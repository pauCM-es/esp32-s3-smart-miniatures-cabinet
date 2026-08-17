#include "ui_state.h"

#include <stdio.h>
#include <string.h>
#include "ui.h"
#include "ui_theme.h"

static UiState state;

static uint8_t clamp_percent(uint8_t value) {
    return value > 100 ? 100 : value;
}

static void copy_text(char* dst, size_t dstSize, const char* src) {
    if (!dst || dstSize == 0) return;
    if (!src) src = "";
    strncpy(dst, src, dstSize - 1);
    dst[dstSize - 1] = '\0';
}

static void render_clock(void) {
    char text[16];
    lv_snprintf(text, sizeof(text), "%s", state.clockText[0] ? state.clockText : "--:--");
    for (uint8_t i = 0; i < 5; ++i) {
        if (ui_ClockLabels[i]) lv_label_set_text(ui_ClockLabels[i], text);
    }
}

static void render_overview(void) {
    if (!ui_Overview) return;

    if (state.cabinetLightOn) lv_obj_add_state(ui_CabinetSwitch, LV_STATE_CHECKED);
    else lv_obj_clear_state(ui_CabinetSwitch, LV_STATE_CHECKED);

    lv_slider_set_value(ui_CabinetSlider, state.cabinetBrightnessPercent, LV_ANIM_OFF);
    char text[32];
    lv_snprintf(text, sizeof(text), "%u%%", state.cabinetBrightnessPercent);
    lv_label_set_text(ui_CabinetBrightnessLabel, text);

    if (state.miniaturesLightOn) lv_obj_add_state(ui_MiniaturesSwitch, LV_STATE_CHECKED);
    else lv_obj_clear_state(ui_MiniaturesSwitch, LV_STATE_CHECKED);

    lv_slider_set_value(ui_MiniaturesSlider, state.miniaturesBrightnessPercent, LV_ANIM_OFF);
    lv_snprintf(text, sizeof(text), "%u%%", state.miniaturesBrightnessPercent);
    lv_label_set_text(ui_MiniaturesBrightnessLabel, text);

    lv_snprintf(text, sizeof(text), "%u", state.miniatureCount);
    lv_label_set_text(ui_MiniatureCountLabel, text);

    for (uint8_t i = 0; i < UI_MAX_SCENES; ++i) {
        if (!ui_SceneButtons[i] || !ui_SceneLabels[i]) continue;

        if (i < state.sceneCount) {
            lv_obj_clear_flag(ui_SceneButtons[i], LV_OBJ_FLAG_HIDDEN);
            lv_label_set_text(ui_SceneLabels[i], state.sceneNames[i]);

            if ((int8_t)i == state.activeSceneIndex) {
                lv_obj_set_style_border_color(ui_SceneButtons[i], ui_color_accent(), 0);
                lv_obj_set_style_border_width(ui_SceneButtons[i], 2, 0);
                lv_obj_set_style_text_color(ui_SceneButtons[i], ui_color_accent(), 0);
            } else {
                lv_obj_set_style_border_color(ui_SceneButtons[i], ui_color_border(), 0);
                lv_obj_set_style_border_width(ui_SceneButtons[i], 1, 0);
                lv_obj_set_style_text_color(ui_SceneButtons[i], ui_color_text(), 0);
            }
        } else {
            lv_obj_add_flag(ui_SceneButtons[i], LV_OBJ_FLAG_HIDDEN);
        }
    }
}

static void render_miniature(void) {
    if (!ui_Miniatures) return;

    lv_label_set_text(ui_MiniNameLabel, state.miniature.name[0] ? state.miniature.name : "No miniature");
    lv_label_set_text(ui_MiniCollectionLabel, state.miniature.collection);
    lv_label_set_text(ui_MiniArtistLabel, state.miniature.artist);
    lv_label_set_text(ui_MiniDateLabel, state.miniature.date);

    char text[64];
    if (state.miniature.shelf > 0 && state.miniature.location[0]) {
        lv_snprintf(text, sizeof(text), "%u-%s", state.miniature.shelf, state.miniature.location);
    } else {
        lv_snprintf(text, sizeof(text), "--");
    }
    lv_label_set_text(ui_MiniLocationLabel, text);

    lv_snprintf(
        text,
        sizeof(text),
        "%u",
        state.miniature.total ? state.miniature.index : 0
    );
    lv_label_set_text(ui_MiniPositionLabel, text);

    lv_snprintf(text, sizeof(text), "/%u", state.miniature.total);
    lv_label_set_text(ui_MiniPositionTotalLabel, text);
    lv_obj_align(ui_MiniPositionTotalLabel, LV_ALIGN_BOTTOM_RIGHT, -10, -12);
    lv_obj_align_to(
        ui_MiniPositionLabel,
        ui_MiniPositionTotalLabel,
        LV_ALIGN_OUT_LEFT_MID,
        -4,
        0
    );

    if (state.miniature.total == 0) {
        lv_obj_add_state(ui_MiniPreviousButton, LV_STATE_DISABLED);
    } else {
        lv_obj_clear_state(ui_MiniPreviousButton, LV_STATE_DISABLED);
    }

    if (state.miniature.total == 0) {
        lv_obj_add_state(ui_MiniNextButton, LV_STATE_DISABLED);
    } else {
        lv_obj_clear_state(ui_MiniNextButton, LV_STATE_DISABLED);
    }
}

static void render_settings(void) {
    if (!ui_Settings || !ui_BrightnessLimitSpinbox) return;
    lv_spinbox_set_value(ui_BrightnessLimitSpinbox, state.miniaturesBrightnessLimitPercent);
}

static void render_ota(void) {
    if (!ui_Ota) return;

    char text[80];

    lv_label_set_text(ui_OtaStatusLabel, "OTA unavailable");
    lv_label_set_text(ui_OtaDetailLabel, "Firmware updates are not implemented yet");
    lv_label_set_text(ui_OtaActionLabel, "Unavailable");
    lv_obj_add_state(ui_OtaActionButton, LV_STATE_DISABLED);

    lv_snprintf(text, sizeof(text), "Version  %s", state.firmwareVersion[0] ? state.firmwareVersion : "--");
    lv_label_set_text(ui_OtaVersionLabel, text);

    lv_snprintf(text, sizeof(text), "Host  %s", state.otaHostname[0] ? state.otaHostname : "--");
    lv_label_set_text(ui_OtaHostnameLabel, text);

    uint32_t minutes = state.otaRemainingSeconds / 60U;
    uint32_t seconds = state.otaRemainingSeconds % 60U;
    lv_snprintf(text, sizeof(text), "Expires  %02lu:%02lu", (unsigned long)minutes, (unsigned long)seconds);
    lv_label_set_text(ui_OtaCountdownLabel, text);

    lv_bar_set_value(ui_OtaProgressBar, state.otaProgressPercent, LV_ANIM_OFF);

    lv_obj_add_flag(ui_OtaProgressBar, LV_OBJ_FLAG_HIDDEN);
}

static void render_connectivity(void) {
    for (uint8_t i = 0; i < 5; ++i) {
        if (ui_HeaderWifiIcons[i]) {
            lv_obj_set_style_text_color(
                ui_HeaderWifiIcons[i],
                state.wifiConnected ? ui_color_accent() : ui_color_muted(),
                0
            );
        }
        if (ui_HeaderMqttLabels[i]) {
            lv_obj_set_style_text_color(
                ui_HeaderMqttLabels[i],
                state.mqttConnected ? ui_color_accent() : ui_color_muted(),
                0
            );
        }
    }

    if (!ui_WifiMqtt) return;

    lv_label_set_text(
        ui_WifiStatusLabel,
        state.wifiConnected ? LV_SYMBOL_OK " Wi-Fi connected" : LV_SYMBOL_CLOSE " Wi-Fi disconnected"
    );
    lv_obj_set_style_text_color(
        ui_WifiStatusLabel,
        state.wifiConnected ? ui_color_success() : ui_color_muted(),
        0
    );

    lv_label_set_text(
        ui_MqttStatusLabel,
        state.mqttConnected ? LV_SYMBOL_OK " MQTT connected" : LV_SYMBOL_CLOSE " MQTT disconnected"
    );
    lv_obj_set_style_text_color(
        ui_MqttStatusLabel,
        state.mqttConnected ? ui_color_success() : ui_color_muted(),
        0
    );

    if (state.ssid[0]) lv_textarea_set_text(ui_SsidTextarea, state.ssid);
    if (state.mqttUser[0]) lv_textarea_set_text(ui_MqttUserTextarea, state.mqttUser);
}

void ui_state_init(void) {
    memset(&state, 0, sizeof(state));

    state.activeSceneIndex = -1;
    state.miniaturesBrightnessLimitPercent = 100;
    state.otaState = UI_OTA_DISABLED;
    copy_text(state.clockText, sizeof(state.clockText), "--:--");
}

const UiState* ui_state_get(void) {
    return &state;
}

void ui_state_apply_all(void) {
    render_clock();
    render_overview();
    render_miniature();
    render_settings();
    render_ota();
    render_connectivity();
}

void ui_state_set_clock(uint8_t hour, uint8_t minute) {
    if (hour > 23) hour = 23;
    if (minute > 59) minute = 59;
    lv_snprintf(state.clockText, sizeof(state.clockText), "%02u:%02u", hour, minute);
    render_clock();
}

void ui_state_set_cabinet_light(bool on, uint8_t brightnessPercent) {
    state.cabinetLightOn = on;
    state.cabinetBrightnessPercent = clamp_percent(brightnessPercent);
    render_overview();
}

void ui_state_set_miniatures_light(bool on, uint8_t brightnessPercent) {
    state.miniaturesLightOn = on;
    state.miniaturesBrightnessPercent = clamp_percent(brightnessPercent);
    render_overview();
}

void ui_state_set_miniatures_brightness_limit(uint8_t percent) {
    state.miniaturesBrightnessLimitPercent = clamp_percent(percent);
    if (state.miniaturesBrightnessPercent > state.miniaturesBrightnessLimitPercent) {
        state.miniaturesBrightnessPercent = state.miniaturesBrightnessLimitPercent;
    }
    render_settings();
    render_overview();
}

void ui_state_set_miniature_count(uint16_t count) {
    state.miniatureCount = count;
    render_overview();
}

void ui_state_set_scenes(const char* const* names, uint8_t count, int8_t activeIndex) {
    if (count > UI_MAX_SCENES) count = UI_MAX_SCENES;
    state.sceneCount = count;
    state.activeSceneIndex = activeIndex;

    for (uint8_t i = 0; i < UI_MAX_SCENES; ++i) {
        copy_text(
            state.sceneNames[i],
            sizeof(state.sceneNames[i]),
            (names && i < count) ? names[i] : ""
        );
    }
    render_overview();
}

void ui_state_set_active_scene(int8_t activeIndex) {
    state.activeSceneIndex = activeIndex;
    render_overview();
}

void ui_state_set_miniature(
    const char* name,
    const char* collection,
    const char* artist,
    const char* date,
    uint16_t index,
    uint16_t total,
    uint8_t shelf,
    const char* location
) {
    copy_text(state.miniature.name, sizeof(state.miniature.name), name);
    copy_text(state.miniature.collection, sizeof(state.miniature.collection), collection);
    copy_text(state.miniature.artist, sizeof(state.miniature.artist), artist);
    copy_text(state.miniature.date, sizeof(state.miniature.date), date);
    state.miniature.index = index;
    state.miniature.total = total;
    state.miniature.shelf = shelf;
    copy_text(state.miniature.location, sizeof(state.miniature.location), location);
    render_miniature();
}

void ui_state_set_ota(
    UiOtaState otaState,
    uint8_t progressPercent,
    uint32_t remainingSeconds,
    const char* firmwareVersion,
    const char* hostname
) {
    state.otaState = otaState;
    state.otaProgressPercent = clamp_percent(progressPercent);
    state.otaRemainingSeconds = remainingSeconds;

    if (firmwareVersion) copy_text(state.firmwareVersion, sizeof(state.firmwareVersion), firmwareVersion);
    if (hostname) copy_text(state.otaHostname, sizeof(state.otaHostname), hostname);

    render_ota();
}

void ui_state_set_connectivity(
    bool wifiConnected,
    bool mqttConnected,
    const char* ssid,
    const char* mqttUser
) {
    state.wifiConnected = wifiConnected;
    state.mqttConnected = mqttConnected;

    if (ssid) copy_text(state.ssid, sizeof(state.ssid), ssid);
    if (mqttUser) copy_text(state.mqttUser, sizeof(state.mqttUser), mqttUser);

    render_connectivity();
}
