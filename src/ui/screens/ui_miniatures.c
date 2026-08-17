#include "../ui_internal.h"

void ui_miniatures_screen_init(void) {
    ui_Miniatures = lv_obj_create(NULL);
    lv_obj_add_style(ui_Miniatures, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_Miniatures, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_Miniatures, "Miniatures", true);

    lv_obj_t* card = ui_make_card(ui_Miniatures, 10, 48, 460, 180);

    ui_MiniNameLabel = ui_make_label(card, "No miniature", 10, 6);
    lv_obj_add_style(ui_MiniNameLabel, &ui_style_accent_text, 0);
    lv_obj_set_style_text_font(ui_MiniNameLabel, UI_FONT_XL, 0);
    lv_label_set_long_mode(ui_MiniNameLabel, LV_LABEL_LONG_DOT);
    lv_obj_set_width(ui_MiniNameLabel, 420);

    ui_MiniCollectionLabel = ui_make_label(card, "", 10, 48);
    lv_obj_set_style_text_font(ui_MiniCollectionLabel, UI_FONT_M, 0);
    lv_obj_set_style_text_color(ui_MiniCollectionLabel, ui_color_text(), 0);
    lv_obj_set_width(ui_MiniCollectionLabel, 420);
    lv_label_set_long_mode(ui_MiniCollectionLabel, LV_LABEL_LONG_DOT);

    ui_MiniArtistLabel = ui_make_label(card, "", 10, 74);
    lv_obj_add_style(ui_MiniArtistLabel, &ui_style_muted_text, 0);
    lv_obj_set_style_text_font(ui_MiniArtistLabel, UI_FONT_S, 0);
    lv_obj_set_width(ui_MiniArtistLabel, 420);
    lv_label_set_long_mode(ui_MiniArtistLabel, LV_LABEL_LONG_DOT);

    ui_MiniDateLabel = ui_make_label(card, "", 10, 98);
    lv_obj_add_style(ui_MiniDateLabel, &ui_style_accent_text, 0);
    lv_obj_set_style_text_font(ui_MiniDateLabel, UI_FONT_S, 0);

    ui_MiniLocationLabel = ui_make_label(card, "--", 10, 132);
    lv_obj_add_style(ui_MiniLocationLabel, &ui_style_muted_text, 0);
    lv_obj_set_style_text_font(ui_MiniLocationLabel, UI_FONT_M, 0);

    ui_MiniPositionLabel = ui_make_label(card, "0", 0, 0);
    lv_obj_add_style(ui_MiniPositionLabel, &ui_style_accent_text, 0);
    lv_obj_set_style_text_font(ui_MiniPositionLabel, UI_FONT_XL, 0);

    ui_MiniPositionTotalLabel = ui_make_label(card, "/0", 0, 0);
    lv_obj_add_style(ui_MiniPositionTotalLabel, &ui_style_accent_text, 0);
    lv_obj_set_style_text_font(ui_MiniPositionTotalLabel, UI_FONT_M, 0);
    lv_obj_align(ui_MiniPositionTotalLabel, LV_ALIGN_BOTTOM_RIGHT, -10, -12);
    lv_obj_align_to(
        ui_MiniPositionLabel,
        ui_MiniPositionTotalLabel,
        LV_ALIGN_OUT_LEFT_MID,
        -4,
        0
    );

    ui_MiniPreviousButton = ui_make_icon_button(
        ui_Miniatures,
        LV_SYMBOL_LEFT, "Previous", false,
        10, 240, 220, 62,
        false
    );
    lv_obj_add_event_cb(ui_MiniPreviousButton, ui_event_mini_previous, LV_EVENT_CLICKED, NULL);

    ui_MiniNextButton = ui_make_icon_button(
        ui_Miniatures,
        LV_SYMBOL_RIGHT, "Next", true,
        250, 240, 220, 62,
        false
    );
    lv_obj_add_event_cb(ui_MiniNextButton, ui_event_mini_next, LV_EVENT_CLICKED, NULL);
}
