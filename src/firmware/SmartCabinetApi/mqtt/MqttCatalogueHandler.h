#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <vector>

#include "../miniatures/MiniatureRepository.h"
#include "MqttApiConfig.h"

class MqttCatalogueHandler {
public:
    MqttCatalogueHandler(
        CatalogueRepository& catalogue,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    // Returns true if the action was handled.
    bool handleCommand(const char* action, ArduinoJson::JsonDocument& doc);

    void publishMiniatures();
    void publishDiscovery();

private:
    bool readFields(
        ArduinoJson::JsonDocument& doc,
        String& name,
        String& collection,
        String& artist,
        String& date,
        uint16_t& shelf,
        uint16_t& location,
        String& notes,
        String& error
    );

    void publishSingle(const Miniature& item);

    CatalogueRepository& catalogue_;
    PubSubClient& mqtt_;
    const MqttApiConfig& config_;
};
