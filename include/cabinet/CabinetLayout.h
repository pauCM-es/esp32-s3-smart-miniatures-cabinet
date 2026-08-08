#pragma once

#include <cstdint>
#include "config/HardwareConfig.h"

namespace smartcabinet {

using LocationId = uint16_t;
constexpr LocationId kInvalidLocationId = 0xFFFF;

struct Location {
    LocationId id{kInvalidLocationId};
    uint8_t shelfIndex{0};
    uint8_t locationIndex{0};
    uint16_t relativeLedStart{0};
    uint16_t ledStart{0};
    uint16_t ledCount{0};
};

struct Shelf {
    uint8_t index{0};
    uint16_t ledStart{0};
    uint16_t ledCount{0};
    uint8_t locationCount{0};
};

class CabinetLayout {
public:
    CabinetLayout();

    void loadDefaults();
    bool setShelfCount(uint8_t count);
    bool setShelfLedCount(uint8_t shelfIndex, uint16_t count);
    bool setShelfLocationCount(uint8_t shelfIndex, uint8_t count);
    bool setLocationRange(uint8_t shelfIndex, uint8_t locationIndex,
                          uint16_t relativeLedStart, uint16_t ledCount);
    bool distributeShelfEvenly(uint8_t shelfIndex);

    uint8_t shelfCount() const;
    uint16_t totalLedCount() const;
    const Shelf* shelf(uint8_t shelfIndex) const;
    const Location* location(LocationId id) const;
    const Location* location(uint8_t shelfIndex, uint8_t locationIndex) const;

    static constexpr LocationId makeLocationId(uint8_t shelfIndex, uint8_t locationIndex) {
        return static_cast<LocationId>(
            static_cast<uint16_t>(shelfIndex) * config::kMaxLocationsPerShelf + locationIndex);
    }

private:
    uint8_t shelfCount_{0};
    Shelf shelves_[config::kMaxShelves]{};
    Location locations_[config::kMaxShelves][config::kMaxLocationsPerShelf]{};

    void recalculateShelfOffsets();
    void rebuildShelfLocations(uint8_t shelfIndex);
    bool rangeOverlaps(uint8_t shelfIndex, uint8_t locationIndex,
                       uint16_t relativeLedStart, uint16_t ledCount) const;
};

}  // namespace smartcabinet
