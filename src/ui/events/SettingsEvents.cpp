#include "SettingsEvents.h"

#include "app/CatalogueContext.h"

extern "C" {

void settings_on_reset_catalogue() {
    catalogue.reset();
}

}  // extern "C"
