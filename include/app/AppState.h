#pragma once

#include <cstddef>
#include <cstdint>

#include "models/Color.h"
#include "models/LightingTypes.h"
#include "models/OtaState.h"

namespace smartcabinet {

struct AppState {
    bool pwmCabinetAvailable{false};
    bool pwmCabinetOn{false};
    uint8_t pwmCabinetBrightness{0};

    bool rgbwCabinetAvailable{false};
    bool rgbwCabinetOn{false};
    uint8_t rgbwCabinetBrightness{0};
    RgbwColor rgbwCabinetColor{};
    LightEffect rgbwCabinetEffect{LightEffect::Static};

    bool miniatureLightsAvailable{false};
    bool miniatureLightsOn{false};
    uint8_t miniatureBrightness{0};
    RgbColor miniatureColor{};
    LightEffect miniatureEffect{LightEffect::Static};

    SceneId activeScene{SceneId::Manual};

    OtaState otaState{OtaState::Disabled};
    uint32_t otaRemainingMs{0};
};

}  // namespace smartcabinet
