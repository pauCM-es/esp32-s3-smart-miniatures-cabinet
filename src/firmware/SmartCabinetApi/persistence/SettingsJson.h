#pragma once

#include <Arduino.h>
#include "../SmartCabinetTypes.h"

namespace SettingsJson {

bool serialize(const CabinetSettings& settings, String& output);
bool deserialize(const String& input, CabinetSettings& settings);

}  // namespace SettingsJson
