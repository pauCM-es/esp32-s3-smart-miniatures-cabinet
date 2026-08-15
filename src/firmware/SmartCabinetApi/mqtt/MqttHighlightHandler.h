#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "../SmartCabinetService.h"
#include "../miniatures/MiniatureRepository.h"
#include "MqttApiConfig.h"
#include "cabinet/CabinetLayout.h"

/**
 * Exposes two HA number (slider) entities for interactive LED highlighting:
 *   - Highlight Miniature (0=off, 1..N = catalogue index)
 *   - Highlight Location  (0=off, 1..totalCabinetLocations = global flat index)
 *
 * The two sliders are mutually exclusive: touching one resets the other.
 * Both highlight in white (persistent).
 */
class MqttHighlightHandler {
public:
    MqttHighlightHandler(
        SmartCabinetService& smartCabinet,
        CatalogueRepository& catalogue,
        const smartcabinet::CabinetLayout& layout,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    void handleMiniSet(const uint8_t* payload, unsigned int length);
    void handleLocationSet(const uint8_t* payload, unsigned int length);

    void publishState();
    void publishDiscovery();

private:
    uint16_t totalCabinetLocations() const;
    uint16_t computeGlobalLocation(uint16_t shelf, uint16_t location) const;
    bool resolveGlobalLocation(uint16_t global, uint16_t& shelf, uint16_t& location) const;

    SmartCabinetService&                smartCabinet_;
    CatalogueRepository&                catalogue_;
    const smartcabinet::CabinetLayout&  layout_;
    PubSubClient&                       mqtt_;
    const MqttApiConfig&                config_;

    uint16_t miniIndex_      = 0;  // 1-based, 0 = none
    uint16_t globalLocation_ = 0;  // 1-based flat cabinet index, 0 = none
};
