#include "cabinet/CabinetLayout.h"

#include <algorithm>

namespace smartcabinet {

CabinetLayout::CabinetLayout() {
    loadDefaults();
}

void CabinetLayout::loadDefaults() {
    shelfCount_ = config::kDefaultShelfCount;
    for (uint8_t i = 0; i < config::kMaxShelves; ++i) {
        shelves_[i] = Shelf{i, 0, 0, 0, false};
        for (uint8_t j = 0; j < config::kMaxLocationsPerShelf; ++j) {
            locations_[i][j] = Location{makeLocationId(i, j), i, j, 0, 0, 0};
        }
    }

    for (uint8_t i = 0; i < shelfCount_; ++i) {
        shelves_[i].ledCount = config::kDefaultLedsPerShelf;
        shelves_[i].locationCount = config::kDefaultLocationsPerShelf;
    }

    recalculateShelfOffsets();
    for (uint8_t i = 0; i < shelfCount_; ++i) {
        rebuildShelfLocations(i);
    }
}

bool CabinetLayout::setShelfCount(uint8_t count) {
    if (count == 0 || count > config::kMaxShelves) {
        return false;
    }

    const uint8_t previousCount = shelfCount_;
    uint32_t prospectiveTotal = 0;
    for (uint8_t i = 0; i < count; ++i) {
        prospectiveTotal += i < previousCount ? shelves_[i].ledCount : config::kDefaultLedsPerShelf;
    }
    if (prospectiveTotal > config::kMiniatureLedCount) {
        return false;
    }

    if (count > previousCount) {
        for (uint8_t i = previousCount; i < count; ++i) {
            shelves_[i].index = i;
            shelves_[i].ledCount = config::kDefaultLedsPerShelf;
            shelves_[i].locationCount = config::kDefaultLocationsPerShelf;
            shelves_[i].mirrored = false;
            for (uint8_t j = 0; j < config::kMaxLocationsPerShelf; ++j) {
                Location& loc = locations_[i][j];
                loc.id = makeLocationId(i, j);
                loc.shelfIndex = i;
                loc.locationIndex = j;
                loc.relativeLedStart = 0;
                loc.ledStart = 0;
                loc.ledCount = 0;
            }
        }
    }

    shelfCount_ = count;
    recalculateShelfOffsets();
    return true;
}

bool CabinetLayout::setShelfLedCount(uint8_t shelfIndex, uint16_t count) {
    if (shelfIndex >= shelfCount_ || count == 0) {
        return false;
    }

    const uint32_t prospectiveTotal =
        static_cast<uint32_t>(totalLedCount()) - shelves_[shelfIndex].ledCount + count;
    if (prospectiveTotal > config::kMiniatureLedCount) {
        return false;
    }

    shelves_[shelfIndex].ledCount = count;
    recalculateShelfOffsets();

    // Keep manual mappings when the shelf length changes. Any location that
    // no longer fits is cleared instead of silently re-running auto-map.
    for (uint8_t i = 0; i < shelves_[shelfIndex].locationCount; ++i) {
        Location& loc = locations_[shelfIndex][i];
        if (loc.ledCount > 0 &&
            static_cast<uint32_t>(loc.relativeLedStart) + loc.ledCount > count) {
            loc.relativeLedStart = 0;
            loc.ledStart = 0;
            loc.ledCount = 0;
        } else if (loc.ledCount > 0) {
            loc.ledStart = shelves_[shelfIndex].ledStart + loc.relativeLedStart;
        }
    }
    return true;
}

bool CabinetLayout::setShelfLocationCount(uint8_t shelfIndex, uint8_t count) {
    if (shelfIndex >= shelfCount_ || count == 0 || count > config::kMaxLocationsPerShelf) {
        return false;
    }

    const uint8_t previousCount = shelves_[shelfIndex].locationCount;
    shelves_[shelfIndex].locationCount = count;

    // Preserve existing mappings. New locations start empty so auto-map is
    // always an explicit user action.
    for (uint8_t i = 0; i < config::kMaxLocationsPerShelf; ++i) {
        Location& loc = locations_[shelfIndex][i];
        loc.id = makeLocationId(shelfIndex, i);
        loc.shelfIndex = shelfIndex;
        loc.locationIndex = i;
        if (i >= count || i >= previousCount) {
            loc.relativeLedStart = 0;
            loc.ledStart = 0;
            loc.ledCount = 0;
        }
    }
    return true;
}

bool CabinetLayout::setShelfMirrored(uint8_t shelfIndex, bool mirrored) {
    if (shelfIndex >= shelfCount_) return false;
    shelves_[shelfIndex].mirrored = mirrored;
    return true;
}

bool CabinetLayout::setLocationRange(uint8_t shelfIndex, uint8_t locationIndex,
                                     uint16_t relativeLedStart, uint16_t ledCount) {
    if (shelfIndex >= shelfCount_) {
        return false;
    }
    const Shelf& s = shelves_[shelfIndex];
    if (locationIndex >= s.locationCount) {
        return false;
    }

    // A zero-length range is the explicit "unmapped" state.
    if (ledCount == 0) {
        Location& loc = locations_[shelfIndex][locationIndex];
        loc.relativeLedStart = 0;
        loc.ledStart = 0;
        loc.ledCount = 0;
        return true;
    }

    if (static_cast<uint32_t>(relativeLedStart) + ledCount > s.ledCount) {
        return false;
    }
    Location& loc = locations_[shelfIndex][locationIndex];
    loc.relativeLedStart = relativeLedStart;
    loc.ledStart = s.ledStart + relativeLedStart;
    loc.ledCount = ledCount;
    return true;
}

bool CabinetLayout::distributeShelfEvenly(uint8_t shelfIndex) {
    if (shelfIndex >= shelfCount_) {
        return false;
    }
    rebuildShelfLocations(shelfIndex);
    return true;
}

uint8_t CabinetLayout::shelfCount() const {
    return shelfCount_;
}

uint16_t CabinetLayout::totalLedCount() const {
    uint32_t total = 0;
    for (uint8_t i = 0; i < shelfCount_; ++i) {
        total += shelves_[i].ledCount;
    }
    return static_cast<uint16_t>(std::min<uint32_t>(total, 0xFFFF));
}

const Shelf* CabinetLayout::shelf(uint8_t shelfIndex) const {
    return shelfIndex < shelfCount_ ? &shelves_[shelfIndex] : nullptr;
}

const Location* CabinetLayout::location(LocationId id) const {
    const uint8_t shelfIndex = static_cast<uint8_t>(id / config::kMaxLocationsPerShelf);
    const uint8_t locationIndex = static_cast<uint8_t>(id % config::kMaxLocationsPerShelf);
    return location(shelfIndex, locationIndex);
}

const Location* CabinetLayout::location(uint8_t shelfIndex, uint8_t locationIndex) const {
    if (shelfIndex >= shelfCount_ || locationIndex >= shelves_[shelfIndex].locationCount) {
        return nullptr;
    }
    return &locations_[shelfIndex][locationIndex];
}

void CabinetLayout::recalculateShelfOffsets() {
    uint32_t offset = 0;
    for (uint8_t i = 0; i < shelfCount_; ++i) {
        shelves_[i].index = i;
        shelves_[i].ledStart = static_cast<uint16_t>(offset);
        offset += shelves_[i].ledCount;
    }

    for (uint8_t i = 0; i < shelfCount_; ++i) {
        for (uint8_t j = 0; j < shelves_[i].locationCount; ++j) {
            Location& loc = locations_[i][j];
            loc.ledStart = shelves_[i].ledStart + loc.relativeLedStart;
        }
    }
}

void CabinetLayout::rebuildShelfLocations(uint8_t shelfIndex) {
    Shelf& s = shelves_[shelfIndex];
    if (s.locationCount == 0) {
        return;
    }

    const uint16_t base = s.ledCount / s.locationCount;
    const uint16_t remainder = s.ledCount % s.locationCount;
    uint16_t cursor = 0;

    for (uint8_t i = 0; i < config::kMaxLocationsPerShelf; ++i) {
        Location& loc = locations_[shelfIndex][i];
        loc.id = makeLocationId(shelfIndex, i);
        loc.shelfIndex = shelfIndex;
        loc.locationIndex = i;

        if (i < s.locationCount) {
            // Keep all equal groups first and assign the full remainder to
            // the final location, matching the physical cabinet workflow.
            const uint16_t size = base + (i == s.locationCount - 1 ? remainder : 0);
            loc.relativeLedStart = cursor;
            loc.ledStart = s.ledStart + cursor;
            loc.ledCount = size;
            cursor += size;
        } else {
            loc.relativeLedStart = 0;
            loc.ledStart = 0;
            loc.ledCount = 0;
        }
    }
}

}  // namespace smartcabinet
