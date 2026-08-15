#pragma once

#include <cstdint>

#include "hardware/PwmCabinetLight.h"
#include "lighting/AddressableCabinetLight.h"
#include "lighting/MiniatureLights.h"
#include "models/Color.h"
#include "models/LightingTypes.h"

namespace smartcabinet {

class LightingManager {
public:
    LightingManager(PwmCabinetLight& pwmCabinet,
                    AddressableCabinetLight& rgbwCabinet,
                    MiniatureLights& miniatures);

    void begin();
    void update(uint32_t nowMs);

    void applyScene(SceneId id);
    SceneId activeScene() const;

    void setPwmCabinetPower(bool on);
    void togglePwmCabinet();
    void setPwmCabinetBrightness(uint8_t percent);

    void setRgbwCabinetPower(bool on);
    void toggleRgbwCabinet();
    void setRgbwCabinetBrightness(uint8_t percent);
    void setRgbwCabinetColor(RgbwColor color);
    void setRgbwCabinetEffect(LightEffect effect);

    void setMiniaturePower(bool on);
    void toggleMiniatures();
    void setMiniatureBrightness(uint8_t percent);
    void setMiniatureColor(RgbColor color);
    void setMiniatureEffect(LightEffect effect);

    bool highlightMiniatureSegment(uint16_t ledStart, uint16_t ledCount, RgbColor color = kCyan);
    void clearMiniatureHighlight();

    const PwmCabinetLight& pwmCabinet() const;
    const AddressableCabinetLight& rgbwCabinet() const;
    const MiniatureLights& miniatures() const;

private:
    PwmCabinetLight& pwmCabinet_;
    AddressableCabinetLight& rgbwCabinet_;
    MiniatureLights& miniatures_;
    SceneId activeScene_{SceneId::Manual};

    void markManual();
};

}  // namespace smartcabinet
