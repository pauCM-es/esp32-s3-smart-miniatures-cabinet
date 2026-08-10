#include "LightsEvents.h"

#include <Arduino.h>
#include "app/AppContext.h"

using namespace smartcabinet;

extern "C" {

void lights_on_minis_color_changed(uint8_t r, uint8_t g, uint8_t b)
{
    Serial.printf("[Lights] minis color: r=%u g=%u b=%u\n", r, g, b);
    app.setMiniatureColor({r, g, b});
}

void lights_on_minis_intensity_changed(uint8_t percent)
{
    Serial.printf("[Lights] minis intensity: %u%%\n", percent);
    app.setMiniatureBrightness(percent);
}

void lights_on_cabinet_color_changed(uint8_t r, uint8_t g, uint8_t b)
{
    if (app.state().rgbwCabinetAvailable) {
        Serial.printf("[Lights] cabinet color: r=%u g=%u b=%u\n", r, g, b);
        const RgbwColor current = app.state().rgbwCabinetColor;
        app.setRgbwCabinetColor({r, g, b, current.w});
    } else {
        Serial.println("[Lights] cabinet color ignored (no RGBW strip)");
    }
}

void lights_on_cabinet_intensity_changed(uint8_t percent)
{
    if (app.state().pwmCabinetAvailable) {
        Serial.printf("[Lights] cabinet intensity (PWM): %u%%\n", percent);
        app.setPwmCabinetBrightness(percent);
    } else if (app.state().rgbwCabinetAvailable) {
        Serial.printf("[Lights] cabinet intensity (RGBW): %u%%\n", percent);
        app.setRgbwCabinetBrightness(percent);
    } else {
        Serial.println("[Lights] cabinet intensity ignored (no cabinet output available)");
    }
}

}  // extern "C"
