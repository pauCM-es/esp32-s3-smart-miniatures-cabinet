#pragma once

#include "../ui.h"
#include "ui_comp_led_item.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Aggregates all addressable sub-widgets of a single shelf tab.
 * Stored in an array (ui_shelf_tabs[]) indexed by shelf number.
 */
typedef struct {
    lv_obj_t *tabContent;              /**< The tab content object from lv_tabview_add_tab() */
    lv_obj_t *locationInShef_label;    /**< Label showing the location count */
    lv_obj_t *ledsInShef_label;        /**< Label showing the LED count */
    lv_obj_t *locationSelectorCont;    /**< Scrollable row of hex position items */
    lv_obj_t *ledMappingCont;          /**< Row of LED bar items */
    lv_obj_t *autoMapBtn;              /**< AUTO MAP button */
    lv_obj_t *testLedsBtn;             /**< TEST LEDS button */
    lv_obj_t *saveBtn;                 /**< SAVE button */
    lv_obj_t *overlay;                 /**< Hidden overlay for start/end selection */
    lv_obj_t *overlayStartLed_label;   /**< Start LED index inside overlay */
    lv_obj_t *overlayEndLed_label;     /**< End LED index inside overlay */
    lv_obj_t *overlayTotalLedsValue;   /**< LED count stepper value in overlay */
} ui_shelf_tab_t;

/**
 * Create one shelf tab inside @p tabview and populate it with:
 *  - inputs row (locations + LEDs up/down)
 *  - location selector (hex position items)
 *  - LED mapping bar (one ui_led_item per LED, all UNASSIGNED)
 *  - action buttons (AUTO MAP / TEST LEDS / SAVE)
 *  - hidden overlay for start-LED selection
 *
 * @param tabview        Parent tabview object.
 * @param shelf_index    0-based shelf index (tab label = shelf_index + 1).
 * @param led_count      Number of LED items to render in the mapping bar.
 * @param location_count Number of hex position items to render.
 * @return               Populated ui_shelf_tab_t struct.
 */
ui_shelf_tab_t ui_shelf_tab_create(lv_obj_t *tabview,
                                   uint8_t   shelf_index,
                                   uint16_t  led_count,
                                   uint8_t   location_count);

#ifdef __cplusplus
} /*extern "C"*/
#endif
