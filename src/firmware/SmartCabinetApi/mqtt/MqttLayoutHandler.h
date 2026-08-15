#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <PubSubClient.h>
#include <vector>

#include "../IAppControllerActions.h"
#include "../SmartCabinetService.h"
#include "../miniatures/MiniatureRepository.h"
#include "MqttApiConfig.h"
#include "cabinet/CabinetLayout.h"

class MqttLayoutHandler {
public:
    MqttLayoutHandler(
        SmartCabinetService& smartCabinet,
        IAppControllerActions& actions,
        smartcabinet::CabinetLayout& layout,
        CatalogueRepository& catalogue,
        fs::FS& fs,
        PubSubClient& mqtt,
        const MqttApiConfig& config
    );

    bool begin();
    bool handleCommand(const char* action, ArduinoJson::JsonDocument& doc);
    void publishLayout();
    void publishDiscovery();

private:
    struct LocationSnapshot {
        uint16_t start = 0;
        uint16_t leds = 0;
    };

    struct ShelfSnapshot {
        uint16_t leds = 0;
        uint8_t locations = 0;
        std::vector<LocationSnapshot> mapping;
    };

    std::vector<ShelfSnapshot> snapshot() const;
    bool applySnapshot(const std::vector<ShelfSnapshot>& shelves);
    bool saveLayout();
    bool loadLayout();

    bool insertShelf(uint8_t position1Based);
    bool deleteShelf(uint8_t shelf1Based);
    bool moveShelf(uint8_t from1Based, uint8_t to1Based);
    bool setShelfConfig(uint8_t shelf1Based, uint16_t leds, uint8_t locations);
    bool setLocationConfig(uint8_t shelf1Based, uint8_t location1Based, uint16_t start, uint16_t leds);
    bool previewLocation(uint8_t shelf1Based, uint8_t location1Based, uint16_t start, uint16_t leds);
    void updateMiniaturesForInsert(uint8_t position1Based);
    void updateMiniaturesForDelete(uint8_t shelf1Based);
    void updateMiniaturesForMove(uint8_t from1Based, uint8_t to1Based);
    void unassignMiniaturesPastLocation(uint8_t shelf1Based, uint8_t maxLocation);

    SmartCabinetService& smartCabinet_;
    IAppControllerActions& actions_;
    smartcabinet::CabinetLayout& layout_;
    CatalogueRepository& catalogue_;
    fs::FS& fs_;
    PubSubClient& mqtt_;
    const MqttApiConfig& config_;
    const char* layoutPath_ = "/smart_cabinet/layout.json";
};
