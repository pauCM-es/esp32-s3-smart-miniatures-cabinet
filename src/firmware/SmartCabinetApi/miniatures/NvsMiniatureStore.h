#pragma once

#include <Arduino.h>
#include "IMiniatureStore.h"

class NvsMiniatureStore final : public IMiniatureStore {
public:
    explicit NvsMiniatureStore(
        const char* nameSpace = "miniatures"
    );

    bool load(std::vector<Miniature>& items) override;
    bool save(const std::vector<Miniature>& items) override;

private:
    String namespace_;
};
