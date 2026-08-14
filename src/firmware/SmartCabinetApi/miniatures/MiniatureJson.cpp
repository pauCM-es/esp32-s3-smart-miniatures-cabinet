#include "MiniatureJson.h"

namespace MiniatureJson {

void writeItem(
    JsonObject object,
    const Miniature& item
) {
    object["id"] = item.id;
    object["name"] = item.name;
    object["shelf"] = item.shelf;
    object["location"] = item.location;
    object["notes"] = item.notes;
}

bool readItem(
    JsonObjectConst object,
    Miniature& item
) {
    const char* id = object["id"] | "";
    const char* name = object["name"] | "";
    const int shelf = object["shelf"] | 0;
    const int location = object["location"] | 0;
    const char* notes = object["notes"] | "";

    if (
        strlen(id) == 0 ||
        strlen(name) == 0 ||
        shelf <= 0 ||
        location <= 0 ||
        shelf > 65535 ||
        location > 65535
    ) {
        return false;
    }

    item.id = id;
    item.name = name;
    item.shelf = static_cast<uint16_t>(shelf);
    item.location = static_cast<uint16_t>(location);
    item.notes = notes;

    return true;
}

bool serializeCollection(
    const std::vector<Miniature>& items,
    String& output
) {
    JsonDocument doc;

    doc["schema_version"] = SCHEMA_VERSION;

    JsonArray array = doc["items"].to<JsonArray>();

    for (const Miniature& item : items) {
        JsonObject object = array.add<JsonObject>();
        writeItem(object, item);
    }

    output = "";
    return serializeJson(doc, output) > 0;
}

bool deserializeCollection(
    const String& input,
    std::vector<Miniature>& items
) {
    JsonDocument doc;
    const DeserializationError error =
        deserializeJson(doc, input);

    if (error) {
        return false;
    }

    const uint16_t schemaVersion =
        doc["schema_version"] | SCHEMA_VERSION;

    if (schemaVersion != SCHEMA_VERSION) {
        return false;
    }

    JsonArrayConst array = doc["items"].as<JsonArrayConst>();

    if (array.isNull()) {
        return false;
    }

    std::vector<Miniature> parsed;
    parsed.reserve(array.size());

    for (JsonObjectConst object : array) {
        Miniature item;

        if (!readItem(object, item)) {
            return false;
        }

        parsed.push_back(item);
    }

    items.swap(parsed);
    return true;
}

}  // namespace MiniatureJson
