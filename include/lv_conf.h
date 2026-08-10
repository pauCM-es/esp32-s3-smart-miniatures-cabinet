#ifndef LV_CONF_H
#define LV_CONF_H

/* Display format required by Freenove's FNK0104N / ST77922 driver. */
#define LV_COLOR_DEPTH 16
#define LV_COLOR_16_SWAP 1

/* SquareLine creates multiple complex screens at boot; 96 KB is too small and
 * can trigger null object allocations during ui_init(). */
#define LV_MEM_CUSTOM 1
#define LV_MEM_CUSTOM_INCLUDE <stdlib.h>
#define LV_MEM_CUSTOM_ALLOC malloc
#define LV_MEM_CUSTOM_FREE free
#define LV_MEM_CUSTOM_REALLOC realloc

/* Use Arduino millis() as LVGL's tick source. */
#define LV_TICK_CUSTOM 1
#define LV_TICK_CUSTOM_INCLUDE "Arduino.h"
#define LV_TICK_CUSTOM_SYS_TIME_EXPR (millis())

#define LV_USE_LOG 1
#define LV_LOG_LEVEL LV_LOG_LEVEL_WARN
#define LV_USE_PERF_MONITOR 0
#define LV_USE_MEM_MONITOR 0

/* Fonts used by the starter and likely cabinet screens. */
#define LV_FONT_MONTSERRAT_14 1
#define LV_FONT_MONTSERRAT_16 1
#define LV_FONT_MONTSERRAT_18 1
#define LV_FONT_MONTSERRAT_20 1
#define LV_FONT_MONTSERRAT_24 1
#define LV_FONT_MONTSERRAT_28 1
#define LV_FONT_MONTSERRAT_30 1
#define LV_FONT_MONTSERRAT_32 1
#define LV_FONT_MONTSERRAT_36 1
#define LV_FONT_MONTSERRAT_38 1
#define LV_FONT_MONTSERRAT_42 1

/* Layout engines commonly emitted by SquareLine Studio. */
#define LV_USE_FLEX 1
#define LV_USE_GRID 1

/* Widgets needed by the cabinet MVP and typical SquareLine exports. */
#define LV_USE_ARC 1
#define LV_USE_BAR 1
#define LV_USE_BTN 1
#define LV_USE_CHECKBOX 1
#define LV_USE_DROPDOWN 1
#define LV_USE_IMG 1
#define LV_USE_KEYBOARD 1
#define LV_USE_LABEL 1
#define LV_USE_LIST 1
#define LV_USE_MSGBOX 1
#define LV_USE_ROLLER 1
#define LV_USE_SLIDER 1
#define LV_USE_SPINBOX 1
#define LV_USE_SWITCH 1
#define LV_USE_TABVIEW 1
#define LV_USE_TEXTAREA 1
#define LV_USE_TILEVIEW 1

#endif
