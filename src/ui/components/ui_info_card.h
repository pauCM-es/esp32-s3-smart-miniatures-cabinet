#pragma once
#include "lvgl/lvgl.h"

/**
 * Creates a styled info card panel.
 *
 * The card uses UI_GAP padding on all sides, so children placed inside with
 * lv_obj_align() are automatically inset from the border.
 *
 * Position is NOT set — caller must call lv_obj_set_pos() or lv_obj_align().
 *
 * @param parent       parent container
 * @param w, h         dimensions
 * @param border_color accent colour for the 1-px border
 * @return             the card lv_obj_t*
 */
lv_obj_t *ui_info_card_create(lv_obj_t *parent,
                               lv_coord_t w, lv_coord_t h,
                               lv_color_t border_color);
