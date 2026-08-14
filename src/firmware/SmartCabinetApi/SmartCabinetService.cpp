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
    if (shelf == 0 || location == 0) {
        return false;
    }

    appController_.highlightLocation(shelf, location);

    state_.hasHighlight = true;
    state_.highlightShelf = shelf;
    state_.highlightLocation = location;

    notifyStateChanged();

    return true;
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
