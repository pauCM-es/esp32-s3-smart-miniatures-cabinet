#pragma once

#include <cstddef>
#include <cstdint>
#include "cabinet/CabinetLayout.h"

namespace smartcabinet {

struct Miniature {
    uint8_t id{0};
    const char* name{nullptr};
    const char* collection{nullptr};
    uint16_t year{0};
    LocationId locationId{kInvalidLocationId};
    const char* imagePath{nullptr};
};

class MiniatureRepository {
public:
    static constexpr size_t kCount = 5;

    size_t count() const;
    const Miniature* byIndex(size_t index) const;
    const Miniature* byId(uint8_t id) const;
};

}  // namespace smartcabinet
