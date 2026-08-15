#pragma once

#include <cstdint>

struct MqttApiConfig {
    const char* host = nullptr;
    uint16_t port = 1883;

    const char* username = "";
    const char* password = "";

    const char* deviceId = "cabinet01";
    const char* deviceName = "Smart Cabinet";
    const char* baseTopic = "smartcabinet/cabinet01";

    uint16_t packetBufferSize = 8192;
    uint32_t reconnectIntervalMs = 5000;
};
