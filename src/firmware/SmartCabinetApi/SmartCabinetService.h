#pragma once

#include <Arduino.h>
#include <functional>

#include "IAppControllerActions.h"
#include "SmartCabinetTypes.h"
#include "persistence/SettingsRepository.h"

class SmartCabinetService {
public:
    using StateChangedCallback =
        std::function<void(const CabinetRuntimeState& state)>;

    SmartCabinetService(
        IAppControllerActions& appController,
        SettingsRepository& settingsRepository
    );

    bool begin(const CabinetSettings& defaults = CabinetSettings{});
    void loop();

    void setPower(bool enabled);
    void setBrightness(uint8_t percent);
    bool highlightLocation(uint16_t shelf, uint16_t location);

    const CabinetRuntimeState& state() const;

    void setStateChangedCallback(StateChangedCallback callback);

private:
    void notifyStateChanged();

    IAppControllerActions& appController_;
    SettingsRepository& settingsRepository_;

    CabinetRuntimeState state_;
    StateChangedCallback stateChangedCallback_;
};
