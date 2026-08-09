// Refactored – dynamic shelves & LED items
// Original SquareLine Studio boilerplate adapted for runtime layout.

#ifndef UI_SHELVES_SCREEN_H
#define UI_SHELVES_SCREEN_H

#include "../ui.h"
#include "../components/ui_comp_shelf_tab.h"

#ifdef __cplusplus
extern "C" {
#endif

/* Maximum number of shelf tabs supported by this screen. */
#define UI_SHELVES_MAX_TABS 5

/* ── Screen-level objects ─────────────────────────────────────── */
extern lv_obj_t *ui_shelves_screen;
extern lv_obj_t *ui_header2;
extern lv_obj_t *ui_BodyContainerShelvesScreen;
extern lv_obj_t *ui_shelves_tabView;

/* ── Per-tab data ─────────────────────────────────────────────── */
extern ui_shelf_tab_t ui_shelf_tabs[UI_SHELVES_MAX_TABS];
extern uint8_t        ui_shelf_tab_count;

/* ── Lifecycle ────────────────────────────────────────────────── */
extern void ui_shelves_screen_screen_init(void);
extern void ui_shelves_screen_screen_destroy(void);

/**
 * Rebuild all shelf tabs to reflect a new layout.
 * Call this after the CabinetLayout has been updated.
 *
 * @param shelf_count   Number of shelves (capped at UI_SHELVES_MAX_TABS).
 * @param led_counts    Array of LED counts, one per shelf.
 * @param loc_counts    Array of location counts, one per shelf.
 */
void ui_shelves_screen_rebuild(uint8_t        shelf_count,
                               const uint16_t led_counts[],
                               const uint8_t  loc_counts[]);

/* ── Event stubs (called from ui_comp_shelf_tab) ──────────────── */
extern void ui_event_autoMapAction_btn(lv_event_t *e);
extern void ui_event_testLedsAction_btn(lv_event_t *e);
extern void ui_event_saveLedsLocationAction_btn2(lv_event_t *e);

// CUSTOM VARIABLES

#ifdef __cplusplus
} /*extern "C"*/
#endif

#endif

