#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#include "../SmartCabinetService.h"
#include "../miniatures/MiniatureRepository.h"
#include "MqttApiConfig.h"

/**
 * Exposes three HA number (slider) entities for interactive LED highlighting:
 *   - Highlight Miniature (0=off, 1..N = catalogue index)
 *   - Highlight Shelf     (0=off, 1..N)
 *   - Highlight Location  (0=off, 1..M)
 *
 * The mini slider and the shelf/location sliders are mutually exclusive:
 * touching one group resets the other.  Both groups highlight in white (persistent).
 */
class MqttHighlightHandler {
public:
    MqttHighlightHandler(
        SmartCabinetService& smartCabinet,
        CatalogueRepository& catalogue,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    void handleMiniSet(const uint8_t* payload, unsigned int length);
    void handleShelfSet(const uint8_t* payload, unsigned int length);
    void handleLocationSet(const uint8_t* payload, unsigned int length);

    void publishState();
    void publishDiscovery();

private:
    void applyLocationHighlight();

    SmartCabinetService&  smartCabinet_;
    CatalogueRepository&  catalogue_;
    PubSubClient&         mqtt_;
    const MqttApiConfig&  config_;

    uint16_t miniIndex_  = 0;  // 1-based, 0 = none
    uint16_t shelf_      = 0;
    uint16_t location_   = 0;
};
