#include "SmartCabinetService.h"

SmartCabinetService::SmartCabinetService(
    IAppControllerActions& appController,
    SettingsRepository& settingsRepository
)
    : appController_(appController),
      settingsRepository_(settingsRepository) {}

bool SmartCabinetService::begin(const CabinetSettings& defaults) {
    const bool persistenceReady = settingsRepository_.begin(defaults);
    const CabinetSettings& settings = settingsRepository_.get();

    state_.power = settings.power;
    state_.brightness = settings.brightness;
    state_.hasHighlight = false;
    state_.highlightShelf = 0;
    state_.highlightLocation = 0;
    state_.highlightR = settings.highlightR;
    state_.highlightG = settings.highlightG;
    state_.highlightB = settings.highlightB;

    // Restore persisted state into the existing AppController.
    appController_.setCabinetLightBrightness(state_.brightness);
    appController_.setPower(state_.power);
    refreshLightingState();

    notifyStateChanged();

    return persistenceReady;
}

void SmartCabinetService::loop() {
    settingsRepository_.loop();
}

void SmartCabinetService::syncFromApp() {
    const AppLightingState lights = appController_.lightingState();
    if (state_.power == lights.cabinetPower &&
        state_.brightness == lights.cabinetBrightness &&
        state_.miniLightPower == lights.miniaturePower &&
        state_.miniLightBrightness == lights.miniatureBrightness &&
        state_.miniLightR == lights.miniatureR &&
        state_.miniLightG == lights.miniatureG &&
        state_.miniLightB == lights.miniatureB &&
        state_.activeScene == lights.activeScene) {
        return;
    }

    refreshLightingState();
    notifyStateChanged();
}

void SmartCabinetService::setPower(bool enabled) {
    if (state_.power == enabled && state_.miniLightPower == enabled) {
        return;
    }

    appController_.setPower(enabled);

    state_.activeScene = 0;
    refreshLightingState();
    settingsRepository_.setPower(state_.power);

    notifyStateChanged();
}

void SmartCabinetService::setBrightness(uint8_t percent) {
    setCabinetLightBrightness(percent);
}

void SmartCabinetService::setCabinetLightPower(bool enabled) {
    if (state_.power == enabled) return;

    appController_.setCabinetLightPower(enabled);
    state_.activeScene = 0;
    refreshLightingState();
    settingsRepository_.setPower(state_.power);
    notifyStateChanged();
}

void SmartCabinetService::setCabinetLightBrightness(uint8_t percent) {
    const uint8_t clamped = percent > 100 ? 100 : percent;

    if (state_.brightness == clamped && state_.power == (clamped > 0)) {
        return;
    }

    appController_.setCabinetLightBrightness(clamped);
    appController_.setCabinetLightPower(clamped > 0);
    state_.activeScene = 0;
    refreshLightingState();
    settingsRepository_.setBrightness(state_.brightness);
    settingsRepository_.setPower(state_.power);
    notifyStateChanged();
}

bool SmartCabinetService::applyScene(uint8_t scene) {
    if (scene < 1 || scene > 3) return false;

    appController_.applyScene(scene);
    state_.activeScene = scene;
    refreshLightingState();
    state_.hasHighlight = false;
    state_.highlightShelf = 0;
    state_.highlightLocation = 0;
    notifyStateChanged();
    return true;
}

bool SmartCabinetService::highlightLocation(
    uint16_t shelf,
    uint16_t location
) {
    clearHighlight();
    return appendHighlightLocation(shelf, location);
}

bool SmartCabinetService::appendHighlightLocation(
    uint16_t shelf,
    uint16_t location
) {
    if (shelf == 0 || location == 0) {
        return false;
    }

    appController_.setMiniatureLightPower(true);
    refreshLightingState();
    if (!appController_.highlightLocationPersistentColor(
        shelf, location, state_.highlightR, state_.highlightG, state_.highlightB
    )) {
        return false;
    }

    state_.hasHighlight = true;
    state_.highlightShelf = shelf;
    state_.highlightLocation = location;
    notifyStateChanged();
    return true;
}

void SmartCabinetService::clearHighlight() {
    appController_.clearHighlight();
    state_.hasHighlight = false;
    state_.highlightShelf = 0;
    state_.highlightLocation = 0;
    notifyStateChanged();
}

void SmartCabinetService::setHighlightColor(uint8_t r, uint8_t g, uint8_t b) {
    state_.highlightR = r;
    state_.highlightG = g;
    state_.highlightB = b;
    settingsRepository_.setHighlightColor(r, g, b);
    notifyStateChanged();
}

void SmartCabinetService::setMiniatureLightPower(bool enabled) {
    if (state_.miniLightPower == enabled) return;
    appController_.setMiniatureLightPower(enabled);
    state_.activeScene = 0;
    refreshLightingState();
    notifyStateChanged();
}

void SmartCabinetService::setMiniatureLightBrightness(uint8_t percent) {
    const uint8_t clamped = percent > 100 ? 100 : percent;
    appController_.setMiniatureLightBrightness(clamped);
    state_.activeScene = 0;
    refreshLightingState();
    notifyStateChanged();
}

void SmartCabinetService::setMiniatureLightColor(uint8_t r, uint8_t g, uint8_t b) {
    appController_.setMiniatureLightColor(r, g, b);
    state_.activeScene = 0;
    refreshLightingState();
    notifyStateChanged();
}

void SmartCabinetService::highlightLocationWhite(uint16_t shelf, uint16_t location) {
    if (shelf == 0 || location == 0) {
        clearHighlight();
    } else {
        appController_.clearHighlight();
        // Ensure the miniature LEDs are on so the highlight is visible.
        appController_.setMiniatureLightPower(true);
        refreshLightingState();
        appController_.highlightLocationPersistentWhite(shelf, location);
        state_.hasHighlight = true;
        state_.highlightShelf = shelf;
        state_.highlightLocation = location;
    }
    notifyStateChanged();
}

const CabinetRuntimeState& SmartCabinetService::state() const {
    return state_;
}

void SmartCabinetService::refreshLightingState() {
    const AppLightingState lights = appController_.lightingState();
    state_.power = lights.cabinetPower;
    state_.brightness = lights.cabinetBrightness;
    state_.miniLightPower = lights.miniaturePower;
    state_.miniLightBrightness = lights.miniatureBrightness;
    state_.miniLightR = lights.miniatureR;
    state_.miniLightG = lights.miniatureG;
    state_.miniLightB = lights.miniatureB;
    state_.activeScene = lights.activeScene;
}

void SmartCabinetService::setStateChangedCallback(
    StateChangedCallback callback
) {
    stateChangedCallback_ = callback;
}

void SmartCabinetService::notifyStateChanged() {
    if (stateChangedCallback_) {
        stateChangedCallback_(state_);
    }
}
