#include "ui_image_placeholder.h"
#include "../theme/ui_theme.h"

lv_obj_t *ui_image_placeholder_create(lv_obj_t *parent,
                                       lv_coord_t w,
                                       lv_coord_t h)
{
    lv_obj_t *obj = lv_obj_create(parent);
    lv_obj_set_size(obj, w, h);
    lv_obj_set_style_bg_color(obj, lv_color_hex(0x090914), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(obj, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(obj, ui_color_border(), LV_PART_MAIN);
    lv_obj_set_style_border_width(obj, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(obj, UI_RADIUS, LV_PART_MAIN);
    lv_obj_set_style_pad_all(obj, 0, LV_PART_MAIN);
    lv_obj_clear_flag(obj, LV_OBJ_FLAG_SCROLLABLE);

    /* Centred placeholder hint — remove once the real image asset is set */
    lv_obj_t *lbl = lv_label_create(obj);
    lv_label_set_text(lbl, LV_SYMBOL_IMAGE "\n" "CABINET");
    lv_obj_set_style_text_color(lbl, ui_color_text_dim(), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl, UI_FONT_BODY, LV_PART_MAIN);
    lv_obj_set_style_text_align(lbl, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
    lv_obj_center(lbl);

    return obj;
}
