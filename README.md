# Smart Cabinet MVP

Modular ESP32-S3 lighting and miniature-location backend for the Freenove 3.5-inch display project.

The UI is intentionally decoupled from the application logic. SquareLine Studio/LVGL callbacks only need to call `smartcabinet::app` methods.

## MVP scope

Included:

- Simple cabinet light through PWM + MOSFET.
- Rotary encoder for simple cabinet light brightness and power.
- Optional SK6812 RGBW cabinet strip.
- Addressable miniature lighting with FastLED.
- Unified scenes controlling any enabled lighting module.
- Shelf -> location -> LED segment model.
- Runtime layout configuration and location test mode.
- Five mock miniatures with physical locations.
- Miniature locate/highlight with automatic restore.
- Non-blocking Static, Breathe and Rainbow effects.
- Serial debug console.
- SquareLine integration API.

Deferred:

- SD catalogue and images.
- Catalogue CRUD.
- Persistent settings.
- Scene CRUD.
- Scene schedules.
- Wi-Fi, AP setup and OTA.
- Home Assistant/web control.
- Voice/audio features.

## Lighting architecture

```text
AppController
    |
    +-- LightingManager
    |      +-- PwmCabinetLight          -> PWM + MOSFET
    |      +-- AddressableCabinetLight  -> SK6812 RGBW
    |      +-- MiniatureLights          -> FastLED RGB strip
    |      +-- SceneRepository
    |
    +-- CabinetLayout
    |      +-- Shelves
    |            +-- Locations
    |                  +-- LED segments
    |
    +-- MiniatureRepository
           +-- 5 mock miniatures
```

Scenes are not split by hardware type. One scene contains optional state blocks for every lighting module. `apply = false` means "leave this module unchanged". `apply = true, power = false` means "explicitly turn this module off".

## Why two LED libraries?

`MiniatureLights` uses **FastLED**, as planned for the cabinet project.

`AddressableCabinetLight` uses **Adafruit NeoPixel** because the SK6812 RGBW has a real fourth white channel and this module needs explicit `R, G, B, W` control. The library difference is hidden behind `LightingManager`.

## First configuration

Open:

`include/config/HardwareConfig.h`

External hardware is disabled by default because the final GPIO map is not fixed yet.

1. Set the real GPIO values.
2. Set the exact RGBW cabinet LED count.
3. Confirm the miniature strip chipset and color order.
4. Enable only the modules physically connected.

Example:

```cpp
#define SMART_CABINET_ENABLE_PWM_CABINET_LIGHT 1
#define SMART_CABINET_ENABLE_RGBW_CABINET_LIGHT 1
#define SMART_CABINET_ENABLE_MINIATURE_LIGHTS 1
#define SMART_CABINET_ENABLE_ENCODER 1
```

Do not enable a module before its pin assignment has been verified against the Freenove board and the final wiring diagram.

## Default miniature layout

The mock configuration matches the current estimate:

- 5 shelves.
- 80 addressable LEDs per shelf.
- 400 LEDs total.
- 5 locations per shelf.
- 16 LEDs per location.

All values can be changed at runtime through `AppController`. Persistence is deliberately deferred until the SD/flash phase.

## Build

Open the folder in VS Code with PlatformIO and build the default environment:

```text
freenove_esp32_s3_wroom
```

Dependencies are pinned in `platformio.ini`:

- FastLED 3.10.3
- Adafruit NeoPixel 1.15.5

## SquareLine integration

Include:

```cpp
#include "app/AppContext.h"
```

Then call the application API from SquareLine callbacks:

```cpp
smartcabinet::app.togglePwmCabinet();
smartcabinet::app.setPwmCabinetBrightness(70);

smartcabinet::app.toggleRgbwCabinet();
smartcabinet::app.setRgbwCabinetColor({120, 0, 255, 40});

smartcabinet::app.toggleMiniatures();
smartcabinet::app.setMiniatureColor({0, 220, 255});

smartcabinet::app.applyScene(smartcabinet::SceneId::Showcase);
smartcabinet::app.locateMiniature(3);
```

See `docs/SQUARELINE_INTEGRATION.md` for callback examples.

## Serial test console

At 115200 baud:

```text
help
state
layout
scene display
scene showcase
scene off
pwm on
pwm brightness 60
rgbw on
rgbw color 120 0 255 50
rgbw effect breathe
mini on
mini color 0 220 255
mini effect breathe
locate 3
test 2 1
clear
```

This allows hardware testing before the UI callbacks are connected.

## Power limits

`HardwareConfig.h` currently applies conservative placeholder limits to the miniature strip:

- Maximum FastLED brightness: 96/255.
- FastLED power budget: 2200 mA at 5 V.

These values must be revisited after measuring the real current of:

- The miniature strip.
- The PWM cabinet strip.
- The SK6812 RGBW cabinet strip, if installed.
- The ESP32-S3 display board.

FastLED's power limiter only accounts for the LEDs controlled by FastLED. It does not account for the PWM strip or the SK6812 strip controlled by NeoPixel.

## SK6812 white channel

An SK6812 RGBW strip has one fixed-CCT white channel. The code exposes white intensity (`W`), not true adjustable color temperature. Real warm/cool temperature control requires an RGB+CCT/RGBWW strip or an approximation using RGB mixing.

## Notes

- LED effects are non-blocking. No animation uses `delay()`.
- Locate/test is implemented as a temporary overlay and restores the previous miniature-light state.
- Manual light changes switch the active scene state to `Manual`.
- Applying a scene clears any active locate/test overlay first.
- Encoder input controls only the simple PWM cabinet light.
- The UI generated by SquareLine remains outside this project so it can be regenerated without overwriting application logic.
