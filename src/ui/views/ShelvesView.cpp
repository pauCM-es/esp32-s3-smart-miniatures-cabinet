#include "ShelvesView.h"

// Shelves screen removed – all functions are no-ops until the screen is re-added.

namespace ShelvesView {

void refresh() {}
void setSelectedShelf(uint8_t) {}
void setLocationCount(uint8_t, uint8_t) {}
void setTotalLedCount(uint8_t, uint16_t) {}
void setSelectedLocation(uint8_t, uint8_t) {}
void openLocationEditor(uint8_t, const LocationEditorViewModel&) {}
void updateLocationEditorValues(uint8_t, const LocationEditorViewModel&) {}
void closeLocationEditor(uint8_t) {}
void refreshLedStates(uint8_t) {}
void setTestBtnActive(uint8_t, bool) {}

}  // namespace ShelvesView