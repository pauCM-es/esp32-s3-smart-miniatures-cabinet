#pragma once

#include "../ui.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    UI_LED_ITEM_STATE_UNASSIGNED = 0,
    UI_LED_ITEM_STATE_START,
    UI_LED_ITEM_STATE_ASSIGNED,
    UI_LED_ITEM_STATE_END,
} ui_led_item_state_t;

// Creates a led item column (bar + index label) inside parent.
// ledIndex is 1-based; used as click event user_data and shown every 5 items.
lv_obj_t *ui_led_item_create(lv_obj_t *parent, uint16_t ledIndex);

// Recolors the LED bar based on assignment state.
void ui_led_item_set_state(lv_obj_t *item, ui_led_item_state_t state);

#ifdef __cplusplus
}
#endif
