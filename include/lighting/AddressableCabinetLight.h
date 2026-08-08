#pragma once

#include <Adafruit_NeoPixel.h>
#include <cstdint>

#include "models/Color.h"
#include "models/LightingTypes.h"

namespace smartcabinet {

class AddressableCabinetLight {
public:
    AddressableCabinetLight();

    void begin();
    void update(uint32_t nowMs);
    bool available() const;

    void setPower(bool on);
    void toggle();
    void setBrightness(uint8_t percent);
    void setColor(RgbwColor color);
    void setEffect(LightEffect effect);

    bool isOn() const;
    uint8_t brightness() const;
    RgbwColor color() const;
    LightEffect effect() const;

private:
    Adafruit_NeoPixel strip_;
    bool on_{false};
    uint8_t brightness_{60};
    RgbwColor color_{0, 0, 0, 220};
    LightEffect effect_{LightEffect::Static};
    uint32_t lastFrameAtMs_{0};
    bool dirty_{true};

    void render(uint32_t nowMs);
    void renderStatic();
    void renderBreathe(uint32_t nowMs);
    void renderRainbow(uint32_t nowMs);
    void clear();
    void showColor(RgbwColor color);
    static RgbwColor wheel(uint8_t position);
};

}  // namespace smartcabinet
