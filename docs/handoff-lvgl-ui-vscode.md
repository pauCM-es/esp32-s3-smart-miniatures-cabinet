# Handoff — LVGL App Development in VS Code

## Goal

Build the 480 × 320 landscape interface for the miniature display cabinet directly in LVGL using C/C++ in VS Code.

The same UI source files should be used for:

- desktop preview and interaction testing;
- ESP32-S3 firmware compiled and uploaded with PlatformIO;
- the final Freenove 3.5-inch capacitive-touch display.

SquareLine Studio is optional. The UI will primarily be maintained as readable source code.

---

## Core approach

Use one repository with shared LVGL UI code and two build targets:

1. **Desktop simulator**
   - Opens a 480 × 320 window on the computer.
   - Mouse input simulates touch.
   - Used to preview layout, fonts, navigation, sliders, switches and animations.
   - Allows faster iteration without flashing the ESP32 after every change.

2. **ESP32-S3 firmware**
   - Built and uploaded through PlatformIO in VS Code.
   - Uses the Freenove display and capacitive-touch drivers.
   - Reuses the same screens, components, theme and events as the simulator.

The hardware-specific code must remain separate from the UI code.

---

## Required tools

- Visual Studio Code
- PlatformIO IDE extension
- C/C++ extension
- Git
- LVGL
- SDL2 for the desktop simulator
- Freenove display and touch libraries/examples for the exact 3.5-inch board

Optional:

- Official LVGL Editor extension for experimenting with LVGL XML projects
- LVGL Project Creator extension
- A live-preview extension only as a secondary experiment, not as the main workflow

---

## Important first step: lock the LVGL version

Do not start the UI implementation until the LVGL version used by the Freenove example project has been confirmed.

LVGL 8 and LVGL 9 use different APIs for:

- display registration;
- input devices;
- image descriptors;
- event callbacks;
- screen transitions;
- some widgets and style functions.

Once confirmed:

- pin that exact LVGL version in `platformio.ini`;
- use the same major version in the desktop simulator;
- do not update LVGL automatically during the MVP.

---

## Proposed repository structure

```text
miniature-cabinet/
├── platformio.ini
├── include/
│   ├── app_config.h
│   └── cabinet_models.h
├── src/
│   ├── main.cpp
│   ├── app/
│   │   ├── app_controller.cpp
│   │   ├── cabinet_store.cpp
│   │   └── lighting_controller.cpp
│   ├── hardware/
│   │   ├── display_freenove.cpp
│   │   ├── touch_freenove.cpp
│   │   └── led_strip.cpp
│   └── ui/
│       ├── ui.cpp
│       ├── ui.h
│       ├── ui_router.cpp
│       ├── ui_router.h
│       ├── theme/
│       │   ├── ui_theme.cpp
│       │   ├── ui_theme.h
│       │   └── ui_tokens.h
│       ├── components/
│       │   ├── header.cpp
│       │   ├── neon_button.cpp
│       │   ├── value_stepper.cpp
│       │   └── position_indicator.cpp
│       ├── screens/
│       │   ├── screen_overview.cpp
│       │   ├── screen_miniatures.cpp
│       │   ├── screen_cabinet_config.cpp
│       │   ├── screen_lights.cpp
│       │   └── screen_settings.cpp
│       ├── assets/
│       └── fonts/
├── simulator/
│   ├── main_simulator.cpp
│   ├── simulator_display.cpp
│   └── simulator_input.cpp
└── test/
```

The exact structure can be adjusted after inspecting the Freenove starter project.

---

## PlatformIO environments

The preferred setup is one `platformio.ini` with two environments.

```ini
[platformio]
default_envs = esp32s3

[env]
lib_deps =
    lvgl/lvgl@<PINNED_VERSION>
build_flags =
    -D LV_CONF_INCLUDE_SIMPLE

[env:esp32s3]
platform = espressif32
board = <EXACT_FREENOVE_BOARD_OR_COMPATIBLE_BOARD>
framework = arduino
monitor_speed = 115200
build_flags =
    ${env.build_flags}
    -D UI_TARGET_ESP32=1

[env:native]
platform = native
build_flags =
    ${env.build_flags}
    -D UI_TARGET_SIMULATOR=1
```

The native environment may need extra SDL2 include and linker flags depending on Windows configuration.

If PlatformIO native compilation becomes unreliable, keep PlatformIO for the ESP32 firmware and use the official LVGL SDL simulator with CMake for preview. The shared UI source files remain unchanged.

---

## Shared UI boundary

The UI layer may use LVGL but must not directly access:

- GPIO;
- Wi-Fi;
- LED-strip libraries;
- SD storage;
- Freenove display objects;
- ESP32-only APIs.

Instead, screens emit actions through callbacks.

```cpp
struct UiCallbacks {
    void (*set_lights_enabled)(bool enabled);
    void (*locate_miniature)(int location_index);
    void (*save_cabinet_config)();
    void (*apply_light_scene)(int scene_id);
};
```

The simulator provides fake callbacks.  
The ESP32 firmware provides real hardware callbacks.

This separation lets every screen run on both targets.

---

## Preview workflow in VS Code

### Normal UI iteration

1. Open the repository in VS Code.
2. Select the PlatformIO `native` environment.
3. Build and run the desktop simulator.
4. A 480 × 320 window opens.
5. Test the screen with the mouse as touch input.
6. Edit LVGL source files.
7. Rebuild and reopen the simulator.
8. Once stable, select `esp32s3`.
9. Build and upload to the physical display.

The simulator should always use the exact logical resolution:

```cpp
constexpr int UI_WIDTH = 480;
constexpr int UI_HEIGHT = 320;
```

Do not design at a larger resolution and scale it down later.

---

## Visual implementation rules

### Resolution and layout

- Fixed logical resolution: **480 × 320**
- Landscape orientation
- All important content must fit without scrolling unless the screen explicitly needs it.
- Large touch targets: approximately 40–48 px minimum where possible.
- Avoid thin decorative controls that look interactive but are difficult to touch.

### Readability

The display is installed near the bottom of the cabinet and viewed from a distance.

Therefore:

- screen titles must be large and bold;
- miniature names and primary values must be visually dominant;
- secondary metadata must remain readable without leaning close;
- avoid small captions unless they are non-essential;
- prefer fewer fields over dense layouts;
- use strong contrast and limited text.

### Theme

- Near-black background
- Cyan for primary actions and active navigation
- Purple for secondary actions and selected scenes
- Magenta and amber for status accents
- White for primary readable text
- Neon borders should be subtle enough to avoid reducing text clarity

### Performance

- Reuse styles instead of creating duplicate styles for every widget.
- Reuse common components.
- Avoid large full-screen transparent PNG assets.
- Prefer LVGL vector-like primitives and small indexed assets.
- Load only the fonts and glyph ranges actually required.
- Avoid excessive shadows, blur-like effects and simultaneous animations.
- Use static screen objects where possible instead of repeatedly recreating them.

---

## MVP screens

### 1. Overview

Contains only:

- current time;
- light on/off toggle;
- total miniature count;
- decorative cabinet image;
- bottom navigation.

### 2. Miniatures

Contains:

- back button;
- large miniature image;
- large miniature name;
- readable artist, date and theme;
- previous and next controls;
- Locate and Edit actions;
- global location position, such as `14 / 36`.

All cabinet locations are treated as one continuous sequence for navigation.

### 3. Cabinet Config

Contains:

- back button;
- compact vertical shelf selector;
- Add Shelf;
- number of locations;
- total LEDs in the selected shelf strip;
- visual location selector;
- visual LED-strip selector;
- mapped start LED, end LED, assigned and unassigned LEDs;
- Save and Test controls.

There are no modules. The mapping is only:

```text
Shelf → Location → LED range
```

### 4. Lights

Contains:

- back button;
- power toggle;
- scene selector;
- brightness;
- effect speed when relevant;
- target shelf or all shelves;
- Apply;
- Save Scene.

### 5. Settings

Contains:

- back button;
- Wi-Fi;
- display brightness;
- auto-off timeout;
- units;
- firmware/about;
- reset settings.

---

## Development sequence

### Phase 1 — Hardware baseline

- Compile the original Freenove example.
- Confirm display resolution and rotation.
- Confirm capacitive touch coordinates.
- Confirm exact LVGL version.
- Record pin configuration and driver classes.
- Create a minimal blank LVGL screen.

### Phase 2 — Desktop simulator

- Create a 480 × 320 SDL window.
- Register mouse input as touch.
- Compile one shared test screen.
- Confirm fonts and assets load on both targets.

### Phase 3 — UI foundation

Implement:

- color and spacing tokens;
- font sizes;
- reusable header;
- back button;
- neon button;
- switch;
- slider;
- position indicator;
- screen router.

### Phase 4 — First complete screen

Start with **Overview** because it is simple and validates:

- layout;
- fonts;
- image assets;
- switch interaction;
- navigation;
- simulator-to-hardware consistency.

### Phase 5 — Remaining MVP screens

Recommended order:

1. Overview
2. Settings
3. Lights
4. Miniatures
5. Cabinet Config

Cabinet Config is last because its LED-range interaction is the most custom.

### Phase 6 — Application connection

Replace simulator data with real application state:

- miniature catalogue;
- shelf/location configuration;
- LED mappings;
- scenes;
- settings;
- persistent storage.

---

## Data should not live inside screen files

Screens display data but do not own the cabinet model.

Example:

```cpp
struct CabinetLocation {
    uint16_t global_index;
    uint8_t shelf_index;
    uint8_t location_index;
    uint16_t led_start;
    uint16_t led_end;
};

struct Miniature {
    String name;
    String artist;
    String date;
    String theme;
    uint16_t location_index;
};
```

The app controller passes data to explicit UI functions:

```cpp
ui_overview_set_miniature_count(124);
ui_overview_set_lights_enabled(true);

ui_miniature_set_name("Frost Knight");
ui_miniature_set_artist("A. Smith");
ui_miniature_set_position(14, 36);
```

---

## Generated assets

Images and icons should be converted into LVGL-compatible C arrays only after their final dimensions are known.

Recommended approach:

- use LVGL built-in symbols where suitable;
- create small monochrome icons that can be recolored by LVGL;
- keep the decorative cabinet image optimized and resolution-limited;
- avoid embedding multiple mockup-sized images;
- use one or two font families at most.

Assets must be tested for flash and RAM use on the ESP32-S3.

---

## Definition of done for each screen

A screen is complete when:

- it renders at exactly 480 × 320;
- it works in the desktop simulator;
- it compiles for the ESP32-S3;
- touch targets work on the physical display;
- text is readable from the intended cabinet viewing distance;
- it does not depend on simulator-only code;
- its events call app-level callbacks;
- it does not contain cabinet business logic;
- memory usage remains acceptable;
- no screen-specific styles duplicate shared theme styles unnecessarily.

---

## Main risks

### LVGL version mismatch

Mitigation: pin the Freenove-compatible version before writing screens.

### Simulator and hardware rendering differences

Mitigation: use the same LVGL version, fonts, resolution and color depth on both targets.

### Fonts consume too much flash

Mitigation: include only required sizes and glyph ranges.

### Neon effects reduce performance

Mitigation: prioritize borders and solid gradients over expensive shadows and transparency.

### Touch controls look large in a mockup but remain difficult to use

Mitigation: validate every screen on the real 3.5-inch display early.

### Native PlatformIO simulator setup is difficult on Windows

Mitigation: fall back to the official LVGL SDL/CMake simulator while continuing to use PlatformIO for ESP32 builds.

---

## Initial deliverable

The first implementation package should contain:

```text
platformio.ini
src/ui/ui.cpp
src/ui/ui.h
src/ui/theme/ui_theme.cpp
src/ui/theme/ui_theme.h
src/ui/components/header.cpp
src/ui/components/header.h
src/ui/screens/screen_overview.cpp
src/ui/screens/screen_overview.h
simulator/main_simulator.cpp
```

It should open the Overview screen in a 480 × 320 desktop window and compile against the pinned LVGL version.

---

## Reference documentation

- LVGL: https://docs.lvgl.io/
- LVGL source: https://github.com/lvgl/lvgl
- Official LVGL Editor for VS Code: https://marketplace.visualstudio.com/items?itemName=LVGL.lvgl-editor
- PlatformIO IDE for VS Code: https://docs.platformio.org/en/latest/integration/ide/vscode.html
