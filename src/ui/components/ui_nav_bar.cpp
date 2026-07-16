#include "ui_nav_bar.h"
#include "ui_icon_placeholder.h"
#include "../theme/ui_theme.h"

lv_obj_t *ui_nav_bar_create(lv_obj_t *parent,
                             const ui_nav_item_t *items, int count,
                             int active_idx)
{
    /* ── Bar container ──────────────────────────────────────────────────── */
    lv_obj_t *bar = lv_obj_create(parent);
    lv_obj_set_size(bar, UI_SCREEN_W, UI_NAV_H);
    lv_obj_set_pos(bar, 0, UI_SCREEN_H - UI_NAV_H);
    lv_obj_set_style_bg_color(bar, ui_color_header(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(bar, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(bar, ui_color_border(), LV_PART_MAIN);
    lv_obj_set_style_border_width(bar, 1, LV_PART_MAIN);
    lv_obj_set_style_border_side(bar, LV_BORDER_SIDE_TOP, LV_PART_MAIN);
    lv_obj_set_style_radius(bar, 0, LV_PART_MAIN);
    lv_obj_set_style_pad_left(bar, UI_GAP, LV_PART_MAIN);
    lv_obj_set_style_pad_right(bar, UI_GAP, LV_PART_MAIN);
    lv_obj_set_style_pad_top(bar, 4, LV_PART_MAIN);
    lv_obj_set_style_pad_bottom(bar, 4, LV_PART_MAIN);
    lv_obj_set_style_pad_column(bar, 0, LV_PART_MAIN);
    lv_obj_clear_flag(bar, LV_OBJ_FLAG_SCROLLABLE);

    /* Available area after horizontal padding; buttons fill it evenly */
    lv_coord_t avail_w = UI_SCREEN_W - UI_GAP * 2;
    lv_coord_t btn_w   = (lv_coord_t)(avail_w / count);
    lv_coord_t btn_h   = UI_NAV_H - 8;   /* bar height minus top+bottom padding */

    for (int i = 0; i < count; i++) {
        const bool is_active = (i == active_idx);

        /* ── Item slot ──────────────────────────────────────────────────── */
        lv_obj_t *item = lv_obj_create(bar);
        lv_obj_set_size(item, btn_w, btn_h);
        lv_obj_set_pos(item, (lv_coord_t)(i * btn_w), 0);
        lv_obj_set_style_pad_all(item, 0, LV_PART_MAIN);
        lv_obj_set_style_radius(item, UI_RADIUS, LV_PART_MAIN);
        lv_obj_clear_flag(item, LV_OBJ_FLAG_SCROLLABLE);

        if (is_active) {
            lv_obj_set_style_bg_color(item, ui_color_nav_active_bg(), LV_PART_MAIN);
            lv_obj_set_style_bg_opa(item, LV_OPA_COVER, LV_PART_MAIN);
            lv_obj_set_style_border_color(item, ui_color_accent2(), LV_PART_MAIN);
            lv_obj_set_style_border_width(item, 2, LV_PART_MAIN);
            lv_obj_set_style_border_side(item, LV_BORDER_SIDE_FULL, LV_PART_MAIN);
        } else {
            lv_obj_set_style_bg_opa(item, LV_OPA_0, LV_PART_MAIN);
            lv_obj_set_style_border_width(item, 0, LV_PART_MAIN);
        }

        if (items[i].on_click) {
            lv_obj_add_event_cb(item, items[i].on_click, LV_EVENT_CLICKED, NULL);
        }

        /* ── Icon placeholder (S) ───────────────────────────────────────── */
        /* Icon and label are centred together as a group inside the item.
         * Group height = UI_ICON_S(16) + 4 gap + ~12 label = 32 px.
         * Offset each half from the item centre so total vertical padding
         * is equal top and bottom (~11 px for UI_NAV_H = 54). */
        lv_color_t icon_color = is_active ? ui_color_accent2() : ui_color_text_dim();
        lv_obj_t  *icon = ui_icon_placeholder_create(item, UI_ICON_S, icon_color);
        lv_obj_align(icon, LV_ALIGN_CENTER, 0, -10);

        /* ── Label ──────────────────────────────────────────────────────── */
        lv_obj_t *lbl = lv_label_create(item);
        lv_label_set_text(lbl, items[i].label);
        lv_obj_set_style_text_font(lbl, UI_FONT_SMALL, LV_PART_MAIN);
        lv_obj_set_style_text_color(lbl,
            is_active ? ui_color_accent2() : ui_color_text_dim(),
            LV_PART_MAIN);
        lv_obj_align(lbl, LV_ALIGN_CENTER, 0, 11);
    }

    return bar;
}
