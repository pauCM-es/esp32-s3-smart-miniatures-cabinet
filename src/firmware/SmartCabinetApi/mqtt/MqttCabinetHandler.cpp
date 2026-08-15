#include "MqttCabinetHandler.h"
#include "MqttUtils.h"

#include <ArduinoJson.h>
#include <cstdlib>

MqttCabinetHandler::MqttCabinetHandler(
    SmartCabinetService& smartCabinet,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : smartCabinet_(smartCabinet),
      mqtt_(mqtt),
      config_(config) {}

bool MqttCabinetHandler::handleCommand(
    const char* action,
    ArduinoJson::JsonDocument& doc
) {
    if (strcmp(action, "setPower") == 0) {
        if (!doc["value"].is<bool>()) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "value_must_be_boolean");
            return true;
        }
        smartCabinet_.setPower(doc["value"].as<bool>());
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    if (strcmp(action, "setBrightness") == 0) {
        if (!doc["value"].is<int>()) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "value_must_be_integer");
            return true;
        }
        const int value = doc["value"].as<int>();
        if (value < 0 || value > 100) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "brightness_out_of_range");
            return true;
        }
        smartCabinet_.setBrightness(static_cast<uint8_t>(value));
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    if (strcmp(action, "setHighlightColor") == 0) {
        if (!doc["r"].is<int>() || !doc["g"].is<int>() || !doc["b"].is<int>()) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "rgb_required");
            return true;
        }
        const int r = doc["r"].as<int>();
        const int g = doc["g"].as<int>();
        const int b = doc["b"].as<int>();
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "rgb_out_of_range");
            return true;
        }
        smartCabinet_.setHighlightColor(r, g, b);
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    if (strcmp(action, "clearHighlight") == 0) {
        smartCabinet_.clearHighlight();
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    if (strcmp(action, "highlightLocations") == 0) {
        JsonArrayConst locations = doc["locations"].as<JsonArrayConst>();
        if (locations.isNull()) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "locations_required");
            return true;
        }
        smartCabinet_.clearHighlight();
        bool any = false;
        for (JsonObjectConst item : locations) {
            const int shelf = item["shelf"] | 0;
            const int location = item["location"] | 0;
            if (shelf > 0 && location > 0 && shelf <= 65535 && location <= 65535) {
                any |= smartCabinet_.appendHighlightLocation(
                    static_cast<uint16_t>(shelf), static_cast<uint16_t>(location)
                );
            }
        }
        MqttUtils::publishResult(mqtt_, config_, any, action, any ? nullptr : "no_assigned_locations");
        return true;
    }

    if (strcmp(action, "highlightLocation") == 0) {
        if (!doc["shelf"].is<int>() || !doc["location"].is<int>()) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "shelf_and_location_must_be_integers");
            return true;
        }
        const int shelf    = doc["shelf"].as<int>();
        const int location = doc["location"].as<int>();
        if (shelf <= 0 || location <= 0 || shelf > 65535 || location > 65535) {
            MqttUtils::publishResult(mqtt_, config_, false, action, "shelf_and_location_are_1_based");
            return true;
        }
        const bool ok = smartCabinet_.highlightLocation(
            static_cast<uint16_t>(shelf),
            static_cast<uint16_t>(location)
        );
        MqttUtils::publishResult(mqtt_, config_, ok, action, ok ? nullptr : "invalid_location");
        return true;
    }

    return false;
}

void MqttCabinetHandler::handlePowerSet(
    const uint8_t* payload,
    unsigned int length
) {
    if (MqttUtils::payloadEquals(payload, length, "ON")   ||
        MqttUtils::payloadEquals(payload, length, "1")    ||
        MqttUtils::payloadEquals(payload, length, "true")) {
        smartCabinet_.setPower(true);
        MqttUtils::publishResult(mqtt_, config_, true, "setPower");
        return;
    }
    if (MqttUtils::payloadEquals(payload, length, "OFF")   ||
        MqttUtils::payloadEquals(payload, length, "0")     ||
        MqttUtils::payloadEquals(payload, length, "false")) {
        smartCabinet_.setPower(false);
        MqttUtils::publishResult(mqtt_, config_, true, "setPower");
        return;
    }
    MqttUtils::publishResult(mqtt_, config_, false, "setPower", "invalid_power_payload");
}

void MqttCabinetHandler::handleBrightnessSet(
    const uint8_t* payload,
    unsigned int length
) {
    String value;
    value.reserve(length + 1);
    for (unsigned int i = 0; i < length; ++i) {
        value += static_cast<char>(payload[i]);
    }
    char* end = nullptr;
    const long brightness = strtol(value.c_str(), &end, 10);
    if (end == value.c_str() || *end != '\0' || brightness < 0 || brightness > 100) {
        MqttUtils::publishResult(mqtt_, config_, false, "setBrightness", "brightness_must_be_0_to_100");
        return;
    }
    smartCabinet_.setBrightness(static_cast<uint8_t>(brightness));
    MqttUtils::publishResult(mqtt_, config_, true, "setBrightness");
}

void MqttCabinetHandler::publishState() {
    if (!mqtt_.connected()) return;

    const CabinetRuntimeState& state = smartCabinet_.state();

    JsonDocument doc;
    doc["power"]              = state.power;
    doc["brightness"]         = state.brightness;
    doc["has_highlight"]      = state.hasHighlight;
    doc["highlight_shelf"]    = state.highlightShelf;
    doc["highlight_location"] = state.highlightLocation;
    JsonObject highlightColor = doc["highlight_color"].to<JsonObject>();
    highlightColor["r"] = state.highlightR;
    highlightColor["g"] = state.highlightG;
    highlightColor["b"] = state.highlightB;

    String payload;
    serializeJson(doc, payload);

    mqtt_.publish(
        MqttUtils::topic(config_, "/api/state").c_str(),
        payload.c_str(),
        true
    );
}

void MqttCabinetHandler::publishDiscovery() {
    // Power switch
    {
        JsonDocument doc;
        doc["name"]               = "Power";
        doc["unique_id"]          = String(config_.deviceId) + "_power";
        doc["default_entity_id"]  = "switch.smart_cabinet_power";
        doc["state_topic"]        = MqttUtils::topic(config_, "/api/state");
        doc["command_topic"]      = MqttUtils::topic(config_, "/ha/power/set");
        doc["payload_on"]         = "ON";
        doc["payload_off"]        = "OFF";
        doc["value_template"]     = "{{ 'ON' if value_json.power else 'OFF' }}";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "switch", "power").c_str(), payload.c_str(), true);
    }
    // Brightness number
    {
        JsonDocument doc;
        doc["name"]                = "Brightness";
        doc["unique_id"]           = String(config_.deviceId) + "_brightness";
        doc["default_entity_id"]   = "number.smart_cabinet_brightness";
        doc["state_topic"]         = MqttUtils::topic(config_, "/api/state");
        doc["command_topic"]       = MqttUtils::topic(config_, "/ha/brightness/set");
        doc["value_template"]      = "{{ value_json.brightness }}";
        doc["min"]                 = 0;
        doc["max"]                 = 100;
        doc["step"]                = 1;
        doc["mode"]                = "slider";
        doc["unit_of_measurement"] = "%";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "number", "brightness").c_str(), payload.c_str(), true);
    }
    // Last-highlight sensor
    {
        JsonDocument doc;
        doc["name"]              = "Last Highlight";
        doc["unique_id"]         = String(config_.deviceId) + "_last_highlight";
        doc["default_entity_id"] = "sensor.smart_cabinet_last_highlight";
        doc["state_topic"]       = MqttUtils::topic(config_, "/api/state");
        doc["value_template"]    =
            "{% if value_json.has_highlight %}"
            "Shelf {{ value_json.highlight_shelf }} / "
            "Location {{ value_json.highlight_location }}"
            "{% else %}None{% endif %}";
        doc["icon"] = "mdi:spotlight-beam";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(MqttUtils::discoveryTopic(config_, "sensor", "last_highlight").c_str(), payload.c_str(), true);
    }
}
