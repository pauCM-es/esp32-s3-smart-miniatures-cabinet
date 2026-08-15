#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "MqttApiConfig.h"

namespace MqttUtils {

inline String topic(const MqttApiConfig& config, const char* suffix) {
    String out(config.baseTopic);
    out += suffix;
    return out;
}

inline String discoveryTopic(
    const MqttApiConfig& config,
    const char* component,
    const char* objectId
) {
    String out = "homeassistant/";
    out += component;
    out += "/";
    out += config.deviceId;
    out += "/";
    out += objectId;
    out += "/config";
    return out;
}

inline bool payloadEquals(
    const uint8_t* payload,
    unsigned int length,
    const char* expected
) {
    const size_t n = strlen(expected);
    return length == n && memcmp(payload, expected, n) == 0;
}

inline void addDeviceInfo(
    JsonDocument& doc,
    const MqttApiConfig& config
) {
    JsonObject device = doc["device"].to<JsonObject>();
    JsonArray identifiers = device["identifiers"].to<JsonArray>();
    identifiers.add(config.deviceId);
    device["name"] = config.deviceName;
    device["manufacturer"] = "DIY";
    device["model"] = "Smart Miniature Cabinet";
}

inline void addAvailability(
    JsonDocument& doc,
    const MqttApiConfig& config
) {
    doc["availability_topic"] = topic(config, "/availability");
    doc["payload_available"] = "online";
    doc["payload_not_available"] = "offline";
}

inline void publishResult(
    PubSubClient& mqtt,
    const MqttApiConfig& config,
    bool ok,
    const char* action,
    const char* error = nullptr,
    const char* id = nullptr
) {
    if (!mqtt.connected()) return;

    JsonDocument doc;
    doc["ok"] = ok;
    doc["action"] = action;
    if (error) doc["error"] = error;
    if (id)    doc["id"] = id;

    String payload;
    serializeJson(doc, payload);

    mqtt.publish(topic(config, "/api/result").c_str(), payload.c_str(), false);
}

} // namespace MqttUtils
