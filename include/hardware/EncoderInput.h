#pragma once

#include <cstdint>

namespace smartcabinet {

struct EncoderEvent {
    int8_t delta{0};
    // bool pressed{false};  // no button
};

class EncoderInput {
public:
    void begin();
    bool available() const;
    EncoderEvent update(uint32_t nowMs);

private:
    uint8_t previousState_{0};
    // bool previousButton_{true};    // no button
    // bool stableButton_{true};
    // uint32_t buttonChangedAtMs_{0};
    int8_t accumulator_{0};
};

}  // namespace smartcabinet
