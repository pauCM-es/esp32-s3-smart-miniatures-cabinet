#pragma once
#include "lvgl/lvgl.h"

/**
 * Descriptor for a single nav-bar item.
 * Set on_click to NULL to defer routing to a central ui_router (recommended).
 */
typedef struct {
    const char   *label;
    lv_event_cb_t on_click;
} ui_nav_item_t;

/**
 * Creates the full-width bottom navigation bar anchored to the bottom of the
 * screen. Each item contains an icon placeholder (S size) and a text label.
 *
 * @param parent     screen or fullscreen container
 * @param items      array of nav item descriptors (must stay in scope)
 * @param count      number of items
 * @param active_idx zero-based index of the currently active tab
 * @return           the bar container object
 */
lv_obj_t *ui_nav_bar_create(lv_obj_t *parent,
                             const ui_nav_item_t *items, int count,
                             int active_idx);
