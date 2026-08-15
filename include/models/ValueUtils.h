#pragma once

#include <cstdint>

namespace smartcabinet {

constexpr uint8_t clampPercent(int value) {
    return value < 0 ? 0 : (value > 100 ? 100 : static_cast<uint8_t>(value));
}

constexpr uint8_t percentToByte(uint8_t percent) {
    return static_cast<uint8_t>((static_cast<uint16_t>(clampPercent(percent)) * 255U) / 100U);
}

constexpr uint8_t percentToByte(uint8_t percent, uint8_t maximum) {
    return static_cast<uint8_t>((static_cast<uint16_t>(clampPercent(percent)) * maximum) / 100U);
}

constexpr uint8_t scaleByte(uint8_t value, uint8_t scale) {
    return static_cast<uint8_t>((static_cast<uint16_t>(value) * scale) / 255U);
}

}  // namespace smartcabinet
