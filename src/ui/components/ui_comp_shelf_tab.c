#include "ui_comp_shelf_tab.h"
#include "../ui.h"
#include "../ui_events.h"
#include "../events/ShelvesEvents.h"

/* ── Helpers ─────────────────────────────────────────────────────────── */

static void on_led_bar_click(lv_event_t *e)
{
    lv_obj_t *bar  = lv_event_get_target(e);
    lv_obj_t *item = lv_obj_get_parent(bar);
    /* 0-based item index → 1-based LED number */
    uint16_t ledIndex = (uint16_t)(lv_obj_get_index(item) + 1u);
    shelves_on_led_selected(ledIndex);
}

static void on_overlay_close(lv_event_t *e)
{
    if (lv_event_get_code(e) != LV_EVENT_CLICKED) return;
    cancelMapLeds(e);
    lv_obj_add_flag((lv_obj_t *)lv_event_get_user_data(e), LV_OBJ_FLAG_HIDDEN);
}

/** Create one hex position item inside the location-selector row. */
static void create_location_item(lv_obj_t *parent, uint8_t location_num)
{
    lv_obj_t *item = lv_label_create(parent);
    lv_obj_set_width(item,  lv_pct(20));
    lv_obj_set_height(item, lv_pct(100));
    lv_obj_set_x(item, -87);
    lv_obj_set_y(item, -14);
    lv_obj_set_align(item, LV_ALIGN_CENTER);
    lv_label_set_long_mode(item, LV_LABEL_LONG_CLIP);

    char buf[4];
    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)location_num);
    lv_label_set_text(item, buf);

    lv_obj_clear_flag(item,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SCROLLABLE |
        LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM |
        LV_OBJ_FLAG_SCROLL_CHAIN);
    lv_obj_add_flag(item, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(item, selectLocationToMap, LV_EVENT_ALL,
                        (void *)(uintptr_t)location_num);

    lv_obj_set_style_bg_img_src(item,
        &ui_img_hexagon_72dp_00e4f6_fill0_wght400_grad0_opsz48_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_img_opa(item, 150, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_img_recolor(item, lv_color_hex(0xB962EC),
                                    LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_img_recolor_opa(item, 255,
                                        LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(item,   0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(item,  0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(item,   12, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(item, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Focused state (selected location) */
    ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_FOCUSED,
        LV_STYLE_TEXT_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_FOCUSED,
        LV_STYLE_TEXT_OPA,   _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_text_align(item, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_FOCUSED);
    lv_obj_set_style_bg_img_opa(item, 255, LV_PART_MAIN | LV_STATE_FOCUSED);
    ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_FOCUSED,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(item, LV_PART_MAIN | LV_STATE_FOCUSED,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_pad_top(item, 12, LV_PART_MAIN | LV_STATE_FOCUSED);
}

/* ── Public ──────────────────────────────────────────────────────────── */

ui_shelf_tab_t ui_shelf_tab_create(lv_obj_t *tabview,
                                   uint8_t   shelf_index,
                                   uint16_t  led_count,
                                   uint8_t   location_count)
{
    ui_shelf_tab_t tab = {0};

    /* ─── Tab label ────────────────────────────────────────────── */
    char tab_label[4];
    lv_snprintf(tab_label, sizeof(tab_label), "%u",
                (unsigned)(shelf_index + 1));

    /* ─── Tab content ──────────────────────────────────────────── */
    lv_obj_t *tabContent = lv_tabview_add_tab(tabview, tab_label);
    tab.tabContent = tabContent;

    lv_obj_clear_flag(tabContent,
        LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK |
        LV_OBJ_FLAG_CLICK_FOCUSABLE | LV_OBJ_FLAG_GESTURE_BUBBLE |
        LV_OBJ_FLAG_SNAPPABLE | LV_OBJ_FLAG_SCROLLABLE |
        LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM |
        LV_OBJ_FLAG_SCROLL_CHAIN);

    lv_obj_set_style_radius(tabContent, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(tabContent,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(tabContent,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_border_width(tabContent, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(tabContent,   5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(tabContent,  5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(tabContent,    5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(tabContent, 5, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ─── Tab body (flex column filling the tab) ───────────────── */
    lv_obj_t *tabBody = lv_obj_create(tabContent);
    lv_obj_remove_style_all(tabBody);
    lv_obj_set_width(tabBody,  lv_pct(100));
    lv_obj_set_height(tabBody, lv_pct(100));
    lv_obj_set_align(tabBody, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(tabBody, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(tabBody, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(tabBody, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_pad_left(tabBody,   0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(tabBody,  0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(tabBody,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(tabBody, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(tabBody,    4, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(tabBody, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ═══════════════════════════════════════════════════════════════
       ROW 1 – Shelf inputs  (20 % height)
       ═══════════════════════════════════════════════════════════════ */
    lv_obj_t *inputsRow = lv_obj_create(tabBody);
    lv_obj_remove_style_all(inputsRow);
    lv_obj_set_width(inputsRow,  lv_pct(100));
    lv_obj_set_height(inputsRow, lv_pct(20));
    lv_obj_set_align(inputsRow, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(inputsRow, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(inputsRow, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(inputsRow,
        LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK |
        LV_OBJ_FLAG_CLICK_FOCUSABLE | LV_OBJ_FLAG_SCROLLABLE |
        LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM |
        LV_OBJ_FLAG_SCROLL_CHAIN);

    /* ── Locations up/down ── */
    lv_obj_t *locInputCont = lv_obj_create(inputsRow);
    lv_obj_set_width(locInputCont,  lv_pct(50));
    lv_obj_set_height(locInputCont, lv_pct(92));
    lv_obj_set_align(locInputCont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(locInputCont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(locInputCont, LV_FLEX_ALIGN_SPACE_BETWEEN,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(locInputCont, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(locInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(locInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_width(locInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(locInputCont,   0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(locInputCont,  5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(locInputCont,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(locInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(locInputCont,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(locInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *hexIcon = lv_img_create(locInputCont);
    lv_img_set_src(hexIcon,
        &ui_img_hexagon_40dp_ffffff_fill0_wght400_grad0_opsz40_png);
    lv_obj_set_width(hexIcon,  LV_SIZE_CONTENT);
    lv_obj_set_height(hexIcon, LV_SIZE_CONTENT);
    lv_obj_set_align(hexIcon, LV_ALIGN_CENTER);
    lv_obj_add_flag(hexIcon, LV_OBJ_FLAG_ADV_HITTEST);
    lv_obj_clear_flag(hexIcon, LV_OBJ_FLAG_SCROLLABLE);
    ui_object_set_themeable_style_property(hexIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(hexIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);

    lv_obj_t *locUpDown = lv_obj_create(locInputCont);
    lv_obj_remove_style_all(locUpDown);
    lv_obj_set_width(locUpDown,  lv_pct(75));
    lv_obj_set_height(locUpDown, lv_pct(85));
    lv_obj_set_align(locUpDown, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(locUpDown, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(locUpDown, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(locUpDown, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(locUpDown, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(locUpDown, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(locUpDown, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(locUpDown, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(locUpDown, lv_color_hex(0xFFFFFF),
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(locUpDown, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(locUpDown, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(locUpDown, &lv_font_montserrat_32,
                               LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *addLocBtn = lv_label_create(locUpDown);
    lv_obj_set_width(addLocBtn,  lv_pct(25));
    lv_obj_set_height(addLocBtn, lv_pct(100));
    lv_obj_set_align(addLocBtn, LV_ALIGN_CENTER);
    lv_label_set_text(addLocBtn, "");
    lv_obj_set_style_bg_img_src(addLocBtn,
        &ui_img_add_32dp_ffffff_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(addLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(addLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(addLocBtn, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(addLocBtn, LV_BORDER_SIDE_RIGHT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_flag(addLocBtn, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(addLocBtn, addLoactionToShelf, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    tab.locationInShef_label = lv_label_create(locUpDown);
    lv_obj_set_width(tab.locationInShef_label,  lv_pct(50));
    lv_obj_set_height(tab.locationInShef_label, lv_pct(100));
    lv_obj_set_align(tab.locationInShef_label, LV_ALIGN_CENTER);
    {
        char buf[8];
        lv_snprintf(buf, sizeof(buf), "%u", (unsigned)location_count);
        lv_label_set_text(tab.locationInShef_label, buf);
    }

    lv_obj_t *subLocBtn = lv_label_create(locUpDown);
    lv_obj_set_width(subLocBtn,  lv_pct(25));
    lv_obj_set_height(subLocBtn, lv_pct(100));
    lv_obj_set_align(subLocBtn, LV_ALIGN_CENTER);
    lv_label_set_text(subLocBtn, "");
    lv_obj_set_style_bg_img_src(subLocBtn,
        &ui_img_remove_32dp_ffffff_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(subLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(subLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(subLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(subLocBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(subLocBtn, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(subLocBtn, LV_BORDER_SIDE_LEFT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_flag(subLocBtn, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(subLocBtn, substractLocationFromShelf, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    /* ── LEDs up/down ── */
    lv_obj_t *ledsInputCont = lv_obj_create(inputsRow);
    lv_obj_set_width(ledsInputCont,  lv_pct(50));
    lv_obj_set_height(ledsInputCont, lv_pct(92));
    lv_obj_set_align(ledsInputCont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(ledsInputCont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(ledsInputCont, LV_FLEX_ALIGN_SPACE_BETWEEN,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(ledsInputCont, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(ledsInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(ledsInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_width(ledsInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_left(ledsInputCont,   5, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(ledsInputCont,  0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(ledsInputCont,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(ledsInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(ledsInputCont,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(ledsInputCont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *ledIcon = lv_img_create(ledsInputCont);
    lv_img_set_src(ledIcon,
        &ui_img_backlight_low_40dp_00e4f6_fill0_wght400_grad0_opsz40_png);
    lv_obj_set_width(ledIcon,  LV_SIZE_CONTENT);
    lv_obj_set_height(ledIcon, LV_SIZE_CONTENT);
    lv_obj_set_align(ledIcon, LV_ALIGN_CENTER);
    lv_obj_add_flag(ledIcon, LV_OBJ_FLAG_ADV_HITTEST);
    lv_obj_clear_flag(ledIcon, LV_OBJ_FLAG_SCROLLABLE);
    ui_object_set_themeable_style_property(ledIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(ledIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);

    lv_obj_t *ledsUpDown = lv_obj_create(ledsInputCont);
    lv_obj_remove_style_all(ledsUpDown);
    lv_obj_set_width(ledsUpDown,  lv_pct(75));
    lv_obj_set_height(ledsUpDown, lv_pct(85));
    lv_obj_set_align(ledsUpDown, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(ledsUpDown, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(ledsUpDown, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(ledsUpDown, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(ledsUpDown, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(ledsUpDown, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(ledsUpDown, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(ledsUpDown, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(ledsUpDown, lv_color_hex(0xFFFFFF),
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(ledsUpDown, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(ledsUpDown, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(ledsUpDown, &lv_font_montserrat_32,
                               LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *addLedsBtn = lv_label_create(ledsUpDown);
    lv_obj_set_width(addLedsBtn,  lv_pct(25));
    lv_obj_set_height(addLedsBtn, lv_pct(100));
    lv_obj_set_align(addLedsBtn, LV_ALIGN_CENTER);
    lv_label_set_text(addLedsBtn, "");
    lv_obj_set_style_bg_img_src(addLedsBtn,
        &ui_img_add_32dp_ffffff_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(addLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(addLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(addLedsBtn, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(addLedsBtn, LV_BORDER_SIDE_RIGHT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_flag(addLedsBtn, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(addLedsBtn, addLedsToShelf, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    tab.ledsInShef_label = lv_label_create(ledsUpDown);
    lv_obj_set_width(tab.ledsInShef_label,  lv_pct(50));
    lv_obj_set_height(tab.ledsInShef_label, lv_pct(100));
    lv_obj_set_align(tab.ledsInShef_label, LV_ALIGN_CENTER);
    {
        char buf[8];
        lv_snprintf(buf, sizeof(buf), "%u", (unsigned)led_count);
        lv_label_set_text(tab.ledsInShef_label, buf);
    }

    lv_obj_t *subLedsBtn = lv_label_create(ledsUpDown);
    lv_obj_set_width(subLedsBtn,  lv_pct(25));
    lv_obj_set_height(subLedsBtn, lv_pct(100));
    lv_obj_set_align(subLedsBtn, LV_ALIGN_CENTER);
    lv_label_set_text(subLedsBtn, "");
    lv_obj_set_style_bg_img_src(subLedsBtn,
        &ui_img_remove_32dp_ffffff_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(subLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(subLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(subLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(subLedsBtn, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(subLedsBtn, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(subLedsBtn, LV_BORDER_SIDE_LEFT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_flag(subLedsBtn, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(subLedsBtn, substractLedsFromShelf, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    /* ═══════════════════════════════════════════════════════════════
       ROW 2 – Location selector  (30 % height)
       ═══════════════════════════════════════════════════════════════ */
    lv_obj_t *locSel = lv_obj_create(tabBody);
    tab.locationSelectorCont = locSel;
    lv_obj_remove_style_all(locSel);
    lv_obj_set_width(locSel,  lv_pct(100));
    lv_obj_set_height(locSel, lv_pct(30));
    lv_obj_set_align(locSel, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(locSel, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(locSel, LV_FLEX_ALIGN_START,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(locSel,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE);
    lv_obj_set_scrollbar_mode(locSel, LV_SCROLLBAR_MODE_ACTIVE);
    lv_obj_set_scroll_dir(locSel, LV_DIR_HOR);
    lv_obj_set_scroll_snap_x(locSel, LV_SCROLL_SNAP_CENTER);
    lv_obj_set_style_radius(locSel, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(locSel, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(locSel, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_border_width(locSel, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(locSel, lv_color_hex(0xFFFFFF),
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(locSel, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(locSel, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(locSel, &lv_font_montserrat_32,
                               LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Populate location hex items */
    for (uint8_t i = 0; i < location_count; i++) {
        create_location_item(locSel, (uint8_t)(i + 1));
    }
    /* Focus first item */
    if (location_count > 0) {
        lv_obj_t *first = lv_obj_get_child(locSel, 0);
        lv_obj_add_state(first, LV_STATE_FOCUSED);
        /* Override default purple tint with cyan for the selected item */
        lv_obj_set_style_bg_img_opa(first, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
        ui_object_set_themeable_style_property(first,
            LV_PART_MAIN | LV_STATE_DEFAULT,
            LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Cyan____________);
        ui_object_set_themeable_style_property(first,
            LV_PART_MAIN | LV_STATE_DEFAULT,
            LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Cyan____________);
    }

    /* ═══════════════════════════════════════════════════════════════
       ROW 3 – LED mapping bar  (30 % height)
       ═══════════════════════════════════════════════════════════════ */
    lv_obj_t *ledMap = lv_obj_create(tabBody);
    tab.ledMappingCont = ledMap;
    lv_obj_remove_style_all(ledMap);
    lv_obj_set_width(ledMap,  lv_pct(100));
    lv_obj_set_height(ledMap, lv_pct(30));
    lv_obj_set_align(ledMap, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(ledMap, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(ledMap, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(ledMap,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE);
    lv_obj_set_scroll_dir(ledMap, LV_DIR_HOR);
    lv_obj_set_scroll_snap_x(ledMap, LV_SCROLL_SNAP_START);
    lv_obj_set_style_radius(ledMap, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(ledMap, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Cyan____________);
    ui_object_set_themeable_style_property(ledMap, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Cyan____________);
    lv_obj_set_style_border_width(ledMap, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(ledMap,    0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(ledMap, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Populate LED items — all start as UNASSIGNED */
    for (uint16_t i = 0; i < led_count; i++) {
        ui_led_item_create(ledMap, (uint16_t)(i + 1));
    }

    /* ═══════════════════════════════════════════════════════════════
       ROW 4 – Action buttons  (20 % height)
       ═══════════════════════════════════════════════════════════════ */
    lv_obj_t *actionsRow = lv_obj_create(tabBody);
    lv_obj_remove_style_all(actionsRow);
    lv_obj_set_width(actionsRow,  lv_pct(100));
    lv_obj_set_height(actionsRow, lv_pct(20));
    lv_obj_set_align(actionsRow, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(actionsRow, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(actionsRow, LV_FLEX_ALIGN_SPACE_BETWEEN,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(actionsRow, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    /* ── Shared button style helper ── */
    #define STYLE_ACTION_BTN(btn)  \
        lv_obj_set_width(btn, lv_pct(30));  \
        lv_obj_set_height(btn, lv_pct(85)); \
        lv_obj_set_align(btn, LV_ALIGN_CENTER); \
        lv_obj_clear_flag(btn, \
            LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE | \
            LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE | \
            LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC | \
            LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN); \
        lv_obj_set_style_radius(btn, 4, LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x531F71), LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_bg_opa(btn, 100, LV_PART_MAIN | LV_STATE_DEFAULT); \
        ui_object_set_themeable_style_property(btn, LV_PART_MAIN | LV_STATE_DEFAULT, \
            LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________); \
        ui_object_set_themeable_style_property(btn, LV_PART_MAIN | LV_STATE_DEFAULT, \
            LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________); \
        lv_obj_set_style_border_width(btn, 2, LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_text_color(btn, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_text_opa(btn, 255, LV_PART_MAIN | LV_STATE_DEFAULT); \
        lv_obj_set_style_text_font(btn, &lv_font_montserrat_18, LV_PART_MAIN | LV_STATE_DEFAULT)

    /* AUTO MAP */
    tab.autoMapBtn = lv_btn_create(actionsRow);
    STYLE_ACTION_BTN(tab.autoMapBtn);
    lv_obj_t *autoMapText = lv_label_create(tab.autoMapBtn);
    lv_obj_set_width(autoMapText,  LV_SIZE_CONTENT);
    lv_obj_set_height(autoMapText, LV_SIZE_CONTENT);
    lv_obj_set_align(autoMapText, LV_ALIGN_CENTER);
    lv_label_set_long_mode(autoMapText, LV_LABEL_LONG_CLIP);
    lv_label_set_text(autoMapText, "AUTO MAP");
    lv_obj_add_event_cb(tab.autoMapBtn, ui_event_autoMapAction_btn, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    /* TEST LEDS */
    tab.testLedsBtn = lv_btn_create(actionsRow);
    STYLE_ACTION_BTN(tab.testLedsBtn);
    lv_obj_t *testLedsText = lv_label_create(tab.testLedsBtn);
    lv_obj_set_width(testLedsText,  LV_SIZE_CONTENT);
    lv_obj_set_height(testLedsText, LV_SIZE_CONTENT);
    lv_obj_set_align(testLedsText, LV_ALIGN_CENTER);
    lv_label_set_long_mode(testLedsText, LV_LABEL_LONG_CLIP);
    lv_label_set_text(testLedsText, "TEST LEDS");
    lv_obj_add_event_cb(tab.testLedsBtn, ui_event_testLedsAction_btn, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    /* SAVE */
    tab.saveBtn = lv_btn_create(actionsRow);
    STYLE_ACTION_BTN(tab.saveBtn);
    lv_obj_set_flex_flow(tab.saveBtn, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(tab.saveBtn, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_t *saveIcon = lv_img_create(tab.saveBtn);
    lv_img_set_src(saveIcon, &ui_img_save_36dp_e3e3e3_fill0_wght400_grad0_opsz40_png);
    lv_obj_set_width(saveIcon,  LV_SIZE_CONTENT);
    lv_obj_set_height(saveIcon, LV_SIZE_CONTENT);
    lv_obj_set_align(saveIcon, LV_ALIGN_CENTER);
    lv_obj_clear_flag(saveIcon,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE |
        LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC |
        LV_OBJ_FLAG_SCROLL_MOMENTUM | LV_OBJ_FLAG_SCROLL_CHAIN);
    ui_object_set_themeable_style_property(saveIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(saveIcon, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_t *saveText = lv_label_create(tab.saveBtn);
    lv_obj_set_width(saveText,  LV_SIZE_CONTENT);
    lv_obj_set_height(saveText, LV_SIZE_CONTENT);
    lv_obj_set_align(saveText, LV_ALIGN_CENTER);
    lv_label_set_long_mode(saveText, LV_LABEL_LONG_CLIP);
    lv_label_set_text(saveText, "CLEAR ALL");
    lv_obj_add_event_cb(tab.saveBtn, ui_event_saveLedsLocationAction_btn2, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    #undef STYLE_ACTION_BTN

    /* ═══════════════════════════════════════════════════════════════
       OVERLAY – hidden start/end LED selection panel
       (absolute child of tabContent, not the flex body)
       ═══════════════════════════════════════════════════════════════ */
    lv_obj_t *overlay = lv_obj_create(tabContent);
    tab.overlay = overlay;
    lv_obj_set_height(overlay, 180);
    lv_obj_set_width(overlay,  lv_pct(100));
    lv_obj_set_align(overlay, LV_ALIGN_TOP_MID);
    lv_obj_set_flex_flow(overlay, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(overlay, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_add_flag(overlay, LV_OBJ_FLAG_HIDDEN);
    lv_obj_clear_flag(overlay,
        LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_PRESS_LOCK |
        LV_OBJ_FLAG_CLICK_FOCUSABLE | LV_OBJ_FLAG_GESTURE_BUBBLE |
        LV_OBJ_FLAG_SNAPPABLE | LV_OBJ_FLAG_SCROLLABLE |
        LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM |
        LV_OBJ_FLAG_SCROLL_CHAIN);
    lv_obj_set_style_bg_color(overlay, lv_color_hex(0x101629),
                              LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(overlay, 240, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(overlay, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(overlay, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(overlay, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *selectStartText = lv_label_create(overlay);
    lv_obj_set_width(selectStartText,  LV_SIZE_CONTENT);
    lv_obj_set_height(selectStartText, LV_SIZE_CONTENT);
    lv_obj_set_align(selectStartText, LV_ALIGN_TOP_MID);
    lv_label_set_text(selectStartText, "SELECT START");
    ui_object_set_themeable_style_property(selectStartText,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_TEXT_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(selectStartText,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_TEXT_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_text_letter_space(selectStartText, 2,
                                       LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(selectStartText, &lv_font_montserrat_24,
                               LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *overlayBottomRow = lv_obj_create(overlay);
    lv_obj_remove_style_all(overlayBottomRow);
    lv_obj_set_height(overlayBottomRow, 60);
    lv_obj_set_width(overlayBottomRow,  lv_pct(100));
    lv_obj_set_align(overlayBottomRow, LV_ALIGN_BOTTOM_MID);
    lv_obj_set_flex_flow(overlayBottomRow, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(overlayBottomRow, LV_FLEX_ALIGN_SPACE_BETWEEN,
                          LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_clear_flag(overlayBottomRow, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_text_align(overlayBottomRow, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(overlayBottomRow, &lv_font_montserrat_42,
                               LV_PART_MAIN | LV_STATE_DEFAULT);

    tab.overlayStartLed_label = lv_label_create(overlayBottomRow);
    lv_obj_set_width(tab.overlayStartLed_label,  72);
    lv_obj_set_height(tab.overlayStartLed_label, LV_SIZE_CONTENT);
    lv_obj_set_align(tab.overlayStartLed_label, LV_ALIGN_CENTER);
    lv_label_set_text(tab.overlayStartLed_label, "—");
    ui_object_set_themeable_style_property(tab.overlayStartLed_label,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_TEXT_COLOR, _ui_theme_color_Pink____________);
    ui_object_set_themeable_style_property(tab.overlayStartLed_label,
        LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_TEXT_OPA, _ui_theme_alpha_Pink____________);
    lv_obj_set_style_text_letter_space(tab.overlayStartLed_label, 2,
                                       LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Centre column: count stepper + arrow indicator */
    lv_obj_t *centreCont = lv_obj_create(overlayBottomRow);
    lv_obj_remove_style_all(centreCont);
    lv_obj_set_width(centreCont,  219);
    lv_obj_set_height(centreCont, 86);
    lv_obj_set_align(centreCont, LV_ALIGN_CENTER);
    lv_obj_clear_flag(centreCont, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t *countUpDown = lv_obj_create(centreCont);
    lv_obj_remove_style_all(countUpDown);
    lv_obj_set_width(countUpDown,  lv_pct(75));
    lv_obj_set_height(countUpDown, lv_pct(47));
    lv_obj_set_align(countUpDown, LV_ALIGN_TOP_MID);
    lv_obj_set_flex_flow(countUpDown, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(countUpDown, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(countUpDown, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(countUpDown, 8, LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(countUpDown, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(countUpDown, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(countUpDown, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_color(countUpDown, lv_color_hex(0xFFFFFF),
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(countUpDown, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_align(countUpDown, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(countUpDown, &lv_font_montserrat_32,
                               LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_t *addLedsToLoc = lv_label_create(countUpDown);
    lv_obj_set_width(addLedsToLoc,  lv_pct(25));
    lv_obj_set_height(addLedsToLoc, lv_pct(100));
    lv_obj_set_align(addLedsToLoc, LV_ALIGN_CENTER);
    lv_label_set_text(addLedsToLoc, "");
    lv_obj_set_style_bg_img_src(addLedsToLoc,
        &ui_img_add_32dp_ffffff_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(addLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(addLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(addLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(addLedsToLoc, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(addLedsToLoc, LV_BORDER_SIDE_RIGHT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_flag(addLedsToLoc, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(addLedsToLoc, addLedsToSection, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    tab.overlayTotalLedsValue = lv_label_create(countUpDown);
    lv_obj_set_width(tab.overlayTotalLedsValue,  lv_pct(50));
    lv_obj_set_height(tab.overlayTotalLedsValue, lv_pct(100));
    lv_obj_set_align(tab.overlayTotalLedsValue, LV_ALIGN_CENTER);
    lv_label_set_text(tab.overlayTotalLedsValue, "1");

    lv_obj_t *removeLedsToLoc = lv_label_create(countUpDown);
    lv_obj_set_width(removeLedsToLoc,  lv_pct(25));
    lv_obj_set_height(removeLedsToLoc, lv_pct(100));
    lv_obj_set_align(removeLedsToLoc, LV_ALIGN_CENTER);
    lv_label_set_text(removeLedsToLoc, "");
    lv_obj_set_style_bg_img_src(removeLedsToLoc,
        &ui_img_remove_32dp_ffffff_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    ui_object_set_themeable_style_property(removeLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(removeLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Purple__________);
    ui_object_set_themeable_style_property(removeLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_COLOR, _ui_theme_color_Purple__________);
    ui_object_set_themeable_style_property(removeLedsToLoc, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_BORDER_OPA, _ui_theme_alpha_Purple__________);
    lv_obj_set_style_border_width(removeLedsToLoc, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_side(removeLedsToLoc, LV_BORDER_SIDE_LEFT,
                                 LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_flag(removeLedsToLoc, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(removeLedsToLoc, substractLedsToSection, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    lv_obj_t *startIndicator = lv_img_create(centreCont);
    lv_img_set_src(startIndicator,
        &ui_img_arrow_drop_down_72dp_00e4f6_fill0_wght400_grad0_opsz48_png);
    lv_obj_set_width(startIndicator,  LV_SIZE_CONTENT);
    lv_obj_set_height(startIndicator, LV_SIZE_CONTENT);
    lv_obj_set_align(startIndicator, LV_ALIGN_TOP_MID);
    lv_obj_add_flag(startIndicator, LV_OBJ_FLAG_ADV_HITTEST);
    lv_obj_clear_flag(startIndicator, LV_OBJ_FLAG_SCROLLABLE);
    ui_object_set_themeable_style_property(startIndicator, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR, _ui_theme_color_Pink____________);
    ui_object_set_themeable_style_property(startIndicator, LV_PART_MAIN | LV_STATE_DEFAULT,
        LV_STYLE_IMG_RECOLOR_OPA, _ui_theme_alpha_Pink____________);
    lv_obj_set_style_pad_top(startIndicator, 15, LV_PART_MAIN | LV_STATE_DEFAULT);

    tab.overlayEndLed_label = lv_label_create(overlayBottomRow);
    lv_obj_set_width(tab.overlayEndLed_label,  72);
    lv_obj_set_height(tab.overlayEndLed_label, LV_SIZE_CONTENT);
    lv_obj_set_align(tab.overlayEndLed_label, LV_ALIGN_CENTER);
    lv_label_set_text(tab.overlayEndLed_label, "—");
    lv_obj_set_style_text_color(tab.overlayEndLed_label, lv_color_hex(0xF6972E),
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(tab.overlayEndLed_label, 255,
                              LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_letter_space(tab.overlayEndLed_label, 2,
                                       LV_PART_MAIN | LV_STATE_DEFAULT);

    /* ── Overlay action buttons: CLOSE and CLEAR ── */
    lv_obj_t *overlayActionsRow = lv_obj_create(overlay);
    lv_obj_remove_style_all(overlayActionsRow);
    lv_obj_set_width(overlayActionsRow,  lv_pct(100));
    lv_obj_set_height(overlayActionsRow, 48);
    lv_obj_set_flex_flow(overlayActionsRow, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(overlayActionsRow, LV_FLEX_ALIGN_SPACE_BETWEEN,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(overlayActionsRow, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t *closeBtn = lv_btn_create(overlayActionsRow);
    lv_obj_set_width(closeBtn,  lv_pct(48));
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
    lv_obj_t *closeIcon = lv_label_create(closeBtn);
    lv_obj_set_width(closeIcon,  40);
    lv_obj_set_height(closeIcon, 40);
    lv_obj_set_align(closeIcon, LV_ALIGN_CENTER);
    lv_label_set_long_mode(closeIcon, LV_LABEL_LONG_CLIP);
    lv_label_set_text(closeIcon, "");
    lv_obj_clear_flag(closeIcon,
        LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
        LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE);
    lv_obj_set_style_bg_img_src(closeIcon,
        &ui_img_close_40dp_ea33f7_fill0_wght400_grad0_opsz40_png,
        LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_event_cb(closeBtn, on_overlay_close, LV_EVENT_ALL, overlay);

    lv_obj_t *clearBtn = lv_btn_create(overlayActionsRow);
    lv_obj_set_width(clearBtn,  lv_pct(48));
    lv_obj_set_height(clearBtn, lv_pct(90));
    lv_obj_set_align(clearBtn, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(clearBtn, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(clearBtn, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
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
    lv_obj_t *clearBtnText = lv_label_create(clearBtn);
    lv_obj_set_width(clearBtnText,  LV_SIZE_CONTENT);
    lv_obj_set_height(clearBtnText, LV_SIZE_CONTENT);
    lv_obj_set_align(clearBtnText, LV_ALIGN_CENTER);
    lv_label_set_long_mode(clearBtnText, LV_LABEL_LONG_CLIP);
    lv_label_set_text(clearBtnText, "CLEAR");
    lv_obj_add_event_cb(clearBtn, clearLedsLocation, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    /* Wire LED bar clicks to show the overlay */
    {
        uint16_t n = lv_obj_get_child_cnt(ledMap);
        for (uint16_t i = 0; i < n; i++) {
            lv_obj_t *led_item = lv_obj_get_child(ledMap, i);
            lv_obj_t *bar = lv_obj_get_child(led_item, 0);
            lv_obj_add_flag(bar, LV_OBJ_FLAG_CLICKABLE);
            lv_obj_add_event_cb(bar, on_led_bar_click, LV_EVENT_CLICKED, NULL);
        }
    }

    lv_obj_add_event_cb(tabContent, selectShelf, LV_EVENT_ALL,
                        (void *)(uintptr_t)shelf_index);

    return tab;
}

/* ══════════════════════════════════════════════════════════════════════════
   Runtime update helpers
   ══════════════════════════════════════════════════════════════════════════ */

void ui_shelf_tab_set_location_count(ui_shelf_tab_t *tab, uint8_t count)
{
    char buf[8];
    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)count);
    lv_label_set_text(tab->locationInShef_label, buf);

    lv_obj_clean(tab->locationSelectorCont);
    for (uint8_t i = 0; i < count; i++) {
        create_location_item(tab->locationSelectorCont, (uint8_t)(i + 1));
    }
    if (count > 0) {
        lv_obj_t *first = lv_obj_get_child(tab->locationSelectorCont, 0);
        lv_obj_add_state(first, LV_STATE_FOCUSED);
        lv_obj_set_style_bg_img_opa(first, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
        ui_object_set_themeable_style_property(first, LV_PART_MAIN | LV_STATE_DEFAULT,
            LV_STYLE_BG_IMG_RECOLOR, _ui_theme_color_Cyan____________);
        ui_object_set_themeable_style_property(first, LV_PART_MAIN | LV_STATE_DEFAULT,
            LV_STYLE_BG_IMG_RECOLOR_OPA, _ui_theme_alpha_Cyan____________);
    }
}

void ui_shelf_tab_set_led_count(ui_shelf_tab_t *tab, uint16_t count)
{
    char buf[8];
    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)count);
    lv_label_set_text(tab->ledsInShef_label, buf);

    lv_obj_clean(tab->ledMappingCont);
    for (uint16_t i = 0; i < count; i++) {
        ui_led_item_create(tab->ledMappingCont, (uint16_t)(i + 1));
    }
    uint16_t n = lv_obj_get_child_cnt(tab->ledMappingCont);
    for (uint16_t i = 0; i < n; i++) {
        lv_obj_t *item = lv_obj_get_child(tab->ledMappingCont, i);
        lv_obj_t *bar  = lv_obj_get_child(item, 0);
        lv_obj_add_flag(bar, LV_OBJ_FLAG_CLICKABLE);
        lv_obj_add_event_cb(bar, on_led_bar_click, LV_EVENT_CLICKED, NULL);
    }
}
