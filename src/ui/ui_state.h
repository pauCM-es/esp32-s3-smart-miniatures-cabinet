#pragma once

#include "ui_types.h"

#ifdef __cplusplus
extern "C" {
#endif

void ui_state_init(void);
const UiState* ui_state_get(void);
void ui_state_apply_all(void);
void ui_state_set_clock(uint8_t hour, uint8_t minute);

void ui_state_set_cabinet_light(bool on, uint8_t brightnessPercent);
void ui_state_set_miniatures_light(bool on, uint8_t brightnessPercent);
void ui_state_set_miniatures_brightness_limit(uint8_t percent);

void ui_state_set_miniature_count(uint16_t count);
void ui_state_set_scenes(
    const char* const* names,
    uint8_t count,
    int8_t activeIndex
);
void ui_state_set_active_scene(int8_t activeIndex);

void ui_state_set_miniature(
    const char* name,
    uint16_t index,
    uint16_t total,
    uint8_t shelf,
    const char* location
);

void ui_state_set_ota(
    UiOtaState state,
    uint8_t progressPercent,
    uint32_t remainingSeconds,
    const char* firmwareVersion,
    const char* hostname
);

void ui_state_set_connectivity(
    bool wifiConnected,
    bool mqttConnected,
    const char* ssid,
    const char* mqttUser
);

#ifdef __cplusplus
}
#endif
