#pragma once

#include <Arduino.h>

namespace AudioService
{
    enum class State : uint8_t
    {
        Uninitialized,
        Idle,
        Queued,
        Recording,
        Playing,
        Cancelling,
        Error
    };

    enum class Result : uint8_t
    {
        None,
        Success,
        Busy,
        NotInitialized,
        InvalidDuration,
        QueueError,
        AllocationFailed,
        MicrophoneInitFailed,
        MicrophoneReadFailed,
        SpeakerInitFailed,
        SpeakerWriteFailed,
        Cancelled,
        InternalError
    };

    struct Status
    {
        State state;
        Result lastResult;

        uint32_t requestedDurationMs;
        uint32_t processedSamples;
        uint32_t totalSamples;

        uint8_t progressPercent;
    };

    /**
     * Creates the persistent audio task and command queue.
     *
     * Call once from setup().
     */
    bool begin();

    /**
     * Stops the audio task and releases its resources.
     *
     * Normally this is not needed during regular operation.
     */
    void end();

    /**
     * Records audio and then plays it asynchronously.
     *
     * This function only places the command in a queue and returns.
     * LVGL and touch processing remain responsive.
     */
    Result startRecordAndPlayback(uint32_t durationMs = 3000);

    /**
     * Requests cancellation of the current audio operation.
     */
    void cancel();

    /**
     * Returns a thread-safe copy of the current state.
     */
    Status getStatus();

    State getState();
    Result getLastResult();

    bool isInitialized();
    bool isBusy();

    const char* stateToString(State state);
    const char* resultToString(Result result);
}