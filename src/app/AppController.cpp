#include "app/AppController.h"

#include <Arduino.h>

#include "config/HardwareConfig.h"
#include "models/ValueUtils.h"

namespace smartcabinet {

AppController::AppController(LightingManager& lighting,
                             CabinetLayout& layout,
                             MiniatureRepository& miniatures,
                             EncoderInput& encoder)
    : lighting_(lighting), layout_(layout), miniatures_(miniatures), encoder_(encoder) {}

void AppController::begin() {
    lighting_.begin();
    encoder_.begin();
    Serial.printf("[Encoder] available=%d  PWM available=%d\n",
                  encoder_.available(), lighting_.pwmCabinet().available());
}

void AppController::update(uint32_t nowMs) {
    handleEncoder(nowMs);

    if (highlightExpiresAtMs_ != 0 &&
        static_cast<int32_t>(nowMs - highlightExpiresAtMs_) >= 0) {
        clearHighlight();
    }

    lighting_.update(nowMs);
}

AppState AppController::state() const {
    AppState value{};

    const auto& pwm = lighting_.pwmCabinet();
    value.pwmCabinetAvailable = pwm.available();
    value.pwmCabinetOn = pwm.isOn();
    value.pwmCabinetBrightness = pwm.brightness();

    const auto& rgbw = lighting_.rgbwCabinet();
    value.rgbwCabinetAvailable = rgbw.available();
    value.rgbwCabinetOn = rgbw.isOn();
    value.rgbwCabinetBrightness = rgbw.brightness();
    value.rgbwCabinetColor = rgbw.color();
    value.rgbwCabinetEffect = rgbw.effect();

    const auto& miniatureLights = lighting_.miniatures();
    value.miniatureLightsAvailable = miniatureLights.available();
    value.miniatureLightsOn = miniatureLights.isOn();
    value.miniatureBrightness = miniatureLights.brightness();
    value.miniatureColor = miniatureLights.color();
    value.miniatureEffect = miniatureLights.effect();

    value.activeScene = lighting_.activeScene();
    value.highlightedMiniatureId = highlightedMiniatureId_;
    value.miniatureCount = miniatures_.count();
    return value;
}

void AppController::setPwmCabinetPower(bool on) {
    lighting_.setPwmCabinetPower(on);
}

void AppController::togglePwmCabinet() {
    lighting_.togglePwmCabinet();
}

void AppController::setPwmCabinetBrightness(uint8_t percent) {
    lighting_.setPwmCabinetBrightness(percent);
}

void AppController::setRgbwCabinetPower(bool on) {
    lighting_.setRgbwCabinetPower(on);
}

void AppController::toggleRgbwCabinet() {
    lighting_.toggleRgbwCabinet();
}

void AppController::setRgbwCabinetBrightness(uint8_t percent) {
    lighting_.setRgbwCabinetBrightness(percent);
}

void AppController::setRgbwCabinetColor(RgbwColor color) {
    lighting_.setRgbwCabinetColor(color);
}

void AppController::setRgbwCabinetEffect(LightEffect effect) {
    lighting_.setRgbwCabinetEffect(effect);
}

void AppController::setMiniaturePower(bool on) {
    lighting_.setMiniaturePower(on);
}

void AppController::toggleMiniatures() {
    lighting_.toggleMiniatures();
}

void AppController::setMiniatureBrightness(uint8_t percent) {
    lighting_.setMiniatureBrightness(percent);
}

void AppController::setMiniatureColor(RgbColor color) {
    lighting_.setMiniatureColor(color);
}

void AppController::setMiniatureEffect(LightEffect effect) {
    lighting_.setMiniatureEffect(effect);
}

void AppController::applyScene(SceneId id) {
    clearHighlight();
    lighting_.applyScene(id);
}

bool AppController::locateMiniature(uint8_t miniatureId, uint32_t durationMs) {
    const Miniature* miniature = miniatures_.byId(miniatureId);
    if (miniature == nullptr) {
        return false;
    }

    const Location* loc = layout_.location(miniature->locationId);
    if (loc == nullptr || loc->ledCount == 0) {
        return false;
    }

    if (!lighting_.highlightMiniatureSegment(loc->ledStart, loc->ledCount, kCyan)) {
        return false;
    }

    highlightedMiniatureId_ = miniatureId;
    setHighlightTimeout(millis(), durationMs == 0 ? config::kLocateDurationMs : durationMs);
    return true;
}

bool AppController::highlightLocation(uint8_t shelfIndex, uint8_t locationIndex, uint32_t durationMs) {
    return testLocation(CabinetLayout::makeLocationId(shelfIndex, locationIndex), durationMs);
}

bool AppController::testLocation(LocationId locationId, uint32_t durationMs) {
    const Location* loc = layout_.location(locationId);
    if (loc == nullptr || loc->ledCount == 0) {
        return false;
    }

    if (!lighting_.highlightMiniatureSegment(loc->ledStart, loc->ledCount, kPurple)) {
        return false;
    }

    highlightedMiniatureId_ = -1;
    setHighlightTimeout(millis(), durationMs == 0 ? config::kLocationTestDurationMs : durationMs);
    return true;
}

bool AppController::testLocationPersistent(LocationId locationId) {
    const Location* loc = layout_.location(locationId);
    if (loc == nullptr || loc->ledCount == 0) return false;
    if (!lighting_.highlightMiniatureSegment(loc->ledStart, loc->ledCount, kPurple)) {
        return false;
    }
    highlightedMiniatureId_ = -1;
    highlightExpiresAtMs_ = 0;
    return true;
}

void AppController::clearHighlight() {
    lighting_.clearMiniatureHighlight();
    highlightedMiniatureId_ = -1;
    highlightExpiresAtMs_ = 0;
}

const Miniature* AppController::miniatureByIndex(size_t index) const {
    return miniatures_.byIndex(index);
}

const Miniature* AppController::miniatureById(uint8_t id) const {
    return miniatures_.byId(id);
}

size_t AppController::miniatureCount() const {
    return miniatures_.count();
}

bool AppController::setShelfCount(uint8_t count) {
    return layout_.setShelfCount(count);
}

bool AppController::setShelfLedCount(uint8_t shelfIndex, uint16_t ledCount) {
    return layout_.setShelfLedCount(shelfIndex, ledCount);
}

bool AppController::setShelfLocationCount(uint8_t shelfIndex, uint8_t locationCount) {
    return layout_.setShelfLocationCount(shelfIndex, locationCount);
}

bool AppController::setLocationRange(uint8_t shelfIndex, uint8_t locationIndex,
                                     uint16_t relativeLedStart, uint16_t ledCount) {
    return layout_.setLocationRange(shelfIndex, locationIndex, relativeLedStart, ledCount);
}

bool AppController::distributeShelfEvenly(uint8_t shelfIndex) {
    return layout_.distributeShelfEvenly(shelfIndex);
}

const CabinetLayout& AppController::layout() const {
    return layout_;
}

uint8_t AppController::selectedShelfIndex() const    { return selectedShelfIndex_; }
uint8_t AppController::selectedLocationIndex() const { return selectedLocationIndex_; }

void AppController::setSelectedShelf(uint8_t shelfIndex) {
    if (shelfIndex < config::kMaxShelves) selectedShelfIndex_ = shelfIndex;
}

void AppController::setSelectedLocation(uint8_t locationIndex) {
    if (locationIndex < config::kMaxLocationsPerShelf) selectedLocationIndex_ = locationIndex;
}

bool AppController::clearShelfLocation(uint8_t shelfIndex, uint8_t locationIndex) {
    return layout_.setLocationRange(shelfIndex, locationIndex, 0, 0);
}

bool AppController::clearShelfAllLocations(uint8_t shelfIndex) {
    const Shelf* s = layout_.shelf(shelfIndex);
    if (!s) return false;
    bool ok = true;
    for (uint8_t i = 0; i < s->locationCount; i++) {
        ok &= layout_.setLocationRange(shelfIndex, i, 0, 0);
    }
    return ok;
}

void AppController::handleEncoder(uint32_t nowMs) {
    (void)nowMs;
    if (!encoder_.available() || !lighting_.pwmCabinet().available()) {
        return;
    }

    const EncoderEvent event = encoder_.update(nowMs);
    if (event.delta != 0) {
        const int next = static_cast<int>(lighting_.pwmCabinet().brightness()) +
                         event.delta * config::kEncoderBrightnessStep;
        const uint8_t clamped = clampPercent(next);
        Serial.printf("[Encoder] delta=%d → brightness=%u%%\n", event.delta, clamped);
        lighting_.setPwmCabinetBrightness(clamped);
    }
    // No button — toggle disabled:
    // if (event.pressed) { lighting_.togglePwmCabinet(); }
}

void AppController::setHighlightTimeout(uint32_t nowMs, uint32_t durationMs) {
    highlightExpiresAtMs_ = durationMs == 0 ? 0 : nowMs + durationMs;
}

int8_t AppController::consumeEncoderEvent(uint32_t nowMs) {
    return encoder_.update(nowMs).delta;
}

}  // namespace smartcabinet
