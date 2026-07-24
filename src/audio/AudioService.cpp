#include "AudioService.h"

#include "AudioTools.h"

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>

#include <esp_heap_caps.h>

#include <algorithm>
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

    /**
     * The digital microphone provides 32-bit I2S words.
     *
     * We convert them to signed 16-bit mono PCM before storing them.
     */
    constexpr uint16_t MIC_BITS_PER_SAMPLE = 32;
    constexpr uint16_t SPEAKER_BITS_PER_SAMPLE = 16;

    constexpr uint8_t MIC_CHANNELS = 1;
    constexpr uint8_t SPEAKER_CHANNELS = 2;

    constexpr size_t MIC_BLOCK_SAMPLES = 256;
    constexpr size_t SPEAKER_BLOCK_FRAMES = 256;

    /**
     * Three seconds need:
     *
     * 16000 samples/second × 3 seconds × 2 bytes = 96000 bytes.
     */
    constexpr uint32_t MAX_RECORDING_DURATION_MS = 10000;

    /**
     * These two values control microphone conversion.
     *
     * They may need adjustment after inspecting the first real recording:
     *
     * - Lower MIC_RIGHT_SHIFT makes the recording louder.
     * - Higher MIC_GAIN makes the recording louder.
     */
    constexpr uint8_t MIC_RIGHT_SHIFT = 14;
    constexpr int32_t MIC_GAIN = 2;

    // ---------------------------------------------------------------------
    // FreeRTOS service configuration
    // ---------------------------------------------------------------------

    constexpr UBaseType_t COMMAND_QUEUE_LENGTH = 2;
    constexpr uint32_t AUDIO_TASK_STACK_SIZE = 8192;
    constexpr UBaseType_t AUDIO_TASK_PRIORITY = 3;

    /**
     * The Arduino loop and LVGL usually run on core 1.
     * The audio task is placed on core 0.
     */
    constexpr BaseType_t AUDIO_TASK_CORE = 0;

    // ---------------------------------------------------------------------
    // Internal command types
    // ---------------------------------------------------------------------

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

    // ---------------------------------------------------------------------
    // Internal service objects
    // ---------------------------------------------------------------------

    QueueHandle_t commandQueue = nullptr;
    TaskHandle_t audioTaskHandle = nullptr;

    /**
     * Separate Audio Tools streams are used because the microphone and
     * speaker have different clocks and data pins on this board.
     *
     * Only one is active at a time during record-and-playback.
     */
    I2SStream microphoneStream;
    I2SStream speakerStream;

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
    // Status management
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
        portENTER_CRITICAL(&statusMutex);

        currentStatus.state = state;
        currentStatus.lastResult = result;
        currentStatus.requestedDurationMs = durationMs;
        currentStatus.processedSamples = processedSamples;
        currentStatus.totalSamples = totalSamples;
        currentStatus.progressPercent =
            std::min<uint8_t>(progressPercent, 100);

        portEXIT_CRITICAL(&statusMutex);
    }

    void setProgress(
        uint32_t processedSamples,
        uint32_t totalSamples
    )
    {
        uint8_t progress = 0;

        if (totalSamples > 0)
        {
            const uint64_t calculatedProgress =
                (
                    static_cast<uint64_t>(processedSamples) *
                    100ULL
                ) /
                static_cast<uint64_t>(totalSamples);

            progress = static_cast<uint8_t>(
                std::min<uint64_t>(
                    calculatedProgress,
                    100ULL
                )
            );
        }

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
        void* memory = heap_caps_malloc(
            byteCount,
            MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT
        );

        if (memory != nullptr)
        {
            Serial.printf(
                "[AudioService] Allocated %u bytes in PSRAM\n",
                static_cast<unsigned int>(byteCount)
            );

            return static_cast<int16_t*>(memory);
        }

        Serial.println(
            "[AudioService] PSRAM unavailable; trying internal RAM"
        );

        memory = heap_caps_malloc(
            byteCount,
            MALLOC_CAP_8BIT
        );

        if (memory != nullptr)
        {
            Serial.printf(
                "[AudioService] Allocated %u bytes in internal RAM\n",
                static_cast<unsigned int>(byteCount)
            );
        }

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
    // Audio Tools I2S setup
    // ---------------------------------------------------------------------

    bool beginMicrophone()
    {
        microphoneStream.end();

        auto config =
            microphoneStream.defaultConfig(RX_MODE);

        config.sample_rate = SAMPLE_RATE;
        config.channels = MIC_CHANNELS;
        config.bits_per_sample = MIC_BITS_PER_SAMPLE;

        config.pin_bck = MIC_BCLK_PIN;
        config.pin_ws = MIC_WS_PIN;

        /**
         * Current Audio Tools versions use pin_data_rx for the input data
         * pin. Setting pin_data as well improves compatibility with versions
         * where RX mode reads the generic data property.
         */
        config.pin_data_rx = MIC_DATA_PIN;
        config.pin_data = MIC_DATA_PIN;

        config.is_master = true;
        config.i2s_format = I2S_STD_FORMAT;

        const bool started =
            microphoneStream.begin(config);

        if (!started)
        {
            microphoneStream.end();
            return false;
        }

        return true;
    }

    bool beginSpeaker()
    {
        speakerStream.end();

        auto config =
            speakerStream.defaultConfig(TX_MODE);

        config.sample_rate = SAMPLE_RATE;
        config.channels = SPEAKER_CHANNELS;
        config.bits_per_sample = SPEAKER_BITS_PER_SAMPLE;

        config.pin_bck = SPEAKER_BCLK_PIN;
        config.pin_ws = SPEAKER_WS_PIN;
        config.pin_data = SPEAKER_DATA_PIN;

        config.is_master = true;
        config.i2s_format = I2S_STD_FORMAT;

        const bool started =
            speakerStream.begin(config);

        if (!started)
        {
            speakerStream.end();
            return false;
        }

        return true;
    }

    void stopMicrophone()
    {
        microphoneStream.end();
    }

    void stopSpeaker()
    {
        speakerStream.end();
    }

    // ---------------------------------------------------------------------
    // Microphone conversion
    // ---------------------------------------------------------------------

    int16_t convertMicrophoneSample(int32_t rawSample)
    {
        int32_t converted =
            rawSample >> MIC_RIGHT_SHIFT;

        converted *= MIC_GAIN;

        converted = std::clamp<int32_t>(
            converted,
            std::numeric_limits<int16_t>::min(),
            std::numeric_limits<int16_t>::max()
        );

        return static_cast<int16_t>(converted);
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
            static_cast<uint32_t>(requestedSamples),
            0
        );

        Serial.printf(
            "[AudioService] Recording for %lu ms\n",
            static_cast<unsigned long>(durationMs)
        );

        int32_t inputBlock[MIC_BLOCK_SAMPLES];

        const uint32_t startTime = millis();
        const uint32_t timeoutMs =
            durationMs + 2000;

        uint8_t consecutiveEmptyReads = 0;

        while (recordedSamples < requestedSamples)
        {
            if (cancellationRequested)
            {
                stopMicrophone();
                return AudioResult::Cancelled;
            }

            if ((millis() - startTime) > timeoutMs)
            {
                Serial.println(
                    "[AudioService] Microphone read timeout"
                );

                stopMicrophone();
                return AudioResult::MicrophoneReadFailed;
            }

            const size_t remainingSamples =
                requestedSamples - recordedSamples;

            const size_t samplesToRead =
                std::min(
                    remainingSamples,
                    static_cast<size_t>(
                        MIC_BLOCK_SAMPLES
                    )
                );

            const size_t requestedBytes =
                samplesToRead * sizeof(int32_t);

            const size_t bytesRead =
                microphoneStream.readBytes(
                    reinterpret_cast<uint8_t*>(
                        inputBlock
                    ),
                    requestedBytes
                );

            const size_t samplesRead =
                bytesRead / sizeof(int32_t);

            if (samplesRead == 0)
            {
                consecutiveEmptyReads++;

                if (consecutiveEmptyReads >= 20)
                {
                    Serial.println(
                        "[AudioService] No microphone samples received"
                    );

                    stopMicrophone();
                    return AudioResult::MicrophoneReadFailed;
                }

                vTaskDelay(pdMS_TO_TICKS(1));
                continue;
            }

            consecutiveEmptyReads = 0;

            for (
                size_t index = 0;
                index < samplesRead &&
                recordedSamples < requestedSamples;
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

        stopMicrophone();

        Serial.printf(
            "[AudioService] Recorded %u samples\n",
            static_cast<unsigned int>(
                recordedSamples
            )
        );

        return AudioResult::Success;
    }

    // ---------------------------------------------------------------------
    // Playback
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
            static_cast<uint32_t>(recordedSamples),
            0
        );

        Serial.println(
            "[AudioService] Playback started"
        );

        int16_t outputBlock[
            SPEAKER_BLOCK_FRAMES *
            SPEAKER_CHANNELS
        ];

        size_t playedSamples = 0;

        while (playedSamples < recordedSamples)
        {
            if (cancellationRequested)
            {
                stopSpeaker();
                return AudioResult::Cancelled;
            }

            const size_t remainingSamples =
                recordedSamples - playedSamples;

            const size_t framesThisBlock =
                std::min(
                    remainingSamples,
                    static_cast<size_t>(
                        SPEAKER_BLOCK_FRAMES
                    )
                );

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
                SPEAKER_CHANNELS *
                sizeof(int16_t);

            const size_t bytesWritten =
                speakerStream.write(
                    reinterpret_cast<const uint8_t*>(
                        outputBlock
                    ),
                    bytesToWrite
                );

            if (bytesWritten == 0)
            {
                Serial.println(
                    "[AudioService] Speaker write failed"
                );

                stopSpeaker();
                return AudioResult::SpeakerWriteFailed;
            }

            const size_t framesWritten =
                bytesWritten /
                (
                    SPEAKER_CHANNELS *
                    sizeof(int16_t)
                );

            if (framesWritten == 0)
            {
                stopSpeaker();
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
         * Add a short block of silence before closing I2S so the final
         * recorded samples can leave the DMA buffer.
         */
        std::memset(
            outputBlock,
            0,
            sizeof(outputBlock)
        );

        speakerStream.write(
            reinterpret_cast<const uint8_t*>(
                outputBlock
            ),
            sizeof(outputBlock)
        );

        vTaskDelay(pdMS_TO_TICKS(30));

        stopSpeaker();

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
            static_cast<size_t>(sampleCount64);

        if (
            requestedSamples >
            SIZE_MAX / sizeof(int16_t)
        )
        {
            return AudioResult::AllocationFailed;
        }

        const size_t recordingBytes =
            requestedSamples * sizeof(int16_t);

        int16_t* recording =
            allocateRecordingBuffer(
                recordingBytes
            );

        if (recording == nullptr)
        {
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
            /**
             * Ensure the microphone I2S driver is fully released before
             * starting the separate speaker I2S output.
             */
            vTaskDelay(pdMS_TO_TICKS(50));

            result = playAudio(
                recording,
                recordedSamples,
                durationMs
            );
        }

        stopMicrophone();
        stopSpeaker();
        releaseRecordingBuffer(recording);

        return result;
    }

    // ---------------------------------------------------------------------
    // Persistent FreeRTOS task
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

            if (command.type == CommandType::Shutdown)
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

                if (result == AudioResult::Success)
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

        stopMicrophone();
        stopSpeaker();

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

        /**
         * Keep Audio Tools logging at warning level so audio timing is not
         * disturbed by excessive serial output.
         */
        AudioToolsLogger.begin(
            Serial,
            AudioToolsLogLevel::Warning
        );

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

        const BaseType_t taskResult =
            xTaskCreatePinnedToCore(
                audioTask,
                "AudioService",
                AUDIO_TASK_STACK_SIZE,
                nullptr,
                AUDIO_TASK_PRIORITY,
                &audioTaskHandle,
                AUDIO_TASK_CORE
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
            const Command command{
                CommandType::Shutdown,
                0
            };

            xQueueSend(
                commandQueue,
                &command,
                pdMS_TO_TICKS(100)
            );
        }

        const uint32_t startTime = millis();

        while (
            audioTaskHandle != nullptr &&
            millis() - startTime < 1000
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

        stopMicrophone();
        stopSpeaker();

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
        const State state = getState();

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