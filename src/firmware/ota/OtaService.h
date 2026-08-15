#pragma once

#include <cstdint>
#include <functional>

#include "models/OtaState.h"

namespace smartcabinet {

constexpr uint32_t kDefaultOtaTimeoutMs = 5UL * 60UL * 1000UL;
constexpr uint32_t kMaxOtaTimeoutMs     = 5UL * 60UL * 1000UL;
constexpr const char* kOtaHostname      = "smart-cabinet";

class OtaService {
public:
    using StateChangedCallback = std::function<void()>;

    void begin();

    void enable(uint32_t timeoutMs = kDefaultOtaTimeoutMs);
    void disable();
    void update(uint32_t nowMs);

    OtaState state() const { return state_; }
    bool isEnabled() const { return state_ != OtaState::Disabled; }
    bool isUpdating() const { return state_ == OtaState::Updating; }
    uint32_t remainingMs(uint32_t nowMs) const;

    void setStateChangedCallback(StateChangedCallback cb);
    void setOnEnterCallback(std::function<void()> cb);
    void setOnExitCallback(std::function<void()> cb);

private:
    OtaState state_{OtaState::Disabled};
    uint32_t enabledAt_{0};
    uint32_t timeoutMs_{0};
    bool initialized_{false};
    uint8_t lastProgress_{0};

    StateChangedCallback onStateChanged_;
    std::function<void()> onEnter_;
    std::function<void()> onExit_;

    void notifyStateChanged();
};

}  // namespace smartcabinet
