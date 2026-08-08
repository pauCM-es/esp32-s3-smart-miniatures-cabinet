#include <cassert>
#include <cstring>
#include <iostream>

#include "cabinet/CabinetLayout.h"
#include "lighting/SceneRepository.h"
#include "miniatures/MiniatureRepository.h"

using namespace smartcabinet;

int main() {
    CabinetLayout layout;
    assert(layout.shelfCount() == 5);
    assert(layout.totalLedCount() == 400);

    const Location* first = layout.location(0, 0);
    const Location* last = layout.location(4, 4);
    assert(first != nullptr && first->ledStart == 0 && first->ledCount == 16);
    assert(last != nullptr && last->ledStart == 384 && last->ledCount == 16);

    assert(!layout.setLocationRange(0, 0, 10, 20)); // Overlaps location 1.
    assert(layout.setShelfLocationCount(0, 4));
    assert(layout.location(0, 3)->ledCount == 20);

    MiniatureRepository miniatures;
    assert(miniatures.count() == 5);
    assert(std::strcmp(miniatures.byId(0)->name, "Wolverine") == 0);
    assert(miniatures.byId(99) == nullptr);

    const SceneDefinition& display = SceneRepository::get(SceneId::Display);
    assert(display.pwmCabinet.apply && display.pwmCabinet.power);
    assert(display.rgbwCabinet.apply && display.rgbwCabinet.color.w > 0);
    assert(display.miniatures.apply && display.miniatures.power);

    const SceneDefinition& off = SceneRepository::get(SceneId::Off);
    assert(off.pwmCabinet.apply && !off.pwmCabinet.power);
    assert(off.rgbwCabinet.apply && !off.rgbwCabinet.power);
    assert(off.miniatures.apply && !off.miniatures.power);

    std::cout << "All host logic tests passed.\n";
    return 0;
}
