#pragma once

#include "ui.h"
#include "ui_theme.h"

#ifdef __cplusplus
extern "C" {
#endif

lv_obj_t* ui_make_header(lv_obj_t* parent, const char* title, bool showBack);
lv_obj_t* ui_make_card(lv_obj_t* parent, lv_coord_t x, lv_coord_t y, lv_coord_t w, lv_coord_t h);
lv_obj_t* ui_make_label(lv_obj_t* parent, const char* text, lv_coord_t x, lv_coord_t y);
lv_obj_t* ui_make_button(lv_obj_t* parent, const char* text, lv_coord_t x, lv_coord_t y, lv_coord_t w, lv_coord_t h, bool primary);
lv_obj_t* ui_make_icon_button(
    lv_obj_t* parent,
    const char* icon,
    const char* text,
    bool iconAfterText,
    lv_coord_t x,
    lv_coord_t y,
    lv_coord_t w,
    lv_coord_t h,
    bool primary
);

void ui_event_back(lv_event_t* e);
void ui_event_open_settings(lv_event_t* e);
void ui_event_open_miniatures(lv_event_t* e);
void ui_event_open_ota(lv_event_t* e);
void ui_event_open_wifi(lv_event_t* e);

void ui_event_cabinet_switch(lv_event_t* e);
void ui_event_cabinet_slider(lv_event_t* e);
void ui_event_miniatures_switch(lv_event_t* e);
void ui_event_miniatures_slider(lv_event_t* e);
void ui_event_scene(lv_event_t* e);
void ui_event_mini_previous(lv_event_t* e);
void ui_event_mini_next(lv_event_t* e);
void ui_event_brightness_limit(lv_event_t* e);
void ui_event_ota_action(lv_event_t* e);
void ui_event_wifi_save(lv_event_t* e);
void ui_event_wifi_mqtt_reconnect(lv_event_t* e);
void ui_event_password_toggle(lv_event_t* e);
void ui_event_textarea_focus(lv_event_t* e);
void ui_event_keyboard(lv_event_t* e);

#ifdef __cplusplus
}
#endif
