#pragma once

#include "app/AppController.h"
#include "../firmware/SmartCabinetApi/IAppControllerActions.h"

namespace smartcabinet {

/**
 * Bridges IAppControllerActions (SmartCabinetService / MQTT) to AppController.
 *
 * setPower   – toggles PWM + RGBW + miniature channels, preserving last brightness/effect.
 * setBrightness – sets PWM cabinet brightness only.
 * highlightLocation – converts 1-based (shelf, location) to 0-based AppController indexes.
 */
class AppControllerActionsAdapter final : public ::IAppControllerActions {
public:
    explicit AppControllerActionsAdapter(AppController& app) : app_(app) {}

    void setPower(bool enabled) override {
        app_.setPwmCabinetPower(enabled);
        app_.setRgbwCabinetPower(enabled);
        app_.setMiniaturePower(enabled);
    }

    void setBrightness(uint8_t percent) override {
        setCabinetLightBrightness(percent);
    }

    void setCabinetLightPower(bool enabled) override {
        const AppState state = app_.state();
        if (state.pwmCabinetAvailable) app_.setPwmCabinetPower(enabled);
        else if (state.rgbwCabinetAvailable) app_.setRgbwCabinetPower(enabled);
    }

    void setCabinetLightBrightness(uint8_t percent) override {
        const AppState state = app_.state();
        if (state.pwmCabinetAvailable) app_.setPwmCabinetBrightness(percent);
        else if (state.rgbwCabinetAvailable) app_.setRgbwCabinetBrightness(percent);
    }

    AppLightingState lightingState() const override {
        const AppState state = app_.state();
        const bool usePwm = state.pwmCabinetAvailable;
        return {
            usePwm ? state.pwmCabinetOn : state.rgbwCabinetOn,
            usePwm ? state.pwmCabinetBrightness : state.rgbwCabinetBrightness,
            state.miniatureLightsOn,
            state.miniatureBrightness,
            state.miniatureColor.r,
            state.miniatureColor.g,
            state.miniatureColor.b,
            static_cast<uint8_t>(state.activeScene),
        };
    }

    void applyScene(uint8_t scene) override {
        if (scene <= static_cast<uint8_t>(SceneId::Showcase)) {
            app_.applyScene(static_cast<SceneId>(scene));
        }
    }

    void highlightLocation(uint16_t shelf, uint16_t location) override {
        if (shelf == 0 || location == 0) return;
        app_.highlightLocation(
            static_cast<uint8_t>(shelf - 1),
            static_cast<uint8_t>(location - 1)
        );
    }

    void setMiniatureLightPower(bool enabled) override {
        app_.setMiniaturePower(enabled);
    }

    void setMiniatureLightBrightness(uint8_t percent) override {
        app_.setMiniatureBrightness(percent);
    }

    void setMiniatureLightColor(uint8_t r, uint8_t g, uint8_t b) override {
        app_.setMiniatureColor({r, g, b});
    }

    void highlightLocationPersistentWhite(uint16_t shelf, uint16_t location) override {
        if (shelf == 0 || location == 0) return;
        app_.highlightLocationPersistent(
            static_cast<uint8_t>(shelf - 1),
            static_cast<uint8_t>(location - 1),
            smartcabinet::kWhite
        );
    }

    bool highlightLocationPersistentColor(
        uint16_t shelf, uint16_t location, uint8_t r, uint8_t g, uint8_t b
    ) override {
        if (shelf == 0 || location == 0) return false;
        return app_.highlightLocationPersistent(
            static_cast<uint8_t>(shelf - 1),
            static_cast<uint8_t>(location - 1),
            smartcabinet::RgbColor{r, g, b}
        );
    }

    void clearHighlight() override {
        app_.clearHighlight();
    }

    bool setShelfCount(uint8_t count) override {
        return app_.setShelfCount(count);
    }

    bool setShelfLedCount(uint8_t shelfIndex, uint16_t ledCount) override {
        return app_.setShelfLedCount(shelfIndex, ledCount);
    }

    bool setShelfLocationCount(uint8_t shelfIndex, uint8_t locationCount) override {
        return app_.setShelfLocationCount(shelfIndex, locationCount);
    }

    bool setShelfMirrored(uint8_t shelfIndex, bool mirrored) override {
        return app_.setShelfMirrored(shelfIndex, mirrored);
    }

    bool setLocationRange(
        uint8_t shelfIndex, uint8_t locationIndex, uint16_t relativeLedStart, uint16_t ledCount
    ) override {
        return app_.setLocationRange(shelfIndex, locationIndex, relativeLedStart, ledCount);
    }

    bool distributeShelfEvenly(uint8_t shelfIndex) override {
        return app_.distributeShelfEvenly(shelfIndex);
    }

    bool clearShelfAllLocations(uint8_t shelfIndex) override {
        return app_.clearShelfAllLocations(shelfIndex);
    }

private:
    AppController& app_;
};

}  // namespace smartcabinet
