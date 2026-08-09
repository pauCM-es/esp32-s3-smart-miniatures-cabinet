#pragma once

#include <cstdint>

// External hardware is disabled by default because the final GPIO map is not fixed yet.
// Set the pins below first, then enable the corresponding feature.

#ifndef SMART_CABINET_ENABLE_PWM_CABINET_LIGHT
#define SMART_CABINET_ENABLE_PWM_CABINET_LIGHT 0
#endif
#ifndef SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT
#define SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT 0
#endif
#ifndef SMART_CABINET_ENABLE_MINIATURE_LIGHTS
#define SMART_CABINET_ENABLE_MINIATURE_LIGHTS 1
#endif
#ifndef SMART_CABINET_ENABLE_ENCODER
#define SMART_CABINET_ENABLE_ENCODER 0
#endif

// Miniature strip defaults. Change the chipset/order if your strip differs.
#define MINIATURE_LED_TYPE WS2812B
#define MINIATURE_LED_COLOR_ORDER GRB

namespace smartcabinet::config {

constexpr int kPwmCabinetPin = 1;
constexpr uint8_t kPwmChannel = 0;
constexpr uint32_t kPwmFrequencyHz = 20000;
constexpr uint8_t kPwmResolutionBits = 8;

constexpr int kRgbwCabinetDataPin = 2;
constexpr uint16_t kRgbwCabinetLedCount = 150;  // Replace with measured strip count.

constexpr int kMiniatureLedDataPin = 3;
constexpr uint16_t kMiniatureLedCount = 400;    // ~2.5 m at 160 LED/m.
constexpr uint8_t kMiniatureMaxBrightness = 96; // Conservative until current is measured.
constexpr uint16_t kMiniaturePowerLimitMilliAmps = 2200;

constexpr int kEncoderPinA = 4;
constexpr int kEncoderPinB = 5;
constexpr int kEncoderButtonPin = 6;
constexpr uint8_t kEncoderBrightnessStep = 5;
constexpr uint16_t kEncoderButtonDebounceMs = 35;

constexpr uint8_t kDefaultShelfCount = 1;
constexpr uint16_t kDefaultLedsPerShelf = 80;
constexpr uint8_t kDefaultLocationsPerShelf = 26;

constexpr uint8_t kMaxShelves = 5;
constexpr uint8_t kMaxLocationsPerShelf = 26;

constexpr uint32_t kLocateDurationMs = 8000;
constexpr uint32_t kLocationTestDurationMs = 5000;
constexpr uint16_t kLedFrameIntervalMs = 33;

}  // namespace smartcabinet::config
