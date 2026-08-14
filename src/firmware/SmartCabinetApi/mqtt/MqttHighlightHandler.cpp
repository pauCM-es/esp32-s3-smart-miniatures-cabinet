#include "MqttHighlightHandler.h"
#include "MqttUtils.h"

#include <Arduino.h>
#include <cstdlib>
#include "config/HardwareConfig.h"

MqttHighlightHandler::MqttHighlightHandler(
    SmartCabinetService& smartCabinet,
    CatalogueRepository& catalogue,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : smartCabinet_(smartCabinet),
      catalogue_(catalogue),
      mqtt_(mqtt),
      config_(config) {}

// ── helpers ──────────────────────────────────────────────────────────────────

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
        shelf_ = 0; location_ = 0;
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
    shelf_    = m.shelf;
    location_ = m.location;
    Serial.printf("[Highlight] mini '%s' -> shelf=%u loc=%u\n",
                  m.name.c_str(), shelf_, location_);
    smartCabinet_.highlightLocationWhite(m.shelf, m.location);
    publishState();
}

void MqttHighlightHandler::handleShelfSet(const uint8_t* payload, unsigned int length)
{
    miniIndex_ = 0;
    shelf_     = parseU16(payload, length);
    Serial.printf("[Highlight] shelf set -> %u\n", shelf_);
    applyLocationHighlight();
}

void MqttHighlightHandler::handleLocationSet(const uint8_t* payload, unsigned int length)
{
    miniIndex_ = 0;
    location_  = parseU16(payload, length);
    Serial.printf("[Highlight] location set -> %u\n", location_);
    applyLocationHighlight();
}

void MqttHighlightHandler::applyLocationHighlight()
{
    if (shelf_ > 0 && location_ > 0) {
        Serial.printf("[Highlight] apply location shelf=%u loc=%u\n", shelf_, location_);
        smartCabinet_.highlightLocationWhite(shelf_, location_);
    } else {
        Serial.printf("[Highlight] clear (shelf=%u loc=%u)\n", shelf_, location_);
        smartCabinet_.highlightLocationWhite(0, 0);
    }
    publishState();
}

// ── publish ───────────────────────────────────────────────────────────────────

void MqttHighlightHandler::publishState()
{
    if (!mqtt_.connected()) return;

    JsonDocument doc;
    doc["mini"]     = miniIndex_;
    doc["shelf"]    = shelf_;
    doc["location"] = location_;

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

    // ── Highlight Shelf ───────────────────────────────────────────────────────
    {
        JsonDocument doc;
        doc["name"]            = "Highlight Shelf";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_shelf";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/shelf/set");
        doc["value_template"]  = "{{ value_json.shelf }}";
        doc["min"]             = 0;
        doc["max"]             = smartcabinet::config::kMaxShelves;
        doc["step"]            = 1;
        doc["mode"]            = "slider";
        doc["icon"]            = "mdi:bookshelf";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "number", "highlight_shelf").c_str(), payload.c_str(), true);
    }

    // ── Highlight Location ────────────────────────────────────────────────────
    {
        JsonDocument doc;
        doc["name"]            = "Highlight Location";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_location";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/location/set");
        doc["value_template"]  = "{{ value_json.location }}";
        doc["min"]             = 0;
        doc["max"]             = smartcabinet::config::kDefaultLocationsPerShelf;
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


// ── helpers ──────────────────────────────────────────────────────────────────

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

    if (miniIndex_ == 0) {
        shelf_    = 0;
        location_ = 0;
        smartCabinet_.highlightLocationWhite(0, 0);
        publishState();
        return;
    }

    const auto& items = catalogue_.all();
    if (miniIndex_ > items.size()) {
        miniIndex_ = 0;
        publishState();
        return;
    }
    const Miniature& m = items[miniIndex_ - 1];
    shelf_    = m.shelf;
    location_ = m.location;
    smartCabinet_.highlightLocationWhite(m.shelf, m.location);
    publishState();
}

void MqttHighlightHandler::handleShelfSet(const uint8_t* payload, unsigned int length)
{
    miniIndex_ = 0;
    shelf_     = parseU16(payload, length);
    applyLocationHighlight();
}

void MqttHighlightHandler::handleLocationSet(const uint8_t* payload, unsigned int length)
{
    miniIndex_ = 0;
    location_  = parseU16(payload, length);
    applyLocationHighlight();
}

void MqttHighlightHandler::applyLocationHighlight()
{
    smartCabinet_.highlightLocationWhite(
        (shelf_ > 0 && location_ > 0) ? shelf_    : 0,
        (shelf_ > 0 && location_ > 0) ? location_ : 0
    );
    publishState();
}

// ── publish ───────────────────────────────────────────────────────────────────

void MqttHighlightHandler::publishState()
{
    if (!mqtt_.connected()) return;

    JsonDocument doc;
    doc["mini"]     = miniIndex_;
    doc["shelf"]    = shelf_;
    doc["location"] = location_;

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

    // ── Highlight Miniature ───────────────────────────────────────────────────
    {
        JsonDocument doc;
        doc["name"]            = "Highlight Miniature";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_mini";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/mini/set");
        doc["value_template"]  = "{{ value_json.mini }}";
        doc["min"]             = 0;
        doc["max"]             = 500;
        doc["step"]            = 1;
        doc["mode"]            = "slider";
        doc["icon"]            = "mdi:account-search";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "number", "highlight_mini").c_str(), payload.c_str(), true);
    }

    // ── Highlight Shelf ───────────────────────────────────────────────────────
    {
        JsonDocument doc;
        doc["name"]            = "Highlight Shelf";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_shelf";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/shelf/set");
        doc["value_template"]  = "{{ value_json.shelf }}";
        doc["min"]             = 0;
        doc["max"]             = 10;
        doc["step"]            = 1;
        doc["mode"]            = "slider";
        doc["icon"]            = "mdi:bookshelf";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "number", "highlight_shelf").c_str(), payload.c_str(), true);
    }

    // ── Highlight Location ────────────────────────────────────────────────────
    {
        JsonDocument doc;
        doc["name"]            = "Highlight Location";
        doc["unique_id"]       = String(config_.deviceId) + "_highlight_location";
        doc["state_topic"]     = stateTopic;
        doc["command_topic"]   = MqttUtils::topic(config_, "/ha/highlight/location/set");
        doc["value_template"]  = "{{ value_json.location }}";
        doc["min"]             = 0;
        doc["max"]             = 50;
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
