#pragma once

#include <cstdint>
#include "models/Color.h"

namespace smartcabinet {

enum class LightEffect : uint8_t {
    Static,
    Breathe,
    Rainbow
};

enum class SceneId : uint8_t {
    Manual,
    Off,
    Display,
    Showcase
};

struct PwmCabinetSceneState {
    bool apply{false};
    bool power{false};
    uint8_t brightness{0};
};

struct RgbwCabinetSceneState {
    bool apply{false};
    bool power{false};
    uint8_t brightness{0};
    RgbwColor color{};
    LightEffect effect{LightEffect::Static};
};

struct MiniatureSceneState {
    bool apply{false};
    bool power{false};
    uint8_t brightness{0};
    RgbColor color{};
    LightEffect effect{LightEffect::Static};
};

struct SceneDefinition {
    SceneId id{SceneId::Manual};
    const char* name{"Manual"};
    PwmCabinetSceneState pwmCabinet{};
    RgbwCabinetSceneState rgbwCabinet{};
    MiniatureSceneState miniatures{};
};

}  // namespace smartcabinet
