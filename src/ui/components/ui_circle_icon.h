#pragma once
#include "lvgl/lvgl.h"

/**
 * Creates a circular icon with a translucent coloured ring and an optional
 * LVGL symbol glyph centred inside.
 *
 * Pass sym = NULL for a plain coloured ring (acts as a placeholder).
 * Position is NOT set — caller must call lv_obj_align() or lv_obj_set_pos().
 */
lv_obj_t *ui_circle_icon_create(lv_obj_t  *parent,
                                  lv_coord_t size,
                                  const char *sym,
                                  lv_color_t  color);
