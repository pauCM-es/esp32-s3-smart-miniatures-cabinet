#include "OverviewView.h"
#include "../screens/ui_overview_screen.h"   // LVGL widget externs

namespace OverviewView {

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
