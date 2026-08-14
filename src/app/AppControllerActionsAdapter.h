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
        app_.setPwmCabinetBrightness(percent);
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

    void clearHighlight() override {
        app_.clearHighlight();
    }

private:
    AppController& app_;
};

}  // namespace smartcabinet
