const DEFAULT_CONFIG = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
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
    const signature = `${layoutState?.last_updated || ""}|${miniState?.last_updated || ""}`;
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

  async _command(payload) {
    if (!this._hass) return;
    await this._hass.callService("mqtt", "publish", {
      topic: this._config.command_topic,
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
            <button data-action="auto-map">Auto map</button>
            <button data-action="clear-map">Clear mapping</button>
          </div>

          <div class="divider"></div>
          <div class="locations-layout">
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

  _render() {
    if (!this.shadowRoot) return;
    const content = this._active === "configuration" ? this._layoutContent()
      : this._active === "miniatures" ? this._miniaturesContent()
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
            <button class="nav-tab ${this._active === "configuration" ? "active" : ""}" data-tab="configuration">Configuration</button>
            <button class="nav-tab ${this._active === "miniatures" ? "active" : ""}" data-tab="miniatures">Miniatures</button>
            <button class="nav-tab ${this._active === "search" ? "active" : ""}" data-tab="search">Search</button>
          </nav>
        </header>
        <div class="page">${content}</div>
      </div>`;
    this._bind();
    if (this._active === "search") this._updateSearch(false);
  }

  _bind() {
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((button) => button.onclick = () => {
      this._active = button.dataset.tab;
      this._render();
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
    }
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
      .app-shell { min-height:100vh; padding-bottom:env(safe-area-inset-bottom, 0px); }
      .topbar { position:sticky; top:0; z-index:4; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:14px 28px; border-bottom:1px solid var(--divider-color); background:var(--app-header-background-color, var(--card-background-color)); box-shadow:0 1px 8px rgba(0,0,0,.06); }
      .topbar-main { display:flex; align-items:center; gap:10px; min-width:0; }
      .ha-native-menu { flex:0 0 auto; margin-left:-6px; }
      .brand { display:flex; align-items:center; gap:11px; min-width:190px; }
      .brand-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:11px; background:var(--primary-color); color:var(--text-primary-color); font-weight:800; font-size:13px; }
      .brand b,.brand span { display:block; } .brand span { margin-top:2px; color:var(--secondary-text-color); font-size:12px; }
      nav { display:flex; gap:4px; padding:4px; border-radius:12px; background:var(--secondary-background-color); }
      .nav-tab { border:0; background:transparent; color:var(--secondary-text-color); padding:9px 15px; border-radius:9px; font-weight:600; }
      .nav-tab.active { background:var(--card-background-color); color:var(--primary-text-color); box-shadow:0 1px 4px rgba(0,0,0,.09); }
      .page { max-width:1500px; margin:0 auto; padding:28px; }
      .panel-card { border:1px solid var(--divider-color); background:var(--card-background-color); border-radius:18px; box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,.04)); }
      .general-card { display:flex; justify-content:space-between; align-items:center; gap:30px; padding:22px 24px; margin-bottom:18px; }
      h2,h3,p { margin:0; } h2 { font-size:22px; } h3 { font-size:16px; }
      p { margin-top:6px; color:var(--secondary-text-color); font-size:13px; line-height:1.5; }
      .eyebrow { margin-bottom:5px; color:var(--primary-color); font-size:10px; letter-spacing:.12em; font-weight:800; }
      .general-values { display:flex; align-items:center; gap:12px; }
      .metric,.color-control { min-width:110px; padding:10px 13px; background:var(--secondary-background-color); border-radius:12px; }
      .metric span,.color-control span { display:block; color:var(--secondary-text-color); font-size:11px; margin-bottom:5px; } .metric b { font-size:20px; }
      .color-control { display:grid; grid-template-columns:1fr auto; column-gap:12px; align-items:center; min-width:170px; } .color-control span { margin:0; } input[type=color] { width:34px; height:28px; border:0; padding:0; background:none; }
      .configuration-grid { display:grid; grid-template-columns:300px minmax(0,1fr); gap:18px; align-items:start; }
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
      .empty-state { display:grid; gap:5px; place-items:center; padding:40px 18px; text-align:center; color:var(--secondary-text-color); } .empty-state b { color:var(--primary-text-color); }
      @media (max-width:900px) { .configuration-grid,.miniatures-grid { grid-template-columns:1fr; } .mini-editor { position:static; } .locations-layout { grid-template-columns:1fr; } .topbar { align-items:flex-start; flex-direction:column; padding:calc(10px + env(safe-area-inset-top, 0px)) 16px 12px; } .topbar-main { width:100%; } nav { width:100%; } .nav-tab { flex:1; } .page { padding:16px 16px calc(32px + env(safe-area-inset-bottom, 0px)); } }
      @media (max-width:600px) { .brand-icon { width:36px; height:36px; } .general-card { align-items:flex-start; flex-direction:column; } .general-values { width:100%; } .metric,.color-control { flex:1; } .form-grid.two,.search-controls { grid-template-columns:1fr; } .mini-row { grid-template-columns:38px 1fr auto; } .mini-artist { grid-column:2; } .mini-row .row-actions { grid-column:2 / -1; } .position-badge { grid-column:3; grid-row:1 / span 2; } }
    `;
  }
}

customElements.define("ha-panel-smart-cabinet", HaPanelSmartCabinet);
