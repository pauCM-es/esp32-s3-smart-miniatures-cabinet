#include "../ui_internal.h"

static void add_icon_title(lv_obj_t* parent, const char* icon, const char* title) {
    lv_obj_t* iconLabel = ui_make_label(parent, icon, 10, 6);
    lv_obj_set_style_text_color(iconLabel, ui_color_text(), 0);

    lv_obj_t* titleLabel = ui_make_label(parent, title, 36, 6);
    lv_obj_set_style_text_font(titleLabel, UI_FONT_M, 0);
    lv_obj_set_style_text_color(titleLabel, ui_color_text(), 0);
}

void ui_settings_screen_init(void) {
    ui_Settings = lv_obj_create(NULL);
    lv_obj_add_style(ui_Settings, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_Settings, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_Settings, "Settings", true);

    lv_obj_t* content = lv_obj_create(ui_Settings);
    lv_obj_set_size(content, 480, 280);
    lv_obj_set_pos(content, 0, 40);
    lv_obj_set_scroll_dir(content, LV_DIR_VER);
    lv_obj_set_scrollbar_mode(content, LV_SCROLLBAR_MODE_AUTO);
    lv_obj_set_style_bg_opa(content, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(content, 0, 0);
    lv_obj_set_style_pad_all(content, 0, 0);

    /* Explicit extent keeps the final card fully reachable by scrolling. */
    lv_obj_t* scrollExtent = lv_obj_create(content);
    lv_obj_set_size(scrollExtent, 1, 1);
    lv_obj_set_pos(scrollExtent, 0, 304);
    lv_obj_clear_flag(scrollExtent, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_opa(scrollExtent, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(scrollExtent, 0, 0);
    lv_obj_set_style_pad_all(scrollExtent, 0, 0);

    lv_obj_t* ota = ui_make_card(content, 10, 8, 460, 64);
    lv_obj_add_flag(ota, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(ota, ui_event_open_ota, LV_EVENT_CLICKED, NULL);
    add_icon_title(ota, LV_SYMBOL_UPLOAD, "OTA");
    lv_obj_t* otaHint = ui_make_label(ota, "Firmware maintenance mode", 10, 33);
    lv_obj_add_style(otaHint, &ui_style_muted_text, 0);
    lv_obj_t* otaArrow = lv_label_create(ota);
    lv_label_set_text(otaArrow, LV_SYMBOL_RIGHT);
    lv_obj_add_style(otaArrow, &ui_style_accent_text, 0);
    lv_obj_align(otaArrow, LV_ALIGN_RIGHT_MID, -2, 0);

    lv_obj_t* wifi = ui_make_card(content, 10, 80, 460, 64);
    lv_obj_add_flag(wifi, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(wifi, ui_event_open_wifi, LV_EVENT_CLICKED, NULL);
    add_icon_title(wifi, LV_SYMBOL_WIFI, "Wi-Fi + MQTT");
    lv_obj_t* wifiHint = ui_make_label(wifi, "Connectivity credentials", 10, 33);
    lv_obj_add_style(wifiHint, &ui_style_muted_text, 0);
    lv_obj_t* wifiArrow = lv_label_create(wifi);
    lv_label_set_text(wifiArrow, LV_SYMBOL_RIGHT);
    lv_obj_add_style(wifiArrow, &ui_style_accent_text, 0);
    lv_obj_align(wifiArrow, LV_ALIGN_RIGHT_MID, -2, 0);

    lv_obj_t* limit = ui_make_card(content, 10, 152, 460, 118);
    lv_obj_t* limitTitle = ui_make_label(limit, "Miniatures light limit brightness", 10, 4);
    lv_obj_set_style_text_font(limitTitle, UI_FONT_M, 0);
    lv_obj_set_style_text_color(limitTitle, ui_color_text(), 0);
    lv_obj_t* limitHint = ui_make_label(limit, "Maximum allowed brightness (0-100%)", 10, 32);
    lv_obj_add_style(limitHint, &ui_style_muted_text, 0);

    lv_obj_t* minus = ui_make_button(limit, LV_SYMBOL_MINUS, 230, 57, 48, 40, false);
    lv_obj_add_state(minus, LV_STATE_DISABLED);

    ui_BrightnessLimitSpinbox = lv_spinbox_create(limit);
    lv_obj_add_style(ui_BrightnessLimitSpinbox, &ui_style_input, 0);
    lv_obj_set_size(ui_BrightnessLimitSpinbox, 92, 40);
    lv_obj_set_pos(ui_BrightnessLimitSpinbox, 288, 57);
    lv_spinbox_set_range(ui_BrightnessLimitSpinbox, 0, 100);
    lv_spinbox_set_digit_format(ui_BrightnessLimitSpinbox, 3, 0);
    lv_spinbox_set_rollover(ui_BrightnessLimitSpinbox, false);
    lv_obj_set_style_text_align(ui_BrightnessLimitSpinbox, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_add_state(ui_BrightnessLimitSpinbox, LV_STATE_DISABLED);

    lv_obj_t* plus = ui_make_button(limit, LV_SYMBOL_PLUS, 390, 57, 48, 40, false);
    lv_obj_add_state(plus, LV_STATE_DISABLED);

    lv_obj_t* deferred = ui_make_label(limit, "Available in a later update", 10, 94);
    lv_obj_add_style(deferred, &ui_style_muted_text, 0);
}
