#pragma once

#include <stdint.h>

// ── LightsEvents ─────────────────────────────────────────────────────────────
// C-linkage entry points called from ui_events.c (C file).
// Implemented in LightsEvents.cpp (C++) which handles app logic.

#ifdef __cplusplus
extern "C" {
#endif

void lights_on_minis_color_changed(uint8_t r, uint8_t g, uint8_t b);
void lights_on_minis_intensity_changed(uint8_t percent);
// Color only applies to RGBW strip; ignored when PWM cabinet is active.
void lights_on_cabinet_color_changed(uint8_t r, uint8_t g, uint8_t b);
// Drives whichever cabinet output is available (PWM or RGBW, mutually exclusive).
void lights_on_cabinet_intensity_changed(uint8_t percent);

#ifdef __cplusplus
}  // extern "C"
#endif
