#include "FlashMiniatureStore.h"

#include "MiniatureJson.h"

FlashMiniatureStore::FlashMiniatureStore(
    fs::FS& fs,
    const char* path
)
    : fs_(fs),
      path_(path) {}

bool FlashMiniatureStore::load(
    std::vector<Miniature>& items
) {
    File file = fs_.open(path_.c_str(), FILE_READ);

    if (!file) {
        return false;
    }

    String json;
    json.reserve(file.size() + 1);

    while (file.available()) {
        json += static_cast<char>(file.read());
    }

    file.close();

    if (json.isEmpty()) {
        return false;
    }

    return MiniatureJson::deserializeCollection(
        json,
        items
    );
}

bool FlashMiniatureStore::save(
    const std::vector<Miniature>& items
) {
    if (!ensureParentDirectory()) {
        return false;
    }

    String json;

    if (!MiniatureJson::serializeCollection(items, json)) {
        return false;
    }

    const String tempPath = path_ + ".tmp";

    fs_.remove(tempPath.c_str());

    File tempFile =
        fs_.open(tempPath.c_str(), FILE_WRITE);

    if (!tempFile) {
        return false;
    }

    const size_t written = tempFile.print(json);
    tempFile.flush();
    tempFile.close();

    if (written != json.length()) {
        fs_.remove(tempPath.c_str());
        return false;
    }

    fs_.remove(path_.c_str());

    if (!fs_.rename(tempPath.c_str(), path_.c_str())) {
        fs_.remove(tempPath.c_str());
        return false;
    }

    return true;
}

bool FlashMiniatureStore::ensureParentDirectory() {
    const int separator = path_.lastIndexOf('/');

    if (separator <= 0) {
        return true;
    }

    const String directory =
        path_.substring(0, separator);

    if (fs_.exists(directory.c_str())) {
        return true;
    }

    return fs_.mkdir(directory.c_str());
}
