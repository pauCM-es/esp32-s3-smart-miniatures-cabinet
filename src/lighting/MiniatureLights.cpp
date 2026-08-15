#include "lighting/MiniatureLights.h"

#include "models/ValueUtils.h"

#include <cstring>

namespace smartcabinet {
bool gHighlightMask[config::kMiniatureLedCount] = {};


void MiniatureLights::begin() {
#if SMART_CABINET_ENABLE_MINIATURE_LIGHTS
    FastLED.addLeds<MINIATURE_LED_TYPE, config::kMiniatureLedDataPin, MINIATURE_LED_COLOR_ORDER>(
        leds_, config::kMiniatureLedCount);
    FastLED.setBrightness(percentToByte(brightness_, config::kMiniatureMaxBrightness));
    FastLED.clear(true);
#endif
}

void MiniatureLights::update(uint32_t nowMs) {
    (void)nowMs;
#if SMART_CABINET_ENABLE_MINIATURE_LIGHTS
    const bool animated = !highlightActive_ && effect_ != LightEffect::Static;
    if (!dirty_ && !animated) {
        return;
    }
    if (animated && nowMs - lastFrameAtMs_ < config::kLedFrameIntervalMs) {
        return;
    }
    lastFrameAtMs_ = nowMs;
    render(nowMs);
    FastLED.show();
    dirty_ = false;
#endif
}

bool MiniatureLights::available() const {
    return SMART_CABINET_ENABLE_MINIATURE_LIGHTS != 0;
}

void MiniatureLights::setPower(bool on) {
    on_ = on;
    dirty_ = true;
}

void MiniatureLights::toggle() {
    setPower(!on_);
}

void MiniatureLights::setBrightness(uint8_t percent) {
    brightness_ = clampPercent(percent);
#if SMART_CABINET_ENABLE_MINIATURE_LIGHTS
    FastLED.setBrightness(percentToByte(brightness_, config::kMiniatureMaxBrightness));
#endif
    dirty_ = true;
}

void MiniatureLights::setColor(RgbColor color) {
    color_ = color;
    dirty_ = true;
}

void MiniatureLights::setEffect(LightEffect effect) {
    effect_ = effect;
    dirty_ = true;
}

bool MiniatureLights::highlightSegment(uint16_t start, uint16_t count, RgbColor color) {
    if (count == 0 || static_cast<uint32_t>(start) + count > config::kMiniatureLedCount) {
        return false;
    }
    highlightActive_ = true;
    highlightStart_ = start;
    highlightCount_ = count;
    highlightColor_ = color;
    for (uint16_t i = 0; i < count; ++i) {
        gHighlightMask[start + i] = true;
    }
    dirty_ = true;
    return true;
}

void MiniatureLights::clearHighlight() {
    highlightActive_ = false;
    highlightCount_ = 0;
    std::memset(gHighlightMask, 0, sizeof(gHighlightMask));
    dirty_ = true;
}

bool MiniatureLights::isOn() const {
    return on_;
}

uint8_t MiniatureLights::brightness() const {
    return brightness_;
}

RgbColor MiniatureLights::color() const {
    return color_;
}

LightEffect MiniatureLights::effect() const {
    return effect_;
}

bool MiniatureLights::isHighlightActive() const {
    return highlightActive_;
}

uint16_t MiniatureLights::ledCount() const {
    return config::kMiniatureLedCount;
}

void MiniatureLights::render(uint32_t nowMs) {
    if (highlightActive_) {
        renderHighlight();
        return;
    }

    if (!on_) {
        fill_solid(leds_, config::kMiniatureLedCount, CRGB::Black);
        return;
    }

    renderBase(nowMs);
}

void MiniatureLights::renderBase(uint32_t nowMs) {
    switch (effect_) {
        case LightEffect::Breathe: {
            const uint16_t phase = static_cast<uint16_t>((nowMs / 6U) % 510U);
            const uint8_t triangle = static_cast<uint8_t>(phase <= 255U ? phase : 510U - phase);
            const uint8_t level = static_cast<uint8_t>(64U + (static_cast<uint16_t>(triangle) * 191U) / 255U);
            CRGB c = toCrgb(color_);
            c.nscale8_video(level);
            fill_solid(leds_, config::kMiniatureLedCount, c);
            break;
        }
        case LightEffect::Rainbow: {
            const uint8_t baseHue = static_cast<uint8_t>((nowMs / 20U) & 0xFFU);
            fill_rainbow(leds_, config::kMiniatureLedCount, baseHue,
                         static_cast<uint8_t>(255U / (config::kMiniatureLedCount > 255 ? 255 : config::kMiniatureLedCount)));
            break;
        }
        case LightEffect::Static:
        default:
            fill_solid(leds_, config::kMiniatureLedCount, toCrgb(color_));
            break;
    }
}

void MiniatureLights::renderHighlight() {
    fill_solid(leds_, config::kMiniatureLedCount, CRGB::Black);
    const CRGB c = toCrgb(highlightColor_);
    for (uint16_t i = 0; i < config::kMiniatureLedCount; ++i) {
        if (gHighlightMask[i]) leds_[i] = c;
    }
}

CRGB MiniatureLights::toCrgb(RgbColor color) {
    return CRGB(color.r, color.g, color.b);
}

}  // namespace smartcabinet
