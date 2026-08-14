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
        seedDefaults();
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

bool CatalogueRepository::reset() {
    items_.clear();
    seedDefaults();
    if (!store_.save(items_)) {
        return false;
    }
    notifyChanged();
    return true;
}

void CatalogueRepository::setChangedCallback(
    ChangedCallback callback
) {
    changedCallback_ = callback;
}

void CatalogueRepository::seedDefaults() {
    static const struct {
        const char* id;
        const char* name;
        const char* collection;
        const char* artist;
        uint16_t shelf;
        uint16_t location;
    } seeds[] = {
        {"mini-seed-01", "Warrior Knight",    "Fantasy Heroes", "Unknown", 1,  1},
        {"mini-seed-02", "Dark Sorceress",    "Fantasy Heroes", "Unknown", 1,  2},
        {"mini-seed-03", "Dragon Hatchling",  "Creatures",      "Unknown", 1,  3},
        {"mini-seed-04", "Elven Ranger",      "Fantasy Heroes", "Unknown", 1,  4},
        {"mini-seed-05", "Undead Skeleton",   "Undead",         "Unknown", 1,  5},
        {"mini-seed-06", "Dwarf Berserker",   "Fantasy Heroes", "Unknown", 1,  6},
        {"mini-seed-07", "Cave Troll",        "Creatures",      "Unknown", 1,  7},
        {"mini-seed-08", "Necromancer",       "Undead",         "Unknown", 1,  8},
        {"mini-seed-09", "Paladin Captain",   "Fantasy Heroes", "Unknown", 1,  9},
        {"mini-seed-10", "Giant Spider",      "Creatures",      "Unknown", 1, 10},
        {"mini-seed-11", "Orc Warchief",      "Orcs",           "Unknown", 1, 11},
        {"mini-seed-12", "High Priestess",    "Fantasy Heroes", "Unknown", 1, 12},
    };
    for (const auto& s : seeds) {
        Miniature item;
        item.id         = s.id;
        item.name       = s.name;
        item.collection = s.collection;
        item.artist     = s.artist;
        item.shelf      = s.shelf;
        item.location   = s.location;
        items_.push_back(item);
    }
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
