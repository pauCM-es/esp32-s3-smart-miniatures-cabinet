#include "hardware/EncoderInput.h"

#include <Arduino.h>
#include "config/HardwareConfig.h"
#include <Wire.h>
#include <PCF8575.h>

namespace smartcabinet {
namespace {

constexpr int8_t kEncoderTable[16] = {
     0, -1,  1,  0,
     1,  0,  0, -1,
    -1,  0,  0,  1,
     0,  1, -1,  0
};

PCF8575 pcf{config::kPcf8575Address};

}  // namespace

void EncoderInput::begin() {
#if SMART_CABINET_ENABLE_ENCODER
    Wire.begin(config::kI2cSdaPin, config::kI2cSclPin);
    pcf.begin();
    const uint16_t initState = pcf.read16();
    const uint8_t a = static_cast<uint8_t>((initState >> config::kEncoderPinA) & 1U);
    const uint8_t b = static_cast<uint8_t>((initState >> config::kEncoderPinB) & 1U);
    previousState_ = static_cast<uint8_t>((a << 1U) | b);
#endif
}

bool EncoderInput::available() const {
    return SMART_CABINET_ENABLE_ENCODER != 0;
}

EncoderEvent EncoderInput::update(uint32_t nowMs) {
    (void)nowMs;
    EncoderEvent event{};
#if SMART_CABINET_ENABLE_ENCODER
    const uint16_t state = pcf.read16();
    const uint8_t a = static_cast<uint8_t>((state >> config::kEncoderPinA) & 1U);
    const uint8_t b = static_cast<uint8_t>((state >> config::kEncoderPinB) & 1U);
    const uint8_t currentState = static_cast<uint8_t>((a << 1U) | b);
    const uint8_t transition = static_cast<uint8_t>((previousState_ << 2U) | currentState);
    previousState_ = currentState;

    accumulator_ += kEncoderTable[transition];
    if (accumulator_ >= 4) {
        event.delta = 1;
        accumulator_ = 0;
    } else if (accumulator_ <= -4) {
        event.delta = -1;
        accumulator_ = 0;
    }
    // No button — debounce logic removed:
    // const bool rawButton = ...
    // if (event.pressed) ...
#endif
    return event;
}

}  // namespace smartcabinet
