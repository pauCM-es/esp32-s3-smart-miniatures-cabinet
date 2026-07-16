#pragma once

#include "lvgl/lvgl.h"

/* ── Color tokens ────────────────────────────────────────────────────────── */
/*
 * Base palette
 *   Background  #05050E   Card     #0C0D17   Border  #3B3E4D
 *   White       #FFFFFF   Gray     #A2A0A4
 *   Cyan        #00E4F6   Purple   #B451ED   Pink    #F04EB9
 *
 * Derived tokens (header, btn, nav-active-bg) are darkened tints of the
 * nearest base colour — update them if the base values change.
 */

/* Darkest background surface */
static inline lv_color_t ui_color_bg(void)             { return lv_color_hex(0x05050E); }
/* Card / panel surfaces */
static inline lv_color_t ui_color_panel(void)          { return lv_color_hex(0x0C0D17); }
/* Header bar — between bg and card */
static inline lv_color_t ui_color_header(void)         { return lv_color_hex(0x08080F); }
/* Primary accent — purple */
static inline lv_color_t ui_color_accent(void)         { return lv_color_hex(0xB451ED); }
/* Secondary accent — cyan */
static inline lv_color_t ui_color_accent2(void)        { return lv_color_hex(0x00E4F6); }
/* Tertiary accent — pink */
static inline lv_color_t ui_color_pink(void)           { return lv_color_hex(0xF04EB9); }
/* Button background — dark purple tint */
static inline lv_color_t ui_color_btn(void)            { return lv_color_hex(0x1E0F35); }
/* Primary text — white */
static inline lv_color_t ui_color_text(void)           { return lv_color_hex(0xFFFFFF); }
/* Secondary / muted text — gray */
static inline lv_color_t ui_color_text_dim(void)       { return lv_color_hex(0xA2A0A4); }
/* Divider / border */
static inline lv_color_t ui_color_border(void)         { return lv_color_hex(0x3B3E4D); }
/* Active nav-bar item background — dark cyan tint */
static inline lv_color_t ui_color_nav_active_bg(void)  { return lv_color_hex(0x061318); }
/* Yellow — brightness, warnings */
static inline lv_color_t ui_color_yellow(void)         { return lv_color_hex(0xFFB800); }
/* Blue — info, about */
static inline lv_color_t ui_color_blue(void)           { return lv_color_hex(0x3A7FD5); }

/* ── Display dimensions ──────────────────────────────────────────────────── */
static constexpr lv_coord_t UI_SCREEN_W = 480;   /* display width             */
static constexpr lv_coord_t UI_SCREEN_H = 320;   /* display height            */

/* ── Spacing ─────────────────────────────────────────────────────────────── */
static constexpr lv_coord_t UI_MARGIN   = 12;    /* outer edge margin         */
static constexpr lv_coord_t UI_GAP      =  8;    /* gap between items         */
static constexpr lv_coord_t UI_RADIUS   =  6;    /* default corner radius     */
static constexpr lv_coord_t UI_HDR_H    = 44;    /* header height             */
static constexpr lv_coord_t UI_NAV_H    = 54;    /* bottom nav-bar height     */
static constexpr lv_coord_t UI_BTN_H    = 48;    /* minimum touch-target height */

/* ── Fonts ───────────────────────────────────────────────────────────────── */
/* Use lv_font_montserrat_* – sizes enabled in lv_conf.h */
#define UI_FONT_TITLE  (&lv_font_montserrat_20)   /* screen / section titles  */
#define UI_FONT_NUM    (&lv_font_montserrat_28)   /* large numbers / time     */
#define UI_FONT_LARGE  (&lv_font_montserrat_24)   /* medium emphasis          */
#define UI_FONT_BODY   (&lv_font_montserrat_14)   /* body text                */
#define UI_FONT_SMALL  (&lv_font_montserrat_12)   /* captions / nav labels    */
