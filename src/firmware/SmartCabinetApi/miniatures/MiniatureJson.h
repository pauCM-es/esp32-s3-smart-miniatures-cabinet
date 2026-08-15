#pragma once

#include <Arduino.h>
#include <vector>
#include <ArduinoJson.h>

#include "Miniature.h"

namespace MiniatureJson {

constexpr uint16_t SCHEMA_VERSION = 1;

bool serializeCollection(
    const std::vector<Miniature>& items,
    String& output
);

bool deserializeCollection(
    const String& input,
    std::vector<Miniature>& items
);

void writeItem(
    ArduinoJson::JsonObject object,
    const Miniature& item
);

bool readItem(
    ArduinoJson::JsonObjectConst object,
    Miniature& item
);

}  // namespace MiniatureJson
