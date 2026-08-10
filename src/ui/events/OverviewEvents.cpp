#include "OverviewEvents.h"

#include "app/AppContext.h"
#include "ui/views/OverviewView.h"

using namespace smartcabinet;

// ── Helpers ───────────────────────────────────────────────────────────────────

namespace {

// Scene cycling order: Manual → Off → Display → Showcase → Manual
SceneId cycleNext(SceneId id)
{
    constexpr uint8_t kCount = 4;
    return static_cast<SceneId>((static_cast<uint8_t>(id) + 1) % kCount);
}

SceneId cyclePrev(SceneId id)
{
    constexpr uint8_t kCount = 4;
    return static_cast<SceneId>((static_cast<uint8_t>(id) + kCount - 1) % kCount);
}

}  // namespace

// ── C-linkage implementations ────────────────────────────────────────────────

extern "C" {

void overview_on_next_scene(void)
{
    app.applyScene(cycleNext(app.state().activeScene));
    OverviewView::refresh();   // state → ViewModel → widgets
}

void overview_on_prev_scene(void)
{
    app.applyScene(cyclePrev(app.state().activeScene));
    OverviewView::refresh();
}

void overview_on_lights_switched(int on)
{
    const bool enabled = (on != 0);
    app.setPwmCabinetPower(enabled);
    if (app.state().rgbwCabinetAvailable) {
        app.setRgbwCabinetPower(enabled);
    }
}

void overview_on_screen_opened(void)
{
    OverviewView::refresh();
}

}  // extern "C"
