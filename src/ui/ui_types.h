#pragma once

#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define UI_MAX_SCENES 4
#define UI_SCENE_NAME_LEN 20
#define UI_MINIATURE_NAME_LEN 48
#define UI_LOCATION_LABEL_LEN 24
#define UI_SSID_LEN 33
#define UI_MQTT_USER_LEN 33
#define UI_FIRMWARE_VERSION_LEN 16
#define UI_OTA_HOSTNAME_LEN 40

typedef enum {
    UI_SCREEN_OVERVIEW = 0,
    UI_SCREEN_MINIATURES,
    UI_SCREEN_SETTINGS,
    UI_SCREEN_OTA,
    UI_SCREEN_WIFI_MQTT
} UiScreen;

typedef enum {
    UI_OTA_DISABLED = 0,
    UI_OTA_READY,
    UI_OTA_UPDATING,
    UI_OTA_ERROR
} UiOtaState;

typedef struct {
    char name[UI_MINIATURE_NAME_LEN];
    uint16_t index;
    uint16_t total;
    uint8_t shelf;
    char location[UI_LOCATION_LABEL_LEN];
} UiMiniatureView;

typedef struct {
    bool cabinetLightOn;
    uint8_t cabinetBrightnessPercent;

    bool miniaturesLightOn;
    uint8_t miniaturesBrightnessPercent;
    uint8_t miniaturesBrightnessLimitPercent;

    uint16_t miniatureCount;

    uint8_t sceneCount;
    int8_t activeSceneIndex;
    char sceneNames[UI_MAX_SCENES][UI_SCENE_NAME_LEN];

    UiMiniatureView miniature;

    UiOtaState otaState;
    uint8_t otaProgressPercent;
    uint32_t otaRemainingSeconds;
    char firmwareVersion[UI_FIRMWARE_VERSION_LEN];
    char otaHostname[UI_OTA_HOSTNAME_LEN];

    bool wifiConnected;
    bool mqttConnected;
    char ssid[UI_SSID_LEN];
    char mqttUser[UI_MQTT_USER_LEN];
    char clockText[6];
} UiState;

#ifdef __cplusplus
}
#endif
