#pragma once

#include "lvgl/lvgl.h"

/* ── Color tokens ────────────────────────────────────────────────────────── */

/* Dark base background */
static inline lv_color_t ui_color_bg(void)             { return lv_color_hex(0x0D0D1A); }
/* Slightly lighter panel surfaces */
static inline lv_color_t ui_color_panel(void)          { return lv_color_hex(0x1A1A2E); }
/* Header bar */
static inline lv_color_t ui_color_header(void)         { return lv_color_hex(0x12122A); }
/* Primary neon accent (purple) */
static inline lv_color_t ui_color_accent(void)         { return lv_color_hex(0x9B30FF); }
/* Secondary accent (cyan) */
static inline lv_color_t ui_color_accent2(void)        { return lv_color_hex(0x00D4FF); }
/* Button background */
static inline lv_color_t ui_color_btn(void)            { return lv_color_hex(0x2D1B4E); }
/* Primary text (near-white) */
static inline lv_color_t ui_color_text(void)           { return lv_color_hex(0xE8E8FF); }
/* Secondary / muted text */
static inline lv_color_t ui_color_text_dim(void)       { return lv_color_hex(0x8080A0); }
/* Divider / border */
static inline lv_color_t ui_color_border(void)         { return lv_color_hex(0x2A2A50); }
/* Active nav-bar item background (dark teal) */
static inline lv_color_t ui_color_nav_active_bg(void)  { return lv_color_hex(0x0A1F2D); }

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
