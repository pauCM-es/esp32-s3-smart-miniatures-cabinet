// Refactored – dynamic shelves & LED items.
// Call ui_shelves_screen_rebuild() to push a new CabinetLayout into the UI.

#include "ui_shelves_screen.h"
#include "../components/ui_comp_shelf_tab.h"

/* ── Defaults matching HardwareConfig.h ───────────────────────────────────
   These are only used for the initial screen_init() call.
   After the CabinetLayout is ready, call ui_shelves_screen_rebuild().       */
#define UI_SHELVES_DEFAULT_SHELF_COUNT  1
#define UI_SHELVES_DEFAULT_LEDS         80
#define UI_SHELVES_DEFAULT_LOCATIONS    26

/* ── Screen-level globals ──────────────────────────────────────────────── */
lv_obj_t *ui_shelves_screen         = NULL;
lv_obj_t *ui_header2                = NULL;
lv_obj_t *ui_BodyContainerShelvesScreen = NULL;
lv_obj_t *ui_shelves_tabView        = NULL;

/* ── Per-tab data ──────────────────────────────────────────────────────── */
ui_shelf_tab_t ui_shelf_tabs[UI_SHELVES_MAX_TABS];
uint8_t        ui_shelf_tab_count = 0;

/* ── Event stubs ──────────────────────────────────────────────────────────
   lv_event_get_user_data(e) returns the shelf index (cast from uintptr_t).  */
void ui_event_autoMapAction_btn(lv_event_t *e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED) {
        autoMapLedsForLocation(e);
    }
}

void ui_event_testLedsAction_btn(lv_event_t *e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED) {
        testLedsLocation(e);
    }
}

void ui_event_saveLedsLocationAction_btn2(lv_event_t *e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED) {
        saveLedsLocation(e);
    }
}

/* ══════════════════════════════════════════════════════════════════════════
   Internal helper – build tabview chrome (the container + tabview widget).
   Called once from screen_init and once from rebuild when the screen object
   already exists but the tabs need to be re-created.
   ══════════════════════════════════════════════════════════════════════════ */
static void build_tabview_chrome(void)
{
    ui_BodyContainerShelvesScreen = lv_obj_create(ui_shelves_screen);
    lv_obj_remove_style_all(ui_BodyContainerShelvesScreen);
    lv_obj_set_width(ui_BodyContainerShelvesScreen,  lv_pct(98));
    lv_obj_set_height(ui_BodyContainerShelvesScreen, lv_pct(82));
    lv_obj_set_x(ui_BodyContainerShelvesScreen, 0);
    lv_obj_set_y(ui_BodyContainerShelvesScreen, -5);
    lv_obj_set_align(ui_BodyContainerShelvesScreen, LV_ALIGN_BOTTOM_MID);
    lv_obj_set_flex_flow(ui_BodyContainerShelvesScreen, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(ui_BodyContainerShelvesScreen,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(ui_BodyContainerShelvesScreen,
                      LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(ui_BodyContainerShelvesScreen, 8,
                            LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(ui_BodyContainerShelvesScreen,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Border);
    ui_object_set_themeable_style_property(ui_BodyContainerShelvesScreen,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Border);
    lv_obj_set_style_border_width(ui_BodyContainerShelvesScreen, 2,
                                  LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(ui_BodyContainerShelvesScreen,   5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(ui_BodyContainerShelvesScreen,  5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(ui_BodyContainerShelvesScreen,    5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(ui_BodyContainerShelvesScreen, 5, LV_PART_MAIN | LV_STATE_DEFAULT);

    ui_shelves_tabView = lv_tabview_create(ui_BodyContainerShelvesScreen,
                                           LV_DIR_LEFT, 40);
    lv_obj_set_width(ui_shelves_tabView,  lv_pct(100));
    lv_obj_set_height(ui_shelves_tabView, lv_pct(100));
    lv_obj_set_x(ui_shelves_tabView, -124);
    lv_obj_set_y(ui_shelves_tabView,   -9);
    lv_obj_set_align(ui_shelves_tabView, LV_ALIGN_CENTER);
    lv_obj_clear_flag(ui_shelves_tabView, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_color(ui_shelves_tabView, lv_color_hex(0xFFFFFF),
                              LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(ui_shelves_tabView, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(ui_shelves_tabView,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(ui_shelves_tabView, 5, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *tabBtns = lv_tabview_get_tab_btns(ui_shelves_tabView);
    lv_obj_set_style_text_align(tabBtns, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(tabBtns, &lv_font_montserrat_24,
                               LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(tabBtns, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_COLOR, _ui_theme_color_Card____________);
    ui_object_set_themeable_style_property(tabBtns, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_OPA, _ui_theme_alpha_Card____________);
    ui_object_set_themeable_style_property(tabBtns, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Border);
    ui_object_set_themeable_style_property(tabBtns, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Border);
    lv_obj_set_style_border_side(tabBtns, LV_BORDER_SIDE_RIGHT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(tabBtns,    5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(tabBtns, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_set_style_radius(tabBtns, 4, LV_PART_ITEMS | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_color(tabBtns, lv_color_hex(0x00E4F6),
                              LV_PART_ITEMS | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(tabBtns, 0, LV_PART_ITEMS | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(tabBtns, LV_PART_ITEMS | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(tabBtns, LV_PART_ITEMS | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(tabBtns, 2, LV_PART_ITEMS | LV_STATE_DEFAULT);
}

/* ══════════════════════════════════════════════════════════════════════════
   Public API
   ══════════════════════════════════════════════════════════════════════════ */

void ui_shelves_screen_screen_init(void)
{
    static const uint16_t default_leds[UI_SHELVES_DEFAULT_SHELF_COUNT] = {
        UI_SHELVES_DEFAULT_LEDS
    };
    static const uint8_t default_locs[UI_SHELVES_DEFAULT_SHELF_COUNT] = {
        UI_SHELVES_DEFAULT_LOCATIONS
    };

    ui_shelves_screen = lv_obj_create(NULL);
    lv_obj_clear_flag(ui_shelves_screen, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_color(ui_shelves_screen, lv_color_hex(0x05050E),
                              LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(ui_shelves_screen, 255, LV_PART_MAIN | LV_STATE_DEFAULT);

    ui_header2 = ui_header2_create(ui_shelves_screen);
    lv_obj_set_x(ui_header2, 0);
    lv_obj_set_y(ui_header2, 0);

    build_tabview_chrome();

    ui_shelves_screen_rebuild(UI_SHELVES_DEFAULT_SHELF_COUNT,
                              default_leds, default_locs);
}

void ui_shelves_screen_rebuild(uint8_t        shelf_count,
                               const uint16_t led_counts[],
                               const uint8_t  loc_counts[])
{
    if (shelf_count > UI_SHELVES_MAX_TABS) {
        shelf_count = UI_SHELVES_MAX_TABS;
    }

    /* Destroy existing tabs by deleting and re-creating the body container. */
    if (ui_BodyContainerShelvesScreen) {
        lv_obj_del(ui_BodyContainerShelvesScreen);
        ui_BodyContainerShelvesScreen = NULL;
        ui_shelves_tabView = NULL;
    }

    build_tabview_chrome();

    ui_shelf_tab_count = shelf_count;
    for (uint8_t i = 0; i < shelf_count; i++) {
        ui_shelf_tabs[i] = ui_shelf_tab_create(ui_shelves_tabView, i,
                                               led_counts[i],
                                               loc_counts[i]);
    }
}

void ui_shelves_screen_screen_destroy(void)
{
    if (ui_shelves_screen) {
        lv_obj_del(ui_shelves_screen);
    }
    ui_shelves_screen         = NULL;
    ui_header2                = NULL;
    ui_BodyContainerShelvesScreen = NULL;
    ui_shelves_tabView        = NULL;

    for (uint8_t i = 0; i < UI_SHELVES_MAX_TABS; i++) {
        ui_shelf_tabs[i] = (ui_shelf_tab_t){0};
    }
    ui_shelf_tab_count = 0;
}
