#include "hardware/EncoderInput.h"

#include <Arduino.h>
#include "config/HardwareConfig.h"

namespace smartcabinet {
namespace {

constexpr int8_t kEncoderTable[16] = {
     0, -1,  1,  0,
     1,  0,  0, -1,
    -1,  0,  0,  1,
     0,  1, -1,  0
};

}  // namespace

void EncoderInput::begin() {
#if SMART_CABINET_ENABLE_ENCODER
    pinMode(config::kEncoderPinA, INPUT_PULLUP);
    pinMode(config::kEncoderPinB, INPUT_PULLUP);
    pinMode(config::kEncoderButtonPin, INPUT_PULLUP);

    const uint8_t a = static_cast<uint8_t>(digitalRead(config::kEncoderPinA));
    const uint8_t b = static_cast<uint8_t>(digitalRead(config::kEncoderPinB));
    previousState_ = static_cast<uint8_t>((a << 1U) | b);
    previousButton_ = digitalRead(config::kEncoderButtonPin) != LOW;
    stableButton_ = previousButton_;
#endif
}

bool EncoderInput::available() const {
    return SMART_CABINET_ENABLE_ENCODER != 0;
}

EncoderEvent EncoderInput::update(uint32_t nowMs) {
    (void)nowMs;
    EncoderEvent event{};
#if SMART_CABINET_ENABLE_ENCODER
    const uint8_t a = static_cast<uint8_t>(digitalRead(config::kEncoderPinA));
    const uint8_t b = static_cast<uint8_t>(digitalRead(config::kEncoderPinB));
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

    const bool rawButton = digitalRead(config::kEncoderButtonPin) != LOW;
    if (rawButton != previousButton_) {
        previousButton_ = rawButton;
        buttonChangedAtMs_ = nowMs;
    }

    if (rawButton != stableButton_ && nowMs - buttonChangedAtMs_ >= config::kEncoderButtonDebounceMs) {
        stableButton_ = rawButton;
        if (!stableButton_) {
            event.pressed = true;
        }
    }
#endif
    return event;
}

}  // namespace smartcabinet
