#include "ShelvesEvents.h"

#include <Arduino.h>
#include "lvgl/lvgl.h"
#include "app/AppContext.h"
#include "cabinet/CabinetLayout.h"
#include "config/HardwareConfig.h"
#include "../views/ShelvesView.h"

using namespace smartcabinet;

/* ── Sequential shelf test state ─────────────────────────────────────── */

static lv_timer_t *s_shelf_test_timer = NULL;
static uint8_t     s_test_shelf       = 0;
static uint8_t     s_test_loc_idx     = 0;
static uint8_t     s_test_loc_count   = 0;

static void shelf_test_advance(lv_timer_t *t)
{
    (void)t;
    s_test_loc_idx++;
    if (s_test_loc_idx >= s_test_loc_count) {
        lv_timer_del(s_shelf_test_timer);
        s_shelf_test_timer = NULL;
        app.clearHighlight();
        Serial.printf("[Shelves] shelf %u test complete\n", s_test_shelf);
        return;
    }
    LocationId id = CabinetLayout::makeLocationId(s_test_shelf, s_test_loc_idx);
    app.testLocationPersistent(id);
    ShelvesView::setSelectedLocation(s_test_shelf, s_test_loc_idx);
    Serial.printf("[Shelves] testing shelf %u location %u\n", s_test_shelf, s_test_loc_idx);
}

extern "C" {

void shelves_on_add_shelf_pressed(void)
{
    uint8_t current = app.layout().shelfCount();
    if (current >= config::kMaxShelves) {
        Serial.println("[Shelves] max shelf count reached");
        return;
    }
    app.setShelfCount(current + 1);
    Serial.printf("[Shelves] shelf added, count=%u\n", current + 1);
    ShelvesView::refresh();
}

void shelves_on_shelf_selected(uint8_t shelfIndex)
{
    app.setSelectedShelf(shelfIndex);
    Serial.printf("[Shelves] shelf selected: %u\n", shelfIndex);
    ShelvesView::setSelectedShelf(shelfIndex);
}

void shelves_on_location_count_increment(void)
{
    uint8_t shelf = app.selectedShelfIndex();
    const Shelf* s = app.layout().shelf(shelf);
    if (!s || s->locationCount >= config::kMaxLocationsPerShelf) return;
    uint8_t newCount = s->locationCount + 1;
    app.setShelfLocationCount(shelf, newCount);
    Serial.printf("[Shelves] shelf %u location count: %u\n", shelf, newCount);
    ShelvesView::setLocationCount(shelf, newCount);
}

void shelves_on_location_count_decrement(void)
{
    uint8_t shelf = app.selectedShelfIndex();
    const Shelf* s = app.layout().shelf(shelf);
    if (!s || s->locationCount == 0) return;
    uint8_t newCount = s->locationCount - 1;
    app.setShelfLocationCount(shelf, newCount);
    Serial.printf("[Shelves] shelf %u location count: %u\n", shelf, newCount);
    ShelvesView::setLocationCount(shelf, newCount);
}

void shelves_on_led_count_increment(void)
{
    uint8_t shelf = app.selectedShelfIndex();
    const Shelf* s = app.layout().shelf(shelf);
    if (!s) return;
    uint16_t newCount = s->ledCount + 1;
    app.setShelfLedCount(shelf, newCount);
    Serial.printf("[Shelves] shelf %u LED count: %u\n", shelf, newCount);
    ShelvesView::setTotalLedCount(shelf, newCount);
}

void shelves_on_led_count_decrement(void)
{
    uint8_t shelf = app.selectedShelfIndex();
    const Shelf* s = app.layout().shelf(shelf);
    if (!s || s->ledCount == 0) return;
    uint16_t newCount = s->ledCount - 1;
    app.setShelfLedCount(shelf, newCount);
    Serial.printf("[Shelves] shelf %u LED count: %u\n", shelf, newCount);
    ShelvesView::setTotalLedCount(shelf, newCount);
}

void shelves_on_location_selected(uint8_t locationIndex)
{
    app.setSelectedLocation(locationIndex);
    Serial.printf("[Shelves] location selected: %u\n", locationIndex);
    ShelvesView::setSelectedLocation(app.selectedShelfIndex(), locationIndex);
}

void shelves_on_auto_assign(void)
{
    uint8_t shelf = app.selectedShelfIndex();
    app.distributeShelfEvenly(shelf);
    Serial.printf("[Shelves] auto-assigned shelf %u\n", shelf);
    ShelvesView::refresh();
}

void shelves_on_test_pressed(void)
{
    if (s_shelf_test_timer) {
        lv_timer_del(s_shelf_test_timer);
        s_shelf_test_timer = NULL;
        app.clearHighlight();
        Serial.printf("[Shelves] shelf test stopped\n");
        return;
    }

    s_test_shelf = app.selectedShelfIndex();
    const Shelf* shelf = app.layout().shelf(s_test_shelf);
    if (!shelf || shelf->locationCount == 0) return;

    s_test_loc_count = shelf->locationCount;
    s_test_loc_idx   = 0;

    LocationId id = CabinetLayout::makeLocationId(s_test_shelf, 0);
    app.testLocationPersistent(id);
    ShelvesView::setSelectedLocation(s_test_shelf, 0);
    Serial.printf("[Shelves] testing shelf %u location 0\n", s_test_shelf);

    s_shelf_test_timer = lv_timer_create(shelf_test_advance,
                                          config::kLocationTestDurationMs, NULL);
}

void shelves_on_clear_shelf(void)
{
    uint8_t shelf = app.selectedShelfIndex();
    app.clearShelfAllLocations(shelf);
    Serial.printf("[Shelves] cleared shelf %u\n", shelf);
    ShelvesView::refresh();
}

void shelves_on_location_led_count_increment(void)
{
    uint8_t shelf    = app.selectedShelfIndex();
    uint8_t location = app.selectedLocationIndex();
    const Location* loc = app.layout().location(shelf, location);
    if (!loc) return;
    uint16_t relStart = loc->relativeLedStart;
    app.setLocationRange(shelf, location, relStart, loc->ledCount + 1);
    loc = app.layout().location(shelf, location);
    if (!loc) return;
    ShelvesView::updateLocationEditorValues(shelf,
        {(uint16_t)(loc->ledStart + 1u), loc->ledCount,
         (uint16_t)(loc->ledStart + loc->ledCount)});
    ShelvesView::refreshLedStates(shelf);
}

void shelves_on_location_led_count_decrement(void)
{
    uint8_t shelf    = app.selectedShelfIndex();
    uint8_t location = app.selectedLocationIndex();
    const Location* loc = app.layout().location(shelf, location);
    if (!loc || loc->ledCount <= 1) return;  /* minimum 1 LED */
    uint16_t relStart = loc->relativeLedStart;
    app.setLocationRange(shelf, location, relStart, loc->ledCount - 1);
    loc = app.layout().location(shelf, location);
    if (!loc) return;
    ShelvesView::updateLocationEditorValues(shelf,
        {(uint16_t)(loc->ledStart + 1u), loc->ledCount,
         (uint16_t)(loc->ledStart + loc->ledCount)});
    ShelvesView::refreshLedStates(shelf);
}

void shelves_on_location_editor_close(void)
{
    /* Overlay is already hidden by the direct on_overlay_close callback.
       Reset selected location to keep app state consistent. */
    app.setSelectedLocation(0);
}

void shelves_on_clear_location(void)
{
    uint8_t shelf    = app.selectedShelfIndex();
    uint8_t location = app.selectedLocationIndex();
    app.clearShelfLocation(shelf, location);
    Serial.printf("[Shelves] cleared shelf %u location %u\n", shelf, location);
    ShelvesView::closeLocationEditor(shelf);
    ShelvesView::refreshLedStates(shelf);
}

void shelves_on_led_selected(uint16_t ledIndex)
{
    uint8_t shelf    = app.selectedShelfIndex();
    uint8_t location = app.selectedLocationIndex();
    const Location* loc = app.layout().location(shelf, location);
    if (!loc) return;

    /* relativeLedStart is 0-based within the shelf; preserve existing count or default to 1 */
    uint16_t relStart = ledIndex > 0u ? (uint16_t)(ledIndex - 1u) : 0u;
    uint16_t ledCount = loc->ledCount > 0u ? loc->ledCount : 1u;

    app.setLocationRange(shelf, location, relStart, ledCount);

    loc = app.layout().location(shelf, location);
    if (!loc) return;

    Serial.printf("[Shelves] LED %u -> shelf %u location %u (count=%u)\n",
                  ledIndex, shelf, location, ledCount);

    ShelvesView::openLocationEditor(shelf,
        {(uint16_t)(loc->ledStart + 1u), loc->ledCount,
         (uint16_t)(loc->ledStart + loc->ledCount)});
    ShelvesView::refreshLedStates(shelf);
}

}  // extern "C"
