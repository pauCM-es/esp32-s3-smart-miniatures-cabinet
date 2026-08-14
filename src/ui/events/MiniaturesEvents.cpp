#include "MiniaturesEvents.h"

#include <lvgl.h>
#include "app/AppContext.h"
#include "app/CatalogueContext.h"
#include "app/SmartCabinetContext.h"
#include "ui/views/MiniaturesView.h"

static size_t s_currentIndex = 0;

namespace {

void showCurrent()
{
    const auto& items = catalogue.all();
    if (items.empty()) {
        MiniaturesView::renderEmpty();
        return;
    }
    const auto& m = items[s_currentIndex];
    MiniaturesView::render({
        m.name.c_str(),
        m.collection.c_str(),
        m.artist.c_str(),
        m.date.c_str(),
        m.notes.c_str(),
        m.shelf,
        m.location,
        s_currentIndex,
        items.size()
    });
}

}  // namespace

extern "C" {

void minis_on_screen_opened()
{
    s_currentIndex = 0;
    showCurrent();
    smartcabinet::app.setEncoderNavigationCallback([](int8_t delta) {
        if (delta > 0) minis_on_next_pressed();
        else           minis_on_previous_pressed();
    });
}

void minis_on_screen_unloaded()
{
    smartcabinet::app.setEncoderNavigationCallback(nullptr);
}

void minis_on_previous_pressed()
{
    const size_t count = catalogue.all().size();
    if (count == 0) return;
    s_currentIndex = (s_currentIndex > 0) ? s_currentIndex - 1 : count - 1;
    showCurrent();
}

void minis_on_next_pressed()
{
    const size_t count = catalogue.all().size();
    if (count == 0) return;
    s_currentIndex = (s_currentIndex + 1) % count;
    showCurrent();
}

void minis_on_slider_changed(int32_t index)
{
    const size_t count = catalogue.all().size();
    if (count == 0 || index < 0) return;
    const size_t idx = static_cast<size_t>(index);
    s_currentIndex = idx < count ? idx : count - 1;
    showCurrent();
}

void minis_on_card_tapped()
{
    const auto& items = catalogue.all();
    if (items.empty()) return;
    const auto& m = items[s_currentIndex];
    smartCabinet.highlightLocation(m.shelf, m.location);
}

// ── LVGL event wrappers ───────────────────────────────────────────────────────

void ui_event_miniatures_screen_loaded(lv_event_t* e)
{
    if (lv_event_get_code(e) == LV_EVENT_SCREEN_LOADED)
        minis_on_screen_opened();
}

void ui_event_miniatures_screen_unloaded(lv_event_t* e)
{
    if (lv_event_get_code(e) == LV_EVENT_SCREEN_UNLOADED)
        minis_on_screen_unloaded();
}

void ui_event_previousMini_btn(lv_event_t* e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED)
        minis_on_previous_pressed();
}

void ui_event_nextMini_btn(lv_event_t* e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED)
        minis_on_next_pressed();
}

void ui_event_minis_locate(lv_event_t* e)
{
    if (lv_event_get_code(e) == LV_EVENT_CLICKED)
        minis_on_card_tapped();
}

void updateMiniLocatinValue(lv_event_t* /*e*/)
{
    // location swap is managed via HA/MQTT card
}

}  // extern "C"
