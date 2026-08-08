#include "AudioService.h"

#include <ESP_I2S.h>

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>

#include <esp_heap_caps.h>

#include <cstring>
#include <limits>

namespace
{
    using AudioState = AudioService::State;
    using AudioResult = AudioService::Result;
    using AudioStatus = AudioService::Status;

    // ---------------------------------------------------------------------
    // Freenove 3.5-inch ESP32-S3 audio pins
    // ---------------------------------------------------------------------

    constexpr int MIC_BCLK_PIN = 3;
    constexpr int MIC_WS_PIN = 14;
    constexpr int MIC_DATA_PIN = 46;

    constexpr int SPEAKER_BCLK_PIN = 42;
    constexpr int SPEAKER_WS_PIN = 41;
    constexpr int SPEAKER_DATA_PIN = 1;

    // ---------------------------------------------------------------------
    // Audio format
    // ---------------------------------------------------------------------

    constexpr uint32_t SAMPLE_RATE = 16000;

    constexpr size_t MIC_BLOCK_SAMPLES = 256;
    constexpr size_t SPEAKER_BLOCK_FRAMES = 256;

    constexpr uint32_t MAX_RECORDING_DURATION_MS = 10000;

    /**
     * The microphone supplies its useful sample in the upper part
     * of a 32-bit I2S word.
     *
     * Shifting by 11 converts an approximately 24-bit microphone
     * sample into a signed 16-bit PCM value.
     */
    constexpr uint8_t MIC_RIGHT_SHIFT = 11;

    /**
     * Desired peak after automatic normalization.
     *
     * INT16_MAX is 32767. Keeping the target lower provides
     * headroom and reduces clipping.
     */
    constexpr int32_t NORMALIZED_TARGET_PEAK = 18000;

    /**
     * Recordings with a peak below this value are considered nearly
     * silent. They are not amplified aggressively because that would
     * mostly amplify electronic noise.
     */
    constexpr int32_t MINIMUM_USEFUL_PEAK = 20;

    // ---------------------------------------------------------------------
    // FreeRTOS service configuration
    // ---------------------------------------------------------------------

    constexpr UBaseType_t COMMAND_QUEUE_LENGTH = 2;
    constexpr uint32_t AUDIO_TASK_STACK_SIZE = 8192;
    constexpr UBaseType_t AUDIO_TASK_PRIORITY = 1;

    enum class CommandType : uint8_t
    {
        RecordAndPlayback,
        Shutdown
    };

    struct Command
    {
        CommandType type;
        uint32_t durationMs;
    };

    QueueHandle_t commandQueue = nullptr;
    TaskHandle_t audioTaskHandle = nullptr;

    /**
     * One I2S instance is reused sequentially:
     *
     * microphone input -> stop -> speaker output.
     */
    I2SClass audioI2S;

    bool serviceInitialized = false;
    volatile bool cancellationRequested = false;

    portMUX_TYPE statusMutex =
        portMUX_INITIALIZER_UNLOCKED;

    AudioStatus currentStatus{
        AudioState::Uninitialized,
        AudioResult::None,
        0,
        0,
        0,
        0
    };

    // ---------------------------------------------------------------------
    // General helpers
    // ---------------------------------------------------------------------

    int32_t absoluteValue(int32_t value)
    {
        if (value == std::numeric_limits<int32_t>::min())
        {
            return std::numeric_limits<int32_t>::max();
        }

        return value < 0 ? -value : value;
    }

    int16_t clampToInt16(int32_t value)
    {
        if (value > std::numeric_limits<int16_t>::max())
        {
            return std::numeric_limits<int16_t>::max();
        }

        if (value < std::numeric_limits<int16_t>::min())
        {
            return std::numeric_limits<int16_t>::min();
        }

        return static_cast<int16_t>(value);
    }

    uint8_t calculateProgress(
        size_t current,
        size_t total
    )
    {
        if (total == 0)
        {
            return 0;
        }

        uint64_t progress =
            (
                static_cast<uint64_t>(current) *
                100ULL
            ) /
            static_cast<uint64_t>(total);

        if (progress > 100ULL)
        {
            progress = 100ULL;
        }

        return static_cast<uint8_t>(progress);
    }

    // ---------------------------------------------------------------------
    // Status handling
    // ---------------------------------------------------------------------

    void setStatus(
        AudioState state,
        AudioResult result,
        uint32_t durationMs,
        uint32_t processedSamples,
        uint32_t totalSamples,
        uint8_t progressPercent
    )
    {
        if (progressPercent > 100)
        {
            progressPercent = 100;
        }

        portENTER_CRITICAL(&statusMutex);

        currentStatus.state = state;
        currentStatus.lastResult = result;
        currentStatus.requestedDurationMs = durationMs;
        currentStatus.processedSamples = processedSamples;
        currentStatus.totalSamples = totalSamples;
        currentStatus.progressPercent = progressPercent;

        portEXIT_CRITICAL(&statusMutex);
    }

    void setProgress(
        uint32_t processedSamples,
        uint32_t totalSamples
    )
    {
        const uint8_t progress =
            calculateProgress(
                processedSamples,
                totalSamples
            );

        portENTER_CRITICAL(&statusMutex);

        currentStatus.processedSamples =
            processedSamples;

        currentStatus.totalSamples =
            totalSamples;

        currentStatus.progressPercent =
            progress;

        portEXIT_CRITICAL(&statusMutex);
    }

    // ---------------------------------------------------------------------
    // Recording buffer
    // ---------------------------------------------------------------------

    int16_t* allocateRecordingBuffer(size_t byteCount)
    {
        /*
        * Use internal 8-bit-capable RAM for audio.
        *
        * The ST77922/LVGL framebuffer already uses PSRAM. Keeping the
        * recording buffer in internal RAM avoids concurrent display and
        * audio access to external PSRAM.
        */
        void* memory = heap_caps_malloc(
            byteCount,
            MALLOC_CAP_INTERNAL |
            MALLOC_CAP_8BIT
        );

        if (memory == nullptr)
        {
            Serial.printf(
                "[AudioService] Could not allocate %u bytes in internal RAM\n",
                static_cast<unsigned int>(byteCount)
            );

            return nullptr;
        }

        Serial.printf(
            "[AudioService] Allocated %u bytes in internal RAM\n",
            static_cast<unsigned int>(byteCount)
        );

        return static_cast<int16_t*>(memory);
    }

    void releaseRecordingBuffer(int16_t*& buffer)
    {
        if (buffer == nullptr)
        {
            return;
        }

        heap_caps_free(buffer);
        buffer = nullptr;
    }

    // ---------------------------------------------------------------------
    // I2S initialization
    // ---------------------------------------------------------------------

    void stopI2S()
    {
        audioI2S.end();

        /**
         * Give the driver and DMA resources a short period to be
         * completely released before reconfiguration.
         */
        vTaskDelay(pdMS_TO_TICKS(20));
    }

   bool beginMicrophone()
    {
        stopI2S();

        // Parameters: BCLK, WS, DOUT, DIN
        audioI2S.setPins(
            MIC_BCLK_PIN,
            MIC_WS_PIN,
            -1,
            MIC_DATA_PIN
        );

        const bool started = audioI2S.begin(
            I2S_MODE_STD,
            SAMPLE_RATE,
            I2S_DATA_BIT_WIDTH_32BIT,
            I2S_SLOT_MODE_MONO
        );

        if (!started)
        {
            Serial.println(
                "[AudioService] Microphone I2S initialization failed"
            );

            stopI2S();
            return false;
        }

        return true;
    }

    bool beginSpeaker()
    {
        stopI2S();

        // Parameters: BCLK, WS, DOUT, DIN
        audioI2S.setPins(
            SPEAKER_BCLK_PIN,
            SPEAKER_WS_PIN,
            SPEAKER_DATA_PIN,
            -1
        );

        const bool started = audioI2S.begin(
            I2S_MODE_STD,
            SAMPLE_RATE,
            I2S_DATA_BIT_WIDTH_16BIT,
            I2S_SLOT_MODE_STEREO
        );

        if (!started)
        {
            Serial.println(
                "[AudioService] Speaker I2S initialization failed"
            );

            stopI2S();
            return false;
        }

        return true;
    }

    // ---------------------------------------------------------------------
    // Microphone conversion and processing
    // ---------------------------------------------------------------------

    int16_t convertMicrophoneSample(int32_t rawSample)
    {
        const int32_t converted =
            rawSample >> MIC_RIGHT_SHIFT;

        return clampToInt16(converted);
    }

    /**
     * Removes a constant DC offset and normalizes the signal.
     *
     * Digital microphones often produce samples centred slightly
     * above or below zero. Removing that offset improves playback.
     */
    void processRecording(
        int16_t* recording,
        size_t sampleCount
    )
    {
        if (
            recording == nullptr ||
            sampleCount == 0
        )
        {
            return;
        }

        int64_t sampleSum = 0;

        for (size_t index = 0; index < sampleCount; ++index)
        {
            sampleSum += recording[index];
        }

        const int32_t dcOffset =
            static_cast<int32_t>(
                sampleSum /
                static_cast<int64_t>(sampleCount)
            );

        int32_t peakBeforeNormalization = 0;

        for (size_t index = 0; index < sampleCount; ++index)
        {
            const int32_t centredSample =
                static_cast<int32_t>(
                    recording[index]
                ) -
                dcOffset;

            recording[index] =
                clampToInt16(centredSample);

            const int32_t magnitude =
                absoluteValue(centredSample);

            if (magnitude > peakBeforeNormalization)
            {
                peakBeforeNormalization = magnitude;
            }
        }

        Serial.printf(
            "[AudioService] Microphone DC offset: %ld\n",
            static_cast<long>(dcOffset)
        );

        Serial.printf(
            "[AudioService] Microphone peak before normalization: %ld\n",
            static_cast<long>(
                peakBeforeNormalization
            )
        );

        if (
            peakBeforeNormalization <
            MINIMUM_USEFUL_PEAK
        )
        {
            Serial.println(
                "[AudioService] Warning: microphone signal is nearly silent"
            );

            return;
        }

        /**
         * Fixed-point gain:
         *
         * gain = targetPeak / measuredPeak
         *
         * Multiplying first with int64_t avoids losing precision.
         */
        for (size_t index = 0; index < sampleCount; ++index)
        {
            const int64_t amplified =
                (
                    static_cast<int64_t>(
                        recording[index]
                    ) *
                    NORMALIZED_TARGET_PEAK
                ) /
                peakBeforeNormalization;

            recording[index] =
                clampToInt16(
                    static_cast<int32_t>(
                        amplified
                    )
                );
        }

        Serial.printf(
            "[AudioService] Recording normalized to peak %ld\n",
            static_cast<long>(
                NORMALIZED_TARGET_PEAK
            )
        );
    }

    // ---------------------------------------------------------------------
    // Recording
    // ---------------------------------------------------------------------

    AudioResult recordAudio(
        int16_t* recording,
        size_t requestedSamples,
        size_t& recordedSamples,
        uint32_t durationMs
    )
    {
        recordedSamples = 0;

        if (!beginMicrophone())
        {
            Serial.println(
                "[AudioService] Microphone initialization failed"
            );

            return AudioResult::MicrophoneInitFailed;
        }

        setStatus(
            AudioState::Recording,
            AudioResult::None,
            durationMs,
            0,
            static_cast<uint32_t>(
                requestedSamples
            ),
            0
        );

        Serial.printf(
            "[AudioService] Recording for %lu ms\n",
            static_cast<unsigned long>(
                durationMs
            )
        );

        int32_t inputBlock[MIC_BLOCK_SAMPLES];

        const uint32_t startTime = millis();
        const uint32_t timeoutMs =
            durationMs + 2500;

        uint8_t consecutiveEmptyReads = 0;

        while (recordedSamples < requestedSamples)
        {
            if (cancellationRequested)
            {
                stopI2S();
                return AudioResult::Cancelled;
            }

            if (
                millis() - startTime >
                timeoutMs
            )
            {
                Serial.println(
                    "[AudioService] Microphone read timeout"
                );

                stopI2S();
                return AudioResult::MicrophoneReadFailed;
            }

            const size_t remainingSamples =
                requestedSamples -
                recordedSamples;

            const size_t samplesToRead =
                remainingSamples <
                        MIC_BLOCK_SAMPLES
                    ? remainingSamples
                    : MIC_BLOCK_SAMPLES;

            const size_t requestedBytes =
                samplesToRead *
                sizeof(int32_t);

            const size_t bytesRead =
                audioI2S.readBytes(
                    reinterpret_cast<char*>(
                        inputBlock
                    ),
                    requestedBytes
                );

            const size_t samplesRead =
                bytesRead /
                sizeof(int32_t);

            if (samplesRead == 0)
            {
                consecutiveEmptyReads++;

                if (consecutiveEmptyReads >= 20)
                {
                    Serial.println(
                        "[AudioService] No microphone samples received"
                    );

                    stopI2S();
                    return AudioResult::MicrophoneReadFailed;
                }

                vTaskDelay(pdMS_TO_TICKS(1));
                continue;
            }

            consecutiveEmptyReads = 0;

            for (
                size_t index = 0;
                index < samplesRead &&
                recordedSamples <
                    requestedSamples;
                ++index
            )
            {
                recording[recordedSamples] =
                    convertMicrophoneSample(
                        inputBlock[index]
                    );

                recordedSamples++;
            }

            setProgress(
                static_cast<uint32_t>(
                    recordedSamples
                ),
                static_cast<uint32_t>(
                    requestedSamples
                )
            );

            taskYIELD();
        }

        stopI2S();

        Serial.printf(
            "[AudioService] Recorded %u samples\n",
            static_cast<unsigned int>(
                recordedSamples
            )
        );

        processRecording(
            recording,
            recordedSamples
        );

        return AudioResult::Success;
    }

    // ---------------------------------------------------------------------
    // Speaker playback
    // ---------------------------------------------------------------------

    AudioResult playAudio(
        const int16_t* recording,
        size_t recordedSamples,
        uint32_t durationMs
    )
    {
        if (!beginSpeaker())
        {
            Serial.println(
                "[AudioService] Speaker initialization failed"
            );

            return AudioResult::SpeakerInitFailed;
        }

        setStatus(
            AudioState::Playing,
            AudioResult::None,
            durationMs,
            0,
            static_cast<uint32_t>(
                recordedSamples
            ),
            0
        );

        Serial.println(
            "[AudioService] Playback started"
        );

        int16_t outputBlock[
            SPEAKER_BLOCK_FRAMES * 2
        ];

        size_t playedSamples = 0;

        while (playedSamples < recordedSamples)
        {
            if (cancellationRequested)
            {
                stopI2S();
                return AudioResult::Cancelled;
            }

            const size_t remainingSamples =
                recordedSamples -
                playedSamples;

            const size_t framesThisBlock =
                remainingSamples <
                        SPEAKER_BLOCK_FRAMES
                    ? remainingSamples
                    : SPEAKER_BLOCK_FRAMES;

            /**
             * Duplicate the mono recording into left and right
             * stereo slots.
             */
            for (
                size_t frame = 0;
                frame < framesThisBlock;
                ++frame
            )
            {
                const int16_t sample =
                    recording[
                        playedSamples + frame
                    ];

                outputBlock[(frame * 2) + 0] =
                    sample;

                outputBlock[(frame * 2) + 1] =
                    sample;
            }

            const size_t bytesToWrite =
                framesThisBlock *
                2 *
                sizeof(int16_t);

            const size_t bytesWritten =
                audioI2S.write(
                    reinterpret_cast<uint8_t*>(
                        outputBlock
                    ),
                    bytesToWrite
                );

            if (bytesWritten == 0)
            {
                Serial.println(
                    "[AudioService] Speaker write failed"
                );

                stopI2S();
                return AudioResult::SpeakerWriteFailed;
            }

            const size_t framesWritten =
                bytesWritten /
                (
                    2 *
                    sizeof(int16_t)
                );

            if (framesWritten == 0)
            {
                stopI2S();
                return AudioResult::SpeakerWriteFailed;
            }

            playedSamples += framesWritten;

            setProgress(
                static_cast<uint32_t>(
                    playedSamples
                ),
                static_cast<uint32_t>(
                    recordedSamples
                )
            );

            taskYIELD();
        }

        /**
         * Send a short silence block so the final samples leave
         * the DMA buffer before I2S is stopped.
         */
        std::memset(
            outputBlock,
            0,
            sizeof(outputBlock)
        );

        audioI2S.write(
            reinterpret_cast<uint8_t*>(
                outputBlock
            ),
            sizeof(outputBlock)
        );

        vTaskDelay(pdMS_TO_TICKS(100));

        stopI2S();

        Serial.println(
            "[AudioService] Playback finished"
        );

        return AudioResult::Success;
    }

    // ---------------------------------------------------------------------
    // Complete operation
    // ---------------------------------------------------------------------

    AudioResult executeRecordAndPlayback(
        uint32_t durationMs
    )
    {
        cancellationRequested = false;

        const uint64_t sampleCount64 =
            (
                static_cast<uint64_t>(
                    SAMPLE_RATE
                ) *
                durationMs
            ) /
            1000ULL;

        if (
            sampleCount64 == 0 ||
            sampleCount64 >
                std::numeric_limits<uint32_t>::max()
        )
        {
            return AudioResult::InvalidDuration;
        }

        const size_t requestedSamples =
            static_cast<size_t>(
                sampleCount64
            );

        if (
            requestedSamples >
            SIZE_MAX / sizeof(int16_t)
        )
        {
            return AudioResult::AllocationFailed;
        }

        const size_t recordingBytes =
            requestedSamples *
            sizeof(int16_t);

        int16_t* recording =
            allocateRecordingBuffer(
                recordingBytes
            );

        if (recording == nullptr)
        {
            Serial.println(
                "[AudioService] Recording buffer allocation failed"
            );

            return AudioResult::AllocationFailed;
        }

        size_t recordedSamples = 0;

        AudioResult result = recordAudio(
            recording,
            requestedSamples,
            recordedSamples,
            durationMs
        );

        if (result == AudioResult::Success)
        {
            vTaskDelay(pdMS_TO_TICKS(100));

            result = playAudio(
                recording,
                recordedSamples,
                durationMs
            );
        }

        stopI2S();
        releaseRecordingBuffer(recording);

        return result;
    }

    // ---------------------------------------------------------------------
    // Persistent audio task
    // ---------------------------------------------------------------------

    void audioTask(void* parameter)
    {
        (void)parameter;

        Serial.println(
            "[AudioService] Audio task started"
        );

        Command command{};

        for (;;)
        {
            const BaseType_t received =
                xQueueReceive(
                    commandQueue,
                    &command,
                    portMAX_DELAY
                );

            if (received != pdTRUE)
            {
                continue;
            }

            if (
                command.type ==
                CommandType::Shutdown
            )
            {
                break;
            }

            if (
                command.type ==
                CommandType::RecordAndPlayback
            )
            {
                const AudioResult result =
                    executeRecordAndPlayback(
                        command.durationMs
                    );

                cancellationRequested = false;

                if (
                    result ==
                    AudioResult::Success
                )
                {
                    setStatus(
                        AudioState::Idle,
                        AudioResult::Success,
                        command.durationMs,
                        0,
                        0,
                        100
                    );
                }
                else if (
                    result ==
                    AudioResult::Cancelled
                )
                {
                    setStatus(
                        AudioState::Idle,
                        AudioResult::Cancelled,
                        command.durationMs,
                        0,
                        0,
                        0
                    );
                }
                else
                {
                    setStatus(
                        AudioState::Error,
                        result,
                        command.durationMs,
                        0,
                        0,
                        0
                    );
                }

                Serial.printf(
                    "[AudioService] Result: %s\n",
                    AudioService::resultToString(
                        result
                    )
                );
            }
        }

        stopI2S();

        Serial.println(
            "[AudioService] Audio task stopped"
        );

        audioTaskHandle = nullptr;
        vTaskDelete(nullptr);
    }
}

namespace AudioService
{
    bool begin()
    {
        if (serviceInitialized)
        {
            return true;
        }

        commandQueue = xQueueCreate(
            COMMAND_QUEUE_LENGTH,
            sizeof(Command)
        );

        if (commandQueue == nullptr)
        {
            setStatus(
                State::Error,
                Result::QueueError,
                0,
                0,
                0,
                0
            );

            Serial.println(
                "[AudioService] Command queue creation failed"
            );

            return false;
        }

        /**
         * Unpinned task: FreeRTOS can choose the most appropriate core.
         */
        const BaseType_t taskResult =
            xTaskCreate(
                audioTask,
                "AudioService",
                AUDIO_TASK_STACK_SIZE,
                nullptr,
                AUDIO_TASK_PRIORITY,
                &audioTaskHandle
            );

        if (taskResult != pdPASS)
        {
            vQueueDelete(commandQueue);
            commandQueue = nullptr;

            setStatus(
                State::Error,
                Result::InternalError,
                0,
                0,
                0,
                0
            );

            Serial.println(
                "[AudioService] Audio task creation failed"
            );

            return false;
        }

        serviceInitialized = true;
        cancellationRequested = false;

        setStatus(
            State::Idle,
            Result::None,
            0,
            0,
            0,
            0
        );

        Serial.println(
            "[AudioService] Initialized"
        );

        return true;
    }

    void end()
    {
        if (!serviceInitialized)
        {
            return;
        }

        cancel();

        if (commandQueue != nullptr)
        {
            const Command shutdownCommand{
                CommandType::Shutdown,
                0
            };

            xQueueSend(
                commandQueue,
                &shutdownCommand,
                pdMS_TO_TICKS(100)
            );
        }

        const uint32_t timeoutStart =
            millis();

        while (
            audioTaskHandle != nullptr &&
            millis() - timeoutStart < 1000
        )
        {
            vTaskDelay(pdMS_TO_TICKS(10));
        }

        if (audioTaskHandle != nullptr)
        {
            vTaskDelete(audioTaskHandle);
            audioTaskHandle = nullptr;
        }

        if (commandQueue != nullptr)
        {
            vQueueDelete(commandQueue);
            commandQueue = nullptr;
        }

        stopI2S();

        serviceInitialized = false;
        cancellationRequested = false;

        setStatus(
            State::Uninitialized,
            Result::None,
            0,
            0,
            0,
            0
        );

        Serial.println(
            "[AudioService] Ended"
        );
    }

    Result startRecordAndPlayback(
        uint32_t durationMs
    )
    {
        if (
            !serviceInitialized ||
            commandQueue == nullptr
        )
        {
            return Result::NotInitialized;
        }

        if (
            durationMs == 0 ||
            durationMs >
                MAX_RECORDING_DURATION_MS
        )
        {
            return Result::InvalidDuration;
        }

        if (isBusy())
        {
            return Result::Busy;
        }

        cancellationRequested = false;

        const uint32_t totalSamples =
            static_cast<uint32_t>(
                (
                    static_cast<uint64_t>(
                        SAMPLE_RATE
                    ) *
                    durationMs
                ) /
                1000ULL
            );

        setStatus(
            State::Queued,
            Result::None,
            durationMs,
            0,
            totalSamples,
            0
        );

        const Command command{
            CommandType::RecordAndPlayback,
            durationMs
        };

        const BaseType_t queued =
            xQueueSend(
                commandQueue,
                &command,
                0
            );

        if (queued != pdTRUE)
        {
            setStatus(
                State::Error,
                Result::QueueError,
                durationMs,
                0,
                0,
                0
            );

            return Result::QueueError;
        }

        return Result::Success;
    }

    void cancel()
    {
        if (!serviceInitialized)
        {
            return;
        }

        if (!isBusy())
        {
            return;
        }

        cancellationRequested = true;

        portENTER_CRITICAL(&statusMutex);
        currentStatus.state = State::Cancelling;
        portEXIT_CRITICAL(&statusMutex);
    }

    Status getStatus()
    {
        Status snapshot{};

        portENTER_CRITICAL(&statusMutex);
        snapshot = currentStatus;
        portEXIT_CRITICAL(&statusMutex);

        return snapshot;
    }

    State getState()
    {
        return getStatus().state;
    }

    Result getLastResult()
    {
        return getStatus().lastResult;
    }

    bool isInitialized()
    {
        return serviceInitialized;
    }

    bool isBusy()
    {
        const State state =
            getState();

        return
            state == State::Queued ||
            state == State::Recording ||
            state == State::Playing ||
            state == State::Cancelling;
    }

    const char* stateToString(State state)
    {
        switch (state)
        {
            case State::Uninitialized:
                return "Uninitialized";

            case State::Idle:
                return "Idle";

            case State::Queued:
                return "Queued";

            case State::Recording:
                return "Recording";

            case State::Playing:
                return "Playing";

            case State::Cancelling:
                return "Cancelling";

            case State::Error:
                return "Error";

            default:
                return "Unknown";
        }
    }

    const char* resultToString(Result result)
    {
        switch (result)
        {
            case Result::None:
                return "None";

            case Result::Success:
                return "Success";

            case Result::Busy:
                return "Busy";

            case Result::NotInitialized:
                return "Not initialized";

            case Result::InvalidDuration:
                return "Invalid duration";

            case Result::QueueError:
                return "Queue error";

            case Result::AllocationFailed:
                return "Allocation failed";

            case Result::MicrophoneInitFailed:
                return "Microphone initialization failed";

            case Result::MicrophoneReadFailed:
                return "Microphone read failed";

            case Result::SpeakerInitFailed:
                return "Speaker initialization failed";

            case Result::SpeakerWriteFailed:
                return "Speaker write failed";

            case Result::Cancelled:
                return "Cancelled";

            case Result::InternalError:
                return "Internal error";

            default:
                return "Unknown result";
        }
    }
}