#include "MqttApiService.h"

#include <ArduinoJson.h>

#include "MqttUtils.h"
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
    IAppControllerActions& actions,
    CatalogueRepository& miniatures,
    smartcabinet::CabinetLayout& layout,
    fs::FS& fs
)
    : config_(config),
      mqtt_(networkClient),
      cabinetHandler_(smartCabinet, mqtt_, config_),
      catalogueHandler_(miniatures, mqtt_, config_),
      highlightHandler_(smartCabinet, miniatures, layout, mqtt_, config_),
      miniLightsHandler_(smartCabinet, mqtt_, config_),
      layoutHandler_(smartCabinet, actions, layout, miniatures, fs, mqtt_, config_)
{
    smartCabinet.setStateChangedCallback(
        [this](const CabinetRuntimeState&) {
            if (mqtt_.connected()) publishState();
        }
    );
    miniatures.setChangedCallback(
        [this](const std::vector<Miniature>&) {
            if (mqtt_.connected()) {
                publishMiniatures();
                // Republish discovery so the Highlight Miniature slider max stays current.
                highlightHandler_.publishDiscovery();
            }
        }
    );
}

void MqttApiService::begin() {
    layoutHandler_.begin();
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
    if (mqtt_.connected()) return true;
    if (config_.host == nullptr || strlen(config_.host) == 0) return false;

    const String availabilityTopic = MqttUtils::topic(config_, "/availability");
    String clientId = "smart-cabinet-";
    clientId += config_.deviceId;

    bool ok = false;
    if (config_.username != nullptr && strlen(config_.username) > 0) {
        ok = mqtt_.connect(clientId.c_str(), config_.username, config_.password,
            availabilityTopic.c_str(), 0, true, "offline");
    } else {
        ok = mqtt_.connect(clientId.c_str(), availabilityTopic.c_str(), 0, true, "offline");
    }
    if (!ok) return false;

    lastReconnectAttemptMs_ = 0;
    subscribeTopics();
    mqtt_.publish(availabilityTopic.c_str(), "online", true);
    publishDiscovery();
    publishState();
    layoutHandler_.publishLayout();
    publishMiniatures();
    return true;
}

void MqttApiService::subscribeTopics() {
    mqtt_.subscribe(MqttUtils::topic(config_, "/api/command").c_str());
    mqtt_.subscribe(MqttUtils::topic(config_, "/ha/power/set").c_str());
    mqtt_.subscribe(MqttUtils::topic(config_, "/ha/brightness/set").c_str());
    mqtt_.subscribe(MqttUtils::topic(config_, "/ha/mini_lights/set").c_str());
    mqtt_.subscribe(MqttUtils::topic(config_, "/ha/highlight/mini/set").c_str());
    mqtt_.subscribe(MqttUtils::topic(config_, "/ha/highlight/location/set").c_str());
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
            layoutHandler_.publishLayout();
            publishMiniatures();
        }
        return;
    }

    if (incoming == MqttUtils::topic(config_, "/api/command")) {
        handleApiCommand(payload, length);
        return;
    }
    if (incoming == MqttUtils::topic(config_, "/ha/power/set")) {
        cabinetHandler_.handlePowerSet(payload, length);
        return;
    }
    if (incoming == MqttUtils::topic(config_, "/ha/brightness/set")) {
        cabinetHandler_.handleBrightnessSet(payload, length);
        return;
    }
    if (incoming == MqttUtils::topic(config_, "/ha/mini_lights/set")) {
        miniLightsHandler_.handleSet(payload, length);
        return;
    }
    if (incoming == MqttUtils::topic(config_, "/ha/highlight/mini/set")) {
        highlightHandler_.handleMiniSet(payload, length);
        return;
    }
    if (incoming == MqttUtils::topic(config_, "/ha/highlight/location/set")) {
        highlightHandler_.handleLocationSet(payload, length);
    }
}

void MqttApiService::handleApiCommand(
    uint8_t* payload,
    unsigned int length
) {
    JsonDocument doc;
    if (deserializeJson(doc, payload, length)) {
        MqttUtils::publishResult(mqtt_, config_, false, "unknown", "invalid_json");
        return;
    }
    const char* action = doc["action"] | "";
    if (!cabinetHandler_.handleCommand(action, doc) &&
        !catalogueHandler_.handleCommand(action, doc) &&
        !layoutHandler_.handleCommand(action, doc) &&
        !(otaHandler_ && otaHandler_->handleCommand(action, doc))) {
        MqttUtils::publishResult(mqtt_, config_, false, action, "unknown_action");
    }
}

void MqttApiService::publishState() {
    cabinetHandler_.publishState();
    miniLightsHandler_.publishState();
    highlightHandler_.publishState();
    if (otaHandler_) otaHandler_->publishState();
}

void MqttApiService::publishMiniatures() {
    catalogueHandler_.publishMiniatures();
}

void MqttApiService::publishDiscovery() {
    if (!mqtt_.connected()) return;
    cabinetHandler_.publishDiscovery();
    catalogueHandler_.publishDiscovery();
    miniLightsHandler_.publishDiscovery();
    highlightHandler_.publishDiscovery();
    layoutHandler_.publishDiscovery();
    if (otaHandler_) otaHandler_->publishDiscovery();
}

void MqttApiService::setOtaService(smartcabinet::OtaService& ota) {
    otaHandler_ = std::make_unique<MqttOtaHandler>(ota, mqtt_, config_);
}
