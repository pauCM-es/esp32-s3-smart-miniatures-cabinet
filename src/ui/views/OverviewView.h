#pragma once

#include <cstddef>

// ── OverviewView ─────────────────────────────────────────────────────────────
// Owns the Dashboard-to-LVGL binding. The only place allowed to reference
// ui_overview_screen widget variables directly.
// Controller code must call these functions instead of touching widgets.

namespace OverviewView {

struct ViewModel {
    const char* sceneName;
    size_t      miniatureCount;
    bool        lightsOn;
};

// Full refresh — call when the screen is opened.
void render(const ViewModel& model);

// Incremental setters — call when a single value changes.
void setCurrentScene(const char* sceneName);
void setMiniatureCount(size_t count);
void setLightsOn(bool on);

}  // namespace OverviewView
