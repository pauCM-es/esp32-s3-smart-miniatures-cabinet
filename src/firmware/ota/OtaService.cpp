#include "firmware/ota/OtaService.h"

#ifdef ARDUINO
#include <Arduino.h>
#include <ArduinoOTA.h>
#include "secrets.h"
#endif

namespace smartcabinet {

void OtaService::begin() {
#ifdef ARDUINO
    ArduinoOTA.setHostname(kOtaHostname);
    ArduinoOTA.setPassword(OTA_PASSWORD);

    ArduinoOTA.onStart([this]() {
        state_ = OtaState::Updating;
        lastProgress_ = 0;
        Serial.println("[OTA] Update started");
        notifyStateChanged();
    });

    ArduinoOTA.onEnd([this]() {
        Serial.println("[OTA] Update finished");
    });

    ArduinoOTA.onProgress([this](unsigned int progress, unsigned int total) {
        const uint8_t percent = static_cast<uint8_t>((progress * 100U) / total);
        if (percent != lastProgress_) {
            lastProgress_ = percent;
            Serial.printf("[OTA] Progress: %u%%\r", percent);
        }
    });

    ArduinoOTA.onError([this](ota_error_t error) {
        Serial.printf("[OTA] Error: %u\n", error);
        state_ = OtaState::Error;
        if (onExit_) onExit_();
        notifyStateChanged();
    });
#endif
}

void OtaService::enable(uint32_t timeoutMs) {
    if (state_ == OtaState::Ready || state_ == OtaState::Updating) return;

    timeoutMs_ = timeoutMs;
#ifdef ARDUINO
    enabledAt_ = millis();
    if (!initialized_) {
        ArduinoOTA.begin();
        initialized_ = true;
    }
#endif

    state_ = OtaState::Ready;
    Serial.println("[OTA] Maintenance mode enabled");
    if (onEnter_) onEnter_();
    notifyStateChanged();
}

void OtaService::disable() {
    if (state_ == OtaState::Disabled) return;

    state_ = OtaState::Disabled;
    Serial.println("[OTA] Maintenance mode disabled");
    if (onExit_) onExit_();
    notifyStateChanged();
}

void OtaService::update(uint32_t nowMs) {
    if (state_ == OtaState::Disabled) return;

#ifdef ARDUINO
    ArduinoOTA.handle();
#endif

    if (state_ == OtaState::Ready &&
        static_cast<uint32_t>(nowMs - enabledAt_) >= timeoutMs_) {
        disable();
    }
}

uint32_t OtaService::remainingMs(uint32_t nowMs) const {
    if (state_ != OtaState::Ready) return 0;
    const uint32_t elapsed = nowMs - enabledAt_;
    return elapsed < timeoutMs_ ? timeoutMs_ - elapsed : 0;
}

void OtaService::setStateChangedCallback(StateChangedCallback cb) {
    onStateChanged_ = std::move(cb);
}

void OtaService::setOnEnterCallback(std::function<void()> cb) {
    onEnter_ = std::move(cb);
}

void OtaService::setOnExitCallback(std::function<void()> cb) {
    onExit_ = std::move(cb);
}

void OtaService::notifyStateChanged() {
    if (onStateChanged_) onStateChanged_();
}

}  // namespace smartcabinet
