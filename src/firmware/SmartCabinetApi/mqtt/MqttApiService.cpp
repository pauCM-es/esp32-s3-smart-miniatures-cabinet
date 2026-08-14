#include "MqttApiService.h"

#include <ArduinoJson.h>
#include <cstdlib>

#include "../miniatures/MiniatureJson.h"

namespace {

constexpr const char* HA_STATUS_TOPIC = "homeassistant/status";

bool payloadEquals(
    const uint8_t* payload,
    unsigned int length,
    const char* expected
) {
    const size_t expectedLength = strlen(expected);

    return length == expectedLength &&
           memcmp(payload, expected, expectedLength) == 0;
}

}

MqttApiService::MqttApiService(
    Client& networkClient,
    const MqttApiConfig& config,
    SmartCabinetService& smartCabinet,
    CatalogueRepository& miniatures
)
    : config_(config),
      smartCabinet_(smartCabinet),
      miniatures_(miniatures),
      mqtt_(networkClient) {

    smartCabinet_.setStateChangedCallback(
        [this](const CabinetRuntimeState&) {
            if (mqtt_.connected()) {
                publishState();
            }
        }
    );

    miniatures_.setChangedCallback(
        [this](const std::vector<Miniature>&) {
            if (mqtt_.connected()) {
                publishMiniatures();
            }
        }
    );
}

void MqttApiService::begin() {
    mqtt_.setServer(config_.host, config_.port);
    mqtt_.setBufferSize(config_.packetBufferSize);

    mqtt_.setCallback(
        [this](char* topic, uint8_t* payload, unsigned int length) {
            handleMessage(topic, payload, length);
        }
    );

    ensureConnected();
}

void MqttApiService::loop() {
    if (!mqtt_.connected()) {
        const uint32_t now = millis();

        if (
            lastReconnectAttemptMs_ == 0 ||
            static_cast<uint32_t>(now - lastReconnectAttemptMs_) >=
                config_.reconnectIntervalMs
        ) {
            lastReconnectAttemptMs_ = now;
            ensureConnected();
        }

        return;
    }

    mqtt_.loop();
}

bool MqttApiService::connected() {
    return mqtt_.connected();
}

bool MqttApiService::ensureConnected() {
    if (mqtt_.connected()) {
        return true;
    }

    if (config_.host == nullptr || strlen(config_.host) == 0) {
        return false;
    }

    const String availabilityTopic = topic("/availability");

    String clientId = "smart-cabinet-";
    clientId += config_.deviceId;

    bool ok = false;

    if (
        config_.username != nullptr &&
        strlen(config_.username) > 0
    ) {
        ok = mqtt_.connect(
            clientId.c_str(),
            config_.username,
            config_.password,
            availabilityTopic.c_str(),
            0,
            true,
            "offline"
        );
    } else {
        ok = mqtt_.connect(
            clientId.c_str(),
            availabilityTopic.c_str(),
            0,
            true,
            "offline"
        );
    }

    if (!ok) {
        return false;
    }

    lastReconnectAttemptMs_ = 0;

    subscribeTopics();

    mqtt_.publish(
        availabilityTopic.c_str(),
        "online",
        true
    );

    publishDiscovery();
    publishState();
    publishMiniatures();

    return true;
}

void MqttApiService::subscribeTopics() {
    const String apiCommand = topic("/api/command");
    const String powerCommand = topic("/ha/power/set");
    const String brightnessCommand = topic("/ha/brightness/set");

    mqtt_.subscribe(apiCommand.c_str());
    mqtt_.subscribe(powerCommand.c_str());
    mqtt_.subscribe(brightnessCommand.c_str());
    mqtt_.subscribe(HA_STATUS_TOPIC);
}

void MqttApiService::handleMessage(
    char* receivedTopic,
    uint8_t* payload,
    unsigned int length
) {
    const String incoming(receivedTopic);

    if (incoming == HA_STATUS_TOPIC) {
        if (payloadEquals(payload, length, "online")) {
            publishDiscovery();
            publishState();
            publishMiniatures();
        }

        return;
    }

    if (incoming == topic("/api/command")) {
        handleApiCommand(payload, length);
        return;
    }

    if (incoming == topic("/ha/power/set")) {
        handlePowerCommand(payload, length);
        return;
    }

    if (incoming == topic("/ha/brightness/set")) {
        handleBrightnessCommand(payload, length);
    }
}

void MqttApiService::handleApiCommand(
    uint8_t* payload,
    unsigned int length
) {
    JsonDocument doc;
    const DeserializationError parseError =
        deserializeJson(doc, payload, length);

    if (parseError) {
        publishResult(false, "unknown", "invalid_json");
        return;
    }

    const char* action = doc["action"] | "";

    if (strcmp(action, "setPower") == 0) {
        if (!doc["value"].is<bool>()) {
            publishResult(
                false,
                action,
                "value_must_be_boolean"
            );
            return;
        }

        smartCabinet_.setPower(doc["value"].as<bool>());
        publishResult(true, action);
        return;
    }

    if (strcmp(action, "setBrightness") == 0) {
        if (!doc["value"].is<int>()) {
            publishResult(
                false,
                action,
                "value_must_be_integer"
            );
            return;
        }

        const int value = doc["value"].as<int>();

        if (value < 0 || value > 100) {
            publishResult(
                false,
                action,
                "brightness_out_of_range"
            );
            return;
        }

        smartCabinet_.setBrightness(
            static_cast<uint8_t>(value)
        );

        publishResult(true, action);
        return;
    }

    if (strcmp(action, "highlightLocation") == 0) {
        if (
            !doc["shelf"].is<int>() ||
            !doc["location"].is<int>()
        ) {
            publishResult(
                false,
                action,
                "shelf_and_location_must_be_integers"
            );
            return;
        }

        const int shelf = doc["shelf"].as<int>();
        const int location = doc["location"].as<int>();

        if (
            shelf <= 0 ||
            location <= 0 ||
            shelf > 65535 ||
            location > 65535
        ) {
            publishResult(
                false,
                action,
                "shelf_and_location_are_1_based"
            );
            return;
        }

        const bool ok = smartCabinet_.highlightLocation(
            static_cast<uint16_t>(shelf),
            static_cast<uint16_t>(location)
        );

        publishResult(
            ok,
            action,
            ok ? nullptr : "invalid_location"
        );
        return;
    }

    if (strcmp(action, "getMiniatures") == 0) {
        publishMiniatures();
        publishResult(true, action);
        return;
    }

    if (strcmp(action, "getMiniature") == 0) {
        const char* id = doc["id"] | "";

        if (strlen(id) == 0) {
            publishResult(false, action, "id_required");
            return;
        }

        const Miniature* item =
            miniatures_.findById(id);

        if (item == nullptr) {
            publishResult(
                false,
                action,
                "miniature_not_found"
            );
            return;
        }

        publishSingleMiniature(*item);
        publishResult(true, action, nullptr, item->id.c_str());
        return;
    }

    if (
        strcmp(action, "createMiniature") == 0 ||
        strcmp(action, "updateMiniature") == 0
    ) {
        String name;
        String collection;
        String artist;
        String date;
        String notes;
        String fieldError;
        uint16_t shelf = 0;
        uint16_t location = 0;

        if (
            !readMiniatureFields(
                doc,
                name,
                collection,
                artist,
                date,
                shelf,
                location,
                notes,
                fieldError
            )
        ) {
            publishResult(
                false,
                action,
                fieldError.c_str()
            );
            return;
        }

        if (strcmp(action, "createMiniature") == 0) {
            Miniature created;
            String error;

            const bool ok = miniatures_.create(
                name,
                collection,
                artist,
                date,
                shelf,
                location,
                notes,
                created,
                error
            );

            publishResult(
                ok,
                action,
                ok ? nullptr : error.c_str(),
                ok ? created.id.c_str() : nullptr
            );
            return;
        }

        const char* id = doc["id"] | "";

        if (strlen(id) == 0) {
            publishResult(false, action, "id_required");
            return;
        }

        Miniature updated;
        String error;

        const bool ok = miniatures_.update(
            id,
            name,
            collection,
            artist,
            date,
            shelf,
            location,
            notes,
            updated,
            error
        );

        publishResult(
            ok,
            action,
            ok ? nullptr : error.c_str(),
            ok ? updated.id.c_str() : nullptr
        );
        return;
    }

    if (strcmp(action, "deleteMiniature") == 0) {
        const char* id = doc["id"] | "";

        if (strlen(id) == 0) {
            publishResult(false, action, "id_required");
            return;
        }

        String error;
        const bool ok = miniatures_.remove(id, error);

        publishResult(
            ok,
            action,
            ok ? nullptr : error.c_str(),
            ok ? id : nullptr
        );
        return;
    }

    publishResult(false, action, "unknown_action");
}

void MqttApiService::handlePowerCommand(
    uint8_t* payload,
    unsigned int length
) {
    if (
        payloadEquals(payload, length, "ON") ||
        payloadEquals(payload, length, "1") ||
        payloadEquals(payload, length, "true")
    ) {
        smartCabinet_.setPower(true);
        publishResult(true, "setPower");
        return;
    }

    if (
        payloadEquals(payload, length, "OFF") ||
        payloadEquals(payload, length, "0") ||
        payloadEquals(payload, length, "false")
    ) {
        smartCabinet_.setPower(false);
        publishResult(true, "setPower");
        return;
    }

    publishResult(
        false,
        "setPower",
        "invalid_power_payload"
    );
}

void MqttApiService::handleBrightnessCommand(
    uint8_t* payload,
    unsigned int length
) {
    String value;
    value.reserve(length + 1);

    for (unsigned int i = 0; i < length; ++i) {
        value += static_cast<char>(payload[i]);
    }

    char* end = nullptr;
    const long brightness =
        strtol(value.c_str(), &end, 10);

    if (
        end == value.c_str() ||
        *end != '\0' ||
        brightness < 0 ||
        brightness > 100
    ) {
        publishResult(
            false,
            "setBrightness",
            "brightness_must_be_0_to_100"
        );
        return;
    }

    smartCabinet_.setBrightness(
        static_cast<uint8_t>(brightness)
    );

    publishResult(true, "setBrightness");
}

bool MqttApiService::readMiniatureFields(
    JsonDocument& doc,
    String& name,
    String& collection,
    String& artist,
    String& date,
    uint16_t& shelf,
    uint16_t& location,
    String& notes,
    String& error
) {
    const char* rawName = doc["name"] | "";
    const char* rawNotes = doc["notes"] | "";
    const char* rawCollection = doc["collection"] | "";
    const char* rawArtist = doc["artist"] | "";
    const char* rawDate = doc["date"] | "";

    if (
        strlen(rawName) == 0 ||
        !doc["shelf"].is<int>() ||
        !doc["location"].is<int>()
    ) {
        error =
            "name_shelf_and_location_are_required";
        return false;
    }

    const int rawShelf = doc["shelf"].as<int>();
    const int rawLocation = doc["location"].as<int>();

    if (
        rawShelf <= 0 ||
        rawLocation <= 0 ||
        rawShelf > 65535 ||
        rawLocation > 65535
    ) {
        error = "shelf_and_location_are_1_based";
        return false;
    }

    name = rawName;
    collection = rawCollection;
    artist = rawArtist;
    date = rawDate;
    shelf = static_cast<uint16_t>(rawShelf);
    location = static_cast<uint16_t>(rawLocation);
    notes = rawNotes;

    return true;
}

void MqttApiService::publishState() {
    if (!mqtt_.connected()) {
        return;
    }

    const CabinetRuntimeState& state =
        smartCabinet_.state();

    JsonDocument doc;
    doc["power"] = state.power;
    doc["brightness"] = state.brightness;
    doc["has_highlight"] = state.hasHighlight;
    doc["highlight_shelf"] = state.highlightShelf;
    doc["highlight_location"] =
        state.highlightLocation;

    String payload;
    serializeJson(doc, payload);

    const String stateTopic = topic("/api/state");

    mqtt_.publish(
        stateTopic.c_str(),
        payload.c_str(),
        true
    );
}

void MqttApiService::publishMiniatures() {
    if (!mqtt_.connected()) {
        return;
    }

    JsonDocument doc;
    const std::vector<Miniature>& items =
        miniatures_.all();

    doc["count"] = items.size();

    JsonArray array = doc["items"].to<JsonArray>();

    for (const Miniature& item : items) {
        JsonObject object = array.add<JsonObject>();
        MiniatureJson::writeItem(object, item);
    }

    String payload;
    serializeJson(doc, payload);

    const String miniaturesTopic =
        topic("/api/miniatures");

    mqtt_.publish(
        miniaturesTopic.c_str(),
        payload.c_str(),
        true
    );
}

void MqttApiService::publishSingleMiniature(
    const Miniature& item
) {
    if (!mqtt_.connected()) {
        return;
    }

    JsonDocument doc;
    JsonObject object = doc["item"].to<JsonObject>();
    MiniatureJson::writeItem(object, item);

    String payload;
    serializeJson(doc, payload);

    const String miniatureTopic =
        topic("/api/miniature");

    mqtt_.publish(
        miniatureTopic.c_str(),
        payload.c_str(),
        false
    );
}

void MqttApiService::publishResult(
    bool ok,
    const char* action,
    const char* error,
    const char* id
) {
    if (!mqtt_.connected()) {
        return;
    }

    JsonDocument doc;
    doc["ok"] = ok;
    doc["action"] = action;

    if (error != nullptr) {
        doc["error"] = error;
    }

    if (id != nullptr) {
        doc["id"] = id;
    }

    String payload;
    serializeJson(doc, payload);

    const String resultTopic = topic("/api/result");

    mqtt_.publish(
        resultTopic.c_str(),
        payload.c_str(),
        false
    );
}

void MqttApiService::publishDiscovery() {
    if (!mqtt_.connected()) {
        return;
    }

    publishPowerDiscovery();
    publishBrightnessDiscovery();
    publishHighlightDiscovery();
    publishMiniaturesDiscovery();
}

void MqttApiService::publishPowerDiscovery() {
    JsonDocument doc;

    doc["name"] = "Power";
    doc["unique_id"] =
        String(config_.deviceId) + "_power";
    doc["default_entity_id"] =
        "switch.smart_cabinet_power";

    doc["state_topic"] = topic("/api/state");
    doc["command_topic"] = topic("/ha/power/set");
    doc["payload_on"] = "ON";
    doc["payload_off"] = "OFF";
    doc["value_template"] =
        "{{ 'ON' if value_json.power else 'OFF' }}";

    doc["availability_topic"] =
        topic("/availability");
    doc["payload_available"] = "online";
    doc["payload_not_available"] = "offline";

    JsonObject device = doc["device"].to<JsonObject>();
    JsonArray identifiers =
        device["identifiers"].to<JsonArray>();
    identifiers.add(config_.deviceId);

    device["name"] = config_.deviceName;
    device["manufacturer"] = "DIY";
    device["model"] = "Smart Miniature Cabinet";

    String payload;
    serializeJson(doc, payload);

    const String configTopic =
        discoveryTopic("switch", "power");

    mqtt_.publish(
        configTopic.c_str(),
        payload.c_str(),
        true
    );
}

void MqttApiService::publishBrightnessDiscovery() {
    JsonDocument doc;

    doc["name"] = "Brightness";
    doc["unique_id"] =
        String(config_.deviceId) + "_brightness";
    doc["default_entity_id"] =
        "number.smart_cabinet_brightness";

    doc["state_topic"] = topic("/api/state");
    doc["command_topic"] =
        topic("/ha/brightness/set");
    doc["value_template"] =
        "{{ value_json.brightness }}";

    doc["min"] = 0;
    doc["max"] = 100;
    doc["step"] = 1;
    doc["mode"] = "slider";
    doc["unit_of_measurement"] = "%";

    doc["availability_topic"] =
        topic("/availability");
    doc["payload_available"] = "online";
    doc["payload_not_available"] = "offline";

    JsonObject device = doc["device"].to<JsonObject>();
    JsonArray identifiers =
        device["identifiers"].to<JsonArray>();
    identifiers.add(config_.deviceId);

    device["name"] = config_.deviceName;
    device["manufacturer"] = "DIY";
    device["model"] = "Smart Miniature Cabinet";

    String payload;
    serializeJson(doc, payload);

    const String configTopic =
        discoveryTopic("number", "brightness");

    mqtt_.publish(
        configTopic.c_str(),
        payload.c_str(),
        true
    );
}

void MqttApiService::publishHighlightDiscovery() {
    JsonDocument doc;

    doc["name"] = "Last Highlight";
    doc["unique_id"] =
        String(config_.deviceId) + "_last_highlight";
    doc["default_entity_id"] =
        "sensor.smart_cabinet_last_highlight";

    doc["state_topic"] = topic("/api/state");
    doc["value_template"] =
        "{% if value_json.has_highlight %}"
        "Shelf {{ value_json.highlight_shelf }} / "
        "Location {{ value_json.highlight_location }}"
        "{% else %}None{% endif %}";
    doc["icon"] = "mdi:spotlight-beam";

    doc["availability_topic"] =
        topic("/availability");
    doc["payload_available"] = "online";
    doc["payload_not_available"] = "offline";

    JsonObject device = doc["device"].to<JsonObject>();
    JsonArray identifiers =
        device["identifiers"].to<JsonArray>();
    identifiers.add(config_.deviceId);

    device["name"] = config_.deviceName;
    device["manufacturer"] = "DIY";
    device["model"] = "Smart Miniature Cabinet";

    String payload;
    serializeJson(doc, payload);

    const String configTopic =
        discoveryTopic("sensor", "last_highlight");

    mqtt_.publish(
        configTopic.c_str(),
        payload.c_str(),
        true
    );
}

void MqttApiService::publishMiniaturesDiscovery() {
    JsonDocument doc;

    doc["name"] = "Miniatures";
    doc["unique_id"] =
        String(config_.deviceId) + "_miniatures";
    doc["default_entity_id"] =
        "sensor.smart_cabinet_miniatures";

    doc["state_topic"] = topic("/api/miniatures");
    doc["value_template"] = "{{ value_json.count }}";
    doc["json_attributes_topic"] =
        topic("/api/miniatures");
    doc["icon"] = "mdi:chess-pawn";
    doc["unit_of_measurement"] = "items";

    doc["availability_topic"] =
        topic("/availability");
    doc["payload_available"] = "online";
    doc["payload_not_available"] = "offline";

    JsonObject device = doc["device"].to<JsonObject>();
    JsonArray identifiers =
        device["identifiers"].to<JsonArray>();
    identifiers.add(config_.deviceId);

    device["name"] = config_.deviceName;
    device["manufacturer"] = "DIY";
    device["model"] = "Smart Miniature Cabinet";

    String payload;
    serializeJson(doc, payload);

    const String configTopic =
        discoveryTopic("sensor", "miniatures");

    mqtt_.publish(
        configTopic.c_str(),
        payload.c_str(),
        true
    );
}

String MqttApiService::topic(
    const char* suffix
) const {
    String output(config_.baseTopic);
    output += suffix;
    return output;
}

String MqttApiService::discoveryTopic(
    const char* component,
    const char* objectId
) const {
    String output = "homeassistant/";
    output += component;
    output += "/";
    output += config_.deviceId;
    output += "/";
    output += objectId;
    output += "/config";

    return output;
}
