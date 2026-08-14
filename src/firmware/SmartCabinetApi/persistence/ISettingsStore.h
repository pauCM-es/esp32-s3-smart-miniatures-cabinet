#pragma once

#include "../SmartCabinetTypes.h"

class ISettingsStore {
public:
    virtual ~ISettingsStore() = default;

    virtual bool load(CabinetSettings& settings) = 0;
    virtual bool save(const CabinetSettings& settings) = 0;
};
