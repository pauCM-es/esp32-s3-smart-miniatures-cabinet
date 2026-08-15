#include "MqttOtaHandler.h"

#include <ArduinoJson.h>

#include "MqttUtils.h"
#include "app_config.h"

MqttOtaHandler::MqttOtaHandler(
    smartcabinet::OtaService& ota,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : ota_(ota), mqtt_(mqtt), config_(config) {}

bool MqttOtaHandler::handleCommand(
    const char* action,
    ArduinoJson::JsonDocument& doc
) {
    if (strcmp(action, "enableOta") == 0) {
        uint32_t timeoutMs = smartcabinet::kDefaultOtaTimeoutMs;
        if (doc["timeout"].is<int>()) {
            const int requested = doc["timeout"].as<int>();
            if (requested > 0) {
                const uint32_t clamped = static_cast<uint32_t>(
                    requested > 300 ? 300 : requested
                );
                timeoutMs = clamped * 1000U;
            }
        }
        ota_.enable(timeoutMs);
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    if (strcmp(action, "disableOta") == 0) {
        ota_.disable();
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }

    return false;
}

void MqttOtaHandler::publishState() {
    if (!mqtt_.connected()) return;

    JsonDocument doc;
    doc["version"] = kFirmwareVersion;

    JsonObject ota = doc["ota"].to<JsonObject>();
    ota["enabled"]    = ota_.isEnabled();
    ota["updating"]   = ota_.isUpdating();
    ota["expires_in"] = static_cast<uint32_t>(ota_.remainingMs(millis()) / 1000U);
    ota["hostname"]   = String(smartcabinet::kOtaHostname) + ".local";

    String payload;
    serializeJson(doc, payload);
    mqtt_.publish(
        MqttUtils::topic(config_, "/firmware/state").c_str(),
        payload.c_str(),
        true
    );
}

void MqttOtaHandler::publishDiscovery() {
    if (!mqtt_.connected()) return;

    // Firmware version sensor
    {
        JsonDocument doc;
        doc["name"]              = "Firmware Version";
        doc["unique_id"]         = String(config_.deviceId) + "_firmware_version";
        doc["state_topic"]       = MqttUtils::topic(config_, "/firmware/state");
        doc["value_template"]    = "{{ value_json.version }}";
        doc["icon"]              = "mdi:chip";
        doc["entity_category"]   = "diagnostic";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(
            MqttUtils::discoveryTopic(config_, "sensor", "firmware_version").c_str(),
            payload.c_str(),
            true
        );
    }

    // OTA state sensor
    {
        JsonDocument doc;
        doc["name"]              = "OTA State";
        doc["unique_id"]         = String(config_.deviceId) + "_ota_state";
        doc["state_topic"]       = MqttUtils::topic(config_, "/firmware/state");
        doc["value_template"]    = "{{ 'active' if value_json.ota.enabled else 'inactive' }}";
        doc["icon"]              = "mdi:update";
        doc["entity_category"]   = "diagnostic";
        MqttUtils::addAvailability(doc, config_);
        MqttUtils::addDeviceInfo(doc, config_);
        String payload;
        serializeJson(doc, payload);
        mqtt_.publish(
            MqttUtils::discoveryTopic(config_, "sensor", "ota_state").c_str(),
            payload.c_str(),
            true
        );
    }
}
