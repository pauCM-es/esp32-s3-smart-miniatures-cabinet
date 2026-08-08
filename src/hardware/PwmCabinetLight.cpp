#include "hardware/PwmCabinetLight.h"

#include <Arduino.h>
#if __has_include(<esp_arduino_version.h>)
#include <esp_arduino_version.h>
#endif

#include "config/HardwareConfig.h"
#include "models/ValueUtils.h"

#ifndef ESP_ARDUINO_VERSION_MAJOR
#define ESP_ARDUINO_VERSION_MAJOR 2
#endif

namespace smartcabinet {

void PwmCabinetLight::begin() {
#if SMART_CABINET_ENABLE_PWM_CABINET_LIGHT
#if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcAttachChannel(config::kPwmCabinetPin, config::kPwmFrequencyHz,
                      config::kPwmResolutionBits, config::kPwmChannel);
#else
    ledcSetup(config::kPwmChannel, config::kPwmFrequencyHz, config::kPwmResolutionBits);
    ledcAttachPin(config::kPwmCabinetPin, config::kPwmChannel);
#endif
    applyOutput();
#endif
}

bool PwmCabinetLight::available() const {
    return SMART_CABINET_ENABLE_PWM_CABINET_LIGHT != 0;
}

void PwmCabinetLight::setPower(bool on) {
    on_ = on;
    applyOutput();
}

void PwmCabinetLight::toggle() {
    setPower(!on_);
}

void PwmCabinetLight::setBrightness(uint8_t percent) {
    brightness_ = clampPercent(percent);
    applyOutput();
}

bool PwmCabinetLight::isOn() const {
    return on_;
}

uint8_t PwmCabinetLight::brightness() const {
    return brightness_;
}

void PwmCabinetLight::applyOutput() {
#if SMART_CABINET_ENABLE_PWM_CABINET_LIGHT
    const uint8_t duty = on_ ? percentToByte(brightness_) : 0;
#if ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcWriteChannel(config::kPwmChannel, duty);
#else
    ledcWrite(config::kPwmChannel, duty);
#endif
#endif
}

}  // namespace smartcabinet
