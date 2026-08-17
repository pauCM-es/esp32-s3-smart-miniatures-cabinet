#pragma once

#include "lvgl.h"

#ifdef __cplusplus
extern "C" {
#endif

LV_FONT_DECLARE(orbitron_16);
LV_FONT_DECLARE(orbitron_18);
LV_FONT_DECLARE(orbitron_24);
LV_FONT_DECLARE(orbitron_32);

#ifdef __cplusplus
}
#endif

/* Typography scale backed by the generated Orbitron fonts. */
#define UI_FONT_S (&orbitron_16)
#define UI_FONT_M (&orbitron_18)
#define UI_FONT_L (&orbitron_24)
#define UI_FONT_XL (&orbitron_32)

/* Shared palette, kept as RGB values for lv_color_hex(). */
#define UI_COLOR_BG          0x0B0F12
#define UI_COLOR_SURFACE     0x151B20
#define UI_COLOR_SURFACE_ALT 0x1B2329
#define UI_COLOR_BORDER      0x2B353C
#define UI_COLOR_ACCENT      0x56BDD0
#define UI_COLOR_TEXT         0xF3F6F8
#define UI_COLOR_MUTED        0x929DA5
#define UI_COLOR_ERROR        0xE36D6D
#define UI_COLOR_SUCCESS      0x67C59A
#define UI_COLOR_ON_ACCENT    0x081013
#define UI_COLOR_INPUT        0x101519

#ifdef __cplusplus
extern "C" {
#endif

extern lv_style_t ui_style_screen;
extern lv_style_t ui_style_header;
extern lv_style_t ui_style_card;
extern lv_style_t ui_style_card_press;
extern lv_style_t ui_style_primary_button;
extern lv_style_t ui_style_secondary_button;
extern lv_style_t ui_style_input;
extern lv_style_t ui_style_accent_text;
extern lv_style_t ui_style_muted_text;

void ui_theme_init(void);

lv_color_t ui_color_bg(void);
lv_color_t ui_color_surface(void);
lv_color_t ui_color_surface_alt(void);
lv_color_t ui_color_border(void);
lv_color_t ui_color_accent(void);
lv_color_t ui_color_text(void);
lv_color_t ui_color_muted(void);
lv_color_t ui_color_error(void);
lv_color_t ui_color_success(void);

#ifdef __cplusplus
}
#endif
