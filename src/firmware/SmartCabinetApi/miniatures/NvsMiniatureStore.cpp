#include "NvsMiniatureStore.h"

#include <Preferences.h>
#include "MiniatureJson.h"

namespace {
constexpr const char* CATALOG_KEY = "catalog";
}

NvsMiniatureStore::NvsMiniatureStore(const char* nameSpace)
    : namespace_(nameSpace) {}

bool NvsMiniatureStore::load(std::vector<Miniature>& items) {
    Preferences preferences;

    if (!preferences.begin(namespace_.c_str(), true)) {
        return false;
    }

    if (!preferences.isKey(CATALOG_KEY)) {
        preferences.end();
        return false;
    }

    const String json =
        preferences.getString(CATALOG_KEY, "");

    preferences.end();

    if (json.isEmpty()) {
        return false;
    }

    return MiniatureJson::deserializeCollection(json, items);
}

bool NvsMiniatureStore::save(
    const std::vector<Miniature>& items
) {
    String json;

    if (!MiniatureJson::serializeCollection(items, json)) {
        return false;
    }

    Preferences preferences;

    if (!preferences.begin(namespace_.c_str(), false)) {
        return false;
    }

    const size_t written =
        preferences.putString(CATALOG_KEY, json);

    preferences.end();

    return written > 0;
}
