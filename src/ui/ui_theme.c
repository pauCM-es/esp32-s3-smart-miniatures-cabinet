#include "ui_theme.h"

lv_style_t ui_style_screen;
lv_style_t ui_style_header;
lv_style_t ui_style_card;
lv_style_t ui_style_card_press;
lv_style_t ui_style_primary_button;
lv_style_t ui_style_secondary_button;
lv_style_t ui_style_input;
lv_style_t ui_style_accent_text;
lv_style_t ui_style_muted_text;

static bool initialized = false;

lv_color_t ui_color_bg(void)        { return lv_color_hex(UI_COLOR_BG); }
lv_color_t ui_color_surface(void)   { return lv_color_hex(UI_COLOR_SURFACE); }
lv_color_t ui_color_surface_alt(void){ return lv_color_hex(UI_COLOR_SURFACE_ALT); }
lv_color_t ui_color_border(void)    { return lv_color_hex(UI_COLOR_BORDER); }
lv_color_t ui_color_accent(void)    { return lv_color_hex(UI_COLOR_ACCENT); }
lv_color_t ui_color_text(void)      { return lv_color_hex(UI_COLOR_TEXT); }
lv_color_t ui_color_muted(void)     { return lv_color_hex(UI_COLOR_MUTED); }
lv_color_t ui_color_error(void)     { return lv_color_hex(UI_COLOR_ERROR); }
lv_color_t ui_color_success(void)   { return lv_color_hex(UI_COLOR_SUCCESS); }

void ui_theme_init(void) {
    if (initialized) return;
    initialized = true;

    lv_style_init(&ui_style_screen);
    lv_style_set_bg_color(&ui_style_screen, ui_color_bg());
    lv_style_set_bg_opa(&ui_style_screen, LV_OPA_COVER);
    lv_style_set_text_color(&ui_style_screen, ui_color_text());
    lv_style_set_pad_all(&ui_style_screen, 0);
    lv_style_set_border_width(&ui_style_screen, 0);

    lv_style_init(&ui_style_header);
    lv_style_set_bg_color(&ui_style_header, ui_color_bg());
    lv_style_set_bg_opa(&ui_style_header, LV_OPA_COVER);
    lv_style_set_border_width(&ui_style_header, 0);
    lv_style_set_pad_left(&ui_style_header, 10);
    lv_style_set_pad_right(&ui_style_header, 10);
    lv_style_set_pad_top(&ui_style_header, 4);
    lv_style_set_pad_bottom(&ui_style_header, 4);

    lv_style_init(&ui_style_card);
    lv_style_set_bg_color(&ui_style_card, ui_color_surface());
    lv_style_set_bg_opa(&ui_style_card, LV_OPA_COVER);
    lv_style_set_border_color(&ui_style_card, ui_color_border());
    lv_style_set_border_width(&ui_style_card, 1);
    lv_style_set_radius(&ui_style_card, 12);
    lv_style_set_pad_all(&ui_style_card, 10);

    lv_style_init(&ui_style_card_press);
    lv_style_set_bg_color(&ui_style_card_press, ui_color_surface_alt());
    lv_style_set_border_color(&ui_style_card_press, ui_color_accent());

    lv_style_init(&ui_style_primary_button);
    lv_style_set_bg_color(&ui_style_primary_button, ui_color_accent());
    lv_style_set_bg_opa(&ui_style_primary_button, LV_OPA_COVER);
    lv_style_set_text_color(&ui_style_primary_button, lv_color_hex(UI_COLOR_ON_ACCENT));
    lv_style_set_radius(&ui_style_primary_button, 10);
    lv_style_set_border_width(&ui_style_primary_button, 0);

    lv_style_init(&ui_style_secondary_button);
    lv_style_set_bg_color(&ui_style_secondary_button, ui_color_surface_alt());
    lv_style_set_bg_opa(&ui_style_secondary_button, LV_OPA_COVER);
    lv_style_set_text_color(&ui_style_secondary_button, ui_color_text());
    lv_style_set_border_color(&ui_style_secondary_button, ui_color_border());
    lv_style_set_border_width(&ui_style_secondary_button, 1);
    lv_style_set_radius(&ui_style_secondary_button, 10);

    lv_style_init(&ui_style_input);
    lv_style_set_bg_color(&ui_style_input, lv_color_hex(UI_COLOR_INPUT));
    lv_style_set_bg_opa(&ui_style_input, LV_OPA_COVER);
    lv_style_set_border_color(&ui_style_input, ui_color_border());
    lv_style_set_border_width(&ui_style_input, 1);
    lv_style_set_radius(&ui_style_input, 8);
    lv_style_set_text_color(&ui_style_input, ui_color_text());
    lv_style_set_pad_left(&ui_style_input, 8);
    lv_style_set_pad_right(&ui_style_input, 8);

    lv_style_init(&ui_style_accent_text);
    lv_style_set_text_color(&ui_style_accent_text, ui_color_accent());

    lv_style_init(&ui_style_muted_text);
    lv_style_set_text_color(&ui_style_muted_text, ui_color_muted());
}
