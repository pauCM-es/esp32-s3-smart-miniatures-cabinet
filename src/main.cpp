#include <Arduino.h>
#include <FS.h>
#include <LittleFS.h>
#include <WiFi.h>
#include <WiFiClient.h>

#include "app/AppContext.h"
#include "app/AppControllerActionsAdapter.h"
#include "cabinet/CabinetLayout.h"
#include "debug/DebugConsole.h"
#include "hal/display.h"
#include "hardware/EncoderInput.h"
#include "hardware/PwmCabinetLight.h"
#include "lighting/AddressableCabinetLight.h"
#include "lighting/LightingManager.h"
#include "lighting/MiniatureLights.h"
#include "secrets.h"
#include "ui/ui.h"

#include "firmware/SmartCabinetApi/SmartCabinetApi.h"
#include "firmware/SmartCabinetApi/miniatures/FlashMiniatureStore.h"

namespace smartcabinet {

PwmCabinetLight pwmCabinetLight;
AddressableCabinetLight rgbwCabinetLight;
MiniatureLights miniatureLights;
LightingManager lightingManager(pwmCabinetLight, rgbwCabinetLight, miniatureLights);
CabinetLayout cabinetLayout;
EncoderInput encoder;
AppController app(lightingManager, cabinetLayout, encoder);
DebugConsole debugConsole(app);
Display display;

}  // namespace smartcabinet

// ─── HA / MQTT integration ───────────────────────────────────────────────────
// These objects live in global namespace to match the SmartCabinetApi types.

smartcabinet::AppControllerActionsAdapter appActions(smartcabinet::app);

NvsSettingsStore   settingsStore("cabinet");
SettingsRepository settingsRepo(settingsStore, 1000);
SmartCabinetService smartCabinet(appActions, settingsRepo);

FlashMiniatureStore catalogueStore(LittleFS, "/smart_cabinet/miniatures.json");
CatalogueRepository catalogue(catalogueStore, 100);

WiFiClient wifiClient;

static MqttApiConfig makeMqttConfig() {
    MqttApiConfig c;
    c.host     = MQTT_HOST;
    c.port     = MQTT_PORT;
    c.username = MQTT_USER;
    c.password = MQTT_PASSWORD;
    c.deviceId   = "cabinet01";
    c.deviceName = "Smart Cabinet";
    c.baseTopic  = "smartcabinet/cabinet01";
    return c;
}
static const MqttApiConfig mqttConfig = makeMqttConfig();

MqttApiService mqttApi(wifiClient, mqttConfig, smartCabinet, catalogue, smartcabinet::cabinetLayout);

void setup() {
    Serial.begin(115200);

    smartcabinet::display.begin();
    ui_init();

    smartcabinet::app.begin();
    smartcabinet::debugConsole.begin();

    // Start in a known safe state.
    smartcabinet::app.applyScene(smartcabinet::SceneId::Off);

    // Restore persisted power + brightness from NVS.
    smartCabinet.begin();

    // Mount internal flash filesystem and load the miniature catalogue.
    if (!LittleFS.begin(true)) {
        Serial.println("[HA] LittleFS mount failed");
    } else {
        catalogue.begin();
    }

    // Connect to Wi-Fi; MQTT loop will reconnect if this times out.
    Serial.printf("[WiFi] Connecting to %s...\n", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    const uint32_t wifiDeadline = millis() + 10000;
    while (WiFi.status() != WL_CONNECTED && millis() < wifiDeadline) {
        delay(100);
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("[WiFi] Connected, IP: %s\n", WiFi.localIP().toString().c_str());
        configTime(0, 0, "pool.ntp.org");
        setenv("TZ", "CET-1CEST,M3.5.0,M10.5.0/3", 1);  // Madrid: UTC+1 winter, UTC+2 summer
        tzset();
    } else {
        Serial.println("[WiFi] Not connected — MQTT will retry in loop");
    }

    // Propagate encoder brightness changes to SmartCabinetService so HA state stays in sync.
    smartcabinet::app.setEncoderBrightnessCallback([](uint8_t b) { smartCabinet.setBrightness(b); });

    // Start MQTT (connect attempt; retries automatically in loop).
    mqttApi.begin();
}

void loop() {
    const uint32_t nowMs = millis();

    smartcabinet::display.loop();
    smartcabinet::app.update(nowMs);
    smartcabinet::debugConsole.update();

    smartCabinet.loop();
    mqttApi.loop();
}
