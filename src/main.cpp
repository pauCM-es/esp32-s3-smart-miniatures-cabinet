#include <Arduino.h>
#include <lvgl.h>

#include "audio/AudioService.h"

#include "hal/display.h"
#include "ui/ui.h"

namespace {
Display display;
}

void setup() {
    Serial.begin(115200);

    Serial.printf(
        "Flash: %u MB\n",
        ESP.getFlashChipSize() / (1024 * 1024)
    );

    Serial.printf(
        "PSRAM: %u MB\n",
        ESP.getPsramSize() / (1024 * 1024)
    );

    // USB CDC can take a moment to enumerate. Never wait indefinitely, because
    // the cabinet must still boot when no computer or serial monitor is attached.
    const uint32_t serialStart = millis();
    while (!Serial && millis() - serialStart < 2000U) {
        delay(10);
    }

    Serial.println();
    Serial.println("Starting Freenove display template...");
    Serial.printf("PSRAM: %u bytes\n", ESP.getPsramSize());

    display.begin();
    ui_init();

    if (!AudioService::begin())
{
    Serial.println(
        "[Main] Audio service initialization failed"
    );
}

    Serial.printf("LVGL %d.%d.%d ready\n",
                  lv_version_major(),
                  lv_version_minor(),
                  lv_version_patch());
}

void loop() {
    display.loop();
    delay(5);
}
