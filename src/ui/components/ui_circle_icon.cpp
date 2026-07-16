#include "ui_circle_icon.h"
#include "../theme/ui_theme.h"

lv_obj_t *ui_circle_icon_create(lv_obj_t  *parent,
                                  lv_coord_t size,
                                  const char *sym,
                                  lv_color_t  color)
{
    lv_obj_t *ring = lv_obj_create(parent);
    lv_obj_set_size(ring, size, size);
    lv_obj_set_style_radius(ring, LV_RADIUS_CIRCLE, LV_PART_MAIN);
    lv_obj_set_style_bg_color(ring, color, LV_PART_MAIN);
    lv_obj_set_style_bg_opa(ring, LV_OPA_20, LV_PART_MAIN);
    lv_obj_set_style_border_color(ring, color, LV_PART_MAIN);
    lv_obj_set_style_border_width(ring, 1, LV_PART_MAIN);
    lv_obj_set_style_pad_all(ring, 0, LV_PART_MAIN);
    lv_obj_clear_flag(ring, LV_OBJ_FLAG_SCROLLABLE);

    if (sym) {
        lv_obj_t *lbl = lv_label_create(ring);
        lv_label_set_text(lbl, sym);
        lv_obj_set_style_text_color(lbl, color, LV_PART_MAIN);
        lv_obj_set_style_text_font(lbl, UI_FONT_BODY, LV_PART_MAIN);
        lv_obj_center(lbl);
    }

    return ring;
}
