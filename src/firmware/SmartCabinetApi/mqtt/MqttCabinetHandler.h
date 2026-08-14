#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "../SmartCabinetService.h"
#include "MqttApiConfig.h"

class MqttCabinetHandler {
public:
    MqttCabinetHandler(
        SmartCabinetService& smartCabinet,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    // Returns true if the action was handled.
    bool handleCommand(const char* action, ArduinoJson::JsonDocument& doc);

    void handlePowerSet(const uint8_t* payload, unsigned int length);
    void handleBrightnessSet(const uint8_t* payload, unsigned int length);

    void publishState();
    void publishDiscovery();

private:
    SmartCabinetService& smartCabinet_;
    PubSubClient& mqtt_;
    const MqttApiConfig& config_;
};
