#pragma once

#include <Arduino.h>
#include <functional>
#include <vector>

#include "IMiniatureStore.h"
#include "Miniature.h"

class CatalogueRepository {
public:
    using ChangedCallback =
        std::function<void(const std::vector<Miniature>&)>;

    explicit CatalogueRepository(
        IMiniatureStore& store,
        size_t maxItems = 24
    );

    bool begin();

    const std::vector<Miniature>& all() const;
    const Miniature* findById(const String& id) const;

    bool create(
        const String& name,
        uint16_t shelf,
        uint16_t location,
        const String& notes,
        Miniature& created,
        String& error
    );

    bool update(
        const String& id,
        const String& name,
        uint16_t shelf,
        uint16_t location,
        const String& notes,
        Miniature& updated,
        String& error
    );

    bool remove(
        const String& id,
        String& error
    );

    void setChangedCallback(ChangedCallback callback);

private:
    String generateId() const;
    bool validate(
        const String& name,
        uint16_t shelf,
        uint16_t location,
        String& error
    ) const;

    bool persist(String& error);
    void notifyChanged();

    IMiniatureStore& store_;
    std::vector<Miniature> items_;
    size_t maxItems_;
    ChangedCallback changedCallback_;
};
