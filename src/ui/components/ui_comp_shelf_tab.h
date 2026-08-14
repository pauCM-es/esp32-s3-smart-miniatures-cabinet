#pragma once

#include "../ui.h"

#define UI_MAX_SHELVES 5

#ifdef __cplusplus
extern "C" {
#endif

// Tracks widget references for one shelf tab.
typedef struct {
    lv_obj_t *locationSelectorCont;   /* scrollable hex row */
    lv_obj_t *locationCountLabel;     /* counter display in inputs row */
    lv_obj_t *ledMappingCont;         /* scrollable LED bar row */
    lv_obj_t *ledCountLabel;          /* counter display in inputs row */
    lv_obj_t *overlay;                /* top info overlay (hidden by default) */
    lv_obj_t *actionsOverlay;         /* bottom actions overlay (hidden by default) */
    lv_obj_t *overlayStartLed_label;  /* start LED label inside top overlay */
    lv_obj_t *overlayTotalLedsValue;  /* section LED count value inside top overlay */
    lv_obj_t *overlayEndLed_label;    /* end LED label inside top overlay */
    lv_obj_t *testBtn;                /* TEST action button */
} ui_shelf_tab_t;

extern ui_shelf_tab_t ui_shelf_tabs[UI_MAX_SHELVES];
extern uint8_t        ui_shelf_tab_count;

// Rebuild dynamic tab content for shelfCount shelves.
// leds[i] = total LED count for shelf i, locs[i] = location count.
void ui_shelves_screen_rebuild(uint8_t shelfCount, const uint16_t *leds, const uint8_t *locs);

// Clear and recreate location hex items for one tab.
void ui_shelf_tab_set_location_count(ui_shelf_tab_t *tab, uint8_t count);

// Clear and recreate LED bar items for one tab.
void ui_shelf_tab_set_led_count(ui_shelf_tab_t *tab, uint16_t count);

#ifdef __cplusplus
}
#endif
