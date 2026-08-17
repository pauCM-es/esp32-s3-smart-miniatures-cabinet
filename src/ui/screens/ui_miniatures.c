#include "../ui_internal.h"

void ui_miniatures_screen_init(void) {
    ui_Miniatures = lv_obj_create(NULL);
    lv_obj_add_style(ui_Miniatures, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_Miniatures, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_Miniatures, "Miniatures", true);

    lv_obj_t* card = ui_make_card(ui_Miniatures, 10, 48, 460, 180);

    lv_obj_t* current = ui_make_label(card, "CURRENT MINIATURE", 10, 6);
    lv_obj_add_style(current, &ui_style_accent_text, 0);

    ui_MiniNameLabel = ui_make_label(card, "No miniature", 10, 36);
    lv_label_set_long_mode(ui_MiniNameLabel, LV_LABEL_LONG_DOT);
    lv_obj_set_width(ui_MiniNameLabel, 330);

    ui_MiniShelfLabel = ui_make_label(card, "Shelf --", 10, 78);
    lv_obj_add_style(ui_MiniShelfLabel, &ui_style_muted_text, 0);

    ui_MiniLocationLabel = ui_make_label(card, "Location --", 10, 108);
    lv_obj_add_style(ui_MiniLocationLabel, &ui_style_muted_text, 0);

    lv_obj_t* posTitle = ui_make_label(card, "Position", 340, 58);
    lv_obj_add_style(posTitle, &ui_style_muted_text, 0);

    ui_MiniPositionLabel = ui_make_label(card, "0 / 0", 340, 90);
    lv_obj_add_style(ui_MiniPositionLabel, &ui_style_accent_text, 0);
    lv_obj_set_style_text_align(ui_MiniPositionLabel, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_width(ui_MiniPositionLabel, 95);

    lv_obj_t* hint = ui_make_label(card, "Highlighted in cabinet", 10, 144);
    lv_obj_add_style(hint, &ui_style_muted_text, 0);

    ui_MiniPreviousButton = ui_make_button(
        ui_Miniatures,
        LV_SYMBOL_LEFT "  Previous",
        10, 240, 220, 62,
        false
    );
    lv_obj_add_event_cb(ui_MiniPreviousButton, ui_event_mini_previous, LV_EVENT_CLICKED, NULL);

    ui_MiniNextButton = ui_make_button(
        ui_Miniatures,
        "Next  " LV_SYMBOL_RIGHT,
        250, 240, 220, 62,
        false
    );
    lv_obj_add_event_cb(ui_MiniNextButton, ui_event_mini_next, LV_EVENT_CLICKED, NULL);
}
