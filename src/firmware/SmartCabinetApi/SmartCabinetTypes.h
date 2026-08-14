#pragma once

#include <cstdint>

struct CabinetSettings {
    static constexpr uint16_t SCHEMA_VERSION = 1;

    uint16_t schemaVersion = SCHEMA_VERSION;
    bool power = false;
    uint8_t brightness = 50;
};

struct CabinetRuntimeState {
    bool power = false;
    uint8_t brightness = 50;

    bool hasHighlight = false;
    uint16_t highlightShelf = 0;
    uint16_t highlightLocation = 0;

    bool miniLightPower = false;
    uint8_t miniLightBrightness = 45;
    uint8_t miniLightR = 0;
    uint8_t miniLightG = 190;
    uint8_t miniLightB = 255;
};
