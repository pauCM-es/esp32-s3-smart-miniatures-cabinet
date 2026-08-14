#pragma once

#include <FastLED.h>
#include <cstdint>

#include "config/HardwareConfig.h"
#include "models/Color.h"
#include "models/LightingTypes.h"

namespace smartcabinet {

class MiniatureLights {
public:
    void begin();
    void update(uint32_t nowMs);
    bool available() const;

    void setShelfCount(uint8_t count);

    void setPower(bool on);
    void toggle();
    void setBrightness(uint8_t percent);
    void setColor(RgbColor color);
    void setEffect(LightEffect effect);

    bool highlightSegment(uint16_t start, uint16_t count, RgbColor color = kCyan);
    void clearHighlight();

    bool isOn() const;
    uint8_t brightness() const;
    RgbColor color() const;
    LightEffect effect() const;
    bool isHighlightActive() const;
    uint16_t ledCount() const;

private:
    CRGB leds_[config::kMiniatureLedCount]{};
    bool on_{false};
    uint8_t brightness_{45};
    RgbColor color_{0, 190, 255};
    LightEffect effect_{LightEffect::Static};
    bool highlightActive_{false};
    uint16_t highlightStart_{0};
    uint16_t highlightCount_{0};
    RgbColor highlightColor_{kCyan};
    uint32_t lastFrameAtMs_{0};
    bool dirty_{true};

    void render(uint32_t nowMs);
    void renderBase(uint32_t nowMs);
    void renderHighlight();
    static CRGB toCrgb(RgbColor color);
};

}  // namespace smartcabinet
