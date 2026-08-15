#include "SettingsJson.h"

#include <ArduinoJson.h>

namespace SettingsJson {

bool serialize(const CabinetSettings& settings, String& output) {
    JsonDocument doc;

    doc["schema_version"] = settings.schemaVersion;
    doc["power"] = settings.power;
    doc["brightness"] = settings.brightness;
    doc["highlight_r"] = settings.highlightR;
    doc["highlight_g"] = settings.highlightG;
    doc["highlight_b"] = settings.highlightB;

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

    if (schemaVersion != 1 && schemaVersion != CabinetSettings::SCHEMA_VERSION) {
        return false;
    }

    const int brightness = doc["brightness"] | 50;
    if (brightness < 0 || brightness > 100) {
        return false;
    }

    settings.schemaVersion = CabinetSettings::SCHEMA_VERSION;
    settings.power = doc["power"] | false;
    settings.brightness = static_cast<uint8_t>(brightness);
    settings.highlightR = static_cast<uint8_t>(doc["highlight_r"] | 156);
    settings.highlightG = static_cast<uint8_t>(doc["highlight_g"] | 39);
    settings.highlightB = static_cast<uint8_t>(doc["highlight_b"] | 176);

    return true;
}

}  // namespace SettingsJson
