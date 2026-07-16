#include "sdl_display.h"
#include <SDL2/SDL.h>
#include <stdint.h>

#define DISP_WIDTH  480
#define DISP_HEIGHT 320

static SDL_Window   *g_window;
static SDL_Renderer *g_renderer;
static SDL_Texture  *g_texture;

/* Scratch buffer for RGB565 → ARGB8888 conversion */
static uint32_t g_argb_buf[DISP_WIDTH * DISP_HEIGHT];

void sdl_display_init(void)
{
    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return;
    }
    g_window = SDL_CreateWindow(
        "LVGL Simulator — 480 × 320",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        DISP_WIDTH, DISP_HEIGHT,
        SDL_WINDOW_SHOWN);

    g_renderer = SDL_CreateRenderer(g_window, -1,
        SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);

    g_texture = SDL_CreateTexture(g_renderer,
        SDL_PIXELFORMAT_ARGB8888,
        SDL_TEXTUREACCESS_STREAMING,
        DISP_WIDTH, DISP_HEIGHT);
}

void sdl_display_flush(lv_disp_drv_t *drv, const lv_area_t *area, lv_color_t *color_p)
{
    int32_t w = area->x2 - area->x1 + 1;
    int32_t h = area->y2 - area->y1 + 1;

    /* lv_color_to32 handles LV_COLOR_DEPTH correctly */
    for (int32_t i = 0; i < w * h; i++) {
        g_argb_buf[i] = lv_color_to32(color_p[i]);
    }

    SDL_Rect rect = { area->x1, area->y1, w, h };
    SDL_UpdateTexture(g_texture, &rect, g_argb_buf, w * (int)sizeof(uint32_t));
    SDL_RenderCopy(g_renderer, g_texture, NULL, NULL);
    SDL_RenderPresent(g_renderer);

    lv_disp_flush_ready(drv);
}
