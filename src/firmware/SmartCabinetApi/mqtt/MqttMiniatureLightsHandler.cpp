#include "MqttMiniatureLightsHandler.h"
#include "MqttUtils.h"

MqttMiniatureLightsHandler::MqttMiniatureLightsHandler(
    SmartCabinetService& smartCabinet,
    PubSubClient& mqtt,
    const MqttApiConfig& config
)
    : smartCabinet_(smartCabinet),
      mqtt_(mqtt),
      config_(config) {}

// HA MQTT light JSON schema: {"state":"ON","brightness":75,"color":{"r":0,"g":190,"b":255}}
// brightness_scale is 100, so brightness maps directly to 0-100%.
void MqttMiniatureLightsHandler::handleSet(
    const uint8_t* payload,
    unsigned int length
) {
    JsonDocument doc;
    if (deserializeJson(doc, payload, length)) return;

    const char* state = doc["state"] | "";
    if (strcmp(state, "ON") == 0) {
        smartCabinet_.setMiniatureLightPower(true);
    } else if (strcmp(state, "OFF") == 0) {
        smartCabinet_.setMiniatureLightPower(false);
        publishState();
        return;
    }

    if (doc["brightness"].is<int>()) {
        const int b = doc["brightness"].as<int>();
        smartCabinet_.setMiniatureLightBrightness(
            static_cast<uint8_t>(b < 0 ? 0 : b > 100 ? 100 : b)
        );
    }

    if (doc["color"].is<JsonObject>()) {
        const uint8_t r = static_cast<uint8_t>(doc["color"]["r"] | 0);
        const uint8_t g = static_cast<uint8_t>(doc["color"]["g"] | 0);
        const uint8_t b = static_cast<uint8_t>(doc["color"]["b"] | 0);
        smartCabinet_.setMiniatureLightColor(r, g, b);
    }

    publishState();
}

void MqttMiniatureLightsHandler::publishState() {
    if (!mqtt_.connected()) return;

    const CabinetRuntimeState& s = smartCabinet_.state();

    JsonDocument doc;
    doc["state"]             = s.miniLightPower ? "ON" : "OFF";
    doc["brightness"]        = s.miniLightBrightness;
    JsonObject color         = doc["color"].to<JsonObject>();
    color["r"]               = s.miniLightR;
    color["g"]               = s.miniLightG;
    color["b"]               = s.miniLightB;

    String payload;
    serializeJson(doc, payload);
    mqtt_.publish(
        MqttUtils::topic(config_, "/api/mini_lights/state").c_str(),
        payload.c_str(),
        true
    );
}

void MqttMiniatureLightsHandler::publishDiscovery() {
    JsonDocument doc;
    doc["name"]                     = "Miniature Lights";
    doc["unique_id"]                = String(config_.deviceId) + "_mini_lights";
    doc["schema"]                   = "json";
    doc["state_topic"]              = MqttUtils::topic(config_, "/api/mini_lights/state");
    doc["command_topic"]            = MqttUtils::topic(config_, "/ha/mini_lights/set");
    doc["brightness"]               = true;
    doc["brightness_scale"]         = 100;
    JsonArray colorModes            = doc["supported_color_modes"].to<JsonArray>();
    colorModes.add("rgb");
    doc["icon"]                     = "mdi:led-strip-variant";
    MqttUtils::addAvailability(doc, config_);
    MqttUtils::addDeviceInfo(doc, config_);

    String payload;
    serializeJson(doc, payload);
    mqtt_.publish(
        MqttUtils::discoveryTopic(config_, "light", "mini_lights").c_str(),
        payload.c_str(),
        true
    );
}
