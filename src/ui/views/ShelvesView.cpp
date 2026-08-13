#include "ShelvesView.h"

#include "../screens/ui_shelves_screen.h"
#include "../components/ui_comp_shelf_tab.h"

#include "app/AppContext.h"
#include "cabinet/CabinetLayout.h"
#include "config/HardwareConfig.h"

using namespace smartcabinet;

namespace ShelvesView {

/* ── Internal helpers ──────────────────────────────────────────────────── */

static void formatLed(char *buf, size_t size, uint16_t led)
{
    if (led == 0) {
        lv_snprintf(buf, size, "\xe2\x80\x94");  /* UTF-8 em dash */
    } else {
        lv_snprintf(buf, size, "%u", (unsigned)led);
    }
}

/* ── Public API ────────────────────────────────────────────────────────── */

void refresh()
{
    const CabinetLayout& layout = app.layout();
    uint8_t count = layout.shelfCount();
    if (count == 0) return;

    uint16_t leds[config::kMaxShelves]{};
    uint8_t  locs[config::kMaxShelves]{};
    for (uint8_t i = 0; i < count; i++) {
        const Shelf* s = layout.shelf(i);
        if (s) { leds[i] = s->ledCount; locs[i] = s->locationCount; }
    }

    ui_shelves_screen_rebuild(count, leds, locs);

    for (uint8_t i = 0; i < count; i++) refreshLedStates(i);

    if (ui_shelves_tabView) {
        lv_tabview_set_act(ui_shelves_tabView,
                          app.selectedShelfIndex(), LV_ANIM_OFF);
    }
}

void setSelectedShelf(uint8_t shelfIndex)
{
    if (ui_shelves_tabView) {
        lv_tabview_set_act(ui_shelves_tabView, shelfIndex, LV_ANIM_OFF);
    }
}

void setLocationCount(uint8_t shelfIndex, uint8_t count)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    ui_shelf_tab_set_location_count(&ui_shelf_tabs[shelfIndex], count);
}

void setTotalLedCount(uint8_t shelfIndex, uint16_t count)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    ui_shelf_tab_set_led_count(&ui_shelf_tabs[shelfIndex], count);
    refreshLedStates(shelfIndex);
}

void setSelectedLocation(uint8_t shelfIndex, uint8_t locationIndex)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    lv_obj_t *locSel = ui_shelf_tabs[shelfIndex].locationSelectorCont;
    if (!locSel) return;

    uint16_t n = lv_obj_get_child_cnt(locSel);
    for (uint16_t i = 0; i < n; i++) {
        lv_obj_t *item = lv_obj_get_child(locSel, i);
        if (i == (uint16_t)locationIndex) {
            lv_obj_add_state(item, LV_STATE_FOCUSED);
            lv_obj_set_style_bg_img_opa(item, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
            ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_DEFAULT,
                LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Cyan____________);
            ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_DEFAULT,
                LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Cyan____________);
        } else {
            lv_obj_clear_state(item, LV_STATE_FOCUSED);
            lv_obj_set_style_bg_img_opa(item, 150, LV_PART_MAIN | LV_STATE_DEFAULT);
            ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_DEFAULT,
                LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
            ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_DEFAULT,
                LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
        }
    }
}

void updateLocationEditorValues(uint8_t shelfIndex, const LocationEditorViewModel& model)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    ui_shelf_tab_t& tab = ui_shelf_tabs[shelfIndex];

    char buf[8];
    formatLed(buf, sizeof(buf), model.startLed);
    lv_label_set_text(tab.overlayStartLed_label, buf);

    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)model.ledCount);
    lv_label_set_text(tab.overlayTotalLedsValue, buf);

    formatLed(buf, sizeof(buf), model.endLed);
    lv_label_set_text(tab.overlayEndLed_label, buf);
}

void openLocationEditor(uint8_t shelfIndex, const LocationEditorViewModel& model)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    updateLocationEditorValues(shelfIndex, model);
    lv_obj_clear_flag(ui_shelf_tabs[shelfIndex].overlay, LV_OBJ_FLAG_HIDDEN);
}

void closeLocationEditor(uint8_t shelfIndex)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    lv_obj_add_flag(ui_shelf_tabs[shelfIndex].overlay, LV_OBJ_FLAG_HIDDEN);
}

void refreshLedStates(uint8_t shelfIndex)
{
    if (shelfIndex >= ui_shelf_tab_count) return;
    const CabinetLayout& layout = app.layout();
    const Shelf* shelf = layout.shelf(shelfIndex);
    if (!shelf) return;

    lv_obj_t *ledMap = ui_shelf_tabs[shelfIndex].ledMappingCont;
    if (!ledMap) return;

    uint16_t itemCount = (uint16_t)lv_obj_get_child_cnt(ledMap);

    for (uint16_t i = 0; i < itemCount; i++) {
        lv_obj_t *item = lv_obj_get_child(ledMap, i);
        uint16_t absLed = shelf->ledStart + i;
        ui_led_item_state_t state = UI_LED_ITEM_STATE_UNASSIGNED;

        for (uint8_t locIdx = 0; locIdx < shelf->locationCount; locIdx++) {
            const Location* loc = layout.location(shelfIndex, locIdx);
            if (!loc || loc->ledCount == 0) continue;
            if (absLed >= loc->ledStart && absLed < loc->ledStart + loc->ledCount) {
                if (absLed == loc->ledStart) {
                    state = UI_LED_ITEM_STATE_START;
                } else if (absLed == loc->ledStart + loc->ledCount - 1u) {
                    state = UI_LED_ITEM_STATE_END;
                } else {
                    state = UI_LED_ITEM_STATE_ASSIGNED;
                }
                break;
            }
        }

        ui_led_item_set_state(item, state);
    }
}

}  // namespace ShelvesView
