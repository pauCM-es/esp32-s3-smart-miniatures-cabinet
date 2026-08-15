#pragma once

#include <vector>
#include "Miniature.h"

class IMiniatureStore {
public:
    virtual ~IMiniatureStore() = default;

    virtual bool load(std::vector<Miniature>& items) = 0;
    virtual bool save(const std::vector<Miniature>& items) = 0;
};
