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

constexpr int kPwmCabinetPin = 46;
constexpr uint8_t kPwmChannel = 0;
constexpr uint32_t kPwmFrequencyHz = 20000;
constexpr uint8_t kPwmResolutionBits = 8;

constexpr int kRgbwCabinetDataPin = 46;
constexpr uint16_t kRgbwCabinetLedCount = 30;  // Replace with measured strip count.

constexpr int kMiniatureLedDataPin = 45;
constexpr uint16_t kMiniatureLedCount = 400;    // ~2.5 m at 160 LED/m.
// Physical output ceiling for the miniature strip (0-255).
// The public 0-100% brightness controls scale to this value, not to 255.
constexpr uint8_t kMiniatureMaxBrightness = 125;

// Encoder via PCF8575 I2C expander (original — commented out).
constexpr int kI2cSdaPin = 38;
constexpr int kI2cSclPin = 39;
constexpr uint8_t kPcf8575Address = 0x20;
constexpr int kEncoderButtonPin = 0;  // P0 → encoder push button
constexpr int kEncoderPinA = 2;       // P1 → encoder signal A
constexpr int kEncoderPinB = 1;       // P2 → encoder signal B
constexpr uint16_t kEncoderButtonDebounceMs = 35;

// Encoder wired directly to GPIO (quadrature, no button).
// constexpr int kEncoderPinA = 38;
// constexpr int kEncoderPinB = 39;
constexpr uint8_t kEncoderBrightnessStep = 5;
// Quadrature steps accumulated before one output tick fires.
// 4 = one output per physical detent on most encoders; try 2 if under-sensitive.
constexpr int8_t kEncoderStepsPerTick = 2;

constexpr uint8_t kDefaultShelfCount = 1;
constexpr uint16_t kDefaultLedsPerShelf = 80;
constexpr uint8_t kDefaultLocationsPerShelf = 12;

constexpr uint8_t kMaxShelves = 5;
constexpr uint8_t kMaxLocationsPerShelf = 26;

constexpr uint32_t kLocateDurationMs = 8000;
constexpr uint32_t kLocationTestDurationMs = 5000;
constexpr uint16_t kLedFrameIntervalMs = 33;

}  // namespace smartcabinet::config
