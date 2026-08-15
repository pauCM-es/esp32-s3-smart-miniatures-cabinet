#pragma once

/**
 * Display resolution shared between the desktop simulator (CMake)
 * and the ESP32 firmware (PlatformIO).
 *
 * These are the logical pixels that LVGL operates with —
 * 480 × 320 landscape, same as the Freenove 3.5-inch display.
 */
static constexpr int UI_WIDTH  = 480;
static constexpr int UI_HEIGHT = 320;

constexpr const char* kFirmwareVersion = "0.2.0";
