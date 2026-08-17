#include "../ui_internal.h"

static lv_obj_t* add_control_card(
    lv_obj_t* parent,
    const char* title,
    lv_coord_t x,
    lv_coord_t y,
    lv_obj_t** outSwitch,
    lv_obj_t** outSlider,
    lv_obj_t** outValueLabel,
    lv_event_cb_t switchEvent,
    lv_event_cb_t sliderEvent
) {
    lv_obj_t* card = ui_make_card(parent, x, y, 222, 105);

    lv_obj_t* titleLabel = ui_make_label(card, title, 8, 4);
    lv_obj_set_style_text_color(titleLabel, ui_color_text(), 0);

    lv_obj_t* sw = lv_switch_create(card);
    lv_obj_set_size(sw, 45, 23);
    lv_obj_align(sw, LV_ALIGN_TOP_RIGHT, -2, 0);
    lv_obj_set_style_bg_color(sw, ui_color_accent(), LV_PART_INDICATOR | LV_STATE_CHECKED);
    lv_obj_add_event_cb(sw, switchEvent, LV_EVENT_VALUE_CHANGED, NULL);

    lv_obj_t* brightness = ui_make_label(card, "Brightness", 8, 35);
    lv_obj_add_style(brightness, &ui_style_muted_text, 0);

    lv_obj_t* valueLabel = ui_make_label(card, "0%", 167, 35);
    lv_obj_add_style(valueLabel, &ui_style_accent_text, 0);

    lv_obj_t* slider = lv_slider_create(card);
    lv_obj_set_size(slider, 195, 16);
    lv_obj_set_pos(slider, 8, 66);
    lv_slider_set_range(slider, 0, 100);
    lv_obj_set_style_bg_color(slider, ui_color_surface_alt(), LV_PART_MAIN);
    lv_obj_set_style_bg_color(slider, ui_color_accent(), LV_PART_INDICATOR);
    lv_obj_set_style_bg_color(slider, ui_color_text(), LV_PART_KNOB);
    lv_obj_add_event_cb(slider, sliderEvent, LV_EVENT_VALUE_CHANGED, NULL);
    lv_obj_add_event_cb(slider, sliderEvent, LV_EVENT_RELEASED, NULL);

    *outSwitch = sw;
    *outSlider = slider;
    *outValueLabel = valueLabel;
    return card;
}

void ui_overview_screen_init(void) {
    ui_Overview = lv_obj_create(NULL);
    lv_obj_add_style(ui_Overview, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_Overview, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_Overview, "Smart Cabinet", false);

    add_control_card(
        ui_Overview,
        "Cabinet light",
        10, 43,
        &ui_CabinetSwitch,
        &ui_CabinetSlider,
        &ui_CabinetBrightnessLabel,
        ui_event_cabinet_switch,
        ui_event_cabinet_slider
    );

    add_control_card(
        ui_Overview,
        "Miniatures light",
        248, 43,
        &ui_MiniaturesSwitch,
        &ui_MiniaturesSlider,
        &ui_MiniaturesBrightnessLabel,
        ui_event_miniatures_switch,
        ui_event_miniatures_slider
    );

    lv_obj_t* scenesCard = ui_make_card(ui_Overview, 10, 156, 292, 111);
    lv_obj_t* scenesTitle = ui_make_label(scenesCard, "Scenes", 8, 2);
    lv_obj_set_style_text_color(scenesTitle, ui_color_text(), 0);

    for (uint8_t i = 0; i < UI_MAX_SCENES; ++i) {
        lv_obj_t* btn = lv_btn_create(scenesCard);
        lv_obj_add_style(btn, &ui_style_secondary_button, 0);
        lv_obj_set_size(btn, 62, 55);
        lv_obj_set_pos(btn, 5 + (i * 69), 32);
        lv_obj_add_event_cb(btn, ui_event_scene, LV_EVENT_CLICKED, (void*)(uintptr_t)i);

        lv_obj_t* label = lv_label_create(btn);
        lv_label_set_text(label, "-");
        lv_label_set_long_mode(label, LV_LABEL_LONG_DOT);
        lv_obj_set_width(label, 54);
        lv_obj_set_style_text_align(label, LV_TEXT_ALIGN_CENTER, 0);
        lv_obj_center(label);

        ui_SceneButtons[i] = btn;
        ui_SceneLabels[i] = label;
    }

    lv_obj_t* countCard = ui_make_card(ui_Overview, 312, 156, 158, 111);
    lv_obj_add_flag(countCard, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(countCard, ui_event_open_miniatures, LV_EVENT_CLICKED, NULL);

    lv_obj_t* countTitle = ui_make_label(countCard, "Miniatures", 6, 2);
    lv_obj_add_style(countTitle, &ui_style_muted_text, 0);

    ui_MiniatureCountLabel = ui_make_label(countCard, "0", 6, 29);
    lv_obj_add_style(ui_MiniatureCountLabel, &ui_style_accent_text, 0);
    lv_obj_set_style_text_font(ui_MiniatureCountLabel, LV_FONT_DEFAULT, 0);

    lv_obj_t* countHint = ui_make_label(countCard, "in cabinet", 6, 63);
    lv_obj_add_style(countHint, &ui_style_muted_text, 0);

    lv_obj_t* arrow = lv_label_create(countCard);
    lv_label_set_text(arrow, LV_SYMBOL_RIGHT);
    lv_obj_add_style(arrow, &ui_style_accent_text, 0);
    lv_obj_align(arrow, LV_ALIGN_RIGHT_MID, -2, 0);

    lv_obj_t* settings = ui_make_button(
        ui_Overview,
        LV_SYMBOL_SETTINGS "  Settings",
        10, 277, 460, 34,
        false
    );
    lv_obj_add_event_cb(settings, ui_event_open_settings, LV_EVENT_CLICKED, NULL);
}
