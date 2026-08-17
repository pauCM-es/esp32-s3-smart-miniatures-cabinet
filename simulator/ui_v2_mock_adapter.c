#include "ui_v2_mock_adapter.h"

#include <time.h>

#include "lvgl/lvgl.h"
#include "ui/ui_events.h"
#include "ui/ui_state.h"

typedef struct {
    const char* name;
    uint8_t shelf;
    const char* location;
} MockMiniature;

static const MockMiniature kMiniatures[] = {
    {"TIE Interceptor", 1, "A1"},
    {"X-wing Starfighter", 1, "A2"},
    {"Millennium Falcon", 2, "B1"},
    {"Razor Crest", 2, "B2"},
    {"AT-AT Walker", 3, "C1"},
};

static const char* const kScenes[] = {"Off", "Display", "Showcase"};
static const uint16_t kMiniatureCount = sizeof(kMiniatures) / sizeof(kMiniatures[0]);
static uint16_t currentMiniature = 0;

static void render_current_miniature(void) {
    const MockMiniature* miniature = &kMiniatures[currentMiniature];
    ui_state_set_miniature(miniature->name, currentMiniature + 1, kMiniatureCount,
        miniature->shelf, miniature->location);
}

static void on_cabinet_power_changed(bool enabled) {
    const UiState* state = ui_state_get();
    ui_state_set_cabinet_light(enabled, state->cabinetBrightnessPercent);
}

static void on_cabinet_brightness_changed(uint8_t percent) {
    ui_state_set_cabinet_light(percent > 0, percent);
}

static void on_miniatures_power_changed(bool enabled) {
    const UiState* state = ui_state_get();
    ui_state_set_miniatures_light(enabled, state->miniaturesBrightnessPercent);
}

static void on_miniatures_brightness_changed(uint8_t percent) {
    const UiState* state = ui_state_get();
    if (percent > state->miniaturesBrightnessLimitPercent) percent = state->miniaturesBrightnessLimitPercent;
    ui_state_set_miniatures_light(percent > 0, percent);
}

static void on_scene_selected(uint8_t sceneIndex) {
    ui_state_set_active_scene((int8_t)sceneIndex);
}

static void on_miniature_previous(void) {
    currentMiniature = currentMiniature == 0 ? kMiniatureCount - 1 : currentMiniature - 1;
    render_current_miniature();
}

static void on_miniature_next(void) {
    currentMiniature = (currentMiniature + 1) % kMiniatureCount;
    render_current_miniature();
}

static void on_screen_changed(UiScreen previous, UiScreen current) {
    (void)previous;
    if (current == UI_SCREEN_MINIATURES) render_current_miniature();
}

static void update_clock(lv_timer_t* timer) {
    (void)timer;
    const time_t now = time(NULL);
    const struct tm* local = localtime(&now);
    if (local) ui_state_set_clock((uint8_t)local->tm_hour, (uint8_t)local->tm_min);
}

void ui_simulator_mock_init(void) {
    const UiActionHandlers handlers = {
        .onCabinetPowerChanged = on_cabinet_power_changed,
        .onCabinetBrightnessChanged = on_cabinet_brightness_changed,
        .onMiniaturesPowerChanged = on_miniatures_power_changed,
        .onMiniaturesBrightnessChanged = on_miniatures_brightness_changed,
        .onSceneSelected = on_scene_selected,
        .onMiniaturePrevious = on_miniature_previous,
        .onMiniatureNext = on_miniature_next,
        .onScreenChanged = on_screen_changed,
    };

    ui_events_set_handlers(&handlers);
    ui_state_set_cabinet_light(true, 70);
    ui_state_set_miniatures_light(true, 45);
    ui_state_set_miniatures_brightness_limit(100);
    ui_state_set_miniature_count(kMiniatureCount);
    ui_state_set_scenes(kScenes, sizeof(kScenes) / sizeof(kScenes[0]), 1);
    ui_state_set_connectivity(true, true, "Simulator Wi-Fi", "simulator");
    ui_state_set_ota(UI_OTA_DISABLED, 0, 0, "sim-v2", "smart-cabinet-sim");
    render_current_miniature();
    update_clock(NULL);
    lv_timer_create(update_clock, 1000, NULL);
}
