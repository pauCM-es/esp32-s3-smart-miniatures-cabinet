#pragma once

#include "lvgl.h"

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
