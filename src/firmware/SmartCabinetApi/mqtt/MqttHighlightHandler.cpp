#include "MqttHighlightHandler.h"
#include "MqttUtils.h"

#include <Arduino.h>
#include <cstdlib>
#include "config/HardwareConfig.h"

MqttHighlightHandler::MqttHighlightHandler(
    SmartCabinetService& smartCabinet,
    CatalogueRepository& catalogue,
    const smartcabinet::CabinetLayout& layout,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : smartCabinet_(smartCabinet),
      catalogue_(catalogue),
      layout_(layout),
      mqtt_(mqtt),
      config_(config) {}

// ── helpers ──────────────────────────────────────────────────────────────────

uint16_t MqttHighlightHandler::totalCabinetLocations() const {
    uint16_t total = 0;
    for (uint8_t i = 0; i < layout_.shelfCount(); ++i) {
        const auto* s = layout_.shelf(i);
        if (s) total += s->locationCount;
    }
    return total;
}

uint16_t MqttHighlightHandler::computeGlobalLocation(uint16_t shelf, uint16_t location) const {
    if (shelf == 0 || location == 0) return 0;
    uint16_t offset = 0;
    for (uint8_t i = 0; i + 1 < static_cast<uint8_t>(shelf) && i < layout_.shelfCount(); ++i) {
        const auto* s = layout_.shelf(i);
        if (s) offset += s->locationCount;
    }
    return offset + location;
}

bool MqttHighlightHandler::resolveGlobalLocation(
    uint16_t global, uint16_t& shelf, uint16_t& location
) const {
    if (global == 0) { shelf = 0; location = 0; return true; }
    uint16_t remaining = global;
    for (uint8_t i = 0; i < layout_.shelfCount(); ++i) {
        const auto* s = layout_.shelf(i);
        if (!s || s->locationCount == 0) continue;
        if (remaining <= s->locationCount) {
            shelf    = static_cast<uint16_t>(i) + 1;
            location = remaining;
            return true;
        }
        remaining -= s->locationCount;
    }
    return false;
}

static uint16_t parseU16(const uint8_t* payload, unsigned int length) {
    String s;
    s.reserve(length);
    for (unsigned int i = 0; i < length; ++i) s += static_cast<char>(payload[i]);
    char* end = nullptr;
    const long v = strtol(s.c_str(), &end, 10);
    return (end == s.c_str() || v < 0 || v > 65535) ? 0 : static_cast<uint16_t>(v);
}

// ── command handlers ─────────────────────────────────────────────────────────

void MqttHighlightHandler::handleMiniSet(const uint8_t* payload, unsigned int length)
{
    miniIndex_ = parseU16(payload, length);
    Serial.printf("[Highlight] mini set -> %u (catalogue size=%u)\n",
                  miniIndex_, (unsigned)catalogue_.all().size());

    if (miniIndex_ == 0) {
        globalLocation_ = 0;
        smartCabinet_.highlightLocationWhite(0, 0);
        publishState();
        return;
    }

    const auto& items = catalogue_.all();
    if (miniIndex_ > items.size()) {
        Serial.printf("[Highlight] mini index %u out of range (%u items)\n",
                      miniIndex_, (unsigned)items.size());
        miniIndex_ = 0;
        publishState();
        return;
    }
    const Miniature& m = items[miniIndex_ - 1];
    globalLocation_ = computeGlobalLocation(m.shelf, m.location);
    Serial.printf("[Highlight] mini '%s' -> shelf=%u loc=%u global=%u\n",
                  m.name.c_str(), m.shelf, m.location, globalLocation_);
    smartCabinet_.highlightLocationWhite(m.shelf, m.location);
    publishState();
}

void MqttHighlightHandler::handleLocationSet(const uint8_t* payload, unsigned int length)
{
    miniIndex_      = 0;
    globalLocation_ = parseU16(payload, length);
    Serial.printf("[Highlight] location set (global) -> %u\n", globalLocation_);

    uint16_t shelf = 0, location = 0;
    resolveGlobalLocation(globalLocation_, shelf, location);
    Serial.printf("[Highlight] resolved -> shelf=%u loc=%u\n", shelf, location);
    smartCabinet_.highlightLocationWhite(shelf, location);
    publishState();
}

// ── publish ───────────────────────────────────────────────────────────────────

void MqttHighlightHandler::publishState()
{
    if (!mqtt_.connected()) return;

    JsonDocument doc;
    doc["mini"]     = miniIndex_;
    doc["location"] = globalLocation_;

    String payload;
    serializeJson(doc, payload);
    mqtt_.publish(
        MqttUtils::topic(config_, "/api/highlight/state").c_str(),
        payload.c_str(),
        true
    );
}

void MqttHighlightHandler::publishDiscovery()
{
    const String stateTopic = MqttUtils::topic(config_, "/api/highlight/state");
    const uint16_t miniMax  = static_cast<uint16_t>(
        catalogue_.all().empty() ? 1 : catalogue_.all().size()
    );

    // ── Highlight Miniature ───────────────────────────────────────────────────
    {
        JsonDocument doc;
        doc["name"]            = "Highlight Miniature";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_mini";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/mini/set");
        doc["value_template"]  = "{{ value_json.mini }}";
        doc["min"]             = 0;
        doc["max"]             = miniMax;
        doc["step"]            = 1;
        doc["mode"]            = "slider";
        doc["icon"]            = "mdi:account-search";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "number", "highlight_mini").c_str(), payload.c_str(), true);
    }

    // ── Highlight Location ────────────────────────────────────────────────────
    {
        const uint16_t locationMax = totalCabinetLocations();
        JsonDocument doc;
        doc["name"]            = "Highlight Location";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_location";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/location/set");
        doc["value_template"]  = "{{ value_json.location }}";
        doc["min"]             = 0;
        doc["max"]             = locationMax == 0 ? 1 : locationMax;
        doc["step"]            = 1;
        doc["mode"]            = "slider";
        doc["icon"]            = "mdi:map-marker-radius";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "number", "highlight_location").c_str(), payload.c_str(), true);
    }
}
