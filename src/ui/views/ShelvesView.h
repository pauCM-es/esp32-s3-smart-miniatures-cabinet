#pragma once

#include <cstdint>

// ── ShelvesView ───────────────────────────────────────────────────────────────
// Owns the Shelves Configuration screen LVGL binding.
// Controller code must call these functions instead of touching widgets directly.

namespace ShelvesView {

struct LocationEditorViewModel {
    uint16_t startLed;  // 1-based; 0 = unset → display "—"
    uint16_t ledCount;
    uint16_t endLed;    // 1-based; 0 = unset → display "—"
};

// Rebuild all tabs from the current CabinetLayout and re-render labels.
void refresh();

// Switch the active tab without a full rebuild.
void setSelectedShelf(uint8_t shelfIndex);

// Update the location count label and rebuild the hex selector for one shelf.
void setLocationCount(uint8_t shelfIndex, uint8_t count);

// Update the LED count label and rebuild the LED mapping bar for one shelf.
void setTotalLedCount(uint8_t shelfIndex, uint16_t count);

// Highlight the selected hex item in the location selector.
void setSelectedLocation(uint8_t shelfIndex, uint8_t locationIndex);

// Show the overlay and populate it with the given values.
void openLocationEditor(uint8_t shelfIndex, const LocationEditorViewModel& model);

// Update overlay labels only (overlay must already be visible).
void updateLocationEditorValues(uint8_t shelfIndex, const LocationEditorViewModel& model);

// Hide the overlay.
void closeLocationEditor(uint8_t shelfIndex);

// Re-colour the LED mapping bar for one shelf from the current CabinetLayout.
void refreshLedStates(uint8_t shelfIndex);

// Toggle TEST button visual state (cyan + full opacity = active, purple + dim = idle).
void setTestBtnActive(uint8_t shelfIndex, bool active);

}  // namespace ShelvesView
