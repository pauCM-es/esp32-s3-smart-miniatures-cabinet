#pragma once

#include <Arduino.h>
#include <FS.h>

#include "IMiniatureStore.h"

class SdMiniatureStore final : public IMiniatureStore {
public:
    SdMiniatureStore(
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
