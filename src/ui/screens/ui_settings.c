#include "../ui_internal.h"

void ui_settings_screen_init(void) {
    ui_Settings = lv_obj_create(NULL);
    lv_obj_add_style(ui_Settings, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_Settings, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_Settings, "Settings", true);

    lv_obj_t* ota = ui_make_card(ui_Settings, 10, 48, 460, 64);
    lv_obj_add_flag(ota, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(ota, ui_event_open_ota, LV_EVENT_CLICKED, NULL);
    ui_make_label(ota, LV_SYMBOL_UPLOAD "  OTA", 10, 6);
    lv_obj_t* otaHint = ui_make_label(ota, "Firmware maintenance mode", 10, 33);
    lv_obj_add_style(otaHint, &ui_style_muted_text, 0);
    lv_obj_t* otaArrow = lv_label_create(ota);
    lv_label_set_text(otaArrow, LV_SYMBOL_RIGHT);
    lv_obj_add_style(otaArrow, &ui_style_accent_text, 0);
    lv_obj_align(otaArrow, LV_ALIGN_RIGHT_MID, -2, 0);

    lv_obj_t* wifi = ui_make_card(ui_Settings, 10, 120, 460, 64);
    lv_obj_add_flag(wifi, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(wifi, ui_event_open_wifi, LV_EVENT_CLICKED, NULL);
    ui_make_label(wifi, LV_SYMBOL_WIFI "  Wi-Fi + MQTT", 10, 6);
    lv_obj_t* wifiHint = ui_make_label(wifi, "Connectivity credentials", 10, 33);
    lv_obj_add_style(wifiHint, &ui_style_muted_text, 0);
    lv_obj_t* wifiArrow = lv_label_create(wifi);
    lv_label_set_text(wifiArrow, LV_SYMBOL_RIGHT);
    lv_obj_add_style(wifiArrow, &ui_style_accent_text, 0);
    lv_obj_align(wifiArrow, LV_ALIGN_RIGHT_MID, -2, 0);

    lv_obj_t* limit = ui_make_card(ui_Settings, 10, 192, 460, 118);
    ui_make_label(limit, "Miniatures light limit brightness", 10, 4);
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

    lv_obj_t* percent = ui_make_label(limit, "%", 444, 69);
    lv_obj_add_style(percent, &ui_style_accent_text, 0);

    lv_obj_t* deferred = ui_make_label(limit, "Available in a later update", 10, 94);
    lv_obj_add_style(deferred, &ui_style_muted_text, 0);
}
