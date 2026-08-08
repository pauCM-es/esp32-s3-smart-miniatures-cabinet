#include "debug/DebugConsole.h"

#include <cstdio>
#include <cstring>

namespace smartcabinet {

DebugConsole::DebugConsole(AppController& app) : app_(app) {}

void DebugConsole::begin(Stream& stream) {
    stream_ = &stream;
    printHelp();
}

void DebugConsole::update() {
    if (stream_ == nullptr) {
        return;
    }

    while (stream_->available() > 0) {
        const char c = static_cast<char>(stream_->read());
        if (c == '\r') {
            continue;
        }
        if (c == '\n') {
            buffer_.trim();
            if (buffer_.length() > 0) {
                handleLine(buffer_);
            }
            buffer_ = "";
            continue;
        }
        if (buffer_.length() < 120) {
            buffer_ += c;
        }
    }
}

void DebugConsole::handleLine(const String& line) {
    if (line == "help") {
        printHelp();
        return;
    }
    if (line == "state") {
        printState();
        return;
    }
    if (line == "layout") {
        printLayout();
        return;
    }
    if (line == "clear") {
        app_.clearHighlight();
        stream_->println("OK");
        return;
    }

    char command[16]{};
    char action[16]{};
    int a = 0;
    int b = 0;
    int c = 0;
    int d = 0;

    if (std::sscanf(line.c_str(), "%15s %15s %d %d %d %d", command, action, &a, &b, &c, &d) < 1) {
        stream_->println("ERR invalid command");
        return;
    }

    if (std::strcmp(command, "scene") == 0) {
        if (std::strcmp(action, "off") == 0) {
            app_.applyScene(SceneId::Off);
        } else if (std::strcmp(action, "display") == 0) {
            app_.applyScene(SceneId::Display);
        } else if (std::strcmp(action, "showcase") == 0) {
            app_.applyScene(SceneId::Showcase);
        } else {
            stream_->println("ERR scene");
            return;
        }
        stream_->println("OK");
        return;
    }

    if (std::strcmp(command, "pwm") == 0) {
        if (std::strcmp(action, "on") == 0) app_.setPwmCabinetPower(true);
        else if (std::strcmp(action, "off") == 0) app_.setPwmCabinetPower(false);
        else if (std::strcmp(action, "toggle") == 0) app_.togglePwmCabinet();
        else if (std::strcmp(action, "brightness") == 0) app_.setPwmCabinetBrightness(static_cast<uint8_t>(a));
        else { stream_->println("ERR pwm"); return; }
        stream_->println("OK");
        return;
    }

    if (std::strcmp(command, "rgbw") == 0) {
        if (std::strcmp(action, "on") == 0) app_.setRgbwCabinetPower(true);
        else if (std::strcmp(action, "off") == 0) app_.setRgbwCabinetPower(false);
        else if (std::strcmp(action, "toggle") == 0) app_.toggleRgbwCabinet();
        else if (std::strcmp(action, "brightness") == 0) app_.setRgbwCabinetBrightness(static_cast<uint8_t>(a));
        else if (std::strcmp(action, "color") == 0) app_.setRgbwCabinetColor(
            {static_cast<uint8_t>(a), static_cast<uint8_t>(b), static_cast<uint8_t>(c), static_cast<uint8_t>(d)});
        else if (std::strcmp(action, "effect") == 0) {
            LightEffect effect{};
            char effectName[16]{};
            if (std::sscanf(line.c_str(), "%*s %*s %15s", effectName) != 1 || !parseEffect(effectName, effect)) {
                stream_->println("ERR effect");
                return;
            }
            app_.setRgbwCabinetEffect(effect);
        } else { stream_->println("ERR rgbw"); return; }
        stream_->println("OK");
        return;
    }

    if (std::strcmp(command, "mini") == 0) {
        if (std::strcmp(action, "on") == 0) app_.setMiniaturePower(true);
        else if (std::strcmp(action, "off") == 0) app_.setMiniaturePower(false);
        else if (std::strcmp(action, "toggle") == 0) app_.toggleMiniatures();
        else if (std::strcmp(action, "brightness") == 0) app_.setMiniatureBrightness(static_cast<uint8_t>(a));
        else if (std::strcmp(action, "color") == 0) app_.setMiniatureColor(
            {static_cast<uint8_t>(a), static_cast<uint8_t>(b), static_cast<uint8_t>(c)});
        else if (std::strcmp(action, "effect") == 0) {
            LightEffect effect{};
            char effectName[16]{};
            if (std::sscanf(line.c_str(), "%*s %*s %15s", effectName) != 1 || !parseEffect(effectName, effect)) {
                stream_->println("ERR effect");
                return;
            }
            app_.setMiniatureEffect(effect);
        } else { stream_->println("ERR mini"); return; }
        stream_->println("OK");
        return;
    }

    if (std::strcmp(command, "locate") == 0) {
        int id = -1;
        if (std::sscanf(line.c_str(), "%*s %d", &id) == 1 && id >= 0 && app_.locateMiniature(static_cast<uint8_t>(id))) {
            stream_->println("OK");
        } else {
            stream_->println("ERR locate");
        }
        return;
    }

    if (std::strcmp(command, "test") == 0) {
        int shelf = -1;
        int location = -1;
        if (std::sscanf(line.c_str(), "%*s %d %d", &shelf, &location) == 2 &&
            shelf >= 0 && location >= 0 &&
            app_.testLocation(CabinetLayout::makeLocationId(
                static_cast<uint8_t>(shelf), static_cast<uint8_t>(location)))) {
            stream_->println("OK");
        } else {
            stream_->println("ERR test");
        }
        return;
    }

    stream_->println("ERR unknown command");
}

void DebugConsole::printHelp() {
    if (stream_ == nullptr) return;
    stream_->println("Smart Cabinet MVP console");
    stream_->println("  state | layout | help | clear");
    stream_->println("  scene off|display|showcase");
    stream_->println("  pwm on|off|toggle|brightness N");
    stream_->println("  rgbw on|off|toggle|brightness N");
    stream_->println("  rgbw color R G B W");
    stream_->println("  rgbw effect static|breathe|rainbow");
    stream_->println("  mini on|off|toggle|brightness N");
    stream_->println("  mini color R G B");
    stream_->println("  mini effect static|breathe|rainbow");
    stream_->println("  locate MINIATURE_ID");
    stream_->println("  test SHELF LOCATION");
}

void DebugConsole::printState() {
    const AppState s = app_.state();
    stream_->printf("PWM available=%d on=%d brightness=%u%%\n",
                    s.pwmCabinetAvailable, s.pwmCabinetOn, s.pwmCabinetBrightness);
    stream_->printf("RGBW available=%d on=%d brightness=%u%% color=%u,%u,%u,%u\n",
                    s.rgbwCabinetAvailable, s.rgbwCabinetOn, s.rgbwCabinetBrightness,
                    s.rgbwCabinetColor.r, s.rgbwCabinetColor.g,
                    s.rgbwCabinetColor.b, s.rgbwCabinetColor.w);
    stream_->printf("Mini available=%d on=%d brightness=%u%% color=%u,%u,%u\n",
                    s.miniatureLightsAvailable, s.miniatureLightsOn, s.miniatureBrightness,
                    s.miniatureColor.r, s.miniatureColor.g, s.miniatureColor.b);
    stream_->printf("Scene=%u miniatures=%u highlighted=%d\n",
                    static_cast<unsigned>(s.activeScene),
                    static_cast<unsigned>(s.miniatureCount), s.highlightedMiniatureId);
}

void DebugConsole::printLayout() {
    const CabinetLayout& layout = app_.layout();
    stream_->printf("Shelves=%u totalLEDs=%u\n", layout.shelfCount(), layout.totalLedCount());
    for (uint8_t shelfIndex = 0; shelfIndex < layout.shelfCount(); ++shelfIndex) {
        const Shelf* shelf = layout.shelf(shelfIndex);
        if (shelf == nullptr) continue;
        stream_->printf("Shelf %u start=%u count=%u locations=%u\n",
                        shelf->index, shelf->ledStart, shelf->ledCount, shelf->locationCount);
        for (uint8_t locationIndex = 0; locationIndex < shelf->locationCount; ++locationIndex) {
            const Location* loc = layout.location(shelfIndex, locationIndex);
            stream_->printf("  Location %u id=%u start=%u count=%u\n",
                            locationIndex, loc->id, loc->ledStart, loc->ledCount);
        }
    }
}

bool DebugConsole::parseEffect(const char* text, LightEffect& effect) {
    if (std::strcmp(text, "static") == 0) effect = LightEffect::Static;
    else if (std::strcmp(text, "breathe") == 0) effect = LightEffect::Breathe;
    else if (std::strcmp(text, "rainbow") == 0) effect = LightEffect::Rainbow;
    else return false;
    return true;
}

}  // namespace smartcabinet
