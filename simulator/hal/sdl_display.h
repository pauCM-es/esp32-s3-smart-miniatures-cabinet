#pragma once

#ifdef __cplusplus
extern "C" {
#endif

#include "lvgl/lvgl.h"

void sdl_display_init(void);
void sdl_display_flush(lv_disp_drv_t *drv, const lv_area_t *area, lv_color_t *color_p);

#ifdef __cplusplus
}
#endif
