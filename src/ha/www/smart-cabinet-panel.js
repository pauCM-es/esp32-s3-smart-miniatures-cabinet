const DEFAULT_CONFIG = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
  scene_entity: "sensor.smart_cabinet_scene",
  mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set",
};

class HaPanelSmartCabinet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._panel = null;
    this._narrow = false;
    this._active = "configuration";
    this._selectedShelf = 1;
    this._selectedLocation = 1;
    this._editingMiniId = null;
    this._previewTimer = null;
    this._searchTimer = null;
    this._dataSignature = null;
    this._searchQuery = "";
    this._searchField = "all";
    this._viewIndex = 0;
    this._viewTimer = null;
    this._mappingStart = null;
    this._mappingEnd = null;
    this._mappingTimer = null;
    this._showAllMappings = false;
    this._ledZoom = 1;
  }

  set narrow(value) {
    const next = Boolean(value);
    if (next === this._narrow) return;
    this._narrow = next;
    this._render();
  }

  set panel(value) {
    this._panel = value;
    this._render();
  }

  set hass(value) {
    this._hass = value;
    const layoutState = value?.states?.[this._config.layout_entity];
    const miniState = value?.states?.[this._config.miniatures_entity];
    const sceneState = value?.states?.[this._config.scene_entity];
    const signature = `${layoutState?.last_updated || ""}|${miniState?.last_updated || ""}|${sceneState?.last_updated || ""}`;
    if (signature !== this._dataSignature) {
      this._dataSignature = signature;
      this._render();
    }
  }

  get _config() {
    return { ...DEFAULT_CONFIG, ...(this._panel?.config || {}) };
  }

  get _layout() {
    return this._hass?.states?.[this._config.layout_entity]?.attributes || { shelves: [], shelf_count: 0 };
  }

  get _miniatures() {
    return this._hass?.states?.[this._config.miniatures_entity]?.attributes?.items || [];
  }

  get _assignedMiniatures() {
    return this._miniatures.filter((item) => Number(item.shelf) > 0 && Number(item.location) > 0);
  }

  async _command(payload) {
    if (!this._hass) return;
    await this._hass.callService("mqtt", "publish", {
      topic: this._config.command_topic,
      payload: JSON.stringify(payload),
      qos: 0,
      retain: false,
    });
  }

  async _miniLightsCommand(payload) {
    if (!this._hass) return;
    await this._hass.callService("mqtt", "publish", {
      topic: this._config.mini_lights_command_topic,
      payload: JSON.stringify(payload),
      qos: 0,
      retain: false,
    });
  }

  _escape(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  _hexToRgb(hex) {
    const normalized = hex.replace("#", "");
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  _rgbToHex(color = {}) {
    const part = (value) => Number(value || 0).toString(16).padStart(2, "0");
    return `#${part(color.r)}${part(color.g)}${part(color.b)}`;
  }

  _layoutContent() {
    const layout = this._layout;
    const shelves = layout.shelves || [];
    if (!shelves.length) {
      return `<div class="empty-state"><b>Waiting for cabinet layout</b><span>The panel will populate when the ESP32 publishes its retained layout state.</span></div>`;
    }

    if (this._selectedShelf > shelves.length) this._selectedShelf = shelves.length;
    const selected = shelves[this._selectedShelf - 1] || shelves[0];
    if (this._selectedLocation > selected.total_locations) this._selectedLocation = selected.total_locations || 1;
    const selectedLocation = selected.locations?.[this._selectedLocation - 1] || null;

    const shelfRows = shelves.map((shelf, index) => `
      <div class="shelf-row ${shelf.shelf === this._selectedShelf ? "selected" : ""}" data-shelf="${shelf.shelf}">
        <button class="shelf-select" data-action="select-shelf" data-shelf="${shelf.shelf}">
          <span class="shelf-number">${String(shelf.shelf).padStart(2, "0")}</span>
          <span><b>Shelf ${shelf.shelf}</b><small>${shelf.total_locations} locations · ${shelf.total_leds} LEDs</small></span>
        </button>
        <div class="row-actions">
          <button class="icon-button" title="Move up" data-action="move-shelf" data-from="${shelf.shelf}" data-to="${Math.max(1, shelf.shelf - 1)}" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="icon-button" title="Move down" data-action="move-shelf" data-from="${shelf.shelf}" data-to="${Math.min(shelves.length, shelf.shelf + 1)}" ${index === shelves.length - 1 ? "disabled" : ""}>↓</button>
        </div>
      </div>
      <button class="insert-shelf" data-action="insert-shelf" data-position="${shelf.shelf + 1}">＋ Insert shelf here</button>
    `).join("");

    const locationRows = (selected.locations || []).map((loc) => `
      <button class="location-row ${loc.location === this._selectedLocation ? "selected" : ""} ${loc.mapped ? "" : "unmapped"}"
        data-action="select-location" data-location="${loc.location}">
        <span class="location-index">${String(loc.location).padStart(2, "0")}</span>
        <span class="location-range">${loc.mapped ? `LED ${loc.start_led} → ${loc.start_led + loc.leds - 1}` : "Unmapped"}</span>
        <span class="location-count">${loc.leds} LEDs</span>
      </button>
    `).join("");

    const highlightHex = this._rgbToHex(layout.highlight_color || { r: 156, g: 39, b: 176 });

    return `
      <section class="general-card panel-card">
        <div>
          <div class="eyebrow">GENERAL</div>
          <h2>Cabinet configuration</h2>
          <p>Physical structure and the color used to identify miniature locations.</p>
        </div>
        <div class="general-values">
          <div class="metric"><span>Shelves</span><b>${layout.shelf_count || shelves.length}</b></div>
          <label class="color-control"><span>Highlight color</span><input id="highlight-color" type="color" value="${highlightHex}"></label>
        </div>
      </section>

      <div class="configuration-grid">
        <aside class="panel-card shelf-list">
          <div class="section-heading"><div><div class="eyebrow">SHELVES</div><h3>Physical order</h3></div><button class="primary small" data-action="insert-shelf" data-position="${shelves.length + 1}">＋ Add shelf</button></div>
          <div class="shelf-items">${shelfRows}</div>
        </aside>

        <main class="panel-card shelf-detail">
          <div class="section-heading detail-heading">
            <div><div class="eyebrow">SELECTED SHELF</div><h2>Shelf ${selected.shelf}</h2></div>
            <button class="danger ghost" data-action="delete-shelf" data-shelf="${selected.shelf}" ${shelves.length <= 1 ? "disabled" : ""}>Delete shelf</button>
          </div>

          <div class="form-grid two">
            <label><span>Total LEDs</span><input id="shelf-leds" type="number" min="1" value="${selected.total_leds}"></label>
            <label><span>Total locations</span><input id="shelf-locations" type="number" min="1" value="${selected.total_locations}"></label>
          </div>
          <div class="button-row">
            <button class="primary" data-action="save-shelf">Save shelf</button>
            <button data-action="duplicate-shelf" data-shelf="${selected.shelf}">Duplicate shelf</button>
            <button data-action="auto-map">Auto map</button>
            <button data-action="clear-map">Clear mapping</button>
          </div>

          <div class="divider"></div>
          ${this._ledMappingContent(selected, selectedLocation)}
          <div class="locations-layout legacy-mapping">
            <div>
              <div class="section-heading"><div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div><span class="muted">Select to highlight</span></div>
              <div class="location-list">${locationRows}</div>
            </div>
            <div class="location-editor ${selectedLocation ? "" : "disabled"}">
              ${selectedLocation ? `
                <div class="eyebrow">LOCATION ${selectedLocation.location}</div>
                <h3>Mapping</h3>
                <p>Changes are previewed on the cabinet before they are saved.</p>
                <div class="form-grid two">
                  <label><span>Start LED</span><input id="location-start" type="number" min="0" value="${selectedLocation.start_led}"></label>
                  <label><span>LEDs</span><input id="location-leds" type="number" min="1" value="${selectedLocation.leds || 1}"></label>
                </div>
                <div class="range-preview"><span>Physical range</span><b id="range-preview-text">${selectedLocation.mapped ? `${selectedLocation.start_led} → ${selectedLocation.start_led + selectedLocation.leds - 1}` : "Not mapped"}</b></div>
                <button class="primary full" data-action="save-location">Save location</button>
              ` : `<div class="empty-state">Select a location.</div>`}
            </div>
          </div>
        </main>
      </div>`;
  }

  _miniaturesContent() {
    const items = this._miniatures;
    const editing = items.find((item) => item.id === this._editingMiniId) || null;
    const rows = items.map((item) => `
      <div class="mini-row">
        <div class="mini-avatar">${this._escape(item.name?.[0] || "?")}</div>
        <div class="mini-main"><b>${this._escape(item.name)}</b><span>${this._escape(item.collection || "No collection")}</span></div>
        <div class="mini-artist">${this._escape(item.artist || "Unknown artist")}</div>
        <div class="position-badge ${item.shelf ? "" : "unassigned"}">${item.shelf ? `S${item.shelf} · L${item.location}` : "Unassigned"}</div>
        <div class="row-actions">
          <button class="ghost" data-action="edit-mini" data-id="${this._escape(item.id)}">Edit</button>
          <button class="danger ghost" data-action="delete-mini" data-id="${this._escape(item.id)}">Delete</button>
        </div>
      </div>`).join("");

    return `
      <div class="miniatures-grid">
        <section class="panel-card mini-editor">
          <div class="eyebrow">${editing ? "EDIT MINIATURE" : "NEW MINIATURE"}</div>
          <h2>${editing ? this._escape(editing.name) : "Add to catalogue"}</h2>
          <p>Position management will get its own visual workflow later. New miniatures start unassigned.</p>
          <div class="form-grid">
            <label><span>Name</span><input id="mini-name" maxlength="80" value="${this._escape(editing?.name || "")}"></label>
            <label><span>Collection</span><input id="mini-collection" maxlength="80" value="${this._escape(editing?.collection || "")}"></label>
            <label><span>Artist</span><input id="mini-artist" maxlength="80" value="${this._escape(editing?.artist || "")}"></label>
          </div>
          <div class="button-row end">
            ${editing ? `<button data-action="cancel-mini">Cancel</button>` : ""}
            <button class="primary" data-action="save-mini">${editing ? "Save changes" : "Add miniature"}</button>
          </div>
        </section>
        <section class="panel-card mini-list-card">
          <div class="section-heading"><div><div class="eyebrow">CATALOGUE</div><h2>${items.length} miniatures</h2></div></div>
          <div class="mini-list">${rows || `<div class="empty-state"><b>No miniatures yet</b><span>Add the first one using the form.</span></div>`}</div>
        </section>
      </div>`;
  }

  _searchContent() {
    return `
      <section class="panel-card search-card">
        <div class="eyebrow">FIND & HIGHLIGHT</div>
        <h2>Find a miniature in the cabinet</h2>
        <p>Search is case-insensitive and partial. Every assigned result is highlighted together.</p>
        <div class="search-controls">
          <input id="search-query" type="search" placeholder="Search miniatures…" autocomplete="off" value="${this._escape(this._searchQuery)}">
          <select id="search-field">
            <option value="all" ${this._searchField === "all" ? "selected" : ""}>All fields</option>
            <option value="name" ${this._searchField === "name" ? "selected" : ""}>Name</option>
            <option value="collection" ${this._searchField === "collection" ? "selected" : ""}>Collection</option>
            <option value="artist" ${this._searchField === "artist" ? "selected" : ""}>Artist</option>
          </select>
        </div>
        <div id="search-summary" class="search-summary muted">Start typing to search.</div>
        <div id="search-results" class="search-results"></div>
      </section>`;
  }

  _viewItem(index) {
    const items = this._assignedMiniatures;
    if (!items.length) return null;
    return items[((index % items.length) + items.length) % items.length];
  }

  _viewPickerContent() {
    const items = this._assignedMiniatures;
    const unassigned = this._miniatures.length - items.length;
    if (!items.length) {
      return `<section class="panel-card view-card empty-state"><b>No assigned miniatures</b><span>${unassigned} unassigned miniature${unassigned === 1 ? "" : "s"}. Assign a shelf and location in the catalogue to browse it here.</span></section>`;
    }
    this._viewIndex = ((this._viewIndex % items.length) + items.length) % items.length;
    return `
      <section class="panel-card view-card">
        <div class="section-heading"><div><div class="eyebrow">CABINET VIEW</div><h2>Browse miniatures</h2></div><span class="position-badge unassigned">${unassigned} unassigned</span></div>
        <div id="view-selection">${this._viewSelectionContent()}</div>
        <div class="picker-shell">
          <div class="picker-caption">SWIPE OR DRAG TO LOCATE</div>
          <div id="view-dial" class="picker-dial">${this._viewDialContent()}</div>
        </div>
        <div class="view-actions"><button data-action="clear-view-highlight">Stop locating</button></div>
      </section>
      ${this._sceneAndLightsContent()}`;
  }

  _viewSelectionContent() {
    const item = this._viewItem(this._viewIndex);
    if (!item) return "";
    return `<div class="view-mini-card"><div class="mini-avatar">${this._escape(item.name?.[0] || "?")}</div><div><div class="eyebrow">${this._viewIndex + 1} / ${this._assignedMiniatures.length}</div><h3>${this._escape(item.name)}</h3><p>${this._escape(item.collection || "No collection")} · ${this._escape(item.artist || "Unknown artist")}</p></div></div><div class="view-position">SHELF ${item.shelf} <span>·</span> LOCATION ${item.location}</div>`;
  }

  _viewDialContent() {
    const total = this._assignedMiniatures.length;
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const index = ((this._viewIndex + offset) % total + total) % total;
      return `<span class="dial-tick ${offset === 0 ? "active" : ""}"><i></i><b>${index + 1}</b></span>`;
    }).join("");
  }

  _sceneAndLightsContent() {
    const currentScene = this._hass?.states?.[this._config.scene_entity]?.state || "Manual";
    return `<div class="view-controls-grid">
      <section class="panel-card view-control-card"><div class="eyebrow">SCENES</div><h3>Current: ${this._escape(currentScene)}</h3><p>Choosing a scene stops locating and restores the full strip output.</p><div class="scene-list">${["Off", "Display", "Showcase"].map((scene) => `<button class="scene-button ${currentScene === scene ? "active" : ""}" data-action="apply-scene" data-scene="${scene.toLowerCase()}">${scene}</button>`).join("")}</div></section>
      <section class="panel-card view-control-card"><div class="eyebrow">MINIATURE STRIP</div><h3>All miniatures</h3><p>Colour or brightness stops locating and applies to the complete strip.</p><div class="strip-controls"><label><span>Colour</span><input id="view-mini-color" type="color" value="#00beff"></label><label><span>Brightness</span><input id="view-mini-brightness" type="range" min="0" max="100" value="45"></label><output id="view-mini-brightness-value">45%</output></div></section>
    </div>`;
  }

  _render() {
    if (!this.shadowRoot) return;
    const previousLedRuns = this.shadowRoot.querySelector(".led-runs");
    if (previousLedRuns) this._ledScrollLeft = previousLedRuns.scrollLeft;
    const content = this._active === "configuration" ? this._layoutContent()
      : this._active === "miniatures" ? this._miniaturesContent()
      : this._active === "view" ? this._viewPickerContent()
      : this._searchContent();

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <div class="app-shell">
        <header class="topbar">
          <div class="topbar-main">
            <ha-menu-button class="ha-native-menu"></ha-menu-button>
            <div class="brand"><div class="brand-icon">SC</div><div><b>Smart Cabinet</b><span>Control & catalogue</span></div></div>
          </div>
          <nav>
            <button class="nav-tab ${this._active === "view" ? "active" : ""}" data-tab="view" aria-label="View" title="View"><svg viewBox="0 0 24 24"><path d="M4 19V5m5 14V9m5 10V4m5 15v-8"/></svg></button>
            <button class="nav-tab ${this._active === "configuration" ? "active" : ""}" data-tab="configuration" aria-label="Configuration" title="Configuration"><svg viewBox="0 0 24 24"><path d="M4 4h16v5H4zm0 11h16v5H4zm4-6v6m8-6v6"/></svg></button>
            <button class="nav-tab ${this._active === "miniatures" ? "active" : ""}" data-tab="miniatures" aria-label="Miniatures" title="Miniatures"><svg viewBox="0 0 24 24"><path d="M7 20v-2a5 5 0 0 1 10 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg></button>
            <button class="nav-tab ${this._active === "search" ? "active" : ""}" data-tab="search" aria-label="Search" title="Search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></svg></button>
          </nav>
        </header>
        <div class="page">${content}</div>
      </div>`;
    this._bind();
    const nextLedRuns = this.shadowRoot.querySelector(".led-runs");
    if (nextLedRuns && Number.isFinite(this._ledScrollLeft)) {
      nextLedRuns.scrollLeft = this._ledScrollLeft;
    }
    if (this._active === "search") this._updateSearch(false);
  }

  _bind() {
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((button) => button.onclick = () => {
      this._active = button.dataset.tab;
      this._render();
      if (this._active === "view") this._scheduleViewHighlight();
    });

    this.shadowRoot.querySelectorAll("[data-action]").forEach((button) => button.onclick = () => this._action(button));

    const color = this.shadowRoot.querySelector("#highlight-color");
    if (color) color.onchange = () => this._command({ action: "setHighlightColor", ...this._hexToRgb(color.value) });

    const start = this.shadowRoot.querySelector("#location-start");
    const leds = this.shadowRoot.querySelector("#location-leds");
    [start, leds].filter(Boolean).forEach((input) => input.oninput = () => this._previewLocation());

    const query = this.shadowRoot.querySelector("#search-query");
    const field = this.shadowRoot.querySelector("#search-field");
    if (query) query.oninput = () => { this._searchQuery = query.value; this._scheduleSearch(); };
    if (field) field.onchange = () => { this._searchField = field.value; this._scheduleSearch(); };

    this._bindViewDial();
    this._bindMappingLocationDial();
    const showAll = this.shadowRoot.querySelector("#show-all-mappings");
    if (showAll) showAll.onchange = () => { this._showAllMappings = showAll.checked; this._render(); };

    const miniColor = this.shadowRoot.querySelector("#view-mini-color");
    if (miniColor) miniColor.onchange = async () => {
      clearTimeout(this._viewTimer);
      await this._command({ action: "clearHighlight" });
      await this._miniLightsCommand({ state: "ON", color: this._hexToRgb(miniColor.value) });
    };

    const miniBrightness = this.shadowRoot.querySelector("#view-mini-brightness");
    if (miniBrightness) miniBrightness.oninput = () => {
      const value = Number(miniBrightness.value);
      const output = this.shadowRoot.querySelector("#view-mini-brightness-value");
      if (output) output.textContent = `${value}%`;
      clearTimeout(this._viewTimer);
      this._viewTimer = setTimeout(async () => {
        await this._command({ action: "clearHighlight" });
        await this._miniLightsCommand({ state: "ON", brightness: value });
      }, 180);
    };
  }

  async _action(button) {
    const action = button.dataset.action;
    if (action === "select-shelf") {
      this._selectedShelf = Number(button.dataset.shelf);
      this._selectedLocation = 1;
      this._render();
    } else if (action === "select-location") {
      this._selectedLocation = Number(button.dataset.location);
      await this._command({ action: "highlightLocation", shelf: this._selectedShelf, location: this._selectedLocation });
      this._render();
    } else if (action === "insert-shelf") {
      await this._command({ action: "insertShelf", position: Number(button.dataset.position) });
    } else if (action === "duplicate-shelf") {
      await this._command({ action: "duplicateShelf", shelf: Number(button.dataset.shelf) });
    } else if (action === "delete-shelf") {
      if (confirm(`Delete Shelf ${button.dataset.shelf}? Miniatures on it will become Unassigned.`)) {
        await this._command({ action: "deleteShelf", shelf: Number(button.dataset.shelf) });
      }
    } else if (action === "move-shelf") {
      await this._command({ action: "moveShelf", from: Number(button.dataset.from), to: Number(button.dataset.to) });
      this._selectedShelf = Number(button.dataset.to);
    } else if (action === "save-shelf") {
      await this._command({
        action: "setShelfConfig",
        shelf: this._selectedShelf,
        total_leds: Number(this.shadowRoot.querySelector("#shelf-leds").value),
        total_locations: Number(this.shadowRoot.querySelector("#shelf-locations").value),
      });
    } else if (action === "auto-map") {
      await this._command({ action: "autoMapShelf", shelf: this._selectedShelf });
    } else if (action === "clear-map") {
      if (confirm("Clear every location mapping on this shelf?")) {
        await this._command({ action: "clearShelfMapping", shelf: this._selectedShelf });
      }
    } else if (action === "toggle-direction") {
      const shelf = this._layout.shelves?.[this._selectedShelf - 1];
      await this._command({ action: "setShelfDirection", shelf: this._selectedShelf, mirrored: !shelf?.mirrored });
    } else if (action === "zoom-in") {
      this._ledZoom = Math.min(2, this._ledZoom + .25); this._render();
    } else if (action === "zoom-out") {
      this._ledZoom = Math.max(.5, this._ledZoom - .25); this._render();
    } else if (action === "select-led") {
      const led = Number(button.dataset.led);
      if (this._mappingStart === null || this._mappingEnd !== null) {
        this._mappingStart = led; this._mappingEnd = null;
      } else {
        this._mappingEnd = led;
        const start = Math.min(this._mappingStart, this._mappingEnd);
        await this._command({ action: "previewLocation", shelf: this._selectedShelf, location: this._selectedLocation, start_led: start, leds: Math.abs(this._mappingEnd - this._mappingStart) + 1 });
      }
      this._render();
    } else if (action === "reset-led-range") {
      this._mappingStart = null; this._mappingEnd = null;
      await this._command({ action: "highlightLocation", shelf: this._selectedShelf, location: this._selectedLocation });
      this._render();
    } else if (action === "save-led-range") {
      const start = Math.min(this._mappingStart, this._mappingEnd);
      await this._command({ action: "setLocationConfig", shelf: this._selectedShelf, location: this._selectedLocation, start_led: start, leds: Math.abs(this._mappingEnd - this._mappingStart) + 1 });
      this._mappingStart = null; this._mappingEnd = null;
    } else if (action === "save-location") {
      await this._command({
        action: "setLocationConfig",
        shelf: this._selectedShelf,
        location: this._selectedLocation,
        start_led: Number(this.shadowRoot.querySelector("#location-start").value),
        leds: Number(this.shadowRoot.querySelector("#location-leds").value),
      });
    } else if (action === "edit-mini") {
      this._editingMiniId = button.dataset.id;
      this._render();
    } else if (action === "cancel-mini") {
      this._editingMiniId = null;
      this._render();
    } else if (action === "save-mini") {
      await this._saveMini();
    } else if (action === "delete-mini") {
      const item = this._miniatures.find((mini) => mini.id === button.dataset.id);
      if (confirm(`Delete ${item?.name || "this miniature"}?`)) {
        await this._command({ action: "deleteMiniature", id: button.dataset.id });
      }
    } else if (action === "highlight-one") {
      const item = this._miniatures.find((mini) => mini.id === button.dataset.id);
      if (item?.shelf) await this._command({ action: "highlightLocation", shelf: item.shelf, location: item.location });
    } else if (action === "clear-view-highlight") {
      clearTimeout(this._viewTimer);
      await this._command({ action: "clearHighlight" });
    } else if (action === "apply-scene") {
      clearTimeout(this._viewTimer);
      await this._command({ action: "applyScene", scene: button.dataset.scene });
    }
  }

  _setViewIndex(index) {
    const items = this._assignedMiniatures;
    if (!items.length) return;
    this._viewIndex = ((index % items.length) + items.length) % items.length;
    const selection = this.shadowRoot.querySelector("#view-selection");
    const dial = this.shadowRoot.querySelector("#view-dial");
    if (selection) selection.innerHTML = this._viewSelectionContent();
    if (dial) dial.innerHTML = this._viewDialContent();
    this._scheduleViewHighlight();
  }

  _ledMappingContent(shelf, selectedLocation) {
    const total = shelf.total_leds;
    const firstRun = Math.ceil(total / 2);
    const ids = shelf.mirrored
      ? [[...Array(firstRun).keys()].reverse(), [...Array(total - firstRun).keys()].map((i) => firstRun + i)]
      : [[...Array(firstRun).keys()], [...Array(total - firstRun).keys()].map((i) => total - 1 - i)];
    const start = this._mappingStart ?? (selectedLocation?.mapped ? selectedLocation.start_led : null);
    const end = this._mappingEnd ?? (selectedLocation?.mapped ? selectedLocation.start_led + selectedLocation.leds - 1 : null);
    const cells = (run) => run.map((led) => {
      const selected = start !== null && end !== null && led >= Math.min(start, end) && led <= Math.max(start, end);
      const assigned = this._showAllMappings && (shelf.locations || []).some((loc) => loc.mapped && led >= loc.start_led && led < loc.start_led + loc.leds);
      const endpoint = led === start ? " range-start" : led === end ? " range-end" : "";
      return `<button class="led-cell ${assigned ? "assigned" : ""} ${selected ? "selected" : ""}${endpoint}" data-action="select-led" data-led="${led}" title="LED ${led + 1}"><i></i>${led % 5 === 0 ? `<small>${led + 1}</small>` : ""}</button>`;
    }).join("");
    const range = start === null || end === null ? "Tap the start LED" : `LED ${Math.min(start, end) + 1} → ${Math.max(start, end) + 1} · ${Math.abs(end - start) + 1} LEDs`;
    const dial = this._mappingDialTicks(shelf.total_locations);
    return `<section class="mapping-visual">
      <div class="section-heading"><div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div><label class="mapping-toggle"><input id="show-all-mappings" type="checkbox" ${this._showAllMappings ? "checked" : ""}><span class="mapping-toggle-icon"><svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m-6.5-6.5a6 6 0 1 1 9 0c-.9.8-1.5 1.8-1.5 3.5h-6c0-1.7-.6-2.7-1.5-3.5Z"/></svg></span><span>Show all assigned</span></label></div>
      <div id="mapping-location-dial" class="picker-dial compact">${dial}</div>
      <div class="mapping-tools"><button data-action="toggle-direction">${shelf.mirrored ? "Start at right" : "Start at left"}</button><button class="icon-button" data-action="zoom-out">−</button><button class="icon-button" data-action="zoom-in">＋</button><b>${range}</b></div>
      <p>Selected location: <b id="mapping-selected-label">${this._selectedLocation}</b>. Tap first and last LED to preview; save commits the range. Overlaps are allowed.</p>
      <div class="led-runs ${shelf.mirrored ? "mirrored" : ""}" style="--led-size:${this._ledZoom * 9}px"><div class="led-run"><div class="power-mark" aria-label="Strip power">⚡</div>${cells(ids[0])}</div><span class="strip-connector" aria-hidden="true"></span><div class="led-run return">${cells(ids[1])}</div></div>
      <div class="button-row end"><button data-action="reset-led-range">Go back</button><button class="primary" data-action="save-led-range" ${start === null || end === null ? "disabled" : ""}>Save location</button></div>
    </section>`;
  }

  _mappingDialTicks(totalLocations) {
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const location = (this._selectedLocation - 1 + offset + totalLocations) % totalLocations + 1;
      return `<span class="dial-tick ${offset === 0 ? "active" : ""}">${offset === 0 ? "<em>LOCATION</em>" : ""}<i></i><b>${location}</b></span>`;
    }).join("");
  }

  _bindViewDial() {
    const dial = this.shadowRoot.querySelector("#view-dial");
    if (!dial) return;
    let startX = 0;
    let startIndex = 0;
    let lastSteps = 0;
    let active = false;
    const stepPixels = 36;

    dial.onpointerdown = (event) => {
      active = true;
      startX = event.clientX;
      startIndex = this._viewIndex;
      lastSteps = 0;
      dial.setPointerCapture?.(event.pointerId);
      dial.classList.add("dragging");
    };
    dial.onpointermove = (event) => {
      if (!active) return;
      const steps = Math.trunc((startX - event.clientX) / stepPixels);
      if (steps === lastSteps) return;
      lastSteps = steps;
      this._setViewIndex(startIndex + steps);
    };
    const finish = () => { active = false; dial.classList.remove("dragging"); };
    dial.onpointerup = finish;
    dial.onpointercancel = finish;
  }

  _bindMappingLocationDial() {
    const dial = this.shadowRoot.querySelector("#mapping-location-dial");
    const shelf = this._layout.shelves?.[this._selectedShelf - 1];
    if (!dial || !shelf) return;
    let startX = 0;
    let initial = 0;
    let lastSteps = 0;
    let active = false;
    let changed = false;
    dial.onpointerdown = (event) => {
      active = true; changed = false; startX = event.clientX; initial = this._selectedLocation - 1; lastSteps = 0;
      dial.setPointerCapture?.(event.pointerId); dial.classList.add("dragging");
    };
    dial.onpointermove = (event) => {
      if (!active) return;
      const steps = Math.trunc((startX - event.clientX) / 36);
      if (steps === lastSteps) return;
      lastSteps = steps;
      this._selectedLocation = ((initial + steps) % shelf.total_locations + shelf.total_locations) % shelf.total_locations + 1;
      this._mappingStart = null; this._mappingEnd = null;
      dial.innerHTML = this._mappingDialTicks(shelf.total_locations);
      const label = this.shadowRoot.querySelector("#mapping-selected-label");
      if (label) label.textContent = this._selectedLocation;
      this._refreshMappingLeds(shelf);
      this._scheduleMappingHighlight();
      changed = true;
    };
    const finish = () => {
      active = false; dial.classList.remove("dragging");
      if (changed) this._render();
    };
    dial.onpointerup = finish; dial.onpointercancel = finish;
  }

  _scheduleMappingHighlight() {
    clearTimeout(this._mappingTimer);
    this._mappingTimer = setTimeout(() => this._command({
      action: "highlightLocation", shelf: this._selectedShelf, location: this._selectedLocation,
    }), 220);
  }

  _refreshMappingLeds(shelf) {
    const current = this.shadowRoot.querySelector(".led-runs");
    const selected = shelf.locations?.[this._selectedLocation - 1];
    if (!current || !selected) return;
    const scratch = document.createElement("div");
    scratch.innerHTML = this._ledMappingContent(shelf, selected);
    const next = scratch.querySelector(".led-runs");
    if (!next) return;
    current.className = next.className;
    current.style.cssText = next.style.cssText;
    current.innerHTML = next.innerHTML;
  }

  _scheduleViewHighlight() {
    const item = this._viewItem(this._viewIndex);
    if (!item) return;
    clearTimeout(this._viewTimer);
    this._viewTimer = setTimeout(() => this._command({
      action: "highlightLocation", shelf: Number(item.shelf), location: Number(item.location),
    }), 220);
  }

  _previewLocation() {
    clearTimeout(this._previewTimer);
    const start = Number(this.shadowRoot.querySelector("#location-start")?.value);
    const leds = Number(this.shadowRoot.querySelector("#location-leds")?.value);
    const preview = this.shadowRoot.querySelector("#range-preview-text");
    if (preview) preview.textContent = Number.isFinite(start) && leds > 0 ? `${start} → ${start + leds - 1}` : "Invalid range";
    if (!Number.isFinite(start) || start < 0 || !Number.isFinite(leds) || leds <= 0) return;
    this._previewTimer = setTimeout(() => this._command({
      action: "previewLocation",
      shelf: this._selectedShelf,
      location: this._selectedLocation,
      start_led: start,
      leds,
    }), 180);
  }

  async _saveMini() {
    const name = this.shadowRoot.querySelector("#mini-name").value.trim();
    const collection = this.shadowRoot.querySelector("#mini-collection").value.trim();
    const artist = this.shadowRoot.querySelector("#mini-artist").value.trim();
    if (!name) return;

    const current = this._miniatures.find((item) => item.id === this._editingMiniId);
    if (current) {
      await this._command({
        action: "updateMiniature", id: current.id, name, collection, artist,
        date: current.date || "", shelf: current.shelf || 0, location: current.location || 0, notes: current.notes || "",
      });
      this._editingMiniId = null;
    } else {
      await this._command({ action: "createMiniature", name, collection, artist, date: "", shelf: 0, location: 0, notes: "" });
    }
    this._render();
  }

  _scheduleSearch() {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this._updateSearch(true), 220);
  }

  async _updateSearch(highlight) {
    const queryInput = this.shadowRoot.querySelector("#search-query");
    const fieldInput = this.shadowRoot.querySelector("#search-field");
    const resultsEl = this.shadowRoot.querySelector("#search-results");
    const summaryEl = this.shadowRoot.querySelector("#search-summary");
    if (!queryInput || !resultsEl) return;

    const q = queryInput.value.trim().toLocaleLowerCase();
    const field = fieldInput?.value || "all";
    if (!q) {
      resultsEl.innerHTML = "";
      summaryEl.textContent = "Start typing to search.";
      if (highlight) await this._command({ action: "clearHighlight" });
      return;
    }

    const fields = field === "all" ? ["name", "collection", "artist"] : [field];
    const results = this._miniatures.filter((item) => fields.some((key) => String(item[key] || "").toLocaleLowerCase().includes(q)));
    const assigned = results.filter((item) => item.shelf > 0 && item.location > 0);

    summaryEl.textContent = `${results.length} result${results.length === 1 ? "" : "s"} · ${assigned.length} assigned`;
    resultsEl.innerHTML = results.map((item) => `
      <button class="search-result" data-action="highlight-one" data-id="${this._escape(item.id)}" ${item.shelf ? "" : "disabled"}>
        <div class="mini-avatar">${this._escape(item.name?.[0] || "?")}</div>
        <div class="search-result-main"><b>${this._escape(item.name)}</b><span>${this._escape(item.collection || "No collection")} · ${this._escape(item.artist || "Unknown artist")}</span></div>
        <span class="position-badge ${item.shelf ? "" : "unassigned"}">${item.shelf ? `Shelf ${item.shelf} · Location ${item.location}` : "Unassigned"}</span>
      </button>`).join("") || `<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>`;

    this.shadowRoot.querySelectorAll("[data-action='highlight-one']").forEach((button) => button.onclick = () => this._action(button));

    if (highlight) {
      if (assigned.length) {
        await this._command({ action: "highlightLocations", locations: assigned.map((item) => ({ shelf: item.shelf, location: item.location })) });
      } else {
        await this._command({ action: "clearHighlight" });
      }
    }
  }

  _styles() {
    return `
      :host { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color); font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif); }
      * { box-sizing:border-box; }
      button, input, select { font:inherit; }
      button { cursor:pointer; }
      button:disabled { cursor:not-allowed; opacity:.42; }
      .app-shell { min-height:100vh; overflow-x:hidden; padding-bottom:env(safe-area-inset-bottom, 0px); }
      .topbar { position:sticky; top:0; z-index:4; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:14px 28px; border-bottom:1px solid var(--divider-color); background:var(--app-header-background-color, var(--card-background-color)); box-shadow:0 1px 8px rgba(0,0,0,.06); }
      .topbar-main { display:flex; align-items:center; gap:10px; min-width:0; }
      .ha-native-menu { flex:0 0 auto; margin-left:-6px; }
      .brand { display:flex; align-items:center; gap:11px; min-width:190px; }
      .brand-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:11px; background:var(--primary-color); color:var(--text-primary-color); font-weight:800; font-size:13px; }
      .brand b,.brand span { display:block; } .brand span { margin-top:2px; color:var(--secondary-text-color); font-size:12px; }
      nav { display:flex; gap:4px; padding:4px; border-radius:12px; background:var(--secondary-background-color); }
      .nav-tab { display:grid; place-items:center; width:42px; height:38px; border:0; background:transparent; color:var(--secondary-text-color); padding:0; border-radius:9px; }
      .nav-tab svg { width:19px; height:19px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
      .nav-tab.active { background:var(--card-background-color); color:var(--primary-text-color); box-shadow:0 1px 4px rgba(0,0,0,.09); }
      .page { max-width:1500px; margin:0 auto; overflow-x:hidden; padding:28px; }
      .panel-card { border:1px solid var(--divider-color); background:var(--card-background-color); border-radius:18px; box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,.04)); }
      .general-card { display:flex; justify-content:space-between; align-items:center; gap:30px; padding:22px 24px; margin-bottom:18px; }
      h2,h3,p { margin:0; } h2 { font-size:22px; } h3 { font-size:16px; }
      p { margin-top:6px; color:var(--secondary-text-color); font-size:13px; line-height:1.5; }
      .eyebrow { margin-bottom:5px; color:var(--primary-color); font-size:10px; letter-spacing:.12em; font-weight:800; }
      .general-values { display:flex; align-items:center; gap:12px; }
      .metric,.color-control { min-width:110px; padding:10px 13px; background:var(--secondary-background-color); border-radius:12px; }
      .metric span,.color-control span { display:block; color:var(--secondary-text-color); font-size:11px; margin-bottom:5px; } .metric b { font-size:20px; }
      .color-control { display:grid; grid-template-columns:1fr auto; column-gap:12px; align-items:center; min-width:170px; } .color-control span { margin:0; } input[type=color] { width:34px; height:28px; border:0; padding:0; background:none; }
      .configuration-grid { display:grid; grid-template-columns:300px minmax(0,1fr); min-width:0; gap:18px; align-items:start; }
      .shelf-detail { min-width:0; overflow:hidden; }
      .shelf-list,.shelf-detail,.mini-editor,.mini-list-card,.search-card { padding:20px; }
      .section-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
      .shelf-items { display:grid; gap:5px; }
      .shelf-row { display:flex; align-items:center; border:1px solid transparent; border-radius:12px; background:var(--secondary-background-color); }
      .shelf-row.selected { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color)); }
      .shelf-select { flex:1; display:flex; align-items:center; gap:10px; text-align:left; padding:10px; border:0; color:inherit; background:transparent; }
      .shelf-select span:last-child { min-width:0; } .shelf-select b,.shelf-select small { display:block; } .shelf-select small { margin-top:2px; color:var(--secondary-text-color); font-size:10px; }
      .shelf-number,.location-index { display:grid; place-items:center; flex:0 0 32px; height:32px; border-radius:9px; background:var(--card-background-color); font-weight:700; font-size:12px; }
      .row-actions { display:flex; gap:4px; padding-right:7px; }
      .icon-button { width:28px; height:28px; padding:0; border:0; border-radius:8px; background:var(--card-background-color); color:inherit; }
      .insert-shelf { width:100%; border:0; background:transparent; color:var(--primary-color); padding:4px; font-size:10px; opacity:.65; } .insert-shelf:hover { opacity:1; }
      .form-grid { display:grid; gap:12px; margin-top:16px; } .form-grid.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
      label span { display:block; margin-bottom:6px; color:var(--secondary-text-color); font-size:11px; font-weight:600; }
      input,select { width:100%; min-height:40px; border:1px solid var(--divider-color); border-radius:10px; padding:8px 10px; background:var(--primary-background-color); color:var(--primary-text-color); outline:none; }
      input:focus,select:focus { border-color:var(--primary-color); box-shadow:0 0 0 2px color-mix(in srgb, var(--primary-color) 20%, transparent); }
      .button-row { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; } .button-row.end { justify-content:flex-end; }
      button:not(.nav-tab):not(.shelf-select):not(.icon-button):not(.insert-shelf):not(.location-row):not(.search-result) { min-height:38px; border:1px solid var(--divider-color); border-radius:10px; padding:0 13px; background:var(--secondary-background-color); color:var(--primary-text-color); }
      button.primary { border-color:var(--primary-color)!important; background:var(--primary-color)!important; color:var(--text-primary-color)!important; } button.small { min-height:32px!important; font-size:11px; }
      button.ghost { background:transparent!important; } button.danger { color:var(--error-color)!important; } button.full { width:100%; margin-top:14px; }
      .divider { height:1px; background:var(--divider-color); margin:22px 0; }
      .locations-layout { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr); gap:18px; }
      .legacy-mapping { display:none; }
      .mapping-visual { min-width:0; } .mapping-toggle { display:flex; align-items:center; gap:7px; color:var(--secondary-text-color); font-size:11px; } .mapping-toggle input { width:auto; min-height:auto; accent-color:var(--primary-color); } .picker-dial.compact { margin:10px 0 14px; min-height:48px; } .picker-dial.compact .dial-tick em { display:none; } .picker-dial.compact .dial-tick.active b { font-size:22px; } .mapping-tools { display:flex; align-items:center; gap:8px; flex-wrap:wrap; } .mapping-tools b { margin-left:auto; color:var(--secondary-text-color); font-size:11px; } .led-runs { display:grid; gap:20px; max-width:100%; margin-top:16px; overflow-x:auto; padding:4px 0 20px; } .led-run { display:grid; grid-auto-flow:column; grid-auto-columns:var(--led-size); width:max-content; min-height:calc(var(--led-size) + 18px); } .led-run.return { margin-left:auto; } .led-cell { position:relative; width:var(--led-size); height:var(--led-size); min-width:var(--led-size); padding:0; border:1px solid var(--divider-color); border-radius:1px; background:var(--secondary-background-color); } .led-cell.selected { background:#fff; border-color:#fff; } .led-cell.assigned { background:color-mix(in srgb, var(--primary-color) 35%, var(--secondary-background-color)); } .led-cell.range-start { background:#e83e8c; border-color:#e83e8c; } .led-cell.range-end { background:#ff8a00; border-color:#ff8a00; } .led-cell small { position:absolute; top:calc(var(--led-size) * 4 + 4px); left:50%; transform:translateX(-50%); color:var(--secondary-text-color); font-size:8px; font-weight:600; }
      .mapping-visual { min-width:0; max-width:100%; overflow:hidden; } .led-runs { position:relative; display:flex; flex-direction:column; align-items:flex-end; contain:inline-size; min-width:0; max-width:100%; width:100%; gap:44px; overflow-x:auto; overflow-y:hidden; padding:8px 32px 24px 28px; } .led-run { gap:2px; position:relative; } .led-cell { min-height:0!important; height:calc(var(--led-size) * 4)!important; min-width:var(--led-size)!important; width:var(--led-size)!important; padding:0!important; border-radius:1px!important; } .led-cell.assigned { background:color-mix(in srgb, var(--primary-color) 35%, var(--secondary-background-color))!important; } .led-cell.selected { background:#fff!important; border-color:#fff!important; } .led-cell.range-start { background:#e83e8c!important; border-color:#e83e8c!important; } .led-cell.range-end { background:#ff8a00!important; border-color:#ff8a00!important; } .power-mark { position:absolute; top:4px; left:-20px; display:grid; place-items:center; width:1rem; height:1rem; border-radius:50%; background:var(--primary-color); color:var(--text-primary-color); font-size:10px; z-index:2; } .led-runs.mirrored .power-mark { left:auto; right:-20px; } .led-run:first-of-type::after { content:none; } .strip-connector { position:absolute; z-index:3; top:calc(var(--led-size) * 2 + 12px); right:12px; width:16px; height:70px; border:2px dashed var(--secondary-text-color); border-left:0; border-radius:0 10px 10px 0; opacity:.9; pointer-events:none; } .led-runs.mirrored { align-items:flex-start; } .led-runs.mirrored .strip-connector { right:auto; left:12px; transform:scaleX(-1); } .led-run.return { margin-left:0; } .mapping-toggle input { position:absolute; opacity:0; pointer-events:none; } .mapping-toggle-icon { display:grid; place-items:center; width:28px; height:28px; border:1px solid var(--divider-color); border-radius:50%; background:var(--secondary-background-color); } .mapping-toggle-icon svg { width:15px; height:15px; fill:none; stroke:var(--secondary-text-color); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; } .mapping-toggle input:checked + .mapping-toggle-icon { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 18%, var(--secondary-background-color)); } .mapping-toggle input:checked + .mapping-toggle-icon svg { stroke:var(--primary-color); fill:color-mix(in srgb, var(--primary-color) 20%, transparent); }
      .location-list { display:grid; gap:5px; max-height:470px; overflow:auto; padding-right:4px; }
      .location-row { display:grid; grid-template-columns:38px 1fr auto; align-items:center; gap:10px; width:100%; min-height:48px; border:1px solid var(--divider-color); border-radius:11px; padding:7px 10px; background:transparent; color:inherit; text-align:left; }
      .location-row.selected { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 9%, transparent); } .location-row.unmapped { opacity:.66; }
      .location-range { font-size:12px; } .location-count,.muted { color:var(--secondary-text-color); font-size:11px; }
      .location-editor { align-self:start; padding:18px; border-radius:14px; background:var(--secondary-background-color); }
      .range-preview { display:flex; justify-content:space-between; gap:12px; margin-top:12px; padding:10px 12px; background:var(--card-background-color); border-radius:10px; font-size:11px; } .range-preview span { color:var(--secondary-text-color); }
      .miniatures-grid { display:grid; grid-template-columns:330px minmax(0,1fr); gap:18px; align-items:start; }
      .mini-editor { position:sticky; top:90px; }
      .mini-list { display:grid; gap:7px; }
      .mini-row { display:grid; grid-template-columns:38px minmax(160px,1fr) minmax(120px,.7fr) auto auto; gap:11px; align-items:center; padding:10px; border:1px solid var(--divider-color); border-radius:12px; }
      .mini-avatar { display:grid; place-items:center; width:36px; height:36px; border-radius:11px; background:color-mix(in srgb, var(--primary-color) 14%, var(--secondary-background-color)); color:var(--primary-color); font-weight:800; }
      .mini-main b,.mini-main span { display:block; } .mini-main span,.mini-artist { color:var(--secondary-text-color); font-size:11px; margin-top:2px; }
      .position-badge { white-space:nowrap; padding:5px 8px; border-radius:999px; background:color-mix(in srgb, var(--primary-color) 12%, transparent); color:var(--primary-color); font-size:10px; font-weight:700; } .position-badge.unassigned { background:var(--secondary-background-color); color:var(--secondary-text-color); }
      .search-card { max-width:980px; margin:0 auto; } .search-controls { display:grid; grid-template-columns:1fr 180px; gap:10px; margin-top:20px; } .search-summary { margin:12px 2px; }
      .search-results { display:grid; gap:7px; } .search-result { display:grid; grid-template-columns:38px 1fr auto; align-items:center; gap:12px; width:100%; padding:10px; border:1px solid var(--divider-color); border-radius:12px; background:transparent; color:inherit; text-align:left; }
      .search-result:hover:not(:disabled) { border-color:var(--primary-color); } .search-result-main b,.search-result-main span { display:block; } .search-result-main span { margin-top:3px; color:var(--secondary-text-color); font-size:11px; }
      .view-card { max-width:760px; margin:0 auto; padding:22px; } .view-mini-card { display:flex; align-items:center; justify-content:flex-start; gap:13px; min-height:94px; padding:14px 32px 14px 14px; text-align:left; border-radius:14px; background:var(--secondary-background-color); } .view-mini-card h3 { font-size:18px; } .view-mini-card p { max-width:390px; } .view-position { margin:12px 0 2px; text-align:center; color:var(--primary-color); font-size:11px; font-weight:800; letter-spacing:.11em; } .view-position span { padding:0 5px; color:var(--secondary-text-color); }
      .picker-shell { position:relative; margin:24px auto 4px; padding:18px 20px 12px; overflow:hidden; border:1px solid var(--divider-color); border-radius:14px; background:var(--primary-background-color); } .picker-caption { margin-bottom:9px; color:var(--secondary-text-color); text-align:center; font-size:9px; font-weight:800; letter-spacing:.22em; } .picker-dial { display:grid; grid-template-columns:repeat(7,1fr); align-items:end; min-height:58px; border-top:1px solid var(--divider-color); background:repeating-linear-gradient(90deg, transparent 0 7px, color-mix(in srgb, var(--divider-color) 70%, transparent) 7px 8px); cursor:grab; touch-action:pan-y; user-select:none; } .picker-dial.dragging { cursor:grabbing; } .dial-tick { display:grid; justify-items:center; gap:4px; color:var(--secondary-text-color); font-size:12px; pointer-events:none; } .dial-tick i { display:block; width:1px; height:12px; background:currentColor; } .dial-tick b { font-size:14px; } .dial-tick.active { color:var(--primary-color); transform:translateY(-4px); } .dial-tick.active i { width:2px; height:22px; } .dial-tick.active b { font-size:19px; } .view-actions { display:flex; justify-content:center; margin-top:13px; }
      .view-controls-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; max-width:760px; margin:18px auto 0; } .view-control-card { padding:20px; } .scene-list { display:flex; gap:7px; margin-top:15px; flex-wrap:wrap; } .scene-button.active { border-color:var(--primary-color)!important; color:var(--primary-color)!important; } .strip-controls { display:grid; grid-template-columns:auto 1fr auto; align-items:end; gap:12px; margin-top:15px; } .strip-controls label span { margin-bottom:5px; } .strip-controls input[type=color] { width:38px; height:38px; } .strip-controls input[type=range] { min-height:30px; padding:0; accent-color:var(--primary-color); } .strip-controls output { min-width:34px; padding-bottom:9px; color:var(--secondary-text-color); font-size:11px; font-weight:700; }
      .empty-state { display:grid; gap:5px; place-items:center; padding:40px 18px; text-align:center; color:var(--secondary-text-color); } .empty-state b { color:var(--primary-text-color); }
      @media (max-width:900px) { .configuration-grid,.miniatures-grid,.view-controls-grid { grid-template-columns:1fr; } .mini-editor { position:static; } .locations-layout { grid-template-columns:1fr; } .topbar { align-items:flex-start; flex-direction:column; padding:calc(10px + env(safe-area-inset-top, 0px)) 16px 12px; } .topbar-main { width:100%; } nav { width:100%; justify-content:space-between; } .nav-tab { flex:0 0 42px; } .page { padding:16px 16px calc(32px + env(safe-area-inset-bottom, 0px)); } }
      @media (max-width:600px) { .brand-icon { width:36px; height:36px; } .general-card { align-items:flex-start; flex-direction:column; } .general-values { width:100%; } .metric,.color-control { flex:1; } .form-grid.two,.search-controls { grid-template-columns:1fr; } .mini-row { grid-template-columns:38px 1fr auto; } .mini-artist { grid-column:2; } .mini-row .row-actions { grid-column:2 / -1; } .position-badge { grid-column:3; grid-row:1 / span 2; } .view-card { padding:16px; } .picker-shell { padding-left:10px; padding-right:10px; } .dial-tick b { font-size:11px; } .dial-tick.active b { font-size:16px; } .picker-dial.compact { min-height:68px; } .picker-dial.compact .dial-tick em { display:block; min-height:10px; color:var(--primary-color); font-size:8px; font-style:normal; font-weight:800; letter-spacing:.1em; } }
    `;
  }
}

customElements.define("ha-panel-smart-cabinet", HaPanelSmartCabinet);
