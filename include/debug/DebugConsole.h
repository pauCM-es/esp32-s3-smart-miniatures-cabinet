#pragma once

#include <Arduino.h>
#include "app/AppController.h"

namespace smartcabinet {

class DebugConsole {
public:
    explicit DebugConsole(AppController& app);

    void begin(Stream& stream = Serial);
    void update();

private:
    AppController& app_;
    Stream* stream_{nullptr};
    String buffer_{};

    void handleLine(const String& line);
    void printHelp();
    void printState();
    void printLayout();
    static bool parseEffect(const char* text, LightEffect& effect);
};

}  // namespace smartcabinet
