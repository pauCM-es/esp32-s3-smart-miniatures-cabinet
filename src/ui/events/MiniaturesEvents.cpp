#include "MiniaturesEvents.h"

#include <Arduino.h>
#include <lvgl.h>
#include "app/AppContext.h"
#include "app/CatalogueContext.h"
#include "app/SmartCabinetContext.h"
#include "models/Color.h"
#include "ui/views/MiniaturesView.h"

static size_t s_currentIndex = 0;

// Set by encoder callbacks; consumed by the LVGL timer (not inside handleEncoder).
static bool s_pendingUpdate = false;
static lv_timer_t* s_navTimer = nullptr;

namespace {

void highlightCurrent()
{
    const auto& items = catalogue.all();
    if (items.empty()) {
        smartcabinet::app.clearHighlight();
        return;
    }
    const auto& m = items[s_currentIndex];
    if (m.shelf == 0 || m.location == 0) {
        Serial.printf("[Minis] index=%zu '%s' has no shelf/location assigned\n",
                      s_currentIndex, m.name.c_str());
        smartcabinet::app.clearHighlight();
        return;
    }
    const bool ok = smartcabinet::app.highlightLocationPersistent(
        static_cast<uint8_t>(m.shelf - 1),
        static_cast<uint8_t>(m.location - 1),
        smartcabinet::kWhite
    );
    Serial.printf("[Minis] highlight shelf=%u loc=%u -> %s\n",
                  m.shelf, m.location, ok ? "OK" : "FAIL (no LED range configured)");
}

void showCurrent()
{
    const auto& items = catalogue.all();
    if (items.empty()) {
        Serial.println("[Minis] catalogue is empty");
        MiniaturesView::renderEmpty();
        return;
    }
    const auto& m = items[s_currentIndex];
    Serial.printf("[Minis] show %zu/%zu  '%s'  shelf=%u loc=%u\n",
                  s_currentIndex + 1, items.size(), m.name.c_str(), m.shelf, m.location);
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
    highlightCurrent();
}

// Fired by LVGL timer — runs in lv_timer_handler(), safely outside handleEncoder().
void onNavTimer(lv_timer_t*)
{
    if (!s_pendingUpdate) return;
    s_pendingUpdate = false;
    showCurrent();
}

}  // namespace

extern "C" {

void minis_on_screen_opened()
{
    s_currentIndex = 0;
    s_pendingUpdate = false;
    Serial.printf("[Minis] screen opened — %zu miniatures\n", catalogue.all().size());

    // Dim cabinet lights; keep miniature LEDs on so the highlight is visible.
    smartcabinet::app.setPwmCabinetPower(false);
    smartcabinet::app.setRgbwCabinetPower(false);
    smartcabinet::app.setMiniaturePower(true);

    // Immediate render for the first item; subsequent navigations go via the timer.
    showCurrent();

    // Timer decouples showCurrent() from the encoder handler to avoid missing transitions.
    s_navTimer = lv_timer_create(onNavTimer, 50, nullptr);

    smartcabinet::app.setEncoderNavigationCallback([](int8_t delta) {
        const size_t count = catalogue.all().size();
        if (count == 0) return;
        if (delta > 0) {
            s_currentIndex = (s_currentIndex + 1) % count;
        } else {
            s_currentIndex = (s_currentIndex > 0) ? s_currentIndex - 1 : count - 1;
        }
        Serial.printf("[Minis] encoder delta=%d -> index=%zu\n", delta, s_currentIndex + 1);
        // Highlight immediately (no LVGL calls — safe inside handleEncoder).
        highlightCurrent();
        // UI labels updated by the 50ms timer to avoid blocking the encoder loop.
        s_pendingUpdate = true;
    });
}

void minis_on_screen_unloaded()
{
    Serial.println("[Minis] screen unloaded — clearing highlight");
    smartcabinet::app.clearHighlight();
    smartcabinet::app.setEncoderNavigationCallback(nullptr);
    if (s_navTimer) {
        lv_timer_del(s_navTimer);
        s_navTimer = nullptr;
    }
    s_pendingUpdate = false;
}

void minis_on_previous_pressed()
{
    const size_t count = catalogue.all().size();
    if (count == 0) return;
    s_currentIndex = (s_currentIndex > 0) ? s_currentIndex - 1 : count - 1;
    Serial.printf("[Minis] btn previous -> %zu/%zu\n", s_currentIndex + 1, count);
    showCurrent();
}

void minis_on_next_pressed()
{
    const size_t count = catalogue.all().size();
    if (count == 0) return;
    s_currentIndex = (s_currentIndex + 1) % count;
    Serial.printf("[Minis] btn next -> %zu/%zu\n", s_currentIndex + 1, count);
    showCurrent();
}

void minis_on_slider_changed(int32_t index)
{
    const size_t count = catalogue.all().size();
    if (count == 0 || index < 0) return;
    const size_t idx = static_cast<size_t>(index);
    s_currentIndex = idx < count ? idx : count - 1;
    Serial.printf("[Minis] slider -> %zu/%zu\n", s_currentIndex + 1, count);
    showCurrent();
}

void minis_on_card_tapped()
{
    const auto& items = catalogue.all();
    if (items.empty()) return;
    const auto& m = items[s_currentIndex];
    Serial.printf("[Minis] card tapped — re-highlight shelf=%u loc=%u\n", m.shelf, m.location);
    highlightCurrent();
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

