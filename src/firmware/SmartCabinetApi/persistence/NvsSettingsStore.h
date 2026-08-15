#pragma once

#include <Arduino.h>
#include "ISettingsStore.h"

class NvsSettingsStore final : public ISettingsStore {
public:
    explicit NvsSettingsStore(const char* nameSpace = "cabinet");

    bool load(CabinetSettings& settings) override;
    bool save(const CabinetSettings& settings) override;

private:
    String namespace_;
};
