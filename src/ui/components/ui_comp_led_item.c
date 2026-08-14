#include "ui_comp_led_item.h"
#include "../events/ShelvesEvents.h"

static void _on_bar_clicked(lv_event_t *e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED)
        shelves_on_led_selected((uint16_t)(uintptr_t)lv_event_get_user_data(e));
}

lv_obj_t *ui_led_item_create(lv_obj_t *parent, uint16_t ledIndex)
{
    lv_obj_t *cont = lv_obj_create(parent);
    lv_obj_remove_style_all(cont);
    lv_obj_set_user_data(cont, (void *)(uintptr_t)ledIndex);  /* read back in set_state */
    lv_obj_set_height(cont, lv_pct(100));
    lv_obj_set_width(cont, LV_SIZE_CONTENT);
    lv_obj_set_align(cont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_clear_flag(cont, LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_CLICK_FOCUSABLE |
                      LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_pad_left(cont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(cont, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(cont, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(cont, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Coloured bar – child 0 */
    lv_obj_t *bar = lv_obj_create(cont);
    lv_obj_set_width(bar, 16);
    lv_obj_set_height(bar, lv_pct(80));
    lv_obj_set_align(bar, LV_ALIGN_CENTER);
    lv_obj_clear_flag(bar, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(bar, 2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_color(bar, lv_color_hex(0x17569A), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(bar, 200, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_color(bar, lv_color_hex(0xB1B1B1), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_opa(bar, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_width(bar, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_add_event_cb(bar, _on_bar_clicked, LV_EVENT_CLICKED,
                        (void *)(uintptr_t)ledIndex);

    /* Index label – child 1; only visible every 5 items */
    lv_obj_t *lbl = lv_label_create(cont);
    lv_obj_set_width(lbl, LV_SIZE_CONTENT);
    lv_obj_set_height(lbl, LV_SIZE_CONTENT);
    lv_obj_set_align(lbl, LV_ALIGN_CENTER);
    lv_obj_set_style_text_color(lbl, lv_color_hex(0xB1B1B1), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(lbl, 255, LV_PART_MAIN | LV_STATE_DEFAULT);

    if (ledIndex % 5 == 0) {
        char buf[6];
        lv_snprintf(buf, sizeof(buf), "%u", (unsigned)ledIndex);
        lv_label_set_text(lbl, buf);
    } else {
        lv_label_set_text(lbl, "");
    }

    return cont;
}

void ui_led_item_set_state(lv_obj_t *item, ui_led_item_state_t state)
{
    lv_obj_t *bar = lv_obj_get_child(item, 0);
    lv_obj_t *lbl = lv_obj_get_child(item, 1);
    if (!bar) return;

    lv_color_t color;
    uint8_t    bg_opa;

    switch (state) {
        case UI_LED_ITEM_STATE_START:
            color  = lv_color_hex(0xEA33F7);  /* pink */
            bg_opa = 255;
            break;
        case UI_LED_ITEM_STATE_ASSIGNED:
            color  = lv_color_hex(0x00E4F6);  /* cyan */
            bg_opa = 255;
            break;
        case UI_LED_ITEM_STATE_END:
            color  = lv_color_hex(0xF6972E);  /* orange */
            bg_opa = 255;
            break;
        default:  /* UNASSIGNED */
            color  = lv_color_hex(0x17569A);  /* dark blue */
            bg_opa = 200;
            break;
    }

    lv_obj_set_style_bg_color(bar, color, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(bar, bg_opa, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_border_color(bar,
        state == UI_LED_ITEM_STATE_UNASSIGNED ? lv_color_hex(0xB1B1B1) : lv_color_hex(0xFFFFFF),
        LV_PART_MAIN | LV_STATE_DEFAULT);

    if (lbl) {
        lv_obj_set_style_text_color(lbl, color, LV_PART_MAIN | LV_STATE_DEFAULT);

        uint16_t ledIndex = (uint16_t)(uintptr_t)lv_obj_get_user_data(item);
        bool showLabel = (ledIndex % 5 == 0) ||
                         (state == UI_LED_ITEM_STATE_START) ||
                         (state == UI_LED_ITEM_STATE_END);
        if (showLabel) {
            char buf[6];
            lv_snprintf(buf, sizeof(buf), "%u", (unsigned)ledIndex);
            lv_label_set_text(lbl, buf);
        } else {
            lv_label_set_text(lbl, "");
        }
    }
}
