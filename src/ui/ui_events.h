#pragma once

#include "ui_types.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    void (*onCabinetPowerChanged)(bool enabled);
    void (*onCabinetBrightnessChanged)(uint8_t percent);

    void (*onMiniaturesPowerChanged)(bool enabled);
    void (*onMiniaturesBrightnessChanged)(uint8_t percent);

    void (*onSceneSelected)(uint8_t sceneIndex);

    void (*onMiniaturePrevious)(void);
    void (*onMiniatureNext)(void);

    void (*onBrightnessLimitChanged)(uint8_t percent);

    void (*onWifiMqttSave)(
        const char* ssid,
        const char* wifiPassword,
        const char* mqttUser,
        const char* mqttPassword
    );
    void (*onWifiMqttReconnectRequested)(void);

    void (*onOtaEnableRequested)(uint32_t timeoutSeconds);
    void (*onOtaDisableRequested)(void);

    void (*onScreenChanged)(UiScreen previous, UiScreen current);
} UiActionHandlers;

void ui_events_init(void);
void ui_events_set_handlers(const UiActionHandlers* handlers);
const UiActionHandlers* ui_events_get_handlers(void);

#ifdef __cplusplus
}
#endif
