#pragma once

#include <stdint.h>

// ── ShelvesEvents ─────────────────────────────────────────────────────────────
// C-linkage entry points called from ui_events.c (C file).
// Implemented in ShelvesEvents.cpp (C++) which delegates to AppController.

#ifdef __cplusplus
extern "C" {
#endif

void shelves_on_add_shelf_pressed(void);
void shelves_on_shelf_selected(uint8_t shelfIndex);

void shelves_on_location_count_increment(void);
void shelves_on_location_count_decrement(void);

void shelves_on_led_count_increment(void);
void shelves_on_led_count_decrement(void);

void shelves_on_location_selected(uint8_t locationIndex);

void shelves_on_auto_assign(void);
void shelves_on_test_pressed(void);
void shelves_on_clear_shelf(void);

void shelves_on_location_led_count_increment(void);
void shelves_on_location_led_count_decrement(void);

void shelves_on_location_editor_close(void);
void shelves_on_clear_location(void);

/* Called when the user taps a LED bar in the mapping row. */
void shelves_on_led_selected(uint16_t ledIndex);

void shelves_on_screen_opened(void);
void shelves_on_screen_closed(void);

#ifdef __cplusplus
}  // extern "C"
#endif
