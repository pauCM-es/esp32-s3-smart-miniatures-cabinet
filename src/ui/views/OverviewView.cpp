#include "OverviewView.h"
#include <lvgl.h>
#include "../screens/ui_overview_screen.h"   // LVGL widget externs

#include "app/AppContext.h"
#include "app/CatalogueContext.h"
#include "lighting/SceneRepository.h"

#ifdef ESP_PLATFORM
#include <WiFi.h>
#include <time.h>
#include "app/MqttApiContext.h"
#endif

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
        /* miniatureCount */ catalogue.all().size(),
        /* lightsOn       */ s.pwmCabinetOn || s.rgbwCabinetOn,
    };
}

lv_timer_t* s_clockTimer = nullptr;

void clockTimerCb(lv_timer_t*)
{
#ifdef ESP_PLATFORM
    if (ui_wifi_label) {
        const bool wifiOk = (WiFi.status() == WL_CONNECTED);
        lv_obj_set_style_text_color(
            ui_wifi_label,
            wifiOk ? lv_color_hex(0x00E4F6) : lv_color_hex(0x555577),
            LV_PART_MAIN | LV_STATE_DEFAULT
        );
    }

    if (ui_mqtt_label) {
        lv_obj_set_style_text_color(
            ui_mqtt_label,
            mqttApi.connected() ? lv_color_hex(0xF04EB9) : lv_color_hex(0x555577),
            LV_PART_MAIN | LV_STATE_DEFAULT
        );
    }

    if (ui_time_label) {
        const time_t now = time(nullptr);
        if (now > 1609459200L) {  // after 2021-01-01, i.e. NTP has synced
            struct tm timeinfo;
            localtime_r(&now, &timeinfo);
            char buf[6];
            strftime(buf, sizeof(buf), "%H:%M", &timeinfo);
            lv_label_set_text(ui_time_label, buf);
        }
    }
#endif
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

void startClock()
{
    if (s_clockTimer) return;
    s_clockTimer = lv_timer_create(clockTimerCb, 1000, nullptr);
    clockTimerCb(nullptr);  // populate immediately, don't wait 1 s
}

}  // namespace OverviewView
