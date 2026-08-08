#pragma once

#include <cstddef>
#include <cstdint>

#include "app/AppState.h"
#include "cabinet/CabinetLayout.h"
#include "hardware/EncoderInput.h"
#include "lighting/LightingManager.h"
#include "miniatures/MiniatureRepository.h"

namespace smartcabinet {

class AppController {
public:
    AppController(LightingManager& lighting,
                  CabinetLayout& layout,
                  MiniatureRepository& miniatures,
                  EncoderInput& encoder);

    void begin();
    void update(uint32_t nowMs);

    AppState state() const;

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

    void applyScene(SceneId id);

    bool locateMiniature(uint8_t miniatureId, uint32_t durationMs = 0);
    bool testLocation(LocationId locationId, uint32_t durationMs = 0);
    void clearHighlight();

    const Miniature* miniatureByIndex(size_t index) const;
    const Miniature* miniatureById(uint8_t id) const;
    size_t miniatureCount() const;

    bool setShelfCount(uint8_t count);
    bool setShelfLedCount(uint8_t shelfIndex, uint16_t ledCount);
    bool setShelfLocationCount(uint8_t shelfIndex, uint8_t locationCount);
    bool setLocationRange(uint8_t shelfIndex, uint8_t locationIndex,
                          uint16_t relativeLedStart, uint16_t ledCount);
    bool distributeShelfEvenly(uint8_t shelfIndex);

    const CabinetLayout& layout() const;

private:
    LightingManager& lighting_;
    CabinetLayout& layout_;
    MiniatureRepository& miniatures_;
    EncoderInput& encoder_;

    int16_t highlightedMiniatureId_{-1};
    uint32_t highlightExpiresAtMs_{0};

    void handleEncoder(uint32_t nowMs);
    void setHighlightTimeout(uint32_t nowMs, uint32_t durationMs);
};

}  // namespace smartcabinet
