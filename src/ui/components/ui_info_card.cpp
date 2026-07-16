#include "ui_info_card.h"
#include "../theme/ui_theme.h"

lv_obj_t *ui_info_card_create(lv_obj_t *parent,
                               lv_coord_t w, lv_coord_t h,
                               lv_color_t border_color)
{
    lv_obj_t *card = lv_obj_create(parent);
    lv_obj_set_size(card, w, h);
    lv_obj_set_style_bg_color(card, ui_color_panel(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(card, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(card, border_color, LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(card, UI_RADIUS, LV_PART_MAIN);
    lv_obj_set_style_pad_all(card, UI_GAP, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);
    return card;
}
