#pragma once

#include <stdint.h>
#include "lvgl/lvgl.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Visual states for a single LED mapping item in the shelf LED bar.
 *
 *  UNASSIGNED – blue bar, no label (default)
 *  ASSIGNED   – cyan bar, no label
 *  START      – pink bar with glow, label shows LED index
 *  END        – orange bar with glow, label shows LED index
 */
typedef enum {
    UI_LED_ITEM_STATE_UNASSIGNED = 0,
    UI_LED_ITEM_STATE_ASSIGNED,
    UI_LED_ITEM_STATE_START,
    UI_LED_ITEM_STATE_END,
} ui_led_item_state_t;

/**
 * Create a single LED item widget inside @p parent.
 * The widget is a flex-column container (bar + index label).
 * It is initialised to UI_LED_ITEM_STATE_UNASSIGNED.
 *
 * @param parent  The led-mapping row container.
 * @param index   1-based LED index shown on START/END items.
 * @return        The outer container object.
 */
lv_obj_t *ui_led_item_create(lv_obj_t *parent, uint16_t index);

/**
 * Change the visual state of an LED item created with ui_led_item_create().
 */
void ui_led_item_set_state(lv_obj_t *item, ui_led_item_state_t state);

/**
 * Update the index label text (useful when the mapping changes at runtime).
 */
void ui_led_item_set_index(lv_obj_t *item, uint16_t index);

#ifdef __cplusplus
} /*extern "C"*/
#endif
