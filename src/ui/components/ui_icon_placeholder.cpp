#include "ui_icon_placeholder.h"

lv_obj_t *ui_icon_placeholder_create(lv_obj_t *parent,
                                      ui_icon_size_t size,
                                      lv_color_t color)
{
    lv_obj_t *obj = lv_obj_create(parent);
    lv_obj_set_size(obj, (lv_coord_t)size, (lv_coord_t)size);
    lv_obj_set_style_bg_color(obj, color, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(obj, LV_OPA_30, LV_PART_MAIN);
    lv_obj_set_style_border_color(obj, color, LV_PART_MAIN);
    lv_obj_set_style_border_width(obj, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(obj, (lv_coord_t)(size / 4), LV_PART_MAIN);
    lv_obj_set_style_pad_all(obj, 0, LV_PART_MAIN);
    lv_obj_clear_flag(obj, LV_OBJ_FLAG_SCROLLABLE);
    return obj;
}
