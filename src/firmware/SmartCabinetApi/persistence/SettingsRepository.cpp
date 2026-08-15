#include "SettingsRepository.h"

SettingsRepository::SettingsRepository(
    ISettingsStore& store,
    uint32_t saveDelayMs
)
    : store_(store),
      saveDelayMs_(saveDelayMs) {}

bool SettingsRepository::begin(const CabinetSettings& defaults) {
    CabinetSettings loaded;

    if (store_.load(loaded)) {
        settings_ = loaded;
        dirty_ = false;
        lastSaveOk_ = true;
        return true;
    }

    settings_ = defaults;
    lastSaveOk_ = store_.save(settings_);
    dirty_ = !lastSaveOk_;

    if (dirty_) {
        dirtySinceMs_ = millis();
    }

    return lastSaveOk_;
}

const CabinetSettings& SettingsRepository::get() const {
    return settings_;
}

void SettingsRepository::setPower(bool enabled) {
    if (settings_.power == enabled) {
        return;
    }

    settings_.power = enabled;
    markDirty();
}

void SettingsRepository::setBrightness(uint8_t percent) {
    const uint8_t clamped = percent > 100 ? 100 : percent;

    if (settings_.brightness == clamped) {
        return;
    }

    settings_.brightness = clamped;
    markDirty();
}

void SettingsRepository::setHighlightColor(uint8_t r, uint8_t g, uint8_t b) {
    if (settings_.highlightR == r && settings_.highlightG == g && settings_.highlightB == b) {
        return;
    }
    settings_.highlightR = r;
    settings_.highlightG = g;
    settings_.highlightB = b;
    markDirty();
}

void SettingsRepository::loop() {
    if (!dirty_) {
        return;
    }

    const uint32_t now = millis();

    if (static_cast<uint32_t>(now - dirtySinceMs_) < saveDelayMs_) {
        return;
    }

    flush();
}

bool SettingsRepository::flush() {
    if (!dirty_) {
        return true;
    }

    lastSaveOk_ = store_.save(settings_);

    if (lastSaveOk_) {
        dirty_ = false;
    } else {
        dirtySinceMs_ = millis();
    }

    return lastSaveOk_;
}

bool SettingsRepository::isDirty() const {
    return dirty_;
}

bool SettingsRepository::lastSaveOk() const {
    return lastSaveOk_;
}

void SettingsRepository::markDirty() {
    dirty_ = true;
    dirtySinceMs_ = millis();
}
