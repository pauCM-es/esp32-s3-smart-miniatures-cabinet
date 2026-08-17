#include "SmartCabinetUiAdapter.h"

#include <Arduino.h>
#include <WiFi.h>
#include <time.h>

#include "app/AppContext.h"
#include "app/CatalogueContext.h"
#include "app/MqttApiContext.h"
#include "app/SmartCabinetContext.h"
#include "lighting/SceneRepository.h"
#include "models/Color.h"
#include "../ui.h"
#include "../ui_events.h"
#include "../ui_state.h"

namespace smartcabinet {
namespace {

constexpr SceneId kSelectableScenes[] = {
    SceneId::Off,
    SceneId::Display,
    SceneId::Showcase,
};

size_t currentMiniatureIndex = 0;
bool miniatureNavigatorOpen = false;
lv_timer_t* stateTimer = nullptr;
lv_timer_t* navigationTimer = nullptr;
bool navigationRenderPending = false;

uint8_t sceneIndex(SceneId scene) {
    for (uint8_t i = 0; i < sizeof(kSelectableScenes) / sizeof(kSelectableScenes[0]); ++i) {
        if (scene == kSelectableScenes[i]) return i;
    }
    return UINT8_MAX;
}

void syncState() {
    const AppState state = app.state();
    const bool usePwm = state.pwmCabinetAvailable;
    const bool cabinetOn = usePwm ? state.pwmCabinetOn : state.rgbwCabinetOn;
    const uint8_t cabinetBrightness = usePwm
        ? state.pwmCabinetBrightness
        : state.rgbwCabinetBrightness;

    ui_state_set_cabinet_light(cabinetOn, cabinetBrightness);
    ui_state_set_miniatures_light(state.miniatureLightsOn, state.miniatureBrightness);
    ui_state_set_miniature_count(static_cast<uint16_t>(catalogue.all().size()));

    const char* sceneNames[sizeof(kSelectableScenes) / sizeof(kSelectableScenes[0])];
    for (uint8_t i = 0; i < sizeof(kSelectableScenes) / sizeof(kSelectableScenes[0]); ++i) {
        sceneNames[i] = SceneRepository::get(kSelectableScenes[i]).name;
    }
    const uint8_t activeIndex = sceneIndex(state.activeScene);
    ui_state_set_scenes(
        sceneNames,
        sizeof(kSelectableScenes) / sizeof(kSelectableScenes[0]),
        activeIndex == UINT8_MAX ? -1 : static_cast<int8_t>(activeIndex)
    );

    const time_t now = time(nullptr);
    if (now > 1609459200L) {
        tm localTime{};
        localtime_r(&now, &localTime);
        ui_state_set_clock(static_cast<uint8_t>(localTime.tm_hour), static_cast<uint8_t>(localTime.tm_min));
    }

    ui_state_set_connectivity(
        WiFi.status() == WL_CONNECTED,
        mqttApi.connected(),
        WiFi.status() == WL_CONNECTED ? WiFi.SSID().c_str() : "",
        nullptr
    );
}

void highlightCurrentMiniature() {
    const auto& miniatures = catalogue.all();
    if (miniatures.empty()) {
        app.clearHighlight();
        return;
    }

    const Miniature& miniature = miniatures[currentMiniatureIndex];
    if (miniature.shelf == 0 || miniature.location == 0) {
        app.clearHighlight();
        return;
    }

    app.highlightLocationPersistent(
        static_cast<uint8_t>(miniature.shelf - 1),
        static_cast<uint8_t>(miniature.location - 1),
        kWhite
    );
}

void renderCurrentMiniature() {
    const auto& miniatures = catalogue.all();
    if (miniatures.empty()) {
        ui_state_set_miniature("", 0, 0, 0, "");
        return;
    }

    if (currentMiniatureIndex >= miniatures.size()) currentMiniatureIndex = 0;
    const Miniature& miniature = miniatures[currentMiniatureIndex];
    char location[UI_LOCATION_LABEL_LEN];
    lv_snprintf(location, sizeof(location), "%u", static_cast<unsigned>(miniature.location));
    ui_state_set_miniature(
        miniature.name.c_str(),
        static_cast<uint16_t>(currentMiniatureIndex + 1),
        static_cast<uint16_t>(miniatures.size()),
        static_cast<uint8_t>(miniature.shelf),
        location
    );
}

void navigationTimerCallback(lv_timer_t*) {
    if (!navigationRenderPending) return;
    navigationRenderPending = false;
    renderCurrentMiniature();
}

void openMiniatureNavigator() {
    if (miniatureNavigatorOpen) return;
    miniatureNavigatorOpen = true;
    currentMiniatureIndex = 0;

    smartCabinet.setCabinetLightPower(false);
    smartCabinet.setMiniatureLightPower(true);

    renderCurrentMiniature();
    highlightCurrentMiniature();
    navigationTimer = lv_timer_create(navigationTimerCallback, 50, nullptr);

    app.setEncoderNavigationCallback([](int8_t delta) {
        const size_t count = catalogue.all().size();
        if (count == 0) return;
        if (delta > 0) {
            currentMiniatureIndex = (currentMiniatureIndex + 1) % count;
        } else {
            currentMiniatureIndex = currentMiniatureIndex == 0 ? count - 1 : currentMiniatureIndex - 1;
        }
        highlightCurrentMiniature();
        navigationRenderPending = true;
    });
}

void closeMiniatureNavigator() {
    if (!miniatureNavigatorOpen) return;
    miniatureNavigatorOpen = false;
    app.clearHighlight();
    app.setEncoderNavigationCallback(nullptr);
    if (navigationTimer) {
        lv_timer_del(navigationTimer);
        navigationTimer = nullptr;
    }
    navigationRenderPending = false;
}

void cabinetPowerChanged(bool enabled) {
    smartCabinet.setCabinetLightPower(enabled);
    syncState();
}

void cabinetBrightnessChanged(uint8_t percent) {
    smartCabinet.setCabinetLightBrightness(percent);
    syncState();
}

void miniaturesPowerChanged(bool enabled) {
    smartCabinet.setMiniatureLightPower(enabled);
    syncState();
}

void miniaturesBrightnessChanged(uint8_t percent) {
    smartCabinet.setMiniatureLightBrightness(percent);
    syncState();
}

void sceneSelected(uint8_t index) {
    if (index >= sizeof(kSelectableScenes) / sizeof(kSelectableScenes[0])) return;
    smartCabinet.applyScene(static_cast<uint8_t>(kSelectableScenes[index]));
    syncState();
}

void miniaturePrevious() {
    const size_t count = catalogue.all().size();
    if (count == 0) return;
    currentMiniatureIndex = currentMiniatureIndex == 0 ? count - 1 : currentMiniatureIndex - 1;
    renderCurrentMiniature();
    highlightCurrentMiniature();
}

void miniatureNext() {
    const size_t count = catalogue.all().size();
    if (count == 0) return;
    currentMiniatureIndex = (currentMiniatureIndex + 1) % count;
    renderCurrentMiniature();
    highlightCurrentMiniature();
}

void screenChanged(UiScreen previous, UiScreen current) {
    if (previous == UI_SCREEN_MINIATURES && current != UI_SCREEN_MINIATURES) {
        closeMiniatureNavigator();
    }
    if (current == UI_SCREEN_MINIATURES && previous != UI_SCREEN_MINIATURES) {
        openMiniatureNavigator();
    }
}

void stateTimerCallback(lv_timer_t*) {
    syncState();
}

}  // namespace

void SmartCabinetUiAdapter::begin() {
    UiActionHandlers handlers{};
    handlers.onCabinetPowerChanged = cabinetPowerChanged;
    handlers.onCabinetBrightnessChanged = cabinetBrightnessChanged;
    handlers.onMiniaturesPowerChanged = miniaturesPowerChanged;
    handlers.onMiniaturesBrightnessChanged = miniaturesBrightnessChanged;
    handlers.onSceneSelected = sceneSelected;
    handlers.onMiniaturePrevious = miniaturePrevious;
    handlers.onMiniatureNext = miniatureNext;
    handlers.onScreenChanged = screenChanged;
    ui_events_set_handlers(&handlers);

    syncState();
    stateTimer = lv_timer_create(stateTimerCallback, 250, nullptr);
}

}  // namespace smartcabinet
