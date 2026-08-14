#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <Client.h>
#include <PubSubClient.h>

#include "../SmartCabinetService.h"
#include "../miniatures/MiniatureRepository.h"
#include "MqttApiConfig.h"

class MqttApiService {
public:
    MqttApiService(
        Client& networkClient,
        const MqttApiConfig& config,
        SmartCabinetService& smartCabinet,
        CatalogueRepository& miniatures
    );

    void begin();
    void loop();

    bool connected();

    void publishState();
    void publishMiniatures();
    void publishDiscovery();

private:
    bool ensureConnected();
    void subscribeTopics();

    void handleMessage(
        char* topic,
        uint8_t* payload,
        unsigned int length
    );

    void handleApiCommand(
        uint8_t* payload,
        unsigned int length
    );

    void handlePowerCommand(
        uint8_t* payload,
        unsigned int length
    );

    void handleBrightnessCommand(
        uint8_t* payload,
        unsigned int length
    );

    bool readMiniatureFields(
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

    void publishResult(
        bool ok,
        const char* action,
        const char* error = nullptr,
        const char* id = nullptr
    );

    void publishSingleMiniature(
        const Miniature& item
    );

    void publishPowerDiscovery();
    void publishBrightnessDiscovery();
    void publishHighlightDiscovery();
    void publishMiniaturesDiscovery();

    String topic(const char* suffix) const;

    String discoveryTopic(
        const char* component,
        const char* objectId
    ) const;

    MqttApiConfig config_;
    SmartCabinetService& smartCabinet_;
    CatalogueRepository& miniatures_;
    PubSubClient mqtt_;

    uint32_t lastReconnectAttemptMs_ = 0;
};
