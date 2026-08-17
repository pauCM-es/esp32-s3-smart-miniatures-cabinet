#include "../ui_internal.h"

static lv_obj_t* make_field(
    lv_obj_t* parent,
    const char* label,
    const char* placeholder,
    lv_coord_t y,
    bool password,
    lv_obj_t** outTextarea
) {
    lv_obj_t* lbl = ui_make_label(parent, label, 10, y + 8);
    lv_obj_add_style(lbl, &ui_style_muted_text, 0);

    lv_obj_t* ta = lv_textarea_create(parent);
    lv_obj_add_style(ta, &ui_style_input, 0);
    lv_obj_set_size(ta, 270, 36);
    lv_obj_set_pos(ta, 155, y);
    lv_textarea_set_one_line(ta, true);
    lv_textarea_set_placeholder_text(ta, placeholder);
    lv_textarea_set_password_mode(ta, password);
    lv_obj_add_event_cb(ta, ui_event_textarea_focus, LV_EVENT_FOCUSED, NULL);

    if (password) {
        lv_obj_t* eye = lv_btn_create(parent);
        lv_obj_add_style(eye, &ui_style_secondary_button, 0);
        lv_obj_set_size(eye, 32, 30);
        lv_obj_set_pos(eye, 388, y + 3);
        lv_obj_add_event_cb(eye, ui_event_password_toggle, LV_EVENT_CLICKED, ta);
        lv_obj_add_state(eye, LV_STATE_DISABLED);

        lv_obj_t* eyeLabel = lv_label_create(eye);
        lv_label_set_text(eyeLabel, LV_SYMBOL_EYE_OPEN);
        lv_obj_center(eyeLabel);
    }

    *outTextarea = ta;
    return ta;
}

void ui_wifi_mqtt_screen_init(void) {
    ui_WifiMqtt = lv_obj_create(NULL);
    lv_obj_add_style(ui_WifiMqtt, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_WifiMqtt, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_WifiMqtt, "Wi-Fi + MQTT", true);

    lv_obj_t* card = ui_make_card(ui_WifiMqtt, 10, 46, 460, 220);

    ui_WifiStatusLabel = ui_make_label(card, "Wi-Fi disconnected", 10, 2);
    ui_MqttStatusLabel = ui_make_label(card, "MQTT disconnected", 245, 2);

    make_field(card, "SSID", "Wi-Fi SSID", 32, false, &ui_SsidTextarea);
    make_field(card, "Wi-Fi password", "Wi-Fi password", 74, true, &ui_WifiPasswordTextarea);
    make_field(card, "MQTT user", "MQTT user", 116, false, &ui_MqttUserTextarea);
    make_field(card, "MQTT password", "MQTT password", 158, true, &ui_MqttPasswordTextarea);

    lv_obj_t* save = ui_make_button(
        ui_WifiMqtt,
        LV_SYMBOL_SAVE "  Save & apply",
        10, 274, 460, 36,
        true
    );
    lv_obj_add_state(ui_SsidTextarea, LV_STATE_DISABLED);
    lv_obj_add_state(ui_WifiPasswordTextarea, LV_STATE_DISABLED);
    lv_obj_add_state(ui_MqttUserTextarea, LV_STATE_DISABLED);
    lv_obj_add_state(ui_MqttPasswordTextarea, LV_STATE_DISABLED);
    lv_obj_add_state(save, LV_STATE_DISABLED);

    lv_obj_t* deferred = ui_make_label(ui_WifiMqtt, "Configuration is not available in this firmware", 10, 250);
    lv_obj_add_style(deferred, &ui_style_muted_text, 0);

    ui_Keyboard = lv_keyboard_create(ui_WifiMqtt);
    lv_obj_set_size(ui_Keyboard, 480, 150);
    lv_obj_align(ui_Keyboard, LV_ALIGN_BOTTOM_MID, 0, 0);
    lv_obj_add_flag(ui_Keyboard, LV_OBJ_FLAG_HIDDEN);
    lv_obj_add_event_cb(ui_Keyboard, ui_event_keyboard, LV_EVENT_READY, NULL);
    lv_obj_add_event_cb(ui_Keyboard, ui_event_keyboard, LV_EVENT_CANCEL, NULL);
}
