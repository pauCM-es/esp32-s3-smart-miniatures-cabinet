#include "../ui_internal.h"

void ui_ota_screen_init(void) {
    ui_Ota = lv_obj_create(NULL);
    lv_obj_add_style(ui_Ota, &ui_style_screen, 0);
    lv_obj_clear_flag(ui_Ota, LV_OBJ_FLAG_SCROLLABLE);

    ui_make_header(ui_Ota, "OTA Update", true);

    lv_obj_t* card = ui_make_card(ui_Ota, 20, 52, 440, 246);

    lv_obj_t* icon = ui_make_label(card, LV_SYMBOL_UPLOAD, 195, 8);
    lv_obj_add_style(icon, &ui_style_accent_text, 0);

    ui_OtaStatusLabel = ui_make_label(card, "OTA disabled", 0, 43);
    lv_obj_set_width(ui_OtaStatusLabel, 420);
    lv_obj_set_style_text_align(ui_OtaStatusLabel, LV_TEXT_ALIGN_CENTER, 0);

    ui_OtaDetailLabel = ui_make_label(card, "Enable a 5 minute maintenance window", 0, 72);
    lv_obj_set_width(ui_OtaDetailLabel, 420);
    lv_obj_set_style_text_align(ui_OtaDetailLabel, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_add_style(ui_OtaDetailLabel, &ui_style_muted_text, 0);

    ui_OtaVersionLabel = ui_make_label(card, "Version --", 20, 112);
    lv_obj_add_style(ui_OtaVersionLabel, &ui_style_muted_text, 0);

    ui_OtaHostnameLabel = ui_make_label(card, "Host --", 20, 140);
    lv_obj_add_style(ui_OtaHostnameLabel, &ui_style_muted_text, 0);

    ui_OtaCountdownLabel = ui_make_label(card, "Expires 00:00", 250, 112);
    lv_obj_add_style(ui_OtaCountdownLabel, &ui_style_muted_text, 0);

    ui_OtaProgressBar = lv_bar_create(card);
    lv_obj_set_size(ui_OtaProgressBar, 380, 12);
    lv_obj_set_pos(ui_OtaProgressBar, 20, 171);
    lv_bar_set_range(ui_OtaProgressBar, 0, 100);
    lv_obj_set_style_bg_color(ui_OtaProgressBar, ui_color_surface_alt(), LV_PART_MAIN);
    lv_obj_set_style_bg_color(ui_OtaProgressBar, ui_color_accent(), LV_PART_INDICATOR);

    ui_OtaActionButton = lv_btn_create(card);
    lv_obj_add_style(ui_OtaActionButton, &ui_style_primary_button, 0);
    lv_obj_set_size(ui_OtaActionButton, 250, 42);
    lv_obj_set_pos(ui_OtaActionButton, 85, 188);
    lv_obj_add_event_cb(ui_OtaActionButton, ui_event_ota_action, LV_EVENT_CLICKED, NULL);

    ui_OtaActionLabel = lv_label_create(ui_OtaActionButton);
    lv_label_set_text(ui_OtaActionLabel, "Enable OTA");
    lv_obj_set_style_text_font(ui_OtaActionLabel, UI_FONT_L, 0);
    lv_obj_center(ui_OtaActionLabel);
}
