#pragma once
#include "lvgl/lvgl.h"

/**
 * Icon sizes used consistently across the UI.
 *
 * When real icon assets (image files or a custom font icon) are ready, replace
 * ui_icon_placeholder_create() calls with lv_image_create() using the same
 * size enum so layout stays consistent.
 */
typedef enum {
    UI_ICON_S = 16,   /* nav-bar icons           */
    UI_ICON_M = 24,   /* card / header icons     */
    UI_ICON_L = 32,   /* hero / decorative icons */
} ui_icon_size_t;

/**
 * Creates a square rounded-rect icon placeholder.
 *
 * Position is NOT set — caller must call lv_obj_set_pos() or lv_obj_align().
 */
lv_obj_t *ui_icon_placeholder_create(lv_obj_t *parent,
                                      ui_icon_size_t size,
                                      lv_color_t color);
