#pragma once

/**
 * Thin navigation router — breaks circular includes between screen files.
 * Each screen calls these instead of including other screens directly.
 */
void ui_goto_overview(void);
void ui_goto_settings(void);
