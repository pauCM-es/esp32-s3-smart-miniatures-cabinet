# Smart Miniature Display — Feature Summary

## Core Purpose

The ESP32-S3 touchscreen is the local controller for the miniature cabinet.

It manages:

- Cabinet layout
- LED mapping
- Miniature locations
- Lighting scenes
- Scene schedules
- System configuration
- Remote control through a web app
- Future voice commands

NFC is not part of the system.

The board includes a microSD card slot used as the primary persistent storage for configuration, miniature data, images and logs.

---

## Cabinet Structure

The physical layout is dynamic and configurable.

```text
Cabinet
└── Shelves
    └── Locations
        └── LED segments
```

### Shelf

A physical shelf containing a configurable number of locations and its own LED strip section.

Configurable properties:

- Name
- Order
- Number of locations
- Total LEDs
- First LED index
- Brightness limit
- Enabled or disabled state

### Location

A physical position for one miniature.

A location may represent:

- One hexagonal stand
- Several grouped hexagons
- A large stand for one miniature
- A custom display area

Configurable properties:

- Name or number
- Position on the shelf
- Assigned miniature
- LED segment
- Highlight colour
- Enabled, empty or unavailable state

### LED Segment

A continuous LED range assigned to one location.

Configurable properties:

- First LED
- Last LED
- LED count
- Brightness compensation

No shelf, location or LED quantity should be hard-coded.

The complete cabinet configuration is saved to and loaded from the SD card.

---

## SD Card Storage

The Freenove ESP32-S3 WROOM board provides a microSD card slot. The SD card is the primary persistent storage for everything that must survive a power cycle or firmware update.

### Directory layout

```text
/config/
    cabinet.json        — shelf, location and LED mapping configuration
    scenes.json         — lighting scene definitions
    automations.json    — scheduled scene automations
    settings.json       — system settings (Wi-Fi, brightness limits, etc.)
/miniatures/
    catalogue.json      — full miniature catalogue with metadata
    images/
        <id>.jpg        — miniature photos (JPEG, web-sized)
/logs/
    events.log          — timestamped system events
    errors.log          — error log for diagnostics
/backups/
    <timestamp>.zip     — configuration and catalogue snapshots
/web/
    index.html          — web app static files served directly from SD
    assets/             — JS, CSS and icons for the web app
```

### What is stored on the SD card

- **Cabinet configuration** — shelves, locations, LED segments, direction
- **Lighting scenes** — names, colours, brightness values
- **Scene automations** — schedules, days, enable state
- **System settings** — Wi-Fi credentials, brightness caps, timezone
- **Miniature catalogue** — all miniature metadata
- **Miniature images** — JPEG photos referenced by catalogue entries
- **Web app files** — served by the built-in HTTP server without needing a host PC
- **Backups** — full configuration and catalogue snapshots
- **Logs** — event and error logs for diagnostics

### What is NOT stored on the SD card

- Firmware (stored in ESP32 flash)
- LVGL fonts and compiled UI assets (stored in flash)
- Runtime state and LED frame buffer (RAM only)

### SD card requirements

- Format: FAT32
- Recommended capacity: 8 GB or larger
- Speed class: Class 10 or UHS-I for acceptable image load times
- The system should start with a degraded mode and a clear on-screen error if the SD card is absent or unreadable

---

## Graphical Shelf Configuration

The shelf setup interface should include:

- Vertical shelf tabs
- Add shelf button
- Number of locations
- Total LEDs in the shelf strip
- Visual location selector
- Visual LED segment selector
- Start, end, assigned and unassigned LED colours
- Selected location and linked LED segment
- Validation warnings

The user selects a location and then selects the LEDs assigned to it.

---

## LED Mapping and Testing

Each location is linked to one LED segment.

Testing functions:

- Flash a selected location
- Light a segment sequentially
- Show strip direction
- Step through individual LEDs
- Test a complete shelf
- Colour each location differently
- Detect overlapping ranges
- Detect unassigned LEDs
- Detect locations without LEDs

---

## Miniature Management

Each location can contain one miniature.
Miniatures may not have a location assigned, it serves as a catalogue too.

Miniature data may include:

- Name
- Artist
- Collection
- Painting date
- Tags
- Notes
- Image (stored on SD card under `/miniatures/images/`)
- Shelf and location
- Preferred highlight colour

User actions:

- Add
- Edit: only by the webApp
- Assign to a location
- Move
- Swap
- Remove
- Mark as temporarily absent
- Search/Filter
- Highlight physically

---

## Lighting Control

Lighting can be controlled for:

- Full cabinet
- Location
- Search result group

Main controls:

- Power
- Brightness
- Colour
- White light
- Scene selection
- Location highlighting

Initial scenes:

- Gallery
- Spotlight
- Collection highlight
- Ambient
- Night mode
- Configuration test
- Off

---

## Scene Automations (future versions)

Lighting scenes can activate automatically.

Scheduling options:

- Start time
- End time
- One-time event
- Daily repetition
- Selected weekdays
- Monday to Friday
- Weekends
- Full-week repetition
- Enable or disable
- Temporary pause
- Multiple automations
- Manual override

Examples:

- Gallery from 18:00 to 23:00
- Night mode after 23:00
- Cabinet off overnight
- Ambient mode Monday to Friday
- Spotlight at a specific time

---

## MVP Screens

### 1. Overview

Shows:

- Cabinet status
- Active scene
- Global brightness
- Miniature totals
- Connection status
- Quick lighting controls (ON/OFF toggle)
- Compact cabinet overview

### 2. Shelves Setup

Configures:

- Shelves
- Locations per shelf
- Total shelf LEDs
- Shelf direction (depending on how the led strip is connected it can go left->right or right-> left)
- Location-to-segment mapping
- Graphical LED verification
- Mapping errors

### 3. Miniatures / Locations

Manages:

- Location occupancy
- Miniature assignment
- Miniature details
- Search
- Move and swap
- Empty and unavailable locations
- Physical highlighting

### 4. Lighting

Controls:

- Cabinet power
- Brightness
- Colour
- White light
- Lighting scenes
- Location highlighting
- Scene preview

### 5. Automations (future)

Manages:

- Scheduled scene changes
- Start and end times
- Repetition days
- Enabled and paused states
- Multiple schedules
- Manual overrides

---

## Touchscreen Interaction

The user can:

- Navigate the five MVP screens
- Select shelves and locations
- Configure LED segments
- Test LED assignments
- Add and manage miniatures
- Search and highlight miniatures
- Control lighting
- Create scene automations (future)
- Access system settings

---

## Web Application

The web app should replicate the main touchscreen interface.

The web app static files (HTML, JS, CSS) are stored on the SD card under `/web/` and served directly by the ESP32 built-in HTTP server. This removes the need to embed web assets in firmware flash.

It should support:

- The same five MVP areas
- Larger graphical shelf configuration
- LED mapping and testing
- Miniature management with image upload to SD card
- Lighting control
- Automation management
- System configuration
- Backup and restore (download/upload SD card snapshots)
- SD card status and available space
- Firmware information

Display and web app changes should stay synchronized.

---

## Connectivity

### Wi-Fi

Primary option for:

- Web app access (files served from SD card)
- Real-time synchronization
- Image upload to SD card
- Firmware updates
- Backup download and restore from SD card
- Future NAS and Home Assistant integration

### Bluetooth

Possible secondary option for:

- Initial setup
- Wi-Fi configuration
- Recovery
- Basic local control

---

## Microphone and Speaker

### Speaker

Possible uses:

- Touch feedback
- Confirmation sounds
- Error sounds
- Scene-change feedback
- Future spoken responses

### Microphone

First voice-control phase:

- Turn the cabinet on or off
- Change lighting scene
- Increase or decrease brightness
- Activate Gallery, Spotlight or Night mode
- Select a shelf

Later phases may add miniature and collection searches.

---

## Development Phases

### Phase 1 — MVP Interface

- Five MVP screens
- Basic navigation
- Shared UI components
- Simulated cabinet data

### Phase 2 — Cabinet Model

- Dynamic shelves
- Dynamic locations
- Configurable LED segments
- Save and load configuration to SD card (`/config/cabinet.json`)
- SD card initialisation and error handling

### Phase 3 — LED Integration

- Physical LED control
- Mapping tests
- Direction tests
- Validation
- Brightness and current limits

### Phase 4 — Miniatures

- Miniature catalogue stored on SD card (`/miniatures/catalogue.json`)
- Image storage and display from SD card (`/miniatures/images/`)
- Location assignment
- Search
- Physical highlighting

### Phase 5 — Web App

- Replicated interface
- Web app files served from SD card (`/web/`)
- Real-time synchronization
- Remote configuration
- Image upload to SD card
- Backup download and restore

### Phase 6 — Voice Control

- Basic offline commands
- Scene and brightness control
- Sound feedback

### Future

- NAS storage for offloading images from SD card
- Expanded image library
- Home Assistant integration
- Automated SD card backups to NAS or cloud
- Advanced voice processing
- Local AI integration
