#pragma once

#include <cstdint>

/**
 * Small adapter boundary between this module and the existing AppController.
 *
 * External shelf/location values are 1-based.
 * Convert them in your implementation if AppController uses 0-based indexes.
 */
struct AppLightingState {
    bool cabinetPower = false;
    uint8_t cabinetBrightness = 0;
    bool miniaturePower = false;
    uint8_t miniatureBrightness = 0;
    uint8_t miniatureR = 0;
    uint8_t miniatureG = 0;
    uint8_t miniatureB = 0;
    uint8_t activeScene = 0;
};

class IAppControllerActions {
public:
    virtual ~IAppControllerActions() = default;

    virtual void setPower(bool enabled) = 0;
    virtual void setBrightness(uint8_t percent) = 0;
    virtual void setCabinetLightPower(bool enabled) = 0;
    virtual void setCabinetLightBrightness(uint8_t percent) = 0;
    virtual AppLightingState lightingState() const = 0;
    virtual void applyScene(uint8_t scene) = 0;
    virtual void highlightLocation(uint16_t shelf, uint16_t location) = 0;

    virtual void setMiniatureLightPower(bool enabled) = 0;
    virtual void setMiniatureLightBrightness(uint8_t percent) = 0;
    virtual void setMiniatureLightColor(uint8_t r, uint8_t g, uint8_t b) = 0;

    // Persistent highlight in white (1-based shelf/location, both 0 = no-op).
    virtual void highlightLocationPersistentWhite(uint16_t shelf, uint16_t location) = 0;
    virtual bool highlightLocationPersistentColor(
        uint16_t shelf, uint16_t location, uint8_t r, uint8_t g, uint8_t b
    ) = 0;
    virtual void clearHighlight() = 0;

    virtual bool setShelfCount(uint8_t count) = 0;
    virtual bool setShelfLedCount(uint8_t shelfIndex, uint16_t ledCount) = 0;
    virtual bool setShelfLocationCount(uint8_t shelfIndex, uint8_t locationCount) = 0;
    virtual bool setShelfMirrored(uint8_t shelfIndex, bool mirrored) = 0;
    virtual bool setLocationRange(
        uint8_t shelfIndex, uint8_t locationIndex, uint16_t relativeLedStart, uint16_t ledCount
    ) = 0;
    virtual bool distributeShelfEvenly(uint8_t shelfIndex) = 0;
    virtual bool clearShelfAllLocations(uint8_t shelfIndex) = 0;
};
