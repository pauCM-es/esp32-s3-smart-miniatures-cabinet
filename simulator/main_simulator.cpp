#include <SDL2/SDL.h>
#include "lvgl/lvgl.h"
#include "hal/sdl_display.h"
#include "hal/sdl_input.h"
#include "ui/ui.h"
#include "ui_v2_mock_adapter.h"
#include "app_config.h"

/* Two draw buffers: 480 * 10 lines each (double-buffered flush) */
#define DRAW_BUF_LINES 10
#define DRAW_BUF_SIZE  (UI_WIDTH * DRAW_BUF_LINES)

int main(int /*argc*/, char * /*argv*/[])
{
    lv_init();
    sdl_display_init();

    /* ── Display driver ─────────────────────────────────────────────────── */
    static lv_disp_draw_buf_t draw_buf;
    static lv_color_t         buf1[DRAW_BUF_SIZE];
    static lv_color_t         buf2[DRAW_BUF_SIZE];
    lv_disp_draw_buf_init(&draw_buf, buf1, buf2, DRAW_BUF_SIZE);

    static lv_disp_drv_t disp_drv;
    lv_disp_drv_init(&disp_drv);
    disp_drv.flush_cb = sdl_display_flush;
    disp_drv.draw_buf = &draw_buf;
    disp_drv.hor_res  = UI_WIDTH;
    disp_drv.ver_res  = UI_HEIGHT;
    lv_disp_t *disp = lv_disp_drv_register(&disp_drv);

    /* ── LVGL default dark theme ────────────────────────────────────────── */
    lv_theme_t *theme = lv_theme_default_init(
        disp,
        lv_palette_main(LV_PALETTE_PURPLE),
        lv_palette_main(LV_PALETTE_CYAN),
        true,   /* dark mode */
        &lv_font_montserrat_14);
    lv_disp_set_theme(disp, theme);

    /* ── Touch/mouse input driver ───────────────────────────────────────── */
    static lv_indev_drv_t indev_drv;
    lv_indev_drv_init(&indev_drv);
    indev_drv.type    = LV_INDEV_TYPE_POINTER;
    indev_drv.read_cb = sdl_input_read;
    lv_indev_drv_register(&indev_drv);

    /* ── Load UI ────────────────────────────────────────────────────────── */
    ui_init();
    ui_simulator_mock_init();

    /* ── Main loop ──────────────────────────────────────────────────────── */
    SDL_Event event;
    bool      running   = true;
    uint32_t  last_tick = SDL_GetTicks();

    while (running) {
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) running = false;
        }

        uint32_t now = SDL_GetTicks();
        lv_tick_inc(now - last_tick);
        last_tick = now;

        lv_timer_handler();
        SDL_Delay(5);
    }

    SDL_Quit();
    return 0;
}
