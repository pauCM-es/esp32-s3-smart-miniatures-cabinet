#pragma once
#include "lvgl/lvgl.h"

/**
 * Creates the standard application header bar (UI_HDR_H tall, full screen width).
 * Positioned at (0, 0) inside @p parent.
 *
 * @param show_back   true → [<] back button that always navigates to Overview.
 * @param icon_sym    LV_SYMBOL_* string shown left of the title.
 *                    Pass NULL to show an icon_placeholder(M) instead (e.g. logo).
 * @param icon_color  colour for the left icon / symbol.
 * @param title       screen title text (all-caps recommended).
 * @param right_color colour applied to both the time label and the WiFi icon
 *                    on the right side of the header.
 *
 * @return the header lv_obj_t* (rarely needed by callers).
 */
lv_obj_t *ui_header_create(lv_obj_t   *parent,
                             bool        show_back,
                             const char *icon_sym,
                             lv_color_t  icon_color,
                             const char *title,
                             lv_color_t  right_color);
