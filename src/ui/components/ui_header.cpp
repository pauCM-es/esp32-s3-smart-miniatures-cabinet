#include "ui_header.h"
#include "ui_icon_placeholder.h"
#include "../theme/ui_theme.h"
#include "../ui_router.h"
#include "lvgl/lvgl.h"

static void _on_back(lv_event_t *e)
{
    (void)e;
    ui_goto_overview();
}

lv_obj_t *ui_header_create(lv_obj_t   *parent,
                             bool        show_back,
                             const char *icon_sym,
                             lv_color_t  icon_color,
                             const char *title,
                             lv_color_t  right_color)
{
    /* ── Bar ────────────────────────────────────────────────────────────── */
    lv_obj_t *hdr = lv_obj_create(parent);
    lv_obj_set_size(hdr, UI_SCREEN_W, UI_HDR_H);
    lv_obj_set_pos(hdr, 0, 0);
    lv_obj_set_style_bg_color(hdr, ui_color_header(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(hdr, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(hdr, ui_color_border(), LV_PART_MAIN);
    lv_obj_set_style_border_width(hdr, 1, LV_PART_MAIN);
    lv_obj_set_style_border_side(hdr, LV_BORDER_SIDE_BOTTOM, LV_PART_MAIN);
    lv_obj_set_style_radius(hdr, 0, LV_PART_MAIN);
    lv_obj_set_style_pad_all(hdr, 0, LV_PART_MAIN);
    lv_obj_clear_flag(hdr, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t *left_anchor = nullptr;

    /* ── Back button (optional) ─────────────────────────────────────────── */
    if (show_back) {
        lv_obj_t *btn = lv_btn_create(hdr);
        lv_obj_set_size(btn, 36, 30);
        lv_obj_align(btn, LV_ALIGN_LEFT_MID, UI_MARGIN, 0);
        lv_obj_set_style_bg_color(btn, ui_color_btn(), LV_PART_MAIN);
        lv_obj_set_style_bg_color(btn, ui_color_accent(), LV_PART_MAIN | LV_STATE_PRESSED);
        lv_obj_set_style_border_color(btn, ui_color_border(), LV_PART_MAIN);
        lv_obj_set_style_border_width(btn, 1, LV_PART_MAIN);
        lv_obj_set_style_radius(btn, UI_RADIUS, LV_PART_MAIN);
        lv_obj_set_style_pad_all(btn, 0, LV_PART_MAIN);
        lv_obj_add_event_cb(btn, _on_back, LV_EVENT_CLICKED, NULL);

        lv_obj_t *sym = lv_label_create(btn);
        lv_label_set_text(sym, LV_SYMBOL_LEFT);
        lv_obj_set_style_text_color(sym, ui_color_text(), LV_PART_MAIN);
        lv_obj_set_style_text_font(sym, UI_FONT_BODY, LV_PART_MAIN);
        lv_obj_center(sym);

        left_anchor = btn;
    }

    /* ── Left icon: LVGL symbol or square placeholder ───────────────────── */
    lv_obj_t *icon_obj;
    if (icon_sym) {
        icon_obj = lv_label_create(hdr);
        lv_label_set_text(icon_obj, icon_sym);
        lv_obj_set_style_text_color(icon_obj, icon_color, LV_PART_MAIN);
        lv_obj_set_style_text_font(icon_obj, UI_FONT_TITLE, LV_PART_MAIN);
    } else {
        icon_obj = ui_icon_placeholder_create(hdr, UI_ICON_M, icon_color);
    }

    if (left_anchor) {
        lv_obj_align_to(icon_obj, left_anchor, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, 0);
    } else {
        lv_obj_align(icon_obj, LV_ALIGN_LEFT_MID, UI_MARGIN, 0);
    }

    /* ── Title ──────────────────────────────────────────────────────────── */
    lv_obj_t *title_lbl = lv_label_create(hdr);
    lv_label_set_text(title_lbl, title);
    lv_obj_set_style_text_color(title_lbl, ui_color_text(), LV_PART_MAIN);
    lv_obj_set_style_text_font(title_lbl, UI_FONT_TITLE, LV_PART_MAIN);
    lv_obj_align_to(title_lbl, icon_obj, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, 0);

    /* ── Right side: time + WiFi ────────────────────────────────────────── */
    lv_obj_t *wifi = lv_label_create(hdr);
    lv_label_set_text(wifi, LV_SYMBOL_WIFI);
    lv_obj_set_style_text_color(wifi, right_color, LV_PART_MAIN);
    lv_obj_set_style_text_font(wifi, UI_FONT_BODY, LV_PART_MAIN);
    lv_obj_align(wifi, LV_ALIGN_RIGHT_MID, -UI_MARGIN, 0);

    lv_obj_t *time_lbl = lv_label_create(hdr);
    lv_label_set_text(time_lbl, "23:17");  /* TODO: wire up to real RTC / NTP */
    lv_obj_set_style_text_color(time_lbl, right_color, LV_PART_MAIN);
    lv_obj_set_style_text_font(time_lbl, UI_FONT_BODY, LV_PART_MAIN);
    lv_obj_align_to(time_lbl, wifi, LV_ALIGN_OUT_LEFT_MID, -UI_GAP, 0);

    return hdr;
}
