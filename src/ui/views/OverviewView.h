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

// ── State → View ─────────────────────────────────────────────────────────────
// Build a ViewModel from the current AppState and render the screen.
// Call this whenever application state changes and the screen may be visible.
void refresh();

// Full refresh from a pre-built model.
void render(const ViewModel& model);

// ── Incremental setters ───────────────────────────────────────────────────────
// Call when only one value changes while the screen is already active.
void setCurrentScene(const char* sceneName);
void setMiniatureCount(size_t count);
void setLightsOn(bool on);

}  // namespace OverviewView
