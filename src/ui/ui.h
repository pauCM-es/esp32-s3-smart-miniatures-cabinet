#pragma once

#include "lvgl.h"
#include "ui_types.h"

#ifdef __cplusplus
extern "C" {
#endif

/* Screens */
extern lv_obj_t* ui_Overview;
extern lv_obj_t* ui_Miniatures;
extern lv_obj_t* ui_Settings;
extern lv_obj_t* ui_Ota;
extern lv_obj_t* ui_WifiMqtt;

/* Common dynamic widgets - Overview */
extern lv_obj_t* ui_CabinetSwitch;
extern lv_obj_t* ui_CabinetSlider;
extern lv_obj_t* ui_CabinetBrightnessLabel;
extern lv_obj_t* ui_MiniaturesSwitch;
extern lv_obj_t* ui_MiniaturesSlider;
extern lv_obj_t* ui_MiniaturesBrightnessLabel;
extern lv_obj_t* ui_MiniatureCountLabel;
extern lv_obj_t* ui_SceneButtons[UI_MAX_SCENES];
extern lv_obj_t* ui_SceneLabels[UI_MAX_SCENES];

/* Miniatures */
extern lv_obj_t* ui_MiniNameLabel;
extern lv_obj_t* ui_MiniShelfLabel;
extern lv_obj_t* ui_MiniLocationLabel;
extern lv_obj_t* ui_MiniPositionLabel;
extern lv_obj_t* ui_MiniPreviousButton;
extern lv_obj_t* ui_MiniNextButton;

/* Settings */
extern lv_obj_t* ui_BrightnessLimitSpinbox;

/* OTA */
extern lv_obj_t* ui_OtaStatusLabel;
extern lv_obj_t* ui_OtaDetailLabel;
extern lv_obj_t* ui_OtaVersionLabel;
extern lv_obj_t* ui_OtaHostnameLabel;
extern lv_obj_t* ui_OtaCountdownLabel;
extern lv_obj_t* ui_OtaProgressBar;
extern lv_obj_t* ui_OtaActionButton;
extern lv_obj_t* ui_OtaActionLabel;

/* Wi-Fi + MQTT */
extern lv_obj_t* ui_WifiStatusLabel;
extern lv_obj_t* ui_MqttStatusLabel;
extern lv_obj_t* ui_SsidTextarea;
extern lv_obj_t* ui_WifiPasswordTextarea;
extern lv_obj_t* ui_MqttUserTextarea;
extern lv_obj_t* ui_MqttPasswordTextarea;
extern lv_obj_t* ui_Keyboard;
extern lv_obj_t* ui_ClockLabels[5];

void ui_init(void);
void ui_destroy(void);
void ui_load_screen(UiScreen screen);
UiScreen ui_get_current_screen(void);

/* Screen builders, kept public to resemble SquareLine output structure. */
void ui_overview_screen_init(void);
void ui_miniatures_screen_init(void);
void ui_settings_screen_init(void);
void ui_ota_screen_init(void);
void ui_wifi_mqtt_screen_init(void);

#ifdef __cplusplus
}
#endif
