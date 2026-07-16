#pragma once

/**
 * Top-level UI entry point.
 * Call once after LVGL and drivers are initialised.
 * Safe to call from both the simulator and the ESP32 firmware.
 */
void ui_init(void);
