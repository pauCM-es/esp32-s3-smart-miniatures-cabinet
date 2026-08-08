#include "lighting/SceneRepository.h"

namespace smartcabinet {
namespace {

constexpr SceneDefinition kOffScene{
    SceneId::Off,
    "Off",
    {true, false, 0},
    {true, false, 0, {0, 0, 0, 0}, LightEffect::Static},
    {true, false, 0, {0, 0, 0}, LightEffect::Static}
};

constexpr SceneDefinition kDisplayScene{
    SceneId::Display,
    "Display",
    {true, true, 80},
    {true, true, 55, {0, 0, 0, 220}, LightEffect::Static},
    {true, true, 45, {0, 190, 255}, LightEffect::Static}
};

constexpr SceneDefinition kShowcaseScene{
    SceneId::Showcase,
    "Showcase",
    {true, true, 25},
    {true, true, 70, {150, 20, 255, 20}, LightEffect::Breathe},
    {true, true, 65, {0, 210, 255}, LightEffect::Breathe}
};

constexpr SceneDefinition kManualScene{
    SceneId::Manual,
    "Manual",
    {},
    {},
    {}
};

}  // namespace

const SceneDefinition& SceneRepository::get(SceneId id) {
    switch (id) {
        case SceneId::Off:
            return kOffScene;
        case SceneId::Display:
            return kDisplayScene;
        case SceneId::Showcase:
            return kShowcaseScene;
        case SceneId::Manual:
        default:
            return kManualScene;
    }
}

}  // namespace smartcabinet
