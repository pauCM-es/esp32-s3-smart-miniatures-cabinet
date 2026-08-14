#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "../SmartCabinetService.h"
#include "MqttApiConfig.h"

class MqttMiniatureLightsHandler {
public:
    MqttMiniatureLightsHandler(
        SmartCabinetService& smartCabinet,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    // Handles a payload from ha/mini_lights/set.
    void handleSet(const uint8_t* payload, unsigned int length);

    void publishState();
    void publishDiscovery();

private:
    SmartCabinetService& smartCabinet_;
    PubSubClient& mqtt_;
    const MqttApiConfig& config_;
};
