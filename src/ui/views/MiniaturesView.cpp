#include "MiniaturesView.h"
#include <lvgl.h>
#include "../screens/ui_miniatures_screen.h"

namespace MiniaturesView {

void render(const ViewModel& model)
{
    if (model.total == 0) { renderEmpty(); return; }

    if (ui_miniInfoTitle_text)
        lv_label_set_text(ui_miniInfoTitle_text, model.name);

    if (ui_mini_info_label1)
        lv_label_set_text(ui_mini_info_label1, "Collection");
    if (ui_mini_info_value1)
        lv_label_set_text(ui_mini_info_value1,
                          (model.collection && model.collection[0]) ? model.collection : "--");

    if (ui_mini_info_label2)
        lv_label_set_text(ui_mini_info_label2, "Artist");
    if (ui_mini_info_value2)
        lv_label_set_text(ui_mini_info_value2,
                          (model.artist && model.artist[0]) ? model.artist : "--");

    if (ui_miniInfoFieldKey_text)
        lv_label_set_text(ui_miniInfoFieldKey_text, "Date");
    if (ui_miniInfoFieldValue_text)
        lv_label_set_text(ui_miniInfoFieldValue_text,
                          (model.date && model.date[0]) ? model.date : "--");

    if (ui_currentLocation_text)
        lv_label_set_text_fmt(ui_currentLocation_text, "Shelf %u | Loc %u",
                              (unsigned)model.shelf, (unsigned)model.location);

    if (ui_currentMini_label)
        lv_label_set_text_fmt(ui_currentMini_label, "%u", (unsigned)(model.index + 1));

    if (ui_totalMinis_label)
        lv_label_set_text_fmt(ui_totalMinis_label, "/ %u", (unsigned)model.total);

    if (ui_locationSelector_slider) {
        lv_slider_set_range(ui_locationSelector_slider, 0, (int32_t)(model.total - 1));
        lv_slider_set_value(ui_locationSelector_slider, (int32_t)model.index, LV_ANIM_OFF);
    }
}

void renderEmpty()
{
    if (ui_miniInfoTitle_text)       lv_label_set_text(ui_miniInfoTitle_text, "No miniatures");
    if (ui_miniInfoFieldKey_text)    lv_label_set_text(ui_miniInfoFieldKey_text, "Date");
    if (ui_miniInfoFieldValue_text)  lv_label_set_text(ui_miniInfoFieldValue_text, "--");
    if (ui_mini_info_label1)         lv_label_set_text(ui_mini_info_label1, "Collection");
    if (ui_mini_info_value1)         lv_label_set_text(ui_mini_info_value1, "--");
    if (ui_mini_info_label2)         lv_label_set_text(ui_mini_info_label2, "Artist");
    if (ui_mini_info_value2)         lv_label_set_text(ui_mini_info_value2, "--");
    if (ui_currentLocation_text)     lv_label_set_text(ui_currentLocation_text, "--");
    if (ui_currentMini_label)        lv_label_set_text(ui_currentMini_label, "0");
    if (ui_totalMinis_label)         lv_label_set_text(ui_totalMinis_label, "/ 0");
    if (ui_locationSelector_slider) {
        lv_slider_set_range(ui_locationSelector_slider, 0, 0);
        lv_slider_set_value(ui_locationSelector_slider, 0, LV_ANIM_OFF);
    }
}

}  // namespace MiniaturesView
