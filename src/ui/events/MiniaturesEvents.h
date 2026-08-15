#pragma once
#include <stdint.h>

// App-logic C-linkage entry points called from the miniatures screen events.

#ifdef __cplusplus
extern "C" {
#endif

void minis_on_screen_opened(void);
void minis_on_screen_unloaded(void);
void minis_on_previous_pressed(void);
void minis_on_next_pressed(void);
void minis_on_slider_changed(int32_t index);
void minis_on_card_tapped(void);

#ifdef __cplusplus
}
#endif
