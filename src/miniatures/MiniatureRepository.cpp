#include "miniatures/MiniatureRepository.h"

namespace smartcabinet {
namespace {

constexpr Miniature kMiniatures[MiniatureRepository::kCount] = {
    {0, "Wolverine", "Marvel United", 2021, CabinetLayout::makeLocationId(0, 0), "/miniatures/wolverine.png"},
    {1, "Storm", "Marvel United", 2021, CabinetLayout::makeLocationId(1, 1), "/miniatures/storm.png"},
    {2, "Magneto", "Marvel United", 2021, CabinetLayout::makeLocationId(2, 2), "/miniatures/magneto.png"},
    {3, "Tlaloc", "Personal Collection", 2026, CabinetLayout::makeLocationId(3, 3), "/miniatures/tlaloc.png"},
    {4, "Itzpapalotl", "Personal Collection", 2026, CabinetLayout::makeLocationId(4, 4), "/miniatures/itzpapalotl.png"},
};

}  // namespace

size_t MiniatureRepository::count() const {
    return kCount;
}

const Miniature* MiniatureRepository::byIndex(size_t index) const {
    return index < kCount ? &kMiniatures[index] : nullptr;
}

const Miniature* MiniatureRepository::byId(uint8_t id) const {
    for (const auto& miniature : kMiniatures) {
        if (miniature.id == id) {
            return &miniature;
        }
    }
    return nullptr;
}

}  // namespace smartcabinet
