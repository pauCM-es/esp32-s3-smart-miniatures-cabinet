#include "MqttLayoutHandler.h"
#include "MqttUtils.h"

#include <algorithm>

MqttLayoutHandler::MqttLayoutHandler(
    SmartCabinetService& smartCabinet,
    IAppControllerActions& actions,
    smartcabinet::CabinetLayout& layout,
    CatalogueRepository& catalogue,
    fs::FS& fs,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : smartCabinet_(smartCabinet), actions_(actions), layout_(layout), catalogue_(catalogue),
      fs_(fs), mqtt_(mqtt), config_(config) {}

bool MqttLayoutHandler::begin() {
    return loadLayout();
}

std::vector<MqttLayoutHandler::ShelfSnapshot> MqttLayoutHandler::snapshot() const {
    std::vector<ShelfSnapshot> result;
    result.reserve(layout_.shelfCount());
    for (uint8_t s = 0; s < layout_.shelfCount(); ++s) {
        const auto* shelf = layout_.shelf(s);
        if (!shelf) continue;
        ShelfSnapshot snap;
        snap.leds = shelf->ledCount;
        snap.locations = shelf->locationCount;
        snap.mirrored = shelf->mirrored;
        snap.mapping.reserve(shelf->locationCount);
        for (uint8_t l = 0; l < shelf->locationCount; ++l) {
            const auto* loc = layout_.location(s, l);
            snap.mapping.push_back(LocationSnapshot{
                loc ? loc->relativeLedStart : 0,
                loc ? loc->ledCount : 0
            });
        }
        result.push_back(std::move(snap));
    }
    return result;
}

bool MqttLayoutHandler::applySnapshot(const std::vector<ShelfSnapshot>& shelves) {
    if (shelves.empty() || shelves.size() > 255) return false;
    if (!actions_.setShelfCount(static_cast<uint8_t>(shelves.size()))) return false;

    for (uint8_t s = 0; s < shelves.size(); ++s) {
        if (!actions_.setShelfLedCount(s, 1)) return false;
    }

    for (uint8_t s = 0; s < shelves.size(); ++s) {
        const ShelfSnapshot& snap = shelves[s];
        if (!actions_.setShelfLedCount(s, snap.leds)) return false;
        if (!actions_.setShelfLocationCount(s, snap.locations)) return false;
        if (!actions_.setShelfMirrored(s, snap.mirrored)) return false;
        if (!actions_.clearShelfAllLocations(s)) return false;
        for (uint8_t l = 0; l < snap.mapping.size() && l < snap.locations; ++l) {
            const auto& loc = snap.mapping[l];
            if (loc.leds == 0) continue;
            if (!actions_.setLocationRange(s, l, loc.start, loc.leds)) return false;
        }
    }
    return true;
}

bool MqttLayoutHandler::saveLayout() {
    File file = fs_.open(layoutPath_, FILE_WRITE);
    if (!file) return false;

    JsonDocument doc;
    doc["schema_version"] = 2;
    JsonArray shelves = doc["shelves"].to<JsonArray>();
    for (const auto& shelf : snapshot()) {
        JsonObject outShelf = shelves.add<JsonObject>();
        outShelf["total_leds"] = shelf.leds;
        outShelf["total_locations"] = shelf.locations;
        outShelf["mirrored"] = shelf.mirrored;
        JsonArray locations = outShelf["locations"].to<JsonArray>();
        for (const auto& loc : shelf.mapping) {
            JsonObject outLoc = locations.add<JsonObject>();
            outLoc["start_led"] = loc.start;
            outLoc["leds"] = loc.leds;
        }
    }
    const bool ok = serializeJson(doc, file) > 0;
    file.close();
    return ok;
}

bool MqttLayoutHandler::loadLayout() {
    if (!fs_.exists(layoutPath_)) return saveLayout();
    File file = fs_.open(layoutPath_, FILE_READ);
    if (!file) return false;
    JsonDocument doc;
    const auto error = deserializeJson(doc, file);
    file.close();
    if (error) return false;

    JsonArrayConst shelves = doc["shelves"].as<JsonArrayConst>();
    if (shelves.isNull() || shelves.size() == 0) return false;

    std::vector<ShelfSnapshot> parsed;
    for (JsonObjectConst shelf : shelves) {
        ShelfSnapshot snap;
        snap.leds = shelf["total_leds"] | 0;
        snap.locations = shelf["total_locations"] | 0;
        snap.mirrored = shelf["mirrored"] | false;
        if (snap.leds == 0 || snap.locations == 0) return false;
        JsonArrayConst locations = shelf["locations"].as<JsonArrayConst>();
        for (JsonObjectConst loc : locations) {
            snap.mapping.push_back(LocationSnapshot{
                static_cast<uint16_t>(loc["start_led"] | 0),
                static_cast<uint16_t>(loc["leds"] | 0)
            });
        }
        while (snap.mapping.size() < snap.locations) snap.mapping.push_back({});
        parsed.push_back(std::move(snap));
    }
    return applySnapshot(parsed);
}

void MqttLayoutHandler::updateMiniaturesForInsert(uint8_t position) {
    std::vector<Miniature> items = catalogue_.all();
    for (const auto& item : items) {
        if (item.shelf == 0 || item.shelf < position) continue;
        Miniature updated; String error;
        catalogue_.update(item.id, item.name, item.collection, item.artist, item.date,
            item.shelf + 1, item.location, item.notes, updated, error);
    }
}

void MqttLayoutHandler::updateMiniaturesForDelete(uint8_t shelf) {
    std::vector<Miniature> items = catalogue_.all();
    for (const auto& item : items) {
        if (item.shelf == 0) continue;
        uint16_t newShelf = item.shelf;
        uint16_t newLocation = item.location;
        if (item.shelf == shelf) { newShelf = 0; newLocation = 0; }
        else if (item.shelf > shelf) { newShelf = item.shelf - 1; }
        else continue;
        Miniature updated; String error;
        catalogue_.update(item.id, item.name, item.collection, item.artist, item.date,
            newShelf, newLocation, item.notes, updated, error);
    }
}

void MqttLayoutHandler::updateMiniaturesForMove(uint8_t from, uint8_t to) {
    std::vector<Miniature> items = catalogue_.all();
    for (const auto& item : items) {
        if (item.shelf == 0) continue;
        uint16_t target = item.shelf;
        if (item.shelf == from) target = to;
        else if (from < to && item.shelf > from && item.shelf <= to) target = item.shelf - 1;
        else if (from > to && item.shelf >= to && item.shelf < from) target = item.shelf + 1;
        else continue;
        Miniature updated; String error;
        catalogue_.update(item.id, item.name, item.collection, item.artist, item.date,
            target, item.location, item.notes, updated, error);
    }
}

void MqttLayoutHandler::unassignMiniaturesPastLocation(uint8_t shelf, uint8_t maxLocation) {
    std::vector<Miniature> items = catalogue_.all();
    for (const auto& item : items) {
        if (item.shelf != shelf || item.location <= maxLocation) continue;
        Miniature updated; String error;
        catalogue_.update(item.id, item.name, item.collection, item.artist, item.date,
            0, 0, item.notes, updated, error);
    }
}

bool MqttLayoutHandler::insertShelf(uint8_t position) {
    auto shelves = snapshot();
    if (position < 1 || position > shelves.size() + 1) return false;
    if (!actions_.setShelfCount(static_cast<uint8_t>(shelves.size() + 1))) return false;
    const auto* created = layout_.shelf(layout_.shelfCount() - 1);
    if (!created) return false;
    ShelfSnapshot blank;
    blank.leds = created->ledCount;
    blank.locations = created->locationCount;
    blank.mapping.resize(blank.locations);
    shelves.insert(shelves.begin() + (position - 1), blank);
    if (!applySnapshot(shelves)) return false;
    updateMiniaturesForInsert(position);
    return saveLayout();
}

bool MqttLayoutHandler::duplicateShelf(uint8_t shelf) {
    auto shelves = snapshot();
    if (shelf < 1 || shelf > shelves.size() || shelves.size() >= smartcabinet::config::kMaxShelves) return false;
    const ShelfSnapshot duplicate = shelves[shelf - 1];
    shelves.insert(shelves.begin() + shelf, duplicate);
    if (!applySnapshot(shelves)) return false;
    updateMiniaturesForInsert(shelf + 1);
    return saveLayout();
}

bool MqttLayoutHandler::deleteShelf(uint8_t shelf) {
    auto shelves = snapshot();
    if (shelves.size() <= 1 || shelf < 1 || shelf > shelves.size()) return false;
    shelves.erase(shelves.begin() + (shelf - 1));
    if (!applySnapshot(shelves)) return false;
    updateMiniaturesForDelete(shelf);
    return saveLayout();
}

bool MqttLayoutHandler::moveShelf(uint8_t from, uint8_t to) {
    auto shelves = snapshot();
    if (from < 1 || to < 1 || from > shelves.size() || to > shelves.size()) return false;
    if (from == to) return true;
    auto moved = shelves[from - 1];
    shelves.erase(shelves.begin() + (from - 1));
    shelves.insert(shelves.begin() + (to - 1), moved);
    if (!applySnapshot(shelves)) return false;
    updateMiniaturesForMove(from, to);
    return saveLayout();
}

bool MqttLayoutHandler::setShelfConfig(uint8_t shelf, uint16_t leds, uint8_t locations) {
    if (shelf < 1 || shelf > layout_.shelfCount() || leds == 0 || locations == 0) return false;
    const auto* current = layout_.shelf(shelf - 1);
    if (!current) return false;
    if (locations < current->locationCount) unassignMiniaturesPastLocation(shelf, locations);
    if (!actions_.setShelfLedCount(shelf - 1, leds)) return false;
    if (!actions_.setShelfLocationCount(shelf - 1, locations)) return false;
    return saveLayout();
}

bool MqttLayoutHandler::setShelfDirection(uint8_t shelf, bool mirrored) {
    if (shelf < 1 || shelf > layout_.shelfCount()) return false;
    if (!actions_.setShelfMirrored(shelf - 1, mirrored)) return false;
    return saveLayout();
}

bool MqttLayoutHandler::setLocationConfig(uint8_t shelf, uint8_t location, uint16_t start, uint16_t leds) {
    if (shelf < 1 || shelf > layout_.shelfCount() || location < 1) return false;
    const auto* old = layout_.location(shelf - 1, location - 1);
    if (!old) return false;
    const LocationSnapshot previous{old->relativeLedStart, old->ledCount};
    if (!actions_.setLocationRange(shelf - 1, location - 1, 0, 0)) return false;
    if (!actions_.setLocationRange(shelf - 1, location - 1, start, leds)) {
        if (previous.leds > 0) actions_.setLocationRange(shelf - 1, location - 1, previous.start, previous.leds);
        return false;
    }
    smartCabinet_.highlightLocation(shelf, location);
    return saveLayout();
}

bool MqttLayoutHandler::previewLocation(uint8_t shelf, uint8_t location, uint16_t start, uint16_t leds) {
    if (shelf < 1 || shelf > layout_.shelfCount() || location < 1 || leds == 0) return false;
    const auto* targetShelf = layout_.shelf(shelf - 1);
    if (!targetShelf || location > targetShelf->locationCount || static_cast<uint32_t>(start) + leds > targetShelf->ledCount) return false;

    std::vector<LocationSnapshot> previous;
    previous.reserve(targetShelf->locationCount);
    for (uint8_t i = 0; i < targetShelf->locationCount; ++i) {
        const auto* loc = layout_.location(shelf - 1, i);
        previous.push_back({loc ? loc->relativeLedStart : 0, loc ? loc->ledCount : 0});
    }
    actions_.clearShelfAllLocations(shelf - 1);
    const bool setOk = actions_.setLocationRange(shelf - 1, location - 1, start, leds);
    const bool highlightOk = setOk && smartCabinet_.highlightLocation(shelf, location);
    actions_.clearShelfAllLocations(shelf - 1);
    for (uint8_t i = 0; i < previous.size(); ++i) {
        if (previous[i].leds > 0) actions_.setLocationRange(shelf - 1, i, previous[i].start, previous[i].leds);
    }
    return highlightOk;
}

bool MqttLayoutHandler::handleCommand(const char* action, ArduinoJson::JsonDocument& doc) {
    bool ok = false;
    const char* error = "invalid_layout_command";

    if (strcmp(action, "getLayout") == 0) {
        publishLayout();
        MqttUtils::publishResult(mqtt_, config_, true, action);
        return true;
    }
    if (strcmp(action, "insertShelf") == 0) {
        ok = insertShelf(static_cast<uint8_t>(doc["position"] | 0));
    } else if (strcmp(action, "duplicateShelf") == 0) {
        ok = duplicateShelf(static_cast<uint8_t>(doc["shelf"] | 0));
    } else if (strcmp(action, "deleteShelf") == 0) {
        ok = deleteShelf(static_cast<uint8_t>(doc["shelf"] | 0));
    } else if (strcmp(action, "moveShelf") == 0) {
        ok = moveShelf(static_cast<uint8_t>(doc["from"] | 0), static_cast<uint8_t>(doc["to"] | 0));
    } else if (strcmp(action, "setShelfConfig") == 0) {
        ok = setShelfConfig(static_cast<uint8_t>(doc["shelf"] | 0),
            static_cast<uint16_t>(doc["total_leds"] | 0), static_cast<uint8_t>(doc["total_locations"] | 0));
    } else if (strcmp(action, "setShelfDirection") == 0) {
        ok = setShelfDirection(static_cast<uint8_t>(doc["shelf"] | 0), doc["mirrored"] | false);
    } else if (strcmp(action, "setLocationConfig") == 0) {
        ok = setLocationConfig(static_cast<uint8_t>(doc["shelf"] | 0), static_cast<uint8_t>(doc["location"] | 0),
            static_cast<uint16_t>(doc["start_led"] | 0), static_cast<uint16_t>(doc["leds"] | 0));
    } else if (strcmp(action, "previewLocation") == 0) {
        ok = previewLocation(static_cast<uint8_t>(doc["shelf"] | 0), static_cast<uint8_t>(doc["location"] | 0),
            static_cast<uint16_t>(doc["start_led"] | 0), static_cast<uint16_t>(doc["leds"] | 0));
    } else if (strcmp(action, "autoMapShelf") == 0) {
        const uint8_t shelf = static_cast<uint8_t>(doc["shelf"] | 0);
        ok = shelf > 0 && actions_.distributeShelfEvenly(shelf - 1) && saveLayout();
    } else if (strcmp(action, "clearShelfMapping") == 0) {
        const uint8_t shelf = static_cast<uint8_t>(doc["shelf"] | 0);
        ok = shelf > 0 && actions_.clearShelfAllLocations(shelf - 1) && saveLayout();
    } else {
        return false;
    }

    if (ok && strcmp(action, "previewLocation") != 0) publishLayout();
    MqttUtils::publishResult(mqtt_, config_, ok, action, ok ? nullptr : error);
    return true;
}

void MqttLayoutHandler::publishLayout() {
    if (!mqtt_.connected()) return;
    JsonDocument doc;
    doc["shelf_count"] = layout_.shelfCount();
    const auto& state = smartCabinet_.state();
    JsonObject color = doc["highlight_color"].to<JsonObject>();
    color["r"] = state.highlightR; color["g"] = state.highlightG; color["b"] = state.highlightB;

    JsonArray shelves = doc["shelves"].to<JsonArray>();
    for (uint8_t s = 0; s < layout_.shelfCount(); ++s) {
        const auto* shelf = layout_.shelf(s);
        if (!shelf) continue;
        JsonObject outShelf = shelves.add<JsonObject>();
        outShelf["shelf"] = s + 1;
        outShelf["total_leds"] = shelf->ledCount;
        outShelf["total_locations"] = shelf->locationCount;
        outShelf["mirrored"] = shelf->mirrored;
        JsonArray locations = outShelf["locations"].to<JsonArray>();
        for (uint8_t l = 0; l < shelf->locationCount; ++l) {
            const auto* loc = layout_.location(s, l);
            JsonObject outLoc = locations.add<JsonObject>();
            outLoc["location"] = l + 1;
            outLoc["start_led"] = loc ? loc->relativeLedStart : 0;
            outLoc["leds"] = loc ? loc->ledCount : 0;
            outLoc["mapped"] = loc && loc->ledCount > 0;
        }
    }
    String payload; serializeJson(doc, payload);
    mqtt_.publish(MqttUtils::topic(config_, "/api/layout").c_str(), payload.c_str(), true);
}

void MqttLayoutHandler::publishDiscovery() {
    JsonDocument doc;
    doc["name"] = "Layout";
    doc["unique_id"] = String(config_.deviceId) + "_layout";
    doc["default_entity_id"] = "sensor.smart_cabinet_layout";
    doc["state_topic"] = MqttUtils::topic(config_, "/api/layout");
    doc["value_template"] = "{{ value_json.shelf_count }}";
    doc["json_attributes_topic"] = MqttUtils::topic(config_, "/api/layout");
    doc["icon"] = "mdi:view-split-horizontal";
    MqttUtils::addAvailability(doc, config_);
    MqttUtils::addDeviceInfo(doc, config_);
    String payload; serializeJson(doc, payload);
    mqtt_.publish(MqttUtils::discoveryTopic(config_, "sensor", "layout").c_str(), payload.c_str(), true);
}
