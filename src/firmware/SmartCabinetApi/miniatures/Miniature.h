#pragma once

#include <Arduino.h>
#include <cstdint>

struct Miniature {
    String id;
    String name;
    String collection;
    String artist;
    String date;
    uint16_t shelf = 0;
    uint16_t location = 0;
    String notes;
};
