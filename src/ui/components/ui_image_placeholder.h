#pragma once
#include "lvgl/lvgl.h"

/**
 * Creates a cabinet image placeholder panel.
 *
 * To swap in the real cabinet image, replace this widget with lv_image_create()
 * (or set lv_img_set_src() on a child) — the size contract stays the same.
 *
 * Position is NOT set — caller must call lv_obj_set_pos() or lv_obj_align().
 */
lv_obj_t *ui_image_placeholder_create(lv_obj_t *parent,
                                       lv_coord_t w,
                                       lv_coord_t h);
