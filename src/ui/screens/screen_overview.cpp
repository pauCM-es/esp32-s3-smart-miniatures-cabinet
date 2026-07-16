#include "screen_overview.h"
#include "../theme/ui_theme.h"
#include "../components/ui_icon_placeholder.h"
#include "../components/ui_info_card.h"
#include "../components/ui_nav_bar.h"
#include "../assets/img_cabinet.h"
#include "lvgl/lvgl.h"

/* ── Layout constants ────────────────────────────────────────────────────── */
/*
 * Display: 480 × 320
 *
 *  ┌────────────────────────────────────────────────────────┐  y = 0
 *  │  Header  (44 px)                                       │
 *  ├────────────────────────────────────────────────────────┤  y = 44
 *  │  Left panel (image)   │  Right column (3 info cards)   │
 *  │  x=12  w=224  h=206   │  x=244  w=224  h=206           │
 *  ├────────────────────────────────────────────────────────┤  y = 266
 *  │  Nav bar  (54 px)                                      │
 *  └────────────────────────────────────────────────────────┘  y = 320
 */
static constexpr lv_coord_t CONTENT_Y = UI_HDR_H + UI_GAP;               /* 52  */
static constexpr lv_coord_t CONTENT_H = UI_SCREEN_H - UI_HDR_H
                                        - UI_NAV_H - UI_GAP * 2;         /* 206 */
static constexpr lv_coord_t COL_W     = (UI_SCREEN_W - UI_MARGIN * 2
                                        - UI_GAP) / 2;                   /* 224 */
static constexpr lv_coord_t LEFT_X    = UI_MARGIN;                       /* 12  */
static constexpr lv_coord_t RIGHT_X   = UI_MARGIN + COL_W + UI_GAP;     /* 244 */
static constexpr lv_coord_t CARD_H    = (CONTENT_H - UI_GAP * 2) / 3;  /*  63 */

/* ── Screen builder ──────────────────────────────────────────────────────── */

void screen_overview_load(void)
{
    lv_obj_t *scr = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(scr, ui_color_bg(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_clear_flag(scr, LV_OBJ_FLAG_SCROLLABLE);

    /* ── Header ─────────────────────────────────────────────────────────── */
    lv_obj_t *hdr = lv_obj_create(scr);
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

    /* Logo icon placeholder (M) + title */
    lv_obj_t *logo = ui_icon_placeholder_create(hdr, UI_ICON_M, ui_color_accent2());
    lv_obj_align(logo, LV_ALIGN_LEFT_MID, UI_MARGIN, 0);

    lv_obj_t *title = lv_label_create(hdr);
    lv_label_set_text(title, "OVERVIEW");
    lv_obj_set_style_text_color(title, ui_color_text(), LV_PART_MAIN);
    lv_obj_set_style_text_font(title, UI_FONT_TITLE, LV_PART_MAIN);
    lv_obj_align_to(title, logo, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, 0);

    /* Time on the right — TODO: hook up to real RTC / NTP */
    lv_obj_t *hdr_time = lv_label_create(hdr);
    lv_label_set_text(hdr_time, "23:17");
    lv_obj_set_style_text_color(hdr_time, ui_color_text_dim(), LV_PART_MAIN);
    lv_obj_set_style_text_font(hdr_time, UI_FONT_BODY, LV_PART_MAIN);
    lv_obj_align(hdr_time, LV_ALIGN_RIGHT_MID, -UI_MARGIN, 0);

    /* ── Left panel: cabinet image ──────────────────────────────────────────
     * bg_img_src displays the 224×206 px C-array asset as the panel background.
     * Swap img_cabinet.c with the LVGL-converted file to show the real photo. */
    lv_obj_t *img_panel = lv_obj_create(scr);
    lv_obj_set_size(img_panel, COL_W, CONTENT_H);
    lv_obj_set_pos(img_panel, LEFT_X, CONTENT_Y);
    lv_obj_set_style_bg_color(img_panel, lv_color_hex(0x090914), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(img_panel, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_bg_img_src(img_panel, &img_cabinet, LV_PART_MAIN);
    lv_obj_set_style_border_color(img_panel, ui_color_border(), LV_PART_MAIN);
    lv_obj_set_style_border_width(img_panel, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(img_panel, UI_RADIUS, LV_PART_MAIN);
    lv_obj_set_style_pad_all(img_panel, 0, LV_PART_MAIN);
    lv_obj_clear_flag(img_panel, LV_OBJ_FLAG_SCROLLABLE);

    /* ── Right column: 3 info cards ─────────────────────────────────────── */

    /* Card 1 — Clock / date  (purple border) */
    lv_obj_t *clock_card = ui_info_card_create(scr, COL_W, CARD_H, ui_color_accent());
    lv_obj_set_pos(clock_card, RIGHT_X, CONTENT_Y);

    lv_obj_t *clk_icon = ui_icon_placeholder_create(clock_card, UI_ICON_M, ui_color_accent());
    lv_obj_align(clk_icon, LV_ALIGN_LEFT_MID, 0, 0);

    lv_obj_t *time_lbl = lv_label_create(clock_card);
    lv_label_set_text(time_lbl, "23:17");
    lv_obj_set_style_text_font(time_lbl, UI_FONT_NUM, LV_PART_MAIN);
    lv_obj_set_style_text_color(time_lbl, ui_color_text(), LV_PART_MAIN);
    lv_obj_align_to(time_lbl, clk_icon, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, -7);

    lv_obj_t *date_lbl = lv_label_create(clock_card);
    lv_label_set_text(date_lbl, "Jul 16, 2026");
    lv_obj_set_style_text_font(date_lbl, UI_FONT_SMALL, LV_PART_MAIN);
    lv_obj_set_style_text_color(date_lbl, ui_color_accent(), LV_PART_MAIN);
    lv_obj_align_to(date_lbl, time_lbl, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 2);

    /* Card 2 — Lights toggle  (cyan border) */
    lv_obj_t *lights_card = ui_info_card_create(scr, COL_W, CARD_H, ui_color_accent2());
    lv_obj_set_pos(lights_card, RIGHT_X, CONTENT_Y + CARD_H + UI_GAP);

    lv_obj_t *lgt_icon = ui_icon_placeholder_create(lights_card, UI_ICON_M, ui_color_accent2());
    lv_obj_align(lgt_icon, LV_ALIGN_LEFT_MID, 0, 0);

    lv_obj_t *lights_lbl = lv_label_create(lights_card);
    lv_label_set_text(lights_lbl, "LIGHTS");
    lv_obj_set_style_text_font(lights_lbl, UI_FONT_BODY, LV_PART_MAIN);
    lv_obj_set_style_text_color(lights_lbl, ui_color_text(), LV_PART_MAIN);
    lv_obj_align_to(lights_lbl, lgt_icon, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, 0);

    /* Toggle switch — pre-set ON; TODO: bind to lighting data model */
    lv_obj_t *sw = lv_switch_create(lights_card);
    lv_obj_set_size(sw, 44, 22);
    lv_obj_add_state(sw, LV_STATE_CHECKED);
    lv_obj_set_style_bg_color(sw, lv_color_hex(0x2A2A50), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_color(sw, ui_color_accent2(), LV_PART_MAIN | LV_STATE_CHECKED);
    lv_obj_set_style_bg_color(sw, lv_color_white(), LV_PART_KNOB | LV_STATE_DEFAULT);
    lv_obj_set_style_border_width(sw, 0, LV_PART_MAIN);
    lv_obj_align(sw, LV_ALIGN_RIGHT_MID, 0, 0);

    lv_obj_t *on_lbl = lv_label_create(lights_card);
    lv_label_set_text(on_lbl, "ON");
    lv_obj_set_style_text_font(on_lbl, UI_FONT_SMALL, LV_PART_MAIN);
    lv_obj_set_style_text_color(on_lbl, ui_color_accent2(), LV_PART_MAIN);
    lv_obj_align_to(on_lbl, sw, LV_ALIGN_OUT_LEFT_MID, -UI_GAP, 0);

    /* Card 3 — Miniature count  (purple border) */
    lv_obj_t *mini_card = ui_info_card_create(scr, COL_W, CARD_H, ui_color_accent());
    lv_obj_set_pos(mini_card, RIGHT_X, CONTENT_Y + (CARD_H + UI_GAP) * 2);

    lv_obj_t *min_icon = ui_icon_placeholder_create(mini_card, UI_ICON_M, ui_color_accent());
    lv_obj_align(min_icon, LV_ALIGN_LEFT_MID, 0, 0);

    lv_obj_t *count_lbl = lv_label_create(mini_card);
    lv_label_set_text(count_lbl, "124");
    lv_obj_set_style_text_font(count_lbl, UI_FONT_NUM, LV_PART_MAIN);
    lv_obj_set_style_text_color(count_lbl, ui_color_text(), LV_PART_MAIN);
    lv_obj_align_to(count_lbl, min_icon, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, -7);

    lv_obj_t *mini_lbl = lv_label_create(mini_card);
    lv_label_set_text(mini_lbl, "MINIATURES");
    lv_obj_set_style_text_font(mini_lbl, UI_FONT_SMALL, LV_PART_MAIN);
    lv_obj_set_style_text_color(mini_lbl, ui_color_accent(), LV_PART_MAIN);
    lv_obj_align_to(mini_lbl, count_lbl, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 2);

    /* ── Bottom navigation bar ───────────────────────────────────────────── */
    static const ui_nav_item_t nav_items[] = {
        { "OVERVIEW",   NULL },
        { "SHELVES",    NULL },
        { "MINIATURES", NULL },
        { "LIGHTS",     NULL },
        { "SETTINGS",   NULL },
    };
    ui_nav_bar_create(scr, nav_items, 5, 0);  /* active = OVERVIEW (index 0) */

    lv_scr_load(scr);
}
