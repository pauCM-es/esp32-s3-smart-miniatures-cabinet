#include "OverviewView.h"
#include <lvgl.h>
#include "../screens/ui_overview_screen.h"   // LVGL widget externs

#include "app/AppContext.h"
#include "lighting/SceneRepository.h"

using namespace smartcabinet;

namespace OverviewView {

// ── State reader ─────────────────────────────────────────────────────────────
// Builds a ViewModel from the current application state.
// Kept private — callers use refresh() or render().

namespace {
ViewModel buildViewModel()
{
    const AppState s = app.state();
    return {
        /* sceneName      */ SceneRepository::get(s.activeScene).name,
        /* miniatureCount */ s.miniatureCount,
        /* lightsOn       */ s.pwmCabinetOn || s.rgbwCabinetOn,
    };
}
}  // namespace

// ── Public API ───────────────────────────────────────────────────────────────

void refresh()
{
    render(buildViewModel());
}

void setCurrentScene(const char* sceneName)
{
    if (!ui_currentScene_label) return;
    lv_label_set_text(ui_currentScene_label, sceneName ? sceneName : "—");
}

void setMiniatureCount(size_t count)
{
    if (!ui_minisAmount_label) return;
    lv_label_set_text_fmt(ui_minisAmount_label, "%u", (unsigned)count);
}

void setLightsOn(bool on)
{
    if (!ui_lights_switch) return;
    // Modify state without firing LV_EVENT_VALUE_CHANGED to avoid re-entry.
    if (on) {
        lv_obj_add_state(ui_lights_switch, LV_STATE_CHECKED);
    } else {
        lv_obj_clear_state(ui_lights_switch, LV_STATE_CHECKED);
    }
}

void render(const ViewModel& model)
{
    setCurrentScene(model.sceneName);
    setMiniatureCount(model.miniatureCount);
    setLightsOn(model.lightsOn);
}

}  // namespace OverviewView
