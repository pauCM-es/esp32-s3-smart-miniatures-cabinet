#pragma once

#include <cstdint>

namespace smartcabinet {

class PwmCabinetLight {
public:
    void begin();
    bool available() const;

    void setPower(bool on);
    void toggle();
    void setBrightness(uint8_t percent);

    bool isOn() const;
    uint8_t brightness() const;

private:
    bool on_{false};
    uint8_t brightness_{70};

    void applyOutput();
};

}  // namespace smartcabinet
