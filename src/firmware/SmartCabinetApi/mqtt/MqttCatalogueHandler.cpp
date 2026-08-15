#include "MqttCatalogueHandler.h"
#include "MqttUtils.h"

#include <ArduinoJson.h>

#include "../miniatures/MiniatureJson.h"

MqttCatalogueHandler::MqttCatalogueHandler(
    CatalogueRepository& catalogue,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : catalogue_(catalogue),
      mqtt_(mqtt),
      config_(config) {}

bool MqttCatalogueHandler::handleCommand(
    const char* action,
    ArduinoJson::JsonDocument& doc
) {
    if (strcmp(action, "getMiniatures") == 0) {
        publishMiniatures();
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    if (strcmp(action, "getMiniature") == 0) {
        const char* id = doc["id"] | "";
        if (strlen(id) == 0) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "id_required");
            return true;
        }
        const Miniature* item = catalogue_.findById(id);
        if (!item) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "miniature_not_found");
            return true;
        }
        publishSingle(*item);
        MqttUtils::publishResult(mqtt_, config_, true, action, nullptr, item->id.c_str());
        return true;
    }

    if (strcmp(action, "createMiniature") == 0 ||
        strcmp(action, "updateMiniature") == 0) {
        String name, collection, artist, date, notes, fieldError;
        uint16_t shelf = 0, location = 0;

        if (!readFields(doc, name, collection, artist, date, shelf, location, notes, fieldError)) {
            MqttUtils::publishResult(mqtt_, config_, false, action, fieldError.c_str());
            return true;
        }

        if (strcmp(action, "createMiniature") == 0) {
            Miniature created;
            String error;
            const bool ok = catalogue_.create(name, collection, artist, date, shelf, location, notes, created, error);
            MqttUtils::publishResult(mqtt_, config_, ok, action,
                ok ? nullptr : error.c_str(),
                ok ? created.id.c_str() : nullptr);
            return true;
        }

        const char* id = doc["id"] | "";
        if (strlen(id) == 0) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "id_required");
            return true;
        }
        Miniature updated;
        String error;
        const bool ok = catalogue_.update(id, name, collection, artist, date, shelf, location, notes, updated, error);
        MqttUtils::publishResult(mqtt_, config_, ok, action,
            ok ? nullptr : error.c_str(),
            ok ? updated.id.c_str() : nullptr);
        return true;
    }

    if (strcmp(action, "deleteMiniature") == 0) {
        const char* id = doc["id"] | "";
        if (strlen(id) == 0) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "id_required");
            return true;
        }
        String error;
        const bool ok = catalogue_.remove(id, error);
        MqttUtils::publishResult(mqtt_, config_, ok, action,
            ok ? nullptr : error.c_str(),
            ok ? id : nullptr);
        return true;
    }

    return false;
}

void MqttCatalogueHandler::publishMiniatures() {
    if (!mqtt_.connected()) return;

    JsonDocument doc;
    const std::vector<Miniature>& items = catalogue_.all();
    doc["count"] = items.size();
    JsonArray array = doc["items"].to<JsonArray>();
    for (const Miniature& item : items) {
        JsonObject obj = array.add<JsonObject>();
        MiniatureJson::writeItem(obj, item);
    }

    String payload;
    serializeJson(doc, payload);

    mqtt_.publish(
        MqttUtils::topic(config_, "/api/miniatures").c_str(),
        payload.c_str(),
        true
    );
}

void MqttCatalogueHandler::publishDiscovery() {
    JsonDocument doc;
    doc["name"]                    = "Miniatures";
    doc["unique_id"]               = String(config_.deviceId) + "_miniatures";
    doc["default_entity_id"]       = "sensor.smart_cabinet_miniatures";
    doc["state_topic"]             = MqttUtils::topic(config_, "/api/miniatures");
    doc["value_template"]          = "{{ value_json.count }}";
    doc["json_attributes_topic"]   = MqttUtils::topic(config_, "/api/miniatures");
    doc["icon"]                    = "mdi:chess-pawn";
    doc["unit_of_measurement"]     = "items";
    MqttUtils::addAvailability(doc, config_);
    MqttUtils::addDeviceInfo(doc, config_);

    String payload;
    serializeJson(doc, payload);

    mqtt_.publish(
        MqttUtils::discoveryTopic(config_, "sensor", "miniatures").c_str(),
        payload.c_str(),
        true
    );
}

void MqttCatalogueHandler::publishSingle(const Miniature& item) {
    if (!mqtt_.connected()) return;

    JsonDocument doc;
    JsonObject obj = doc["item"].to<JsonObject>();
    MiniatureJson::writeItem(obj, item);

    String payload;
    serializeJson(doc, payload);

    mqtt_.publish(
        MqttUtils::topic(config_, "/api/miniature").c_str(),
        payload.c_str(),
        false
    );
}

bool MqttCatalogueHandler::readFields(
    ArduinoJson::JsonDocument& doc,
    String& name,
    String& collection,
    String& artist,
    String& date,
    uint16_t& shelf,
    uint16_t& location,
    String& notes,
    String& error
) {
    const char* rawName       = doc["name"]       | "";
    const char* rawCollection = doc["collection"] | "";
    const char* rawArtist     = doc["artist"]     | "";
    const char* rawDate       = doc["date"]       | "";
    const char* rawNotes      = doc["notes"]      | "";

    if (strlen(rawName) == 0 ||
        !doc["shelf"].is<int>() ||
        !doc["location"].is<int>()) {
        error = "name_shelf_and_location_are_required";
        return false;
    }

    const int rawShelf    = doc["shelf"].as<int>();
    const int rawLocation = doc["location"].as<int>();

    const bool unassigned = rawShelf == 0 && rawLocation == 0;
    const bool assigned = rawShelf > 0 && rawLocation > 0;
    if ((!unassigned && !assigned) || rawShelf > 65535 || rawLocation > 65535) {
        error = "position_must_be_unassigned_or_1_based";
        return false;
    }

    name       = rawName;
    collection = rawCollection;
    artist     = rawArtist;
    date       = rawDate;
    shelf      = static_cast<uint16_t>(rawShelf);
    location   = static_cast<uint16_t>(rawLocation);
    notes      = rawNotes;

    return true;
}
