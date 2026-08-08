#pragma once

#include <cstdint>

namespace smartcabinet {

struct RgbColor {
    uint8_t r{0};
    uint8_t g{0};
    uint8_t b{0};
};

struct RgbwColor {
    uint8_t r{0};
    uint8_t g{0};
    uint8_t b{0};
    uint8_t w{0};
};

constexpr RgbColor kCyan{0, 220, 255};
constexpr RgbColor kPurple{170, 40, 255};
constexpr RgbColor kWarmWhiteRgb{255, 180, 110};

}  // namespace smartcabinet
