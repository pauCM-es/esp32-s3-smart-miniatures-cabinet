#pragma once

// ── OverviewEvents ───────────────────────────────────────────────────────────
// C-linkage entry points called from ui_overview_screen.c (C file).
// Implemented in OverviewEvents.cpp (C++) which handles app logic.

#ifdef __cplusplus
extern "C" {
#endif

void overview_on_next_scene(void);
void overview_on_prev_scene(void);
// 'on' is int so this header is valid C (bool is C99/C11 only with stdbool.h).
void overview_on_lights_switched(int on);
void overview_on_screen_opened(void);

#ifdef __cplusplus
}  // extern "C"
#endif
