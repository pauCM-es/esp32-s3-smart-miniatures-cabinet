#pragma once

#include "IAppControllerActions.h"
#include "SmartCabinetService.h"
#include "SmartCabinetTypes.h"


#include "miniatures/Miniature.h"
#include "miniatures/IMiniatureStore.h"
#include "miniatures/FlashMiniatureStore.h"
#include "miniatures/MiniatureRepository.h"
#include "miniatures/NvsMiniatureStore.h"
#include "miniatures/SdMiniatureStore.h"

#include "mqtt/MqttApiConfig.h"
#include "mqtt/MqttApiService.h"

#include "persistence/ISettingsStore.h"
#include "persistence/NvsSettingsStore.h"
#include "persistence/SdSettingsStore.h"
#include "persistence/SettingsRepository.h"
