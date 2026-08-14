#include "MiniatureRepository.h"

#include <esp_system.h>

CatalogueRepository::CatalogueRepository(
    IMiniatureStore& store,
    size_t maxItems
)
    : store_(store),
      maxItems_(maxItems) {}

bool CatalogueRepository::begin() {
    std::vector<Miniature> loaded;

    if (!store_.load(loaded)) {
        items_.clear();

        // First boot is a valid empty catalogue.
        return store_.save(items_);
    }

    items_.swap(loaded);
    return true;
}

const std::vector<Miniature>&
CatalogueRepository::all() const {
    return items_;
}

const Miniature*
CatalogueRepository::findById(const String& id) const {
    for (const Miniature& item : items_) {
        if (item.id == id) {
            return &item;
        }
    }

    return nullptr;
}

bool CatalogueRepository::create(
    const String& name,
    const String& collection,
    const String& artist,
    const String& date,
    uint16_t shelf,
    uint16_t location,
    const String& notes,
    Miniature& created,
    String& error
) {
    if (!validate(name, shelf, location, error)) {
        return false;
    }

    if (items_.size() >= maxItems_) {
        error = "catalog_full";
        return false;
    }

    Miniature item;
    item.id = generateId();
    item.name = name;
    item.collection = collection;
    item.artist = artist;
    item.date = date;
    item.shelf = shelf;
    item.location = location;
    item.notes = notes;

    items_.push_back(item);

    if (!persist(error)) {
        items_.pop_back();
        return false;
    }

    created = item;
    notifyChanged();

    return true;
}

bool CatalogueRepository::update(
    const String& id,
    const String& name,
    const String& collection,
    const String& artist,
    const String& date,
    uint16_t shelf,
    uint16_t location,
    const String& notes,
    Miniature& updated,
    String& error
) {
    if (id.isEmpty()) {
        error = "id_required";
        return false;
    }

    if (!validate(name, shelf, location, error)) {
        return false;
    }

    for (Miniature& item : items_) {
        if (item.id != id) {
            continue;
        }

        const Miniature previous = item;

        item.name = name;
        item.collection = collection;
        item.artist = artist;
        item.date = date;
        item.shelf = shelf;
        item.location = location;
        item.notes = notes;

        if (!persist(error)) {
            item = previous;
            return false;
        }

        updated = item;
        notifyChanged();

        return true;
    }

    error = "miniature_not_found";
    return false;
}

bool CatalogueRepository::remove(
    const String& id,
    String& error
) {
    if (id.isEmpty()) {
        error = "id_required";
        return false;
    }

    for (size_t index = 0; index < items_.size(); ++index) {
        if (items_[index].id != id) {
            continue;
        }

        const Miniature removed = items_[index];
        items_.erase(items_.begin() + index);

        if (!persist(error)) {
            items_.insert(items_.begin() + index, removed);
            return false;
        }

        notifyChanged();
        return true;
    }

    error = "miniature_not_found";
    return false;
}

void CatalogueRepository::setChangedCallback(
    ChangedCallback callback
) {
    changedCallback_ = callback;
}

String CatalogueRepository::generateId() const {
    String id = "mini-";
    id += String(esp_random(), HEX);
    return id;
}

bool CatalogueRepository::validate(
    const String& name,
    uint16_t shelf,
    uint16_t location,
    String& error
) const {
    if (name.isEmpty()) {
        error = "name_required";
        return false;
    }

    if (name.length() > 80) {
        error = "name_too_long";
        return false;
    }

    if (shelf == 0 || location == 0) {
        error = "shelf_and_location_are_1_based";
        return false;
    }

    return true;
}

bool CatalogueRepository::persist(String& error) {
    if (!store_.save(items_)) {
        error = "persistence_failed";
        return false;
    }

    return true;
}

void CatalogueRepository::notifyChanged() {
    if (changedCallback_) {
        changedCallback_(items_);
    }
}
