#include "NvsSettingsStore.h"

#include <Preferences.h>
#include "SettingsJson.h"

namespace {
constexpr const char* SETTINGS_KEY = "settings";
}

NvsSettingsStore::NvsSettingsStore(const char* nameSpace)
    : namespace_(nameSpace) {}

bool NvsSettingsStore::load(CabinetSettings& settings) {
    Preferences preferences;

    if (!preferences.begin(namespace_.c_str(), true)) {
        return false;
    }

    if (!preferences.isKey(SETTINGS_KEY)) {
        preferences.end();
        return false;
    }

    const String json = preferences.getString(SETTINGS_KEY, "");
    preferences.end();

    if (json.isEmpty()) {
        return false;
    }

    return SettingsJson::deserialize(json, settings);
}

bool NvsSettingsStore::save(const CabinetSettings& settings) {
    String json;
    if (!SettingsJson::serialize(settings, json)) {
        return false;
    }

    Preferences preferences;
    if (!preferences.begin(namespace_.c_str(), false)) {
        return false;
    }

    const size_t written = preferences.putString(SETTINGS_KEY, json);
    preferences.end();

    return written > 0;
}
