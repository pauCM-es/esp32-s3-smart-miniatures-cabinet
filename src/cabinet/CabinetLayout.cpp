#include "cabinet/CabinetLayout.h"

#include <algorithm>

namespace smartcabinet {

CabinetLayout::CabinetLayout() {
    loadDefaults();
}

void CabinetLayout::loadDefaults() {
    shelfCount_ = config::kDefaultShelfCount;
    for (uint8_t i = 0; i < config::kMaxShelves; ++i) {
        shelves_[i] = Shelf{i, 0, 0, 0};
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

    uint32_t prospectiveTotal = 0;
    for (uint8_t i = 0; i < count; ++i) {
        prospectiveTotal += i < shelfCount_ ? shelves_[i].ledCount : config::kDefaultLedsPerShelf;
    }
    if (prospectiveTotal > config::kMiniatureLedCount) {
        return false;
    }

    if (count > shelfCount_) {
        for (uint8_t i = shelfCount_; i < count; ++i) {
            shelves_[i].index = i;
            shelves_[i].ledCount = config::kDefaultLedsPerShelf;
            shelves_[i].locationCount = config::kDefaultLocationsPerShelf;
        }
    }

    shelfCount_ = count;
    recalculateShelfOffsets();
    for (uint8_t i = 0; i < shelfCount_; ++i) {
        rebuildShelfLocations(i);
    }
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
    rebuildShelfLocations(shelfIndex);
    return true;
}

bool CabinetLayout::setShelfLocationCount(uint8_t shelfIndex, uint8_t count) {
    if (shelfIndex >= shelfCount_ || count == 0 || count > config::kMaxLocationsPerShelf) {
        return false;
    }

    shelves_[shelfIndex].locationCount = count;
    rebuildShelfLocations(shelfIndex);
    return true;
}

bool CabinetLayout::setLocationRange(uint8_t shelfIndex, uint8_t locationIndex,
                                     uint16_t relativeLedStart, uint16_t ledCount) {
    if (shelfIndex >= shelfCount_) {
        return false;
    }
    const Shelf& s = shelves_[shelfIndex];
    if (locationIndex >= s.locationCount || ledCount == 0) {
        return false;
    }
    if (static_cast<uint32_t>(relativeLedStart) + ledCount > s.ledCount) {
        return false;
    }
    if (rangeOverlaps(shelfIndex, locationIndex, relativeLedStart, ledCount)) {
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
            const uint16_t size = base + (i < remainder ? 1 : 0);
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

bool CabinetLayout::rangeOverlaps(uint8_t shelfIndex, uint8_t locationIndex,
                                  uint16_t relativeLedStart, uint16_t ledCount) const {
    const Shelf& s = shelves_[shelfIndex];
    const uint16_t newStart = relativeLedStart;
    const uint16_t newEnd = static_cast<uint16_t>(relativeLedStart + ledCount);

    for (uint8_t i = 0; i < s.locationCount; ++i) {
        if (i == locationIndex) {
            continue;
        }
        const Location& other = locations_[shelfIndex][i];
        if (other.ledCount == 0) {
            continue;
        }
        const uint16_t otherStart = other.relativeLedStart;
        const uint16_t otherEnd = static_cast<uint16_t>(otherStart + other.ledCount);
        if (newStart < otherEnd && newEnd > otherStart) {
            return true;
        }
    }
    return false;
}

}  // namespace smartcabinet
