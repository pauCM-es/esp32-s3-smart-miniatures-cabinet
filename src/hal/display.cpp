#include "display.h"

#include <Arduino.h>
#include <ST77922.h>
#include <esp_heap_caps.h>
#include <lvgl.h>
#include <ST77922_Touch.h>

namespace {

constexpr uint16_t kWidth = 480;
constexpr uint16_t kHeight = 320;
constexpr uint8_t kRotation = 1;

constexpr size_t kFramePixels =
    static_cast<size_t>(kWidth) * static_cast<size_t>(kHeight);

constexpr size_t kFrameBytes =
    kFramePixels * sizeof(lv_color_t);

ST77922 panel;
ST77922_TOUCH touchPanel;

lv_disp_draw_buf_t drawBuffer;
lv_color_t* frameBuffer = nullptr;

void flushDisplay(
    lv_disp_drv_t* driver,
    const lv_area_t* area,
    lv_color_t* pixels
) {
    // full_refresh ensures this is always the complete 480 × 320 frame.
    panel.Fill_Colors(
        0,
        0,
        kWidth,
        kHeight,
        reinterpret_cast<uint16_t*>(pixels)
    );

    lv_disp_flush_ready(driver);
}

#if LV_USE_LOG != 0
void printLvglLog(const char* message) {
    Serial.print(message);
}
#endif

void readTouch(lv_indev_drv_t*, lv_indev_data_t* data) {
    if (!touchPanel.Get_Touch()) {
        data->state = LV_INDEV_STATE_REL;
        return;
    }

    const uint16_t x = touchPanel.touch.x[0];
    const uint16_t y = touchPanel.touch.y[0];

    // Ignore invalid coordinates.
    if (x >= panel.Get_Width() || y >= panel.Get_Height()) {
        data->state = LV_INDEV_STATE_REL;
        return;
    }

    data->point.x = static_cast<lv_coord_t>(x);
    data->point.y = static_cast<lv_coord_t>(y);
    data->state = LV_INDEV_STATE_PR;
}

} // namespace

void Display::begin() {
    panel.Init();
    panel.Set_Rotation(kRotation);
    
    touchPanel.init();
    touchPanel.Set_Rotation(kRotation);

    Serial.println("ST77922 touch initialized.");

    Serial.printf(
        "ST77922 dimensions: %u x %u\n",
        panel.Get_Width(),
        panel.Get_Height()
    );

    Serial.printf(
        "PSRAM available: %u bytes\n",
        ESP.getFreePsram()
    );

    lv_init();

    #if LV_USE_LOG != 0
        lv_log_register_print_cb(printLvglLog);
    #endif

    frameBuffer = static_cast<lv_color_t*>(
        heap_caps_malloc(
            kFrameBytes,
            MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT
        )
    );

    if (frameBuffer == nullptr) {
        Serial.println("ERROR: could not allocate LVGL framebuffer in PSRAM.");

        while (true) {
            delay(1000);
        }
    }

    memset(frameBuffer, 0, kFrameBytes);

    Serial.printf(
        "LVGL framebuffer allocated: %u bytes\n",
        static_cast<unsigned int>(kFrameBytes)
    );

    lv_disp_draw_buf_init(
        &drawBuffer,
        frameBuffer,
        nullptr,
        kFramePixels
    );

    static lv_disp_drv_t driver;
    lv_disp_drv_init(&driver);

    driver.hor_res = kWidth;
    driver.ver_res = kHeight;
    driver.flush_cb = flushDisplay;
    driver.draw_buf = &drawBuffer;

    // Always render and transfer one complete screen.
    driver.full_refresh = 1;

    lv_disp_drv_register(&driver);

    static lv_indev_drv_t touchDriver;
    lv_indev_drv_init(&touchDriver); 

    touchDriver.type = LV_INDEV_TYPE_POINTER;
    touchDriver.read_cb = readTouch;

    lv_indev_drv_register(&touchDriver);

    Serial.println("LVGL touch driver registered.");

    Serial.println("LVGL full-frame display driver registered.");
}

void Display::loop() {
    lv_timer_handler();
}