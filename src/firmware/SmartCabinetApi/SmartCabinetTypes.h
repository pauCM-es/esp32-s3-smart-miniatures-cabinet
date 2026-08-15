#pragma once

#include <cstdint>

struct CabinetSettings {
    static constexpr uint16_t SCHEMA_VERSION = 2;

    uint16_t schemaVersion = SCHEMA_VERSION;
    bool power = false;
    uint8_t brightness = 50;
    uint8_t highlightR = 156;
    uint8_t highlightG = 39;
    uint8_t highlightB = 176;
};

struct CabinetRuntimeState {
    bool power = false;
    uint8_t brightness = 50;
    uint8_t activeScene = 0;  // 0=Manual, 1=Off, 2=Display, 3=Showcase

    bool hasHighlight = false;
    uint16_t highlightShelf = 0;
    uint16_t highlightLocation = 0;
    uint8_t highlightR = 156;
    uint8_t highlightG = 39;
    uint8_t highlightB = 176;

    bool miniLightPower = false;
    uint8_t miniLightBrightness = 45;
    uint8_t miniLightR = 0;
    uint8_t miniLightG = 190;
    uint8_t miniLightB = 255;
};
