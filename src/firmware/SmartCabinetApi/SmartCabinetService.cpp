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
    appController_.setBrightness(state_.brightness);
    appController_.setPower(state_.power);

    notifyStateChanged();

    return persistenceReady;
}

void SmartCabinetService::loop() {
    settingsRepository_.loop();
}

void SmartCabinetService::setPower(bool enabled) {
    if (state_.power == enabled) {
        return;
    }

    appController_.setPower(enabled);

    state_.power = enabled;
    settingsRepository_.setPower(enabled);

    notifyStateChanged();
}

void SmartCabinetService::setBrightness(uint8_t percent) {
    const uint8_t clamped = percent > 100 ? 100 : percent;

    if (state_.brightness == clamped) {
        return;
    }

    appController_.setBrightness(clamped);

    state_.brightness = clamped;
    settingsRepository_.setBrightness(clamped);

    // power follows brightness: reaching 0 turns off, leaving 0 turns on.
    // setPower notifies; skip the redundant notify here when power will change.
    const bool powerWillChange = (clamped == 0 && state_.power) ||
                                 (clamped > 0 && !state_.power);
    if (!powerWillChange) {
        notifyStateChanged();
    }

    if (clamped == 0) {
        setPower(false);
    } else if (!state_.power) {
        setPower(true);
    }
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
    state_.miniLightPower = enabled;
    notifyStateChanged();
}

void SmartCabinetService::setMiniatureLightBrightness(uint8_t percent) {
    const uint8_t clamped = percent > 100 ? 100 : percent;
    appController_.setMiniatureLightBrightness(clamped);
    state_.miniLightBrightness = clamped;
    notifyStateChanged();
}

void SmartCabinetService::setMiniatureLightColor(uint8_t r, uint8_t g, uint8_t b) {
    appController_.setMiniatureLightColor(r, g, b);
    state_.miniLightR = r;
    state_.miniLightG = g;
    state_.miniLightB = b;
    notifyStateChanged();
}

void SmartCabinetService::highlightLocationWhite(uint16_t shelf, uint16_t location) {
    if (shelf == 0 || location == 0) {
        clearHighlight();
    } else {
        appController_.clearHighlight();
        // Ensure the miniature LEDs are on so the highlight is visible.
        appController_.setMiniatureLightPower(true);
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
