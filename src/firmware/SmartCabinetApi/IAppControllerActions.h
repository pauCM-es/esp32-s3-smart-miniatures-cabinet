#pragma once

#include <cstdint>

/**
 * Small adapter boundary between this module and the existing AppController.
 *
 * External shelf/location values are 1-based.
 * Convert them in your implementation if AppController uses 0-based indexes.
 */
class IAppControllerActions {
public:
    virtual ~IAppControllerActions() = default;

    virtual void setPower(bool enabled) = 0;
    virtual void setBrightness(uint8_t percent) = 0;
    virtual void highlightLocation(uint16_t shelf, uint16_t location) = 0;
};
