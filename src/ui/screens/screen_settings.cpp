#include "screen_settings.h"
#include "../theme/ui_theme.h"
#include "../ui_router.h"
#include "../components/ui_header.h"
#include "../components/ui_circle_icon.h"
#include "lvgl/lvgl.h"

/* ── Layout constants ────────────────────────────────────────────────────── */
/*
 *  ┌────────────────────────────────────────────────────────┐  y = 0
 *  │  Header  (44 px)   [<]  ⚙ SETTINGS        23:17  wifi │
 *  ├────────────────────────────────────────────────────────┤  y = 44
 *  │  y=52  Content panel  (260 px = 5 × 52)                │
 *  │  ┌────────────────────────────────────────────────┐    │
 *  │  │  wifi  WIFI               Connected to…     >  │    │
 *  │  │  ───────────────────────────────────────────   │    │
 *  │  │  ☀    BRIGHTNESS                     80%   >  │    │
 *  │  │  ───────────────────────────────────────────   │    │
 *  │  │  🕐  AUTO-OFF DISPLAY   Screen timeout  30s >  │    │
 *  │  │  ───────────────────────────────────────────   │    │
 *  │  │  ℹ   ABOUT              Firmware…   v1.2.3 >  │    │
 *  │  │  ───────────────────────────────────────────   │    │
 *  │  │  ↺   RESET SETTINGS     Restore def…      >  │    │
 *  │  └────────────────────────────────────────────────┘    │
 *  └────────────────────────────────────────────────────────┘  y = 320
 */
static constexpr lv_coord_t PANEL_X   = UI_GAP;
static constexpr lv_coord_t PANEL_Y   = UI_HDR_H + UI_GAP;      /* 52  */
static constexpr lv_coord_t PANEL_W   = UI_SCREEN_W - UI_GAP * 2; /* 464 */
static constexpr lv_coord_t ROW_COUNT = 5;
static constexpr lv_coord_t ROW_H     = 52;
static constexpr lv_coord_t PANEL_H   = ROW_COUNT * ROW_H;       /* 260 */

/* ── Row descriptor ──────────────────────────────────────────────────────── */
struct RowDef {
    const char *sym;       /* LV_SYMBOL_* glyph, or nullptr for placeholder   */
    uint32_t    icon_hex;
    const char *title;
    const char *subtitle;  /* nullptr = title only, vertically centred        */
    const char *value;     /* nullptr = no value label                        */
    uint32_t    value_hex;
};

static const RowDef ROWS[ROW_COUNT] = {
    { LV_SYMBOL_WIFI,    0x00E4F6, "WIFI",             "Connected to HomeNet",          nullptr,   0x00E4F6 },
    { nullptr,           0xFFB800, "BRIGHTNESS",        nullptr,                          "80%",     0xFFB800 },
    { nullptr,           0xB451ED, "AUTO-OFF DISPLAY",  "Screen timeout",                "30 sec",  0xF04EB9 },
    { nullptr,           0x3A7FD5, "ABOUT",             "Firmware, info & updates",      "v1.2.3",  0x3A7FD5 },
    { LV_SYMBOL_REFRESH, 0xF04EB9, "RESET SETTINGS",   "Restore default configuration", nullptr,   0xA2A0A4 },
};

/* ── Event callbacks ─────────────────────────────────────────────────────── */
/* (back navigation is handled inside ui_header — nothing extra needed here) */

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Builds one settings row inside the panel at the given y offset. */
static void build_row(lv_obj_t *panel, const RowDef *r, lv_coord_t y_off, bool last)
{
    lv_color_t icon_col  = lv_color_hex(r->icon_hex);
    lv_color_t value_col = lv_color_hex(r->value_hex);

    lv_obj_t *row = lv_obj_create(panel);
    lv_obj_set_size(row, PANEL_W, ROW_H);
    lv_obj_set_pos(row, 0, y_off);
    lv_obj_set_style_bg_opa(row, LV_OPA_0, LV_PART_MAIN);
    lv_obj_set_style_border_width(row, 0, LV_PART_MAIN);
    lv_obj_set_style_radius(row, 0, LV_PART_MAIN);
    lv_obj_set_style_pad_all(row, 0, LV_PART_MAIN);
    lv_obj_clear_flag(row, LV_OBJ_FLAG_SCROLLABLE);

    /* Icon */
    lv_obj_t *icon = ui_circle_icon_create(row, 32, r->sym, icon_col);
    lv_obj_align(icon, LV_ALIGN_LEFT_MID, UI_MARGIN, 0);

    /* Title — shift up when subtitle exists to leave room below */
    lv_obj_t *title_lbl = lv_label_create(row);
    lv_label_set_text(title_lbl, r->title);
    lv_obj_set_style_text_color(title_lbl, ui_color_text(), LV_PART_MAIN);
    lv_obj_set_style_text_font(title_lbl, UI_FONT_TITLE, LV_PART_MAIN);

    if (r->subtitle) {
        lv_obj_align_to(title_lbl, icon, LV_ALIGN_OUT_RIGHT_TOP, UI_GAP, 3);

        lv_obj_t *sub = lv_label_create(row);
        lv_label_set_text(sub, r->subtitle);
        lv_obj_set_style_text_color(sub, icon_col, LV_PART_MAIN);
        lv_obj_set_style_text_font(sub, UI_FONT_SMALL, LV_PART_MAIN);
        lv_obj_align_to(sub, title_lbl, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 2);
    } else {
        lv_obj_align_to(title_lbl, icon, LV_ALIGN_OUT_RIGHT_MID, UI_GAP, 0);
    }

    /* Arrow > */
    lv_obj_t *arrow = lv_label_create(row);
    lv_label_set_text(arrow, LV_SYMBOL_RIGHT);
    lv_obj_set_style_text_color(arrow, ui_color_text_dim(), LV_PART_MAIN);
    lv_obj_set_style_text_font(arrow, UI_FONT_BODY, LV_PART_MAIN);
    lv_obj_align(arrow, LV_ALIGN_RIGHT_MID, -UI_MARGIN, 0);

    /* Value (placed left of the arrow) */
    if (r->value) {
        lv_obj_t *val = lv_label_create(row);
        lv_label_set_text(val, r->value);
        lv_obj_set_style_text_color(val, value_col, LV_PART_MAIN);
        lv_obj_set_style_text_font(val, UI_FONT_BODY, LV_PART_MAIN);
        lv_obj_align_to(val, arrow, LV_ALIGN_OUT_LEFT_MID, -UI_GAP, 0);
    }

    /* Divider — skip on the last row */
    if (!last) {
        lv_obj_t *div = lv_obj_create(row);
        lv_obj_set_size(div, PANEL_W - UI_MARGIN * 2, 1);
        lv_obj_set_pos(div, UI_MARGIN, ROW_H - 1);
        lv_obj_set_style_bg_color(div, ui_color_border(), LV_PART_MAIN);
        lv_obj_set_style_border_width(div, 0, LV_PART_MAIN);
        lv_obj_set_style_radius(div, 0, LV_PART_MAIN);
    }
}

/* ── Screen builder ──────────────────────────────────────────────────────── */

void screen_settings_load(void)
{
    lv_obj_t *scr = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(scr, ui_color_bg(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_clear_flag(scr, LV_OBJ_FLAG_SCROLLABLE);

    /* ── Header ─────────────────────────────────────────────────────────── */
    ui_header_create(scr, true, LV_SYMBOL_SETTINGS, ui_color_accent2(), "SETTINGS", ui_color_pink());

    /* ── Content panel ───────────────────────────────────────────────────── */
    lv_obj_t *panel = lv_obj_create(scr);
    lv_obj_set_size(panel, PANEL_W, PANEL_H);
    lv_obj_set_pos(panel, PANEL_X, PANEL_Y);
    lv_obj_set_style_bg_color(panel, ui_color_panel(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(panel, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(panel, ui_color_border(), LV_PART_MAIN);
    lv_obj_set_style_border_width(panel, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(panel, UI_RADIUS, LV_PART_MAIN);
    lv_obj_set_style_pad_all(panel, 0, LV_PART_MAIN);
    lv_obj_clear_flag(panel, LV_OBJ_FLAG_SCROLLABLE);

    /* ── Rows ────────────────────────────────────────────────────────────── */
    for (int i = 0; i < ROW_COUNT; i++) {
        build_row(panel, &ROWS[i], (lv_coord_t)(i * ROW_H), i == ROW_COUNT - 1);
    }

    lv_scr_load(scr);
}
