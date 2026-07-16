cmake_minimum_required(VERSION 3.16)
project(lvgl_simulator C CXX)

# Silence LVGL's CMP0177 warning in FetchContent sub-projects (CMake 4.x).
set(CMAKE_POLICY_DEFAULT_CMP0177 NEW)

set(CMAKE_C_STANDARD   11)
set(CMAKE_CXX_STANDARD 17)

# ─── SDL2 (MinGW build, pre-downloaded to deps/) ────────────────────────────
set(SDL2_ROOT    "${CMAKE_CURRENT_SOURCE_DIR}/deps/SDL2-2.32.10/x86_64-w64-mingw32")
set(SDL2_INCLUDE "${SDL2_ROOT}/include")
set(SDL2_LIB     "${SDL2_ROOT}/lib")
set(SDL2_BIN     "${SDL2_ROOT}/bin")

# ─── LVGL 8.4.0 via FetchContent ────────────────────────────────────────────
include(FetchContent)

FetchContent_Declare(
    lvgl
    GIT_REPOSITORY https://github.com/lvgl/lvgl.git
    GIT_TAG        v8.4.0
    GIT_SHALLOW    TRUE
    # Name the source directory "lvgl" so that #include "lvgl/lvgl.h" resolves
    # when we add the parent directory to the include path.
    SOURCE_DIR     "${CMAKE_CURRENT_BINARY_DIR}/_deps/lvgl"
)
FetchContent_MakeAvailable(lvgl)

# Add the deps parent so #include "lvgl/lvgl.h" works project-wide.
# The simulator/ dir is also included so LVGL finds our lv_conf.h via LV_CONF_INCLUDE_SIMPLE.
target_compile_definitions(lvgl PUBLIC LV_CONF_INCLUDE_SIMPLE LV_LVGL_H_INCLUDE_SIMPLE)
target_include_directories(lvgl PUBLIC
    "${CMAKE_CURRENT_BINARY_DIR}/_deps"   # allows  #include "lvgl/lvgl.h"
    "${CMAKE_CURRENT_SOURCE_DIR}"          # allows  #include "lv_conf.h"
)

# ─── Shared UI sources (also compiled into the ESP32 build) ─────────────────
set(UI_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/ui.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/ui_router.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/theme/ui_theme.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/screens/screen_overview.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/screens/screen_settings.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/components/ui_icon_placeholder.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/components/ui_image_placeholder.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/components/ui_info_card.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/components/ui_nav_bar.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/components/ui_header.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/components/ui_circle_icon.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/ui/assets/img_cabinet.c"
)

# ─── Simulator executable ───────────────────────────────────────────────────
add_executable(simulator
    main_simulator.cpp
    hal/sdl_display.c
    hal/sdl_input.c
    ${UI_SOURCES}
)

target_include_directories(simulator PRIVATE
    "${SDL2_INCLUDE}"
    "${CMAKE_CURRENT_SOURCE_DIR}"            # lv_conf.h + hal headers
    "${CMAKE_CURRENT_SOURCE_DIR}/../src"     # for #include "ui/ui.h" etc.
    "${CMAKE_CURRENT_SOURCE_DIR}/../include" # app_config.h
)

target_compile_definitions(simulator PRIVATE
    UI_TARGET_SIMULATOR=1
)

# SDL2 link order required by MinGW: -lmingw32 → SDL2main → SDL2 → system libs
target_link_libraries(simulator PRIVATE
    lvgl
    -lmingw32
    "${SDL2_LIB}/libSDL2main.a"
    "${SDL2_LIB}/libSDL2.a"
    -Wl,--dynamicbase
    -Wl,--nxcompat
    -lm -ldinput8 -ldxguid -ldxerr8 -luser32 -lgdi32
    -lwinmm -limm32 -lole32 -loleaut32 -lshell32
    -lsetupapi -lversion -luuid
)

# Copy SDL2.dll next to the built executable so it can run in-place
add_custom_command(TARGET simulator POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${SDL2_BIN}/SDL2.dll"
        "$<TARGET_FILE_DIR:simulator>"
    COMMENT "Copying SDL2.dll to build output"
)
