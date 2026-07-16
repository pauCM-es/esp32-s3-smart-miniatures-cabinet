#include "ui_router.h"
#include "screens/screen_overview.h"
#include "screens/screen_settings.h"

void ui_goto_overview(void) { screen_overview_load(); }
void ui_goto_settings(void) { screen_settings_load(); }
