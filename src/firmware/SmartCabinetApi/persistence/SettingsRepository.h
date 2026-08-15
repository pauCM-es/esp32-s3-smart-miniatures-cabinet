#pragma once

#include <Arduino.h>

#include "ISettingsStore.h"

class SettingsRepository {
public:
    explicit SettingsRepository(
        ISettingsStore& store,
        uint32_t saveDelayMs = 1000
    );

    bool begin(const CabinetSettings& defaults = CabinetSettings{});

    const CabinetSettings& get() const;

    void setPower(bool enabled);
    void setBrightness(uint8_t percent);
    void setHighlightColor(uint8_t r, uint8_t g, uint8_t b);

    void loop();
    bool flush();

    bool isDirty() const;
    bool lastSaveOk() const;

private:
    void markDirty();

    ISettingsStore& store_;
    CabinetSettings settings_;

    uint32_t saveDelayMs_;
    uint32_t dirtySinceMs_ = 0;

    bool dirty_ = false;
    bool lastSaveOk_ = true;
};
