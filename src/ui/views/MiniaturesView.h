#pragma once
#include <cstddef>
#include <cstdint>

namespace MiniaturesView {

struct ViewModel {
    const char* name;
    const char* collection;
    const char* artist;
    const char* date;
    const char* notes;
    uint16_t    shelf;
    uint16_t    location;
    size_t      index;
    size_t      total;
};

void render(const ViewModel& model);
void renderEmpty();

}  // namespace MiniaturesView
