#include "lighting/AddressableCabinetLight.h"

#include "config/HardwareConfig.h"
#include "models/ValueUtils.h"

namespace smartcabinet {

AddressableCabinetLight::AddressableCabinetLight()
    : strip_(config::kRgbwCabinetLedCount, config::kRgbwCabinetDataPin, NEO_GRBW + NEO_KHZ800) {}

void AddressableCabinetLight::begin() {
#if SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT
    strip_.begin();
    strip_.setBrightness(percentToByte(brightness_));
    strip_.clear();
    strip_.show();
#endif
}

void AddressableCabinetLight::update(uint32_t nowMs) {
    (void)nowMs;
#if SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT
    const bool animated = effect_ != LightEffect::Static;
    if (!dirty_ && !animated) {
        return;
    }
    if (animated && nowMs - lastFrameAtMs_ < config::kLedFrameIntervalMs) {
        return;
    }
    lastFrameAtMs_ = nowMs;
    render(nowMs);
    dirty_ = false;
#endif
}

bool AddressableCabinetLight::available() const {
    return SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT != 0;
}

void AddressableCabinetLight::setPower(bool on) {
    on_ = on;
    dirty_ = true;
}

void AddressableCabinetLight::toggle() {
    setPower(!on_);
}

void AddressableCabinetLight::setBrightness(uint8_t percent) {
    brightness_ = clampPercent(percent);
#if SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT
    strip_.setBrightness(percentToByte(brightness_));
#endif
    dirty_ = true;
}

void AddressableCabinetLight::setColor(RgbwColor color) {
    color_ = color;
    dirty_ = true;
}

void AddressableCabinetLight::setEffect(LightEffect effect) {
    effect_ = effect;
    dirty_ = true;
}

bool AddressableCabinetLight::isOn() const {
    return on_;
}

uint8_t AddressableCabinetLight::brightness() const {
    return brightness_;
}

RgbwColor AddressableCabinetLight::color() const {
    return color_;
}

LightEffect AddressableCabinetLight::effect() const {
    return effect_;
}

void AddressableCabinetLight::render(uint32_t nowMs) {
    if (!on_) {
        clear();
        return;
    }

    switch (effect_) {
        case LightEffect::Breathe:
            renderBreathe(nowMs);
            break;
        case LightEffect::Rainbow:
            renderRainbow(nowMs);
            break;
        case LightEffect::Static:
        default:
            renderStatic();
            break;
    }
    strip_.show();
}

void AddressableCabinetLight::renderStatic() {
    showColor(color_);
}

void AddressableCabinetLight::renderBreathe(uint32_t nowMs) {
    const uint16_t phase = static_cast<uint16_t>((nowMs / 6U) % 510U);
    const uint8_t triangle = static_cast<uint8_t>(phase <= 255U ? phase : 510U - phase);
    const uint8_t level = static_cast<uint8_t>(64U + (static_cast<uint16_t>(triangle) * 191U) / 255U);
    showColor({scaleByte(color_.r, level), scaleByte(color_.g, level),
               scaleByte(color_.b, level), scaleByte(color_.w, level)});
}

void AddressableCabinetLight::renderRainbow(uint32_t nowMs) {
    const uint8_t offset = static_cast<uint8_t>((nowMs / 20U) & 0xFFU);
    const uint16_t count = strip_.numPixels();
    for (uint16_t i = 0; i < count; ++i) {
        const uint8_t pos = static_cast<uint8_t>(offset + (static_cast<uint32_t>(i) * 256U / count));
        const RgbwColor c = wheel(pos);
        strip_.setPixelColor(i, strip_.Color(c.r, c.g, c.b, c.w));
    }
}

void AddressableCabinetLight::clear() {
    strip_.clear();
    strip_.show();
}

void AddressableCabinetLight::showColor(RgbwColor color) {
    const uint32_t packed = strip_.Color(color.r, color.g, color.b, color.w);
    strip_.fill(packed, 0, strip_.numPixels());
}

RgbwColor AddressableCabinetLight::wheel(uint8_t position) {
    position = static_cast<uint8_t>(255U - position);
    if (position < 85U) {
        return {static_cast<uint8_t>(255U - position * 3U), 0,
                static_cast<uint8_t>(position * 3U), 0};
    }
    if (position < 170U) {
        position = static_cast<uint8_t>(position - 85U);
        return {0, static_cast<uint8_t>(position * 3U),
                static_cast<uint8_t>(255U - position * 3U), 0};
    }
    position = static_cast<uint8_t>(position - 170U);
    return {static_cast<uint8_t>(position * 3U),
            static_cast<uint8_t>(255U - position * 3U), 0, 0};
}

}  // namespace smartcabinet
