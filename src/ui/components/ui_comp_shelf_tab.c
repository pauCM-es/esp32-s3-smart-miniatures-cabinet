#include "ui_comp_shelf_tab.h"
#include "ui_comp_led_item.h"

/* ui.h (via header) already brings in: lvgl, ui_helpers, ui_events, ui_themes,
   ui_theme_manager, and all screen headers (including ui_shelves_screen.h). */

ui_shelf_tab_t ui_shelf_tabs[UI_MAX_SHELVES];
uint8_t        ui_shelf_tab_count = 0;

/* ── Forward declarations ─────────────────────────────────────────── */
static void     _create_location_item(lv_obj_t *parent, uint8_t locationNum);
static lv_obj_t *_create_updown_counter(lv_obj_t *parent,
                                         lv_event_cb_t addCb, lv_event_cb_t subCb,
                                         const char *initText);
static void     _build_new_tab_content(lv_obj_t *tabContent, uint8_t shelfIdx);
static void     _on_close_btn(lv_event_t *e);

/* ── Close button handler for dynamically-created overlays ─────────── */
static void _on_close_btn(lv_event_t *e)
{
    if (lv_event_get_code(e) != LV_EVENT_CLICKED) return;
    cancelMapLeds(e);
    ui_shelf_tab_t *tab = (ui_shelf_tab_t *)lv_event_get_user_data(e);
    if (tab) {
        lv_obj_add_flag(tab->overlay, LV_OBJ_FLAG_HIDDEN);
        lv_obj_add_flag(tab->actionsOverlay, LV_OBJ_FLAG_HIDDEN);
    }
}

/* ── Shared up/down counter widget (returns the value label) ────────── */
static lv_obj_t *_create_updown_counter(lv_obj_t *parent,
                                          lv_event_cb_t addCb, lv_event_cb_t subCb,
                                          const char *initText)
{
    lv_obj_t *cnt = lv_obj_create(parent);
    lv_obj_remove_style_all(cnt);
    lv_obj_set_width(cnt, lv_pct(75));
    lv_obj_set_height(cnt, lv_pct(85));
    lv_obj_set_align(cnt, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(cnt, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(cnt, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(cnt, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(cnt, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(cnt, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(cnt, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(cnt, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(cnt, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(cnt, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(cnt, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(cnt, &lv_font_montserrat_32, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *addBtn = lv_label_create(cnt);
    lv_obj_set_width(addBtn, lv_pct(25));
    lv_obj_set_height(addBtn, lv_pct(100));
    lv_obj_set_align(addBtn, LV_ALIGN_CENTER);
    lv_label_set_text(addBtn, "");
    lv_obj_set_style_bg_img_src(addBtn,
        &ui_img_add_32dp_ffffff_fill0_wght400_grad0_opsz40_png, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(addBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(addBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(addBtn, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(addBtn, LV_BORDER_SIDE_RIGHT, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_event_cb(addBtn, addCb, LV_EVENT_ALL, NULL);

    lv_obj_t *valLbl = lv_label_create(cnt);
    lv_obj_set_width(valLbl, lv_pct(50));
    lv_obj_set_height(valLbl, lv_pct(100));
    lv_obj_set_align(valLbl, LV_ALIGN_CENTER);
    lv_label_set_text(valLbl, initText);

    lv_obj_t *subBtn = lv_label_create(cnt);
    lv_obj_set_width(subBtn, lv_pct(25));
    lv_obj_set_height(subBtn, lv_pct(100));
    lv_obj_set_align(subBtn, LV_ALIGN_CENTER);
    lv_label_set_text(subBtn, "");
    lv_obj_set_style_bg_img_src(subBtn,
        &ui_img_remove_32dp_ffffff_fill0_wght400_grad0_opsz40_png, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(subBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(subBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(subBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(subBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(subBtn, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(subBtn, LV_BORDER_SIDE_LEFT, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_event_cb(subBtn, subCb, LV_EVENT_ALL, NULL);

    return valLbl;
}

/* ── Location hex item ────────────────────────────────────────────── */
static void _create_location_item(lv_obj_t *parent, uint8_t locationNum)
{
    lv_obj_t *cont = lv_obj_create(parent);
    lv_obj_remove_style_all(cont);
    lv_obj_set_width(cont, 70);
    lv_obj_set_height(cont, 56);
    lv_obj_set_align(cont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(cont, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK |
                      LV_OBJ_FLAG_CLICK_FOCUSABLE | LV_OBJ_FLAG_GESTURE_BUBBLE |
                      LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_set_style_bg_img_src(cont,
        &ui_img_hexagon_72dp_00e4f6_fill0_wght400_grad0_opsz48_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    /* default: grey */
    lv_obj_set_style_bg_img_recolor(cont, lv_color_hex(0x6C7080), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_img_recolor_opa(cont, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(cont, lv_color_hex(0x6C7080), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(cont, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    /* checked = currently selected (white) */
    lv_obj_set_style_bg_img_recolor(cont, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_CHECKED);
    lv_obj_set_style_bg_img_recolor_opa(cont, 255, LV_PART_MAIN | LV_STATE_CHECKED);
    lv_obj_set_style_text_color(cont, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_CHECKED);
    /* edited = has LEDs assigned (pink) */
    ui_object_set_themeable_style_property(cont, LV_PART_MAIN | LV_STATE_EDITED,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Pink____________);
    ui_object_set_themeable_style_property(cont, LV_PART_MAIN | LV_STATE_EDITED,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Pink____________);
    ui_object_set_themeable_style_property(cont, LV_PART_MAIN | LV_STATE_EDITED,
        LV_STYLE_TEXT_COLOR, _ui_theme_color_Pink____________);
    ui_object_set_themeable_style_property(cont, LV_PART_MAIN | LV_STATE_EDITED,
        LV_STYLE_TEXT_OPA, _ui_theme_alpha_Pink____________);

    /* Number label with click event */
    lv_obj_t *lbl = lv_label_create(cont);
    lv_obj_set_width(lbl, LV_SIZE_CONTENT);
    lv_obj_set_height(lbl, LV_SIZE_CONTENT);
    lv_obj_set_align(lbl, LV_ALIGN_CENTER);
    lv_label_set_long_mode(lbl, LV_LABEL_LONG_CLIP);
    char buf[4];
    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)locationNum);
    lv_label_set_text(lbl, buf);
    lv_obj_add_flag(lbl, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_clear_flag(lbl, LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
                      LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SCROLLABLE |
                      LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM |
                      LV_OBJ_FLAG_SCROLL_CHAIN);
    /* pass 1-based locationNum as user_data; selectLocationToMap subtracts 1 inside */
    lv_obj_add_event_cb(lbl, selectLocationToMap, LV_EVENT_CLICKED,
                        (void *)(uintptr_t)locationNum);
}

/* ── Build full content for a newly-added tab (shelves 2+) ─────────── */
static void _build_new_tab_content(lv_obj_t *tabContent, uint8_t shelfIdx)
{
    /* ── Tab content styles (mirrors ui_shelf1_tabContent) ── */
    lv_obj_clear_flag(tabContent,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE |
        LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC |
        LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);
    lv_obj_set_style_radius(tabContent, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(tabContent, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(tabContent, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_border_width(tabContent, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(tabContent, 5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(tabContent, 5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(tabContent, 5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(tabContent, 5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_event_cb(tabContent, ui_event_shelf1_tabContent, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelfIdx);

    /* ── Body container (flex column) ── */
    lv_obj_t *body = lv_obj_create(tabContent);
    lv_obj_remove_style_all(body);
    lv_obj_set_width(body, lv_pct(100));
    lv_obj_set_height(body, lv_pct(100));
    lv_obj_set_align(body, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(body, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(body, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(body, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_pad_all(body, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(body, 4, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(body, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ── Row 1: Inputs row (location count + LED count) ── */
    lv_obj_t *inputs = lv_obj_create(body);
    lv_obj_remove_style_all(inputs);
    lv_obj_set_width(inputs, lv_pct(100));
    lv_obj_set_height(inputs, lv_pct(20));
    lv_obj_set_align(inputs, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(inputs, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(inputs, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(inputs,
        LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC |
        LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);

    /* Location input sub-container */
    lv_obj_t *locInCont = lv_obj_create(inputs);
    lv_obj_set_width(locInCont, lv_pct(50));
    lv_obj_set_height(locInCont, lv_pct(92));
    lv_obj_set_align(locInCont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(locInCont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(locInCont, LV_FLEX_ALIGN_SPACE_BETWEEN, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(locInCont, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_width(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(locInCont, 5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(locInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *hexIcon = lv_img_create(locInCont);
    lv_img_set_src(hexIcon, &ui_img_hexagon_40dp_ffffff_fill0_wght400_grad0_opsz40_png);
    lv_obj_set_width(hexIcon, LV_SIZE_CONTENT);
    lv_obj_set_height(hexIcon, LV_SIZE_CONTENT);
    lv_obj_set_align(hexIcon, LV_ALIGN_CENTER);
    lv_obj_add_flag(hexIcon, LV_OBJ_FLAG_ADV_HITTEST);
    lv_obj_clear_flag(hexIcon, LV_OBJ_FLAG_SCROLLABLE);
    ui_object_set_themeable_style_property(hexIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(hexIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);

    lv_obj_t *locCountLbl = _create_updown_counter(locInCont,
        ui_event_addLocation_btn, ui_event_substractLocation_btn, "0");

    /* LED input sub-container */
    lv_obj_t *ledInCont = lv_obj_create(inputs);
    lv_obj_set_width(ledInCont, lv_pct(50));
    lv_obj_set_height(ledInCont, lv_pct(92));
    lv_obj_set_align(ledInCont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(ledInCont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(ledInCont, LV_FLEX_ALIGN_SPACE_BETWEEN, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(ledInCont, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_width(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(ledInCont, 5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(ledInCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *ledIcon = lv_img_create(ledInCont);
    lv_img_set_src(ledIcon, &ui_img_backlight_low_40dp_00e4f6_fill0_wght400_grad0_opsz40_png);
    lv_obj_set_width(ledIcon, LV_SIZE_CONTENT);
    lv_obj_set_height(ledIcon, LV_SIZE_CONTENT);
    lv_obj_set_align(ledIcon, LV_ALIGN_CENTER);
    lv_obj_add_flag(ledIcon, LV_OBJ_FLAG_ADV_HITTEST);
    lv_obj_clear_flag(ledIcon, LV_OBJ_FLAG_SCROLLABLE);
    ui_object_set_themeable_style_property(ledIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(ledIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);

    lv_obj_t *ledCountLbl = _create_updown_counter(ledInCont,
        ui_event_addLeds_btn, ui_event_substractLeds_btn, "0");

    /* ── Row 2: Location selector (scrollable hex row) ── */
    lv_obj_t *locSel = lv_obj_create(body);
    lv_obj_remove_style_all(locSel);
    lv_obj_set_width(locSel, lv_pct(100));
    lv_obj_set_height(locSel, lv_pct(30));
    lv_obj_set_align(locSel, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(locSel, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(locSel, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(locSel,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE | LV_OBJ_FLAG_GESTURE_BUBBLE);
    lv_obj_set_scroll_dir(locSel, LV_DIR_HOR);
    lv_obj_set_scroll_snap_x(locSel, LV_SCROLL_SNAP_CENTER);
    lv_obj_set_style_radius(locSel, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(locSel, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(locSel, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_border_width(locSel, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(locSel, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(locSel, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(locSel, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(locSel, &lv_font_montserrat_32, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ── Row 3: LED mapping bar (scrollable) ── */
    lv_obj_t *ledMap = lv_obj_create(body);
    lv_obj_remove_style_all(ledMap);
    lv_obj_set_width(ledMap, lv_pct(100));
    lv_obj_set_height(ledMap, lv_pct(30));
    lv_obj_set_align(ledMap, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(ledMap, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(ledMap, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(ledMap,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE | LV_OBJ_FLAG_GESTURE_BUBBLE);
    lv_obj_set_scroll_dir(ledMap, LV_DIR_HOR);
    lv_obj_set_scroll_snap_x(ledMap, LV_SCROLL_SNAP_START);
    lv_obj_set_style_radius(ledMap, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(ledMap, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(ledMap, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_border_width(ledMap, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(ledMap, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(ledMap, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ── Row 4: Action buttons ── */
    lv_obj_t *actions = lv_obj_create(body);
    lv_obj_remove_style_all(actions);
    lv_obj_set_width(actions, lv_pct(100));
    lv_obj_set_height(actions, lv_pct(20));
    lv_obj_set_align(actions, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(actions, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(actions, LV_FLEX_ALIGN_SPACE_BETWEEN, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(actions, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    /* Helper macro for the 3 action buttons */
#define _MAKE_ACTION_BTN(parent, label_text, cb)                                          \
    do {                                                                                  \
        lv_obj_t *_btn = lv_btn_create(parent);                                           \
        lv_obj_set_width(_btn, lv_pct(30));                                               \
        lv_obj_set_height(_btn, lv_pct(85));                                              \
        lv_obj_set_align(_btn, LV_ALIGN_CENTER);                                          \
        lv_obj_clear_flag(_btn,                                                           \
            LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |                       \
            LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE |                         \
            LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC |                        \
            LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);                     \
        lv_obj_set_style_radius(_btn, 4, LV_PART_MAIN | LV_STATE_DEFAULT);               \
        lv_obj_set_style_bg_color(_btn, lv_color_hex(0x531F71), LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_bg_opa(_btn, 100, LV_PART_MAIN | LV_STATE_DEFAULT);             \
        ui_object_set_themeable_style_property(_btn, LV_PART_MAIN | LV_STATE_DEFAULT,    \
            LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);                    \
        ui_object_set_themeable_style_property(_btn, LV_PART_MAIN | LV_STATE_DEFAULT,    \
            LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);                      \
        lv_obj_set_style_border_width(_btn, 2, LV_PART_MAIN | LV_STATE_DEFAULT);         \
        lv_obj_set_style_text_color(_btn, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_text_opa(_btn, 255, LV_PART_MAIN | LV_STATE_DEFAULT);           \
        lv_obj_set_style_text_font(_btn, &lv_font_montserrat_18, LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_t *_lbl = lv_label_create(_btn);                                           \
        lv_obj_set_width(_lbl, LV_SIZE_CONTENT);                                          \
        lv_obj_set_height(_lbl, LV_SIZE_CONTENT);                                         \
        lv_obj_set_align(_lbl, LV_ALIGN_CENTER);                                          \
        lv_label_set_long_mode(_lbl, LV_LABEL_LONG_CLIP);                                 \
        lv_label_set_text(_lbl, label_text);                                              \
        lv_obj_add_event_cb(_btn, cb, LV_EVENT_ALL, NULL);                                \
    } while (0)

    _MAKE_ACTION_BTN(actions, "AUTO",      ui_event_autoMapAction_btn);
    _MAKE_ACTION_BTN(actions, "TEST",      ui_event_testLedsAction_btn);
    _MAKE_ACTION_BTN(actions, "CLEAR ALL", ui_event_saveLedsLocationAction_btn2);
#undef _MAKE_ACTION_BTN

    /* ── Top overlay (LED mapping info) ── */
    lv_obj_t *ov = lv_obj_create(tabContent);
    lv_obj_set_height(ov, 61);
    lv_obj_set_width(ov, lv_pct(100));
    lv_obj_set_align(ov, LV_ALIGN_TOP_MID);
    lv_obj_set_flex_flow(ov, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(ov, LV_FLEX_ALIGN_SPACE_BETWEEN, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_add_flag(ov, LV_OBJ_FLAG_HIDDEN);
    lv_obj_clear_flag(ov,
        LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE | LV_OBJ_FLAG_SCROLLABLE |
        LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);
    lv_obj_set_style_bg_color(ov, lv_color_hex(0x101629), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(ov, 240, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(ov, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(ov, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(ov, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Container6 inside top overlay: [startLed | counter | endLed] */
    lv_obj_t *c6 = lv_obj_create(ov);
    lv_obj_remove_style_all(c6);
    lv_obj_set_height(c6, 53);
    lv_obj_set_width(c6, lv_pct(103));
    lv_obj_set_align(c6, LV_ALIGN_TOP_MID);
    lv_obj_set_flex_flow(c6, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(c6, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_START);
    lv_obj_clear_flag(c6, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_text_align(c6, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(c6, &lv_font_montserrat_42, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *startLbl = lv_label_create(c6);
    lv_obj_set_width(startLbl, 72);
    lv_obj_set_height(startLbl, LV_SIZE_CONTENT);
    lv_obj_set_x(startLbl, 0);
    lv_obj_set_y(startLbl, 10);
    lv_obj_set_align(startLbl, LV_ALIGN_CENTER);
    lv_label_set_text(startLbl, "\xe2\x80\x94");  /* em dash = unset */
    ui_object_set_themeable_style_property(startLbl, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_TEXT_COLOR, _ui_theme_color_Pink____________);
    ui_object_set_themeable_style_property(startLbl, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_TEXT_OPA, _ui_theme_alpha_Pink____________);
    lv_obj_set_style_text_letter_space(startLbl, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_line_space(startLbl, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *c8 = lv_obj_create(c6);
    lv_obj_remove_style_all(c8);
    lv_obj_set_width(c8, 219);
    lv_obj_set_height(c8, 60);
    lv_obj_set_align(c8, LV_ALIGN_CENTER);
    lv_obj_clear_flag(c8, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t *sectionCountLbl = _create_updown_counter(c8,
        ui_event_addLedsToLocation_btn, ui_event_removeLedsToLocation_btn, "1");

    lv_obj_t *endLbl = lv_label_create(c6);
    lv_obj_set_width(endLbl, 72);
    lv_obj_set_height(endLbl, LV_SIZE_CONTENT);
    lv_obj_set_align(endLbl, LV_ALIGN_CENTER);
    lv_label_set_text(endLbl, "\xe2\x80\x94");
    lv_obj_set_style_text_color(endLbl, lv_color_hex(0xF6972E), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(endLbl, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_letter_space(endLbl, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_line_space(endLbl, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ── Bottom overlay (action buttons) ── */
    lv_obj_t *aov = lv_obj_create(tabContent);
    lv_obj_remove_style_all(aov);
    lv_obj_set_width(aov, lv_pct(100));
    lv_obj_set_height(aov, lv_pct(18));
    lv_obj_set_align(aov, LV_ALIGN_BOTTOM_MID);
    lv_obj_set_flex_flow(aov, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(aov, LV_FLEX_ALIGN_SPACE_BETWEEN, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_add_flag(aov, LV_OBJ_FLAG_HIDDEN);
    lv_obj_clear_flag(aov,
        LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_color(aov, lv_color_hex(0x000000), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(aov, 255, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Close button (needs special handler to hide both overlays) */
    lv_obj_t *closeBtn = lv_btn_create(aov);
    lv_obj_set_width(closeBtn, lv_pct(48));
    lv_obj_set_height(closeBtn, lv_pct(90));
    lv_obj_set_align(closeBtn, LV_ALIGN_CENTER);
    lv_obj_clear_flag(closeBtn,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE |
        LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC |
        LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);
    lv_obj_set_style_radius(closeBtn, 4, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_color(closeBtn, lv_color_hex(0x531F71), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(closeBtn, 100, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(closeBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(closeBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(closeBtn, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(closeBtn, &lv_font_montserrat_18, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *closeTxt = lv_label_create(closeBtn);
    lv_obj_set_width(closeTxt, 40);
    lv_obj_set_height(closeTxt, 40);
    lv_obj_set_align(closeTxt, LV_ALIGN_CENTER);
    lv_label_set_long_mode(closeTxt, LV_LABEL_LONG_CLIP);
    lv_label_set_text(closeTxt, "");
    lv_obj_set_style_bg_img_src(closeTxt,
        &ui_img_close_40dp_ea33f7_fill0_wght400_grad0_opsz40_png, LV_PART_MAIN | LV_STATE_DEFAULT);
    /* user_data pointer must be valid at click time; ui_shelf_tabs[shelfIdx] is static */
    lv_obj_add_event_cb(closeBtn, _on_close_btn, LV_EVENT_ALL, &ui_shelf_tabs[shelfIdx]);

    /* Clear location button */
    lv_obj_t *clearBtn = lv_btn_create(aov);
    lv_obj_set_width(clearBtn, lv_pct(48));
    lv_obj_set_height(clearBtn, lv_pct(90));
    lv_obj_set_align(clearBtn, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(clearBtn, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(clearBtn, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(clearBtn,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE |
        LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC |
        LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);
    lv_obj_set_style_radius(clearBtn, 4, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_color(clearBtn, lv_color_hex(0x531F71), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(clearBtn, 100, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(clearBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(clearBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(clearBtn, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(clearBtn, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(clearBtn, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(clearBtn, &lv_font_montserrat_18, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *clearTxt = lv_label_create(clearBtn);
    lv_obj_set_width(clearTxt, LV_SIZE_CONTENT);
    lv_obj_set_height(clearTxt, LV_SIZE_CONTENT);
    lv_obj_set_align(clearTxt, LV_ALIGN_CENTER);
    lv_label_set_long_mode(clearTxt, LV_LABEL_LONG_CLIP);
    lv_label_set_text(clearTxt, "CLEAR");
    lv_obj_add_event_cb(clearBtn, ui_event_clearLedsLocationAction_btn, LV_EVENT_ALL, NULL);

    /* ── Store references in the tab struct ── */
    ui_shelf_tabs[shelfIdx].locationSelectorCont  = locSel;
    ui_shelf_tabs[shelfIdx].locationCountLabel    = locCountLbl;
    ui_shelf_tabs[shelfIdx].ledMappingCont        = ledMap;
    ui_shelf_tabs[shelfIdx].ledCountLabel         = ledCountLbl;
    ui_shelf_tabs[shelfIdx].overlay               = ov;
    ui_shelf_tabs[shelfIdx].actionsOverlay        = aov;
    ui_shelf_tabs[shelfIdx].overlayStartLed_label = startLbl;
    ui_shelf_tabs[shelfIdx].overlayTotalLedsValue = sectionCountLbl;
    ui_shelf_tabs[shelfIdx].overlayEndLed_label   = endLbl;
    ui_shelf_tabs[shelfIdx].testBtn               = lv_obj_get_child(actions, 1); /* TEST is 2nd */
}

/* ── Public API ───────────────────────────────────────────────────── */

void ui_shelves_screen_rebuild(uint8_t shelfCount,
                                const uint16_t *leds, const uint8_t *locs)
{
    if (!ui_shelves_tabView || shelfCount == 0) return;

    uint8_t prevCount = ui_shelf_tab_count;

    for (uint8_t i = 0; i < shelfCount; i++) {
        if (i == 0 && prevCount == 0) {
            /* First call: claim the SquareLine-generated tab 0 globals */
            ui_shelf_tabs[0].locationSelectorCont  = ui_shelfLocationSelector_container;
            ui_shelf_tabs[0].locationCountLabel    = ui_locationInShef_label;
            ui_shelf_tabs[0].ledMappingCont        = ui_shelfLedMapping_container;
            ui_shelf_tabs[0].ledCountLabel         = ui_ledsInShef_label;
            ui_shelf_tabs[0].overlay               = ui_shelfLedMapping_containerOverly;
            ui_shelf_tabs[0].actionsOverlay        = ui_ledsSectionActions_containerOverlay;
            ui_shelf_tabs[0].overlayStartLed_label = ui_startLed_label;
            ui_shelf_tabs[0].overlayTotalLedsValue = ui_ledsInSection_inputValue;
            ui_shelf_tabs[0].overlayEndLed_label   = ui_endLed_label;
            ui_shelf_tabs[0].testBtn               = ui_testLedsAction_btn;
        } else if (i >= prevCount) {
            /* New shelf: add a tab and build its full content */
            char name[4];
            lv_snprintf(name, sizeof(name), "%u", (unsigned)(i + 1));
            lv_obj_t *tc = lv_tabview_add_tab(ui_shelves_tabView, name);
            _build_new_tab_content(tc, i);
        }
        /* Always repopulate the dynamic lists */
        ui_shelf_tab_set_location_count(&ui_shelf_tabs[i], locs[i]);
        ui_shelf_tab_set_led_count(&ui_shelf_tabs[i], leds[i]);
    }

    ui_shelf_tab_count = shelfCount;
}

void ui_shelf_tab_set_location_count(ui_shelf_tab_t *tab, uint8_t count)
{
    if (!tab || !tab->locationSelectorCont) return;

    if (tab->locationCountLabel) {
        char buf[8];
        lv_snprintf(buf, sizeof(buf), "%u", (unsigned)count);
        lv_label_set_text(tab->locationCountLabel, buf);
    }

    lv_obj_clean(tab->locationSelectorCont);
    for (uint8_t i = 0; i < count; i++)
        _create_location_item(tab->locationSelectorCont, (uint8_t)(i + 1u));
}

void ui_shelf_tab_set_led_count(ui_shelf_tab_t *tab, uint16_t count)
{
    if (!tab || !tab->ledMappingCont) return;

    if (tab->ledCountLabel) {
        char buf[8];
        lv_snprintf(buf, sizeof(buf), "%u", (unsigned)count);
        lv_label_set_text(tab->ledCountLabel, buf);
    }

    lv_obj_clean(tab->ledMappingCont);
    for (uint16_t i = 0; i < count; i++)
        ui_led_item_create(tab->ledMappingCont, (uint16_t)(i + 1u));
}
