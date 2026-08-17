#include "ui_events.h"

#include <string.h>
#include "ui.h"
#include "ui_internal.h"
#include "ui_state.h"

static UiActionHandlers handlers;

void ui_events_init(void) {
    memset(&handlers, 0, sizeof(handlers));
}

void ui_events_set_handlers(const UiActionHandlers* newHandlers) {
    if (newHandlers) {
        handlers = *newHandlers;
    } else {
        memset(&handlers, 0, sizeof(handlers));
    }
}

const UiActionHandlers* ui_events_get_handlers(void) {
    return &handlers;
}

void ui_event_back(lv_event_t* e) {
    (void)e;
    switch (ui_get_current_screen()) {
        case UI_SCREEN_OTA:
        case UI_SCREEN_WIFI_MQTT:
            ui_load_screen(UI_SCREEN_SETTINGS);
            break;
        case UI_SCREEN_MINIATURES:
        case UI_SCREEN_SETTINGS:
        default:
            ui_load_screen(UI_SCREEN_OVERVIEW);
            break;
    }
}

void ui_event_open_settings(lv_event_t* e) { (void)e; ui_load_screen(UI_SCREEN_SETTINGS); }
void ui_event_open_miniatures(lv_event_t* e) { (void)e; ui_load_screen(UI_SCREEN_MINIATURES); }
void ui_event_open_ota(lv_event_t* e) { (void)e; ui_load_screen(UI_SCREEN_OTA); }
void ui_event_open_wifi(lv_event_t* e) { (void)e; ui_load_screen(UI_SCREEN_WIFI_MQTT); }

void ui_event_cabinet_switch(lv_event_t* e) {
    if (lv_event_get_code(e) != LV_EVENT_VALUE_CHANGED) return;
    bool enabled = lv_obj_has_state(ui_CabinetSwitch, LV_STATE_CHECKED);
    if (handlers.onCabinetPowerChanged) handlers.onCabinetPowerChanged(enabled);
}

void ui_event_cabinet_slider(lv_event_t* e) {
    lv_event_code_t code = lv_event_get_code(e);
    uint8_t value = (uint8_t)lv_slider_get_value(ui_CabinetSlider);

    char text[8];
    lv_snprintf(text, sizeof(text), "%u%%", value);
    lv_label_set_text(ui_CabinetBrightnessLabel, text);

    if ((code == LV_EVENT_RELEASED || code == LV_EVENT_VALUE_CHANGED) &&
        handlers.onCabinetBrightnessChanged) {
        if (code == LV_EVENT_RELEASED) {
            handlers.onCabinetBrightnessChanged(value);
        }
    }
}

void ui_event_miniatures_switch(lv_event_t* e) {
    if (lv_event_get_code(e) != LV_EVENT_VALUE_CHANGED) return;
    bool enabled = lv_obj_has_state(ui_MiniaturesSwitch, LV_STATE_CHECKED);
    if (handlers.onMiniaturesPowerChanged) handlers.onMiniaturesPowerChanged(enabled);
}

void ui_event_miniatures_slider(lv_event_t* e) {
    lv_event_code_t code = lv_event_get_code(e);
    uint8_t value = (uint8_t)lv_slider_get_value(ui_MiniaturesSlider);

    char text[8];
    lv_snprintf(text, sizeof(text), "%u%%", value);
    lv_label_set_text(ui_MiniaturesBrightnessLabel, text);

    if (code == LV_EVENT_RELEASED && handlers.onMiniaturesBrightnessChanged) {
        handlers.onMiniaturesBrightnessChanged(value);
    }
}

void ui_event_scene(lv_event_t* e) {
    if (lv_event_get_code(e) != LV_EVENT_CLICKED) return;
    uint32_t index = (uint32_t)(uintptr_t)lv_event_get_user_data(e);
    if (index >= UI_MAX_SCENES) return;

    ui_state_set_active_scene((int8_t)index);
    if (handlers.onSceneSelected) handlers.onSceneSelected((uint8_t)index);
}

void ui_event_mini_previous(lv_event_t* e) {
    (void)e;
    if (handlers.onMiniaturePrevious) handlers.onMiniaturePrevious();
}

void ui_event_mini_next(lv_event_t* e) {
    (void)e;
    if (handlers.onMiniatureNext) handlers.onMiniatureNext();
}

void ui_event_brightness_limit(lv_event_t* e) {
    if (lv_event_get_code(e) != LV_EVENT_VALUE_CHANGED) return;
    int32_t value = lv_spinbox_get_value(ui_BrightnessLimitSpinbox);
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    if (handlers.onBrightnessLimitChanged) {
        handlers.onBrightnessLimitChanged((uint8_t)value);
    }
}

void ui_event_ota_action(lv_event_t* e) {
    (void)e;
    const UiState* state = ui_state_get();

    if (state->otaState == UI_OTA_DISABLED || state->otaState == UI_OTA_ERROR) {
        if (handlers.onOtaEnableRequested) handlers.onOtaEnableRequested(300);
    } else if (state->otaState == UI_OTA_READY) {
        if (handlers.onOtaDisableRequested) handlers.onOtaDisableRequested();
    }
}

void ui_event_wifi_save(lv_event_t* e) {
    (void)e;
    if (!handlers.onWifiMqttSave) return;

    handlers.onWifiMqttSave(
        lv_textarea_get_text(ui_SsidTextarea),
        lv_textarea_get_text(ui_WifiPasswordTextarea),
        lv_textarea_get_text(ui_MqttUserTextarea),
        lv_textarea_get_text(ui_MqttPasswordTextarea)
    );
}

void ui_event_wifi_mqtt_reconnect(lv_event_t* e) {
    (void)e;
    if (handlers.onWifiMqttReconnectRequested) {
        handlers.onWifiMqttReconnectRequested();
    }
}

void ui_event_password_toggle(lv_event_t* e) {
    lv_obj_t* textarea = (lv_obj_t*)lv_event_get_user_data(e);
    if (!textarea) return;

    bool enabled = lv_textarea_get_password_mode(textarea);
    lv_textarea_set_password_mode(textarea, !enabled);
}

void ui_event_textarea_focus(lv_event_t* e) {
    if (lv_event_get_code(e) != LV_EVENT_FOCUSED) return;
    lv_obj_t* textarea = lv_event_get_target(e);
    if (!ui_Keyboard || !textarea) return;

    lv_keyboard_set_textarea(ui_Keyboard, textarea);
    lv_obj_clear_flag(ui_Keyboard, LV_OBJ_FLAG_HIDDEN);
    lv_obj_move_foreground(ui_Keyboard);
}

void ui_event_keyboard(lv_event_t* e) {
    lv_event_code_t code = lv_event_get_code(e);
    if (code == LV_EVENT_READY || code == LV_EVENT_CANCEL) {
        lv_obj_add_flag(ui_Keyboard, LV_OBJ_FLAG_HIDDEN);
        lv_keyboard_set_textarea(ui_Keyboard, NULL);
    }
}
