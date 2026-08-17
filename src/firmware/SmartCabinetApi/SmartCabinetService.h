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
    void syncFromApp();

    void setPower(bool enabled);
    void setBrightness(uint8_t percent);
    void setCabinetLightPower(bool enabled);
    void setCabinetLightBrightness(uint8_t percent);
    bool applyScene(uint8_t scene);
    bool highlightLocation(uint16_t shelf, uint16_t location);
    bool appendHighlightLocation(uint16_t shelf, uint16_t location);
    void clearHighlight();
    void setHighlightColor(uint8_t r, uint8_t g, uint8_t b);

    void setMiniatureLightPower(bool enabled);
    void setMiniatureLightBrightness(uint8_t percent);
    void setMiniatureLightColor(uint8_t r, uint8_t g, uint8_t b);

    // Persistent white highlight; shelf=0 or location=0 clears it.
    void highlightLocationWhite(uint16_t shelf, uint16_t location);

    const CabinetRuntimeState& state() const;

    void setStateChangedCallback(StateChangedCallback callback);

private:
    void refreshLightingState();
    void notifyStateChanged();

    IAppControllerActions& appController_;
    SettingsRepository& settingsRepository_;

    CabinetRuntimeState state_;
    StateChangedCallback stateChangedCallback_;
};
