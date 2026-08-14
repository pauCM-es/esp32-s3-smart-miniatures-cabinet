#include "SettingsJson.h"

#include <ArduinoJson.h>

namespace SettingsJson {

bool serialize(const CabinetSettings& settings, String& output) {
    JsonDocument doc;

    doc["schema_version"] = settings.schemaVersion;
    doc["power"] = settings.power;
    doc["brightness"] = settings.brightness;

    output = "";
    return serializeJson(doc, output) > 0;
}

bool deserialize(const String& input, CabinetSettings& settings) {
    JsonDocument doc;
    const DeserializationError error = deserializeJson(doc, input);

    if (error) {
        return false;
    }

    const uint16_t schemaVersion =
        doc["schema_version"] | CabinetSettings::SCHEMA_VERSION;

    if (schemaVersion != CabinetSettings::SCHEMA_VERSION) {
        return false;
    }

    const int brightness = doc["brightness"] | 50;
    if (brightness < 0 || brightness > 100) {
        return false;
    }

    settings.schemaVersion = schemaVersion;
    settings.power = doc["power"] | false;
    settings.brightness = static_cast<uint8_t>(brightness);

    return true;
}

}  // namespace SettingsJson
