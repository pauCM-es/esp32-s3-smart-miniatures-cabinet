#pragma once

#include "models/LightingTypes.h"

namespace smartcabinet {

class SceneRepository {
public:
    static const SceneDefinition& get(SceneId id);
};

}  // namespace smartcabinet
