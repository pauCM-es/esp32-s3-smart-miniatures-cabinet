#include "ui.h"

#include <stdio.h>
#include "ui_events.h"
#include "ui_internal.h"
#include "ui_state.h"
#include "ui_theme.h"

/* Screens */
lv_obj_t* ui_Overview = NULL;
lv_obj_t* ui_Miniatures = NULL;
lv_obj_t* ui_Settings = NULL;
lv_obj_t* ui_Ota = NULL;
lv_obj_t* ui_WifiMqtt = NULL;

/* Overview */
lv_obj_t* ui_CabinetSwitch = NULL;
lv_obj_t* ui_CabinetSlider = NULL;
lv_obj_t* ui_CabinetBrightnessLabel = NULL;
lv_obj_t* ui_MiniaturesSwitch = NULL;
lv_obj_t* ui_MiniaturesSlider = NULL;
lv_obj_t* ui_MiniaturesBrightnessLabel = NULL;
lv_obj_t* ui_MiniatureCountLabel = NULL;
lv_obj_t* ui_SceneButtons[UI_MAX_SCENES] = {NULL};
lv_obj_t* ui_SceneLabels[UI_MAX_SCENES] = {NULL};

/* Miniatures */
lv_obj_t* ui_MiniNameLabel = NULL;
lv_obj_t* ui_MiniShelfLabel = NULL;
lv_obj_t* ui_MiniLocationLabel = NULL;
lv_obj_t* ui_MiniPositionLabel = NULL;
lv_obj_t* ui_MiniPreviousButton = NULL;
lv_obj_t* ui_MiniNextButton = NULL;

/* Settings */
lv_obj_t* ui_BrightnessLimitSpinbox = NULL;

/* OTA */
lv_obj_t* ui_OtaStatusLabel = NULL;
lv_obj_t* ui_OtaDetailLabel = NULL;
lv_obj_t* ui_OtaVersionLabel = NULL;
lv_obj_t* ui_OtaHostnameLabel = NULL;
lv_obj_t* ui_OtaCountdownLabel = NULL;
lv_obj_t* ui_OtaProgressBar = NULL;
lv_obj_t* ui_OtaActionButton = NULL;
lv_obj_t* ui_OtaActionLabel = NULL;

/* Wi-Fi + MQTT */
lv_obj_t* ui_WifiStatusLabel = NULL;
lv_obj_t* ui_MqttStatusLabel = NULL;
lv_obj_t* ui_SsidTextarea = NULL;
lv_obj_t* ui_WifiPasswordTextarea = NULL;
lv_obj_t* ui_MqttUserTextarea = NULL;
lv_obj_t* ui_MqttPasswordTextarea = NULL;
lv_obj_t* ui_Keyboard = NULL;
lv_obj_t* ui_ClockLabels[5] = {NULL};
lv_obj_t* ui_HeaderWifiIcons[5] = {NULL};
lv_obj_t* ui_HeaderMqttLabels[5] = {NULL};

static UiScreen currentScreen = UI_SCREEN_OVERVIEW;

static lv_obj_t* screen_from_id(UiScreen screen) {
    switch (screen) {
        case UI_SCREEN_MINIATURES: return ui_Miniatures;
        case UI_SCREEN_SETTINGS: return ui_Settings;
        case UI_SCREEN_OTA: return ui_Ota;
        case UI_SCREEN_WIFI_MQTT: return ui_WifiMqtt;
        case UI_SCREEN_OVERVIEW:
        default: return ui_Overview;
    }
}

lv_obj_t* ui_make_header(lv_obj_t* parent, const char* title, bool showBack) {
    lv_obj_t* header = lv_obj_create(parent);
    lv_obj_add_style(header, &ui_style_header, 0);
    lv_obj_set_size(header, 480, 40);
    lv_obj_set_pos(header, 0, 0);
    lv_obj_clear_flag(header, LV_OBJ_FLAG_SCROLLABLE);

    if (showBack) {
        lv_obj_t* back = lv_btn_create(header);
        lv_obj_add_style(back, &ui_style_secondary_button, 0);
        lv_obj_set_size(back, 38, 30);
        lv_obj_align(back, LV_ALIGN_LEFT_MID, 0, 0);
        lv_obj_add_event_cb(back, ui_event_back, LV_EVENT_CLICKED, NULL);

        lv_obj_t* icon = lv_label_create(back);
        lv_label_set_text(icon, LV_SYMBOL_LEFT);
        lv_obj_center(icon);
    }

    lv_obj_t* label = lv_label_create(header);
    lv_label_set_text(label, title);
    lv_obj_set_style_text_font(label, UI_FONT_M, 0);
    lv_obj_set_style_text_color(label, ui_color_text(), 0);
    lv_obj_align(label, LV_ALIGN_LEFT_MID, showBack ? 48 : 2, 0);

    lv_obj_t* clock = lv_label_create(header);
    lv_label_set_text(clock," --:--");
    lv_obj_add_style(clock, &ui_style_muted_text, 0);
    lv_obj_set_style_text_font(clock, UI_FONT_M, 0);
    lv_obj_align(clock, LV_ALIGN_RIGHT_MID, 0, 0);

    lv_obj_t* mqtt = lv_label_create(header);
    lv_label_set_text(mqtt, "MQTT");
    lv_obj_add_style(mqtt, &ui_style_muted_text, 0);
    lv_obj_set_style_text_font(mqtt, UI_FONT_S, 0);
    lv_obj_align_to(mqtt, clock, LV_ALIGN_OUT_LEFT_MID, -24, 0);

    lv_obj_t* wifi = lv_label_create(header);
    lv_label_set_text(wifi, LV_SYMBOL_WIFI);
    lv_obj_add_style(wifi, &ui_style_muted_text, 0);
    lv_obj_align_to(wifi, mqtt, LV_ALIGN_OUT_LEFT_MID, -10, 0);

    /* Screen creation order matches UiScreen. */
    for (uint8_t i = 0; i < 5; ++i) {
        if (!ui_ClockLabels[i]) {
            ui_ClockLabels[i] = clock;
            ui_HeaderWifiIcons[i] = wifi;
            ui_HeaderMqttLabels[i] = mqtt;
            break;
        }
    }

    return header;
}

lv_obj_t* ui_make_card(lv_obj_t* parent, lv_coord_t x, lv_coord_t y, lv_coord_t w, lv_coord_t h) {
    lv_obj_t* card = lv_obj_create(parent);
    lv_obj_add_style(card, &ui_style_card, 0);
    lv_obj_add_style(card, &ui_style_card_press, LV_STATE_PRESSED);
    lv_obj_set_pos(card, x, y);
    lv_obj_set_size(card, w, h);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);
    return card;
}

lv_obj_t* ui_make_label(lv_obj_t* parent, const char* text, lv_coord_t x, lv_coord_t y) {
    lv_obj_t* label = lv_label_create(parent);
    lv_label_set_text(label, text);
    lv_obj_set_pos(label, x, y);
    return label;
}

lv_obj_t* ui_make_button(lv_obj_t* parent, const char* text, lv_coord_t x, lv_coord_t y, lv_coord_t w, lv_coord_t h, bool primary) {
    lv_obj_t* btn = lv_btn_create(parent);
    lv_obj_add_style(btn, primary ? &ui_style_primary_button : &ui_style_secondary_button, 0);
    lv_obj_set_pos(btn, x, y);
    lv_obj_set_size(btn, w, h);

    lv_obj_t* label = lv_label_create(btn);
    lv_label_set_text(label, text);
    lv_obj_center(label);
    return btn;
}

void ui_init(void) {
    ui_theme_init();
    ui_events_init();

    ui_overview_screen_init();
    ui_miniatures_screen_init();
    ui_settings_screen_init();
    ui_ota_screen_init();
    ui_wifi_mqtt_screen_init();

    ui_state_init();
    ui_state_apply_all();
    ui_load_screen(UI_SCREEN_OVERVIEW);
}

void ui_destroy(void) {
    if (ui_Overview) lv_obj_del(ui_Overview);
    if (ui_Miniatures) lv_obj_del(ui_Miniatures);
    if (ui_Settings) lv_obj_del(ui_Settings);
    if (ui_Ota) lv_obj_del(ui_Ota);
    if (ui_WifiMqtt) lv_obj_del(ui_WifiMqtt);

    ui_Overview = NULL;
    ui_Miniatures = NULL;
    ui_Settings = NULL;
    ui_Ota = NULL;
    ui_WifiMqtt = NULL;
}

void ui_load_screen(UiScreen screen) {
    lv_obj_t* target = screen_from_id(screen);
    if (!target) return;

    const UiScreen previousScreen = currentScreen;
    currentScreen = screen;
    lv_scr_load_anim(target, LV_SCR_LOAD_ANIM_FADE_ON, 120, 0, false);

    const UiActionHandlers* handlers = ui_events_get_handlers();
    if (handlers && handlers->onScreenChanged) {
        handlers->onScreenChanged(previousScreen, screen);
    }
}

UiScreen ui_get_current_screen(void) {
    return currentScreen;
}
