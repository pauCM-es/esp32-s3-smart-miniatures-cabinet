#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "firmware/ota/OtaService.h"
#include "MqttApiConfig.h"

class MqttOtaHandler {
public:
    MqttOtaHandler(
        smartcabinet::OtaService& ota,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    // Returns true if the action was handled.
    bool handleCommand(const char* action, ArduinoJson::JsonDocument& doc);

    void publishState();
    void publishDiscovery();

private:
    smartcabinet::OtaService& ota_;
    PubSubClient& mqtt_;
    const MqttApiConfig& config_;
};
