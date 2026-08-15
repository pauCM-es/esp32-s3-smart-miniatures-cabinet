# Smart Cabinet Home Assistant Custom Panel

This replaces the previous Lovelace cards with one lightweight Home Assistant custom panel.

## Sections

### Configuration

- Shows the number of physical shelves.
- Configurable RGB highlight color.
- Add a shelf at the end or insert one between existing shelves.
- Reorder shelves to match the physical cabinet.
- Delete a shelf. Miniatures assigned to it become `Unassigned`.
- Edit total LEDs and total locations per shelf.
- Reducing the number of locations unassigns miniatures that were stored in removed locations.
- Select a location to highlight its current physical LED range.
- Edit `Start LED` and `LEDs` with live physical preview.
- `Save location` persists the mapping.
- `Auto map` divides the shelf LEDs evenly. Any remainder is assigned to the last location.
- `Clear mapping` removes every LED range on the selected shelf without deleting the locations.

### Miniatures

First CRUD version:

- Name
- Collection
- Artist

New miniatures are created as `Unassigned` using `(shelf: 0, location: 0)`.
Existing physical positions are preserved when editing catalogue metadata.

### Search

Search is case-insensitive and performs partial matching against:

- Name
- Collection
- Artist
- All fields

All assigned search results are highlighted simultaneously. Clicking an individual result highlights only that miniature.

## HA files

Copy:

```text
ha/www/smart-cabinet-panel.js
```

to:

```text
/config/www/smart-cabinet-panel.js
```

Then merge the contents of:

```text
ha/panel-configuration.yaml
```

into Home Assistant's `/config/configuration.yaml`.

Restart Home Assistant after changing `configuration.yaml`.

The sidebar will contain **Smart Cabinet** at:

```text
/smart-cabinet
```

## Home Assistant entities used by the panel

The ESP32 publishes MQTT discovery for:

```text
sensor.smart_cabinet_layout
sensor.smart_cabinet_miniatures
```

The panel sends commands through Home Assistant's `mqtt.publish` action to:

```text
smartcabinet/cabinet01/api/command
```

## New MQTT commands

### Layout

```json
{"action":"getLayout"}
{"action":"insertShelf","position":2}
{"action":"deleteShelf","shelf":2}
{"action":"moveShelf","from":2,"to":4}
{"action":"setShelfConfig","shelf":2,"total_leds":160,"total_locations":12}
{"action":"setLocationConfig","shelf":2,"location":3,"start_led":26,"leds":13}
{"action":"previewLocation","shelf":2,"location":3,"start_led":26,"leds":13}
{"action":"autoMapShelf","shelf":2}
{"action":"clearShelfMapping","shelf":2}
```

### Highlight

```json
{"action":"setHighlightColor","r":156,"g":39,"b":176}
{"action":"clearHighlight"}
{"action":"highlightLocation","shelf":2,"location":3}
{"action":"highlightLocations","locations":[{"shelf":2,"location":3},{"shelf":4,"location":7}]}
```

### Miniatures

The existing CRUD actions remain, but `(0, 0)` is now a valid unassigned position.

```json
{
  "action":"createMiniature",
  "name":"Tlaloc",
  "collection":"Aztec Gods",
  "artist":"Artist Name",
  "date":"",
  "shelf":0,
  "location":0,
  "notes":""
}
```

## Persistence

- Cabinet power, brightness and highlight RGB are stored through the existing settings repository / NVS.
- Shelf and location mapping is stored in LittleFS at:

```text
/smart_cabinet/layout.json
```

- Miniatures continue to use the existing miniature repository and JSON store.

## Behavior changes in the firmware

- `Auto map` now assigns the remainder LEDs to the final location.
- Changing shelf LED/location totals no longer silently auto-maps the shelf.
- Existing valid manual mappings are preserved.
- A location can have a zero-length range internally to represent `Unmapped`.
- Search highlighting can accumulate multiple LED segments until `clearHighlight` is called.
- Shelf insertion, deletion and reorder also update miniature shelf references.

## Future position-management section

The CRUD intentionally does not expose shelf/location editing yet. The next panel section can provide a fast visual cabinet-placement workflow while keeping this catalogue form simple.
