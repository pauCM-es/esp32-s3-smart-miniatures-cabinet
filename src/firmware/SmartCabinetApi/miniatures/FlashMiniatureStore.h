#pragma once

#include <Arduino.h>
#include <FS.h>

#include "IMiniatureStore.h"

/**
 * File-backed catalogue stored in the ESP32 internal flash.
 *
 * Pass LittleFS as the fs::FS instance.
 */
class FlashMiniatureStore final : public IMiniatureStore {
public:
    FlashMiniatureStore(
        fs::FS& fs,
        const char* path =
            "/smart_cabinet/miniatures.json"
    );

    bool load(std::vector<Miniature>& items) override;
    bool save(const std::vector<Miniature>& items) override;

private:
    bool ensureParentDirectory();

    fs::FS& fs_;
    String path_;
};
