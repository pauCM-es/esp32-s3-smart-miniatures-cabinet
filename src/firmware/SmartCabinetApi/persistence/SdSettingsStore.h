#pragma once

#include <Arduino.h>
#include <FS.h>

#include "ISettingsStore.h"

class SdSettingsStore final : public ISettingsStore {
public:
    SdSettingsStore(
        fs::FS& fs,
        const char* path = "/smart_cabinet/settings.json"
    );

    bool load(CabinetSettings& settings) override;
    bool save(const CabinetSettings& settings) override;

private:
    bool ensureParentDirectory();

    fs::FS& fs_;
    String path_;
};
