#include "ui_comp_led_item.h"

/* Child indices inside the LED item container */
#define LED_ITEM_CHILD_BAR   0
#define LED_ITEM_CHILD_LABEL 1

/* ──────────────────────────────────────────────────────────────────────── */

lv_obj_t *ui_led_item_create(lv_obj_t *parent, uint16_t index)
{
    /* Outer column container */
    lv_obj_t *cont = lv_obj_create(parent);
    lv_obj_remove_style_all(cont);
    lv_obj_set_width(cont, LV_SIZE_CONTENT);
    lv_obj_set_height(cont, lv_pct(100));
    lv_obj_set_align(cont, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_START,
                          LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
    lv_obj_clear_flag(cont, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_pad_left(cont,   0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_right(cont,  0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_top(cont,    2, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_bottom(cont, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Coloured bar (child 0) */
    lv_obj_t *bar = lv_obj_create(cont);
    lv_obj_set_width(bar,  16);
    lv_obj_set_height(bar, lv_pct(80));
    lv_obj_set_align(bar, LV_ALIGN_CENTER);
    lv_obj_clear_flag(bar, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_radius(bar, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

    /* Index label (child 1) */
    lv_obj_t *label = lv_label_create(cont);
    lv_obj_set_width(label,  LV_SIZE_CONTENT);
    lv_obj_set_height(label, LV_SIZE_CONTENT);
    lv_obj_set_align(label, LV_ALIGN_CENTER);
    lv_obj_set_style_text_color(label, lv_color_hex(0xB1B1B1),
                                LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_opa(label, 255, LV_PART_MAIN | LV_STATE_DEFAULT);

    char buf[8];
    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)index);
    lv_label_set_text(label, buf);

    /* Apply default state */
    ui_led_item_set_state(cont, UI_LED_ITEM_STATE_UNASSIGNED);

    return cont;
}

/* ──────────────────────────────────────────────────────────────────────── */

void ui_led_item_set_state(lv_obj_t *item, ui_led_item_state_t state)
{
    lv_obj_t *bar   = lv_obj_get_child(item, LED_ITEM_CHILD_BAR);
    lv_obj_t *label = lv_obj_get_child(item, LED_ITEM_CHILD_LABEL);

    switch (state) {

        /* ── UNASSIGNED ─────────────────────────────────────────── */
        case UI_LED_ITEM_STATE_UNASSIGNED:
            /* Restore narrow, normal-height container */
            lv_obj_set_width(item,  LV_SIZE_CONTENT);
            lv_obj_set_height(item, lv_pct(100));
            lv_obj_set_flex_align(item, LV_FLEX_ALIGN_START,
                                  LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
            lv_obj_set_style_pad_top(item,    2, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_pad_bottom(item, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

            lv_obj_set_style_bg_color(bar, lv_color_hex(0x17569A),
                                      LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_bg_opa(bar, 200, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_color(bar, lv_color_hex(0xB1B1B1),
                                          LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_opa(bar,   255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_width(bar,   1, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_width(bar,   0, LV_PART_MAIN | LV_STATE_DEFAULT);

            lv_obj_add_flag(label, LV_OBJ_FLAG_HIDDEN);
            break;

        /* ── ASSIGNED ───────────────────────────────────────────── */
        case UI_LED_ITEM_STATE_ASSIGNED:
            lv_obj_set_width(item,  LV_SIZE_CONTENT);
            lv_obj_set_height(item, lv_pct(100));
            lv_obj_set_flex_align(item, LV_FLEX_ALIGN_START,
                                  LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_START);
            lv_obj_set_style_pad_top(item,    2, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_pad_bottom(item, 2, LV_PART_MAIN | LV_STATE_DEFAULT);

            ui_object_set_themeable_style_property(bar, LV_PART_MAIN | LV_STATE_DEFAULT,
                                                   LV_STYLE_BG_COLOR,
                                                   _ui_theme_color_Cyan____________);
            ui_object_set_themeable_style_property(bar, LV_PART_MAIN | LV_STATE_DEFAULT,
                                                   LV_STYLE_BG_OPA,
                                                   _ui_theme_alpha_Cyan____________);
            lv_obj_set_style_border_color(bar, lv_color_hex(0xFFFFFF),
                                          LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_opa(bar,   255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_width(bar,   1, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_width(bar,   0, LV_PART_MAIN | LV_STATE_DEFAULT);

            lv_obj_add_flag(label, LV_OBJ_FLAG_HIDDEN);
            break;

        /* ── START ──────────────────────────────────────────────── */
        case UI_LED_ITEM_STATE_START:
            /* Start marker is wider and slightly taller to stand out */
            lv_obj_set_width(item,  30);
            lv_obj_set_height(item, lv_pct(110));
            lv_obj_set_flex_align(item, LV_FLEX_ALIGN_START,
                                  LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
            lv_obj_set_style_pad_top(item,    5, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_pad_bottom(item, 5, LV_PART_MAIN | LV_STATE_DEFAULT);

            ui_object_set_themeable_style_property(bar, LV_PART_MAIN | LV_STATE_DEFAULT,
                                                   LV_STYLE_BG_COLOR,
                                                   _ui_theme_color_Pink____________);
            ui_object_set_themeable_style_property(bar, LV_PART_MAIN | LV_STATE_DEFAULT,
                                                   LV_STYLE_BG_OPA,
                                                   _ui_theme_alpha_Pink____________);
            lv_obj_set_style_border_color(bar, lv_color_hex(0xFFFFFF),
                                          LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_opa(bar,   255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_width(bar,   1, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_color(bar, lv_color_hex(0xFF7ED3),
                                          LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_opa(bar,    255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_width(bar,   20, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_spread(bar,   4, LV_PART_MAIN | LV_STATE_DEFAULT);

            ui_object_set_themeable_style_property(label, LV_PART_MAIN | LV_STATE_DEFAULT,
                                                   LV_STYLE_TEXT_COLOR,
                                                   _ui_theme_color_Pink____________);
            ui_object_set_themeable_style_property(label, LV_PART_MAIN | LV_STATE_DEFAULT,
                                                   LV_STYLE_TEXT_OPA,
                                                   _ui_theme_alpha_Pink____________);
            lv_obj_clear_flag(label, LV_OBJ_FLAG_HIDDEN);
            break;

        /* ── END ────────────────────────────────────────────────── */
        case UI_LED_ITEM_STATE_END:
            lv_obj_set_width(item,  30);
            lv_obj_set_height(item, lv_pct(110));
            lv_obj_set_flex_align(item, LV_FLEX_ALIGN_START,
                                  LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
            lv_obj_set_style_pad_top(item,    5, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_pad_bottom(item, 5, LV_PART_MAIN | LV_STATE_DEFAULT);

            lv_obj_set_style_bg_color(bar, lv_color_hex(0xF6972E),
                                      LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_bg_opa(bar,   255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_color(bar, lv_color_hex(0xFFFFFF),
                                          LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_opa(bar,   255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_border_width(bar,   1, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_color(bar, lv_color_hex(0xFAAA51),
                                          LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_opa(bar,    255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_width(bar,   20, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_shadow_spread(bar,   4, LV_PART_MAIN | LV_STATE_DEFAULT);

            lv_obj_set_style_text_color(label, lv_color_hex(0xF6972E),
                                        LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_set_style_text_opa(label, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
            lv_obj_clear_flag(label, LV_OBJ_FLAG_HIDDEN);
            break;
    }
}

/* ──────────────────────────────────────────────────────────────────────── */

void ui_led_item_set_index(lv_obj_t *item, uint16_t index)
{
    lv_obj_t *label = lv_obj_get_child(item, LED_ITEM_CHILD_LABEL);
    char buf[8];
    lv_snprintf(buf, sizeof(buf), "%u", (unsigned)index);
    lv_label_set_text(label, buf);
}
