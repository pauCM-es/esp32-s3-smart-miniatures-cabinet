#include "sdl_input.h"
#include <SDL2/SDL.h>

void sdl_input_read(lv_indev_drv_t *drv, lv_indev_data_t *data)
{
    (void)drv;
    int x, y;
    uint32_t buttons = SDL_GetMouseState(&x, &y);
    data->point.x = (lv_coord_t)x;
    data->point.y = (lv_coord_t)y;
    data->state   = (buttons & SDL_BUTTON(SDL_BUTTON_LEFT))
                    ? LV_INDEV_STATE_PR
                    : LV_INDEV_STATE_REL;
}
