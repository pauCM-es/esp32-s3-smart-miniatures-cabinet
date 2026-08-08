#include "AudioServiceBridge.h"
#include "AudioService.h"

#include <Arduino.h>

extern "C" void audio_service_start_test(void)
{
    const AudioService::Result result =
        AudioService::startRecordAndPlayback(
            1000
        );

    Serial.printf(
        "[UI] Audio test command: %s\n",
        AudioService::resultToString(result)
    );
}

extern "C" void audio_service_cancel(void)
{
    AudioService::cancel();
}