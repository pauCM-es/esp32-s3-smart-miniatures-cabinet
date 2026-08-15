#pragma once

#include <Arduino.h>
#include <Client.h>
#include <PubSubClient.h>

#include "../SmartCabinetService.h"
#include "../miniatures/MiniatureRepository.h"
#include "MqttApiConfig.h"
#include "MqttCabinetHandler.h"
#include "MqttCatalogueHandler.h"
#include "MqttHighlightHandler.h"
#include "MqttLayoutHandler.h"
#include "MqttMiniatureLightsHandler.h"
#include "cabinet/CabinetLayout.h"

class MqttApiService {
public:
    MqttApiService(
        Client& networkClient,
        const MqttApiConfig& config,
        SmartCabinetService& smartCabinet,
        IAppControllerActions& actions,
        CatalogueRepository& miniatures,
        smartcabinet::CabinetLayout& layout,
        fs::FS& fs
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

    // Declaration order matters: mqtt_ must precede the handlers.
    MqttApiConfig              config_;
    PubSubClient               mqtt_;
    MqttCabinetHandler         cabinetHandler_;
    MqttCatalogueHandler       catalogueHandler_;
    MqttHighlightHandler       highlightHandler_;
    MqttMiniatureLightsHandler miniLightsHandler_;
    MqttLayoutHandler          layoutHandler_;

    uint32_t lastReconnectAttemptMs_ = 0;
};

