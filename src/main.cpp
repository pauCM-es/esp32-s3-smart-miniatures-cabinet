#include <Arduino.h>

#include "app/AppContext.h"
#include "cabinet/CabinetLayout.h"
#include "debug/DebugConsole.h"
#include "hal/display.h"
#include "hardware/EncoderInput.h"
#include "hardware/PwmCabinetLight.h"
#include "lighting/AddressableCabinetLight.h"
#include "lighting/LightingManager.h"
#include "lighting/MiniatureLights.h"
#include "miniatures/MiniatureRepository.h"
#include "ui/ui.h"

namespace smartcabinet {

PwmCabinetLight pwmCabinetLight;
AddressableCabinetLight rgbwCabinetLight;
MiniatureLights miniatureLights;
LightingManager lightingManager(pwmCabinetLight, rgbwCabinetLight, miniatureLights);
CabinetLayout cabinetLayout;
MiniatureRepository miniatureRepository;
EncoderInput encoder;
AppController app(lightingManager, cabinetLayout, miniatureRepository, encoder);
DebugConsole debugConsole(app);
Display display;

}  // namespace smartcabinet

void setup() {
    Serial.begin(115200);

    smartcabinet::display.begin();
    ui_init();

    smartcabinet::app.begin();
    smartcabinet::debugConsole.begin();

    // Start in a known safe state.
    smartcabinet::app.applyScene(smartcabinet::SceneId::Off);
}

void loop() {
    const uint32_t nowMs = millis();

    smartcabinet::display.loop();
    smartcabinet::app.update(nowMs);
    smartcabinet::debugConsole.update();
}
