const v = {
  _layoutContent() {
    const s = this._layout, t = s.shelves || [];
    if (!t.length) return '<div class="empty-state"><b>Waiting for cabinet layout</b><span>The panel will populate when the ESP32 publishes its retained layout state.</span></div>';
    this._selectedShelf > t.length && (this._selectedShelf = t.length);
    const e = t[this._selectedShelf - 1] || t[0];
    this._selectedLocation > e.total_locations && (this._selectedLocation = e.total_locations || 1);
    const i = e.locations?.[this._selectedLocation - 1] || null, o = t.map((a, d) => `
      <div class="shelf-row ${a.shelf === this._selectedShelf ? "selected" : ""}" data-shelf="${a.shelf}">
        <button class="shelf-select" data-action="select-shelf" data-shelf="${a.shelf}"><span class="shelf-number">${String(a.shelf).padStart(2, "0")}</span><span><b>Shelf ${a.shelf}</b><small>${a.total_locations} locations · ${a.total_leds} LEDs</small></span></button>
        <div class="row-actions"><button class="icon-button" title="Move up" data-action="move-shelf" data-from="${a.shelf}" data-to="${Math.max(1, a.shelf - 1)}" ${d === 0 ? "disabled" : ""}>↑</button><button class="icon-button" title="Move down" data-action="move-shelf" data-from="${a.shelf}" data-to="${Math.min(t.length, a.shelf + 1)}" ${d === t.length - 1 ? "disabled" : ""}>↓</button></div>
      </div><button class="insert-shelf" data-action="insert-shelf" data-position="${a.shelf + 1}">＋ Insert shelf here</button>`).join(""), r = (e.locations || []).map((a) => `<button class="location-row ${a.location === this._selectedLocation ? "selected" : ""} ${a.mapped ? "" : "unmapped"}" data-action="select-location" data-location="${a.location}"><span class="location-index">${String(a.location).padStart(2, "0")}</span><span class="location-range">${a.mapped ? `LED ${a.start_led} → ${a.start_led + a.leds - 1}` : "Unmapped"}</span><span class="location-count">${a.leds} LEDs</span></button>`).join(""), c = this._rgbToHex(s.highlight_color || { r: 156, g: 39, b: 176 });
    return `<section class="general-card panel-card"><div><div class="eyebrow">GENERAL</div><h2>Cabinet configuration</h2><p>Physical structure and the color used to identify miniature locations.</p></div><div class="general-values"><div class="metric"><span>Shelves</span><b>${s.shelf_count || t.length}</b></div><label class="color-control"><span>Highlight color</span><input id="highlight-color" type="color" value="${c}"></label></div></section>
      <div class="configuration-grid"><aside class="panel-card shelf-list"><div class="section-heading"><div><div class="eyebrow">SHELVES</div><h3>Physical order</h3></div><button class="primary small" data-action="insert-shelf" data-position="${t.length + 1}">＋ Add shelf</button></div><div class="shelf-items">${o}</div></aside>
      <main class="panel-card shelf-detail"><div class="section-heading detail-heading"><div><div class="eyebrow">SELECTED SHELF</div><h2>Shelf ${e.shelf}</h2></div><button class="danger ghost" data-action="delete-shelf" data-shelf="${e.shelf}" ${t.length <= 1 ? "disabled" : ""}>Delete shelf</button></div><div class="form-grid two"><label><span>Total LEDs</span><input id="shelf-leds" type="number" min="1" value="${e.total_leds}"></label><label><span>Total locations</span><input id="shelf-locations" type="number" min="1" value="${e.total_locations}"></label></div><div class="button-row"><button class="primary" data-action="save-shelf">Save shelf</button><button data-action="duplicate-shelf" data-shelf="${e.shelf}">Duplicate shelf</button><button data-action="auto-map">Auto map</button><button data-action="clear-map">Clear mapping</button></div><div class="divider"></div>${this._ledMappingContent(e, i)}
      <div class="locations-layout legacy-mapping"><div><div class="section-heading"><div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div><span class="muted">Select to highlight</span></div><div class="location-list">${r}</div></div><div class="location-editor ${i ? "" : "disabled"}">${i ? `<div class="eyebrow">LOCATION ${i.location}</div><h3>Mapping</h3><p>Changes are previewed on the cabinet before they are saved.</p><div class="form-grid two"><label><span>Start LED</span><input id="location-start" type="number" min="0" value="${i.start_led}"></label><label><span>LEDs</span><input id="location-leds" type="number" min="1" value="${i.leds || 1}"></label></div><div class="range-preview"><span>Physical range</span><b id="range-preview-text">${i.mapped ? `${i.start_led} → ${i.start_led + i.leds - 1}` : "Not mapped"}</b></div><button class="primary full" data-action="save-location">Save location</button>` : '<div class="empty-state">Select a location.</div>'}</div></div></main></div>`;
  },
  _miniaturesContent() {
    const s = this._miniatures, t = s.find((i) => i.id === this._editingMiniId) || null, e = s.map((i) => `<div class="mini-row"><div class="mini-avatar">${this._escape(i.name?.[0] || "?")}</div><div class="mini-main"><b>${this._escape(i.name)}</b><span>${this._escape(i.collection || "No collection")}</span></div><div class="mini-artist">${this._escape(i.artist || "Unknown artist")}</div><div class="position-badge ${i.shelf ? "" : "unassigned"}">${i.shelf ? `S${i.shelf} · L${i.location}` : "Unassigned"}</div><div class="row-actions"><button class="ghost" data-action="edit-mini" data-id="${this._escape(i.id)}">Edit</button><button class="danger ghost" data-action="delete-mini" data-id="${this._escape(i.id)}">Delete</button></div></div>`).join("");
    return `<div class="miniatures-grid"><section class="panel-card mini-editor"><div class="eyebrow">${t ? "EDIT MINIATURE" : "NEW MINIATURE"}</div><h2>${t ? this._escape(t.name) : "Add to catalogue"}</h2><p>Position management will get its own visual workflow later. New miniatures start unassigned.</p><div class="form-grid"><label><span>Name</span><input id="mini-name" maxlength="80" value="${this._escape(t?.name || "")}"></label><label><span>Collection</span><input id="mini-collection" maxlength="80" value="${this._escape(t?.collection || "")}"></label><label><span>Artist</span><input id="mini-artist" maxlength="80" value="${this._escape(t?.artist || "")}"></label></div><div class="button-row end">${t ? '<button data-action="cancel-mini">Cancel</button>' : ""}<button class="primary" data-action="save-mini">${t ? "Save changes" : "Add miniature"}</button></div></section><section class="panel-card mini-list-card"><div class="section-heading"><div><div class="eyebrow">CATALOGUE</div><h2>${s.length} miniatures</h2></div></div><div class="mini-list">${e || '<div class="empty-state"><b>No miniatures yet</b><span>Add the first one using the form.</span></div>'}</div></section></div>`;
  },
  _searchContent() {
    return `<section class="panel-card search-card"><div class="eyebrow">FIND & HIGHLIGHT</div><h2>Find a miniature in the cabinet</h2><p>Search is case-insensitive and partial. Every assigned result is highlighted together.</p><div class="search-controls"><input id="search-query" type="search" placeholder="Search miniatures…" autocomplete="off" value="${this._escape(this._searchQuery)}"><select id="search-field"><option value="all" ${this._searchField === "all" ? "selected" : ""}>All fields</option><option value="name" ${this._searchField === "name" ? "selected" : ""}>Name</option><option value="collection" ${this._searchField === "collection" ? "selected" : ""}>Collection</option><option value="artist" ${this._searchField === "artist" ? "selected" : ""}>Artist</option></select></div><div id="search-summary" class="search-summary muted">Start typing to search.</div><div id="search-results" class="search-results"></div></section>`;
  },
  _viewItem(s) {
    const t = this._assignedMiniatures;
    return t.length ? t[(s % t.length + t.length) % t.length] : null;
  },
  _viewPickerContent() {
    const s = this._assignedMiniatures, t = this._miniatures.length - s.length;
    return s.length ? (this._viewIndex = (this._viewIndex % s.length + s.length) % s.length, `<section class="panel-card view-card"><div class="section-heading"><div><div class="eyebrow">CABINET VIEW</div><h2>Browse miniatures</h2></div><span class="position-badge unassigned">${t} unassigned</span></div><div id="view-selection">${this._viewSelectionContent()}</div><div class="picker-shell"><div class="picker-caption">SWIPE OR DRAG TO LOCATE</div><div id="view-dial" class="picker-dial">${this._viewDialContent()}</div></div><div class="view-actions"><button data-action="clear-view-highlight">Stop locating</button></div></section>${this._sceneAndLightsContent()}`) : `<section class="panel-card view-card empty-state"><b>No assigned miniatures</b><span>${t} unassigned miniature${t === 1 ? "" : "s"}. Assign a shelf and location in the catalogue to browse it here.</span></section>`;
  },
  _viewSelectionContent() {
    const s = this._viewItem(this._viewIndex);
    return s ? `<div class="view-mini-card"><div class="mini-avatar">${this._escape(s.name?.[0] || "?")}</div><div><div class="eyebrow">${this._viewIndex + 1} / ${this._assignedMiniatures.length}</div><h3>${this._escape(s.name)}</h3><p>${this._escape(s.collection || "No collection")} · ${this._escape(s.artist || "Unknown artist")}</p></div></div><div class="view-position">SHELF ${s.shelf} <span>·</span> LOCATION ${s.location}</div>` : "";
  },
  _viewDialContent() {
    const s = this._assignedMiniatures.length;
    return [-3, -2, -1, 0, 1, 2, 3].map((t) => {
      const e = ((this._viewIndex + t) % s + s) % s;
      return `<span class="dial-tick ${t === 0 ? "active" : ""}"><i></i><b>${e + 1}</b></span>`;
    }).join("");
  },
  _sceneAndLightsContent() {
    const s = this._hass?.states?.[this._config.scene_entity]?.state || "Manual";
    return `<div class="view-controls-grid"><section class="panel-card view-control-card"><div class="eyebrow">SCENES</div><h3>Current: ${this._escape(s)}</h3><p>Choosing a scene stops locating and restores the full strip output.</p><div class="scene-list">${["Off", "Display", "Showcase"].map((t) => `<button class="scene-button ${s === t ? "active" : ""}" data-action="apply-scene" data-scene="${t.toLowerCase()}">${t}</button>`).join("")}</div></section><section class="panel-card view-control-card"><div class="eyebrow">MINIATURE STRIP</div><h3>All miniatures</h3><p>Colour or brightness stops locating and applies to the complete strip.</p><div class="strip-controls"><label><span>Colour</span><input id="view-mini-color" type="color" value="#00beff"></label><label><span>Brightness</span><input id="view-mini-brightness" type="range" min="0" max="100" value="45"></label><output id="view-mini-brightness-value">45%</output></div></section></div>`;
  }
}, f = ":host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif)}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.42}.app-shell{min-height:100vh;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,0px)}.topbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 28px;border-bottom:1px solid var(--divider-color);background:var( --app-header-background-color, var(--card-background-color) );box-shadow:0 1px 8px #0000000f}.topbar-main{display:flex;align-items:center;gap:10px;min-width:0}.ha-native-menu{flex:0 0 auto;margin-left:-6px}.brand{display:flex;align-items:center;gap:11px;min-width:190px}.brand-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--primary-color);color:var(--text-primary-color);font-weight:800;font-size:13px}.brand b,.brand span{display:block}.brand span{margin-top:2px;color:var(--secondary-text-color);font-size:12px}nav{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color)}.nav-tab{display:grid;place-items:center;width:42px;height:38px;border:0;background:transparent;color:var(--secondary-text-color);padding:0;border-radius:9px}.nav-tab svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav-tab.active{background:var(--card-background-color);color:var(--primary-text-color);box-shadow:0 1px 4px #00000017}.page{max-width:1500px;margin:0 auto;overflow-x:hidden;padding:28px}.panel-card{border:1px solid var(--divider-color);background:var(--card-background-color);border-radius:18px;box-shadow:var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, .04))}.general-card{display:flex;justify-content:space-between;align-items:center;gap:30px;padding:22px 24px;margin-bottom:18px}h2,h3,p{margin:0}h2{font-size:22px}h3{font-size:16px}p{margin-top:6px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:10px;letter-spacing:.12em;font-weight:800}.general-values{display:flex;align-items:center;gap:12px}.metric,.color-control{min-width:110px;padding:10px 13px;background:var(--secondary-background-color);border-radius:12px}.metric span,.color-control span{display:block;color:var(--secondary-text-color);font-size:11px;margin-bottom:5px}.metric b{font-size:20px}.color-control{display:grid;grid-template-columns:1fr auto;column-gap:12px;align-items:center;min-width:170px}.color-control span{margin:0}input[type=color]{width:34px;height:28px;border:0;padding:0;background:none}.configuration-grid{display:grid;grid-template-columns:300px minmax(0,1fr);min-width:0;gap:18px;align-items:start}.shelf-detail{min-width:0;overflow:hidden}.shelf-list,.shelf-detail,.mini-editor,.mini-list-card,.search-card{padding:20px}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.shelf-items{display:grid;gap:5px}.shelf-row{display:flex;align-items:center;border:1px solid transparent;border-radius:12px;background:var(--secondary-background-color)}.shelf-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color))}.shelf-select{flex:1;display:flex;align-items:center;gap:10px;text-align:left;padding:10px;border:0;color:inherit;background:transparent}.shelf-select span:last-child{min-width:0}.shelf-select b,.shelf-select small{display:block}.shelf-select small{margin-top:2px;color:var(--secondary-text-color);font-size:10px}.shelf-number,.location-index{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:var(--card-background-color);font-weight:700;font-size:12px}.row-actions{display:flex;gap:4px;padding-right:7px}.icon-button{width:28px;height:28px;padding:0;border:0;border-radius:8px;background:var(--card-background-color);color:inherit}.insert-shelf{width:100%;border:0;background:transparent;color:var(--primary-color);padding:4px;font-size:10px;opacity:.65}.insert-shelf:hover{opacity:1}.form-grid{display:grid;gap:12px;margin-top:16px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}label span{display:block;margin-bottom:6px;color:var(--secondary-text-color);font-size:11px;font-weight:600}input,select{width:100%;min-height:40px;border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);outline:none}input:focus,select:focus{border-color:var(--primary-color);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-color) 20%,transparent)}.button-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}.button-row.end{justify-content:flex-end}button:not(.nav-tab):not(.shelf-select):not(.icon-button):not(.insert-shelf):not(.location-row):not(.search-result){min-height:38px;border:1px solid var(--divider-color);border-radius:10px;padding:0 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}button.primary{border-color:var(--primary-color)!important;background:var(--primary-color)!important;color:var(--text-primary-color)!important}button.small{min-height:32px!important;font-size:11px}button.ghost{background:transparent!important}button.danger{color:var(--error-color)!important}button.full{width:100%;margin-top:14px}.divider{height:1px;background:var(--divider-color);margin:22px 0}.locations-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr);gap:18px}.legacy-mapping{display:none}.mapping-visual{min-width:0}.mapping-toggle{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:11px}.mapping-toggle input{width:auto;min-height:auto;accent-color:var(--primary-color)}.picker-dial.compact{margin:10px 0 14px;min-height:48px}.picker-dial.compact .dial-tick em{display:none}.picker-dial.compact .dial-tick.active b{font-size:22px}.mapping-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mapping-tools b{margin-left:auto;color:var(--secondary-text-color);font-size:11px}.led-runs{display:grid;gap:20px;max-width:100%;margin-top:16px;overflow-x:auto;padding:4px 0 20px}.led-run{display:grid;grid-auto-flow:column;grid-auto-columns:var(--led-size);width:max-content;min-height:calc(var(--led-size) + 18px)}.led-run.return{margin-left:auto}.led-cell{position:relative;width:var(--led-size);height:var(--led-size);min-width:var(--led-size);padding:0;border:1px solid var(--divider-color);border-radius:1px;background:var(--secondary-background-color)}.led-cell.selected{background:#fff;border-color:#fff}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))}.led-cell.range-start{background:#e83e8c;border-color:#e83e8c}.led-cell.range-end{background:#ff8a00;border-color:#ff8a00}.led-cell small{position:absolute;top:calc(var(--led-size) * 4 + 4px);left:50%;transform:translate(-50%);color:var(--secondary-text-color);font-size:8px;font-weight:600}.mapping-visual{min-width:0;max-width:100%;overflow:hidden}.led-runs{position:relative;display:flex;flex-direction:column;align-items:flex-end;contain:inline-size;min-width:0;max-width:100%;width:100%;gap:44px;overflow-x:auto;overflow-y:hidden;padding:8px 32px 24px 28px}.led-run{gap:2px;position:relative}.led-cell{min-height:0!important;height:calc(var(--led-size) * 4)!important;min-width:var(--led-size)!important;width:var(--led-size)!important;padding:0!important;border-radius:1px!important}.led-cell.assigned{background:color-mix(in srgb,var(--primary-color) 35%,var(--secondary-background-color))!important}.led-cell.selected{background:#fff!important;border-color:#fff!important}.led-cell.range-start{background:#e83e8c!important;border-color:#e83e8c!important}.led-cell.range-end{background:#ff8a00!important;border-color:#ff8a00!important}.power-mark{position:absolute;top:4px;left:-20px;display:grid;place-items:center;width:1rem;height:1rem;border-radius:50%;background:var(--primary-color);color:var(--text-primary-color);font-size:10px;z-index:2}.led-runs.mirrored .power-mark{left:auto;right:-20px}.led-run:first-of-type:after{content:none}.strip-connector{position:absolute;z-index:3;top:calc(var(--led-size) * 2 + 12px);right:12px;width:16px;height:70px;border:2px dashed var(--secondary-text-color);border-left:0;border-radius:0 10px 10px 0;opacity:.9;pointer-events:none}.led-runs.mirrored{align-items:flex-start}.led-runs.mirrored .strip-connector{right:auto;left:12px;transform:scaleX(-1)}.led-run.return{margin-left:0}.mapping-toggle input{position:absolute;opacity:0;pointer-events:none}.mapping-toggle-icon{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--divider-color);border-radius:50%;background:var(--secondary-background-color)}.mapping-toggle-icon svg{width:15px;height:15px;fill:none;stroke:var(--secondary-text-color);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mapping-toggle input:checked+.mapping-toggle-icon{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 18%,var(--secondary-background-color))}.mapping-toggle input:checked+.mapping-toggle-icon svg{stroke:var(--primary-color);fill:color-mix(in srgb,var(--primary-color) 20%,transparent)}.location-list{display:grid;gap:5px;max-height:470px;overflow:auto;padding-right:4px}.location-row{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;width:100%;min-height:48px;border:1px solid var(--divider-color);border-radius:11px;padding:7px 10px;background:transparent;color:inherit;text-align:left}.location-row.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 9%,transparent)}.location-row.unmapped{opacity:.66}.location-range{font-size:12px}.location-count,.muted{color:var(--secondary-text-color);font-size:11px}.location-editor{align-self:start;padding:18px;border-radius:14px;background:var(--secondary-background-color)}.range-preview{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:10px 12px;background:var(--card-background-color);border-radius:10px;font-size:11px}.range-preview span{color:var(--secondary-text-color)}.miniatures-grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px;align-items:start}.mini-editor{position:sticky;top:90px}.mini-list{display:grid;gap:7px}.mini-row{display:grid;grid-template-columns:38px minmax(160px,1fr) minmax(120px,.7fr) auto auto;gap:11px;align-items:center;padding:10px;border:1px solid var(--divider-color);border-radius:12px}.mini-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,var(--primary-color) 14%,var(--secondary-background-color));color:var(--primary-color);font-weight:800}.mini-main b,.mini-main span{display:block}.mini-main span,.mini-artist{color:var(--secondary-text-color);font-size:11px;margin-top:2px}.position-badge{white-space:nowrap;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);font-size:10px;font-weight:700}.position-badge.unassigned{background:var(--secondary-background-color);color:var(--secondary-text-color)}.search-card{max-width:980px;margin:0 auto}.search-controls{display:grid;grid-template-columns:1fr 180px;gap:10px;margin-top:20px}.search-summary{margin:12px 2px}.search-results{display:grid;gap:7px}.search-result{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:12px;background:transparent;color:inherit;text-align:left}.search-result:hover:not(:disabled){border-color:var(--primary-color)}.search-result-main b,.search-result-main span{display:block}.search-result-main span{margin-top:3px;color:var(--secondary-text-color);font-size:11px}.view-card{max-width:760px;margin:0 auto;padding:22px}.view-mini-card{display:flex;align-items:center;justify-content:flex-start;gap:13px;min-height:94px;padding:14px 32px 14px 14px;text-align:left;border-radius:14px;background:var(--secondary-background-color)}.view-mini-card h3{font-size:18px}.view-mini-card p{max-width:390px}.view-position{margin:12px 0 2px;text-align:center;color:var(--primary-color);font-size:11px;font-weight:800;letter-spacing:.11em}.view-position span{padding:0 5px;color:var(--secondary-text-color)}.picker-shell{position:relative;margin:24px auto 4px;padding:18px 20px 12px;overflow:hidden;border:1px solid var(--divider-color);border-radius:14px;background:var(--primary-background-color)}.picker-caption{margin-bottom:9px;color:var(--secondary-text-color);text-align:center;font-size:9px;font-weight:800;letter-spacing:.22em}.picker-dial{display:grid;grid-template-columns:repeat(7,1fr);align-items:end;min-height:58px;border-top:1px solid var(--divider-color);background:repeating-linear-gradient(90deg,transparent 0 7px,color-mix(in srgb,var(--divider-color) 70%,transparent) 7px 8px);cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}.picker-dial.dragging{cursor:grabbing}.dial-tick{display:grid;justify-items:center;gap:4px;color:var(--secondary-text-color);font-size:12px;pointer-events:none}.dial-tick i{display:block;width:1px;height:12px;background:currentColor}.dial-tick b{font-size:14px}.dial-tick.active{color:var(--primary-color);transform:translateY(-4px)}.dial-tick.active i{width:2px;height:22px}.dial-tick.active b{font-size:19px}.view-actions{display:flex;justify-content:center;margin-top:13px}.view-controls-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:760px;margin:18px auto 0}.view-control-card{padding:20px}.scene-list{display:flex;gap:7px;margin-top:15px;flex-wrap:wrap}.scene-button.active{border-color:var(--primary-color)!important;color:var(--primary-color)!important}.strip-controls{display:grid;grid-template-columns:auto 1fr auto;align-items:end;gap:12px;margin-top:15px}.strip-controls label span{margin-bottom:5px}.strip-controls input[type=color]{width:38px;height:38px}.strip-controls input[type=range]{min-height:30px;padding:0;accent-color:var(--primary-color)}.strip-controls output{min-width:34px;padding-bottom:9px;color:var(--secondary-text-color);font-size:11px;font-weight:700}.empty-state{display:grid;gap:5px;place-items:center;padding:40px 18px;text-align:center;color:var(--secondary-text-color)}.empty-state b{color:var(--primary-text-color)}@media(max-width:900px){.configuration-grid,.miniatures-grid,.view-controls-grid{grid-template-columns:1fr}.mini-editor{position:static}.locations-layout{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 12px}.topbar-main{width:100%}nav{width:100%;justify-content:space-between}.nav-tab{flex:0 0 42px}.page{padding:16px 16px calc(32px + env(safe-area-inset-bottom,0px))}}@media(max-width:600px){.brand-icon{width:36px;height:36px}.general-card{align-items:flex-start;flex-direction:column}.general-values{width:100%}.metric,.color-control{flex:1}.form-grid.two,.search-controls{grid-template-columns:1fr}.mini-row{grid-template-columns:38px 1fr auto}.mini-artist{grid-column:2}.mini-row .row-actions{grid-column:2 / -1}.position-badge{grid-column:3;grid-row:1 / span 2}.view-card{padding:16px}.picker-shell{padding-left:10px;padding-right:10px}.dial-tick b{font-size:11px}.dial-tick.active b{font-size:16px}.picker-dial.compact{min-height:68px}.picker-dial.compact .dial-tick em{display:block;min-height:10px;color:var(--primary-color);font-size:8px;font-style:normal;font-weight:800;letter-spacing:.1em}}", b = {
  command_topic: "smartcabinet/cabinet01/api/command",
  layout_entity: "sensor.smart_cabinet_layout",
  miniatures_entity: "sensor.smart_cabinet_miniatures",
  scene_entity: "sensor.smart_cabinet_scene",
  mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set"
};
class g extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._hass = null, this._panel = null, this._narrow = !1, this._active = "configuration", this._selectedShelf = 1, this._selectedLocation = 1, this._editingMiniId = null, this._previewTimer = null, this._searchTimer = null, this._dataSignature = null, this._searchQuery = "", this._searchField = "all", this._viewIndex = 0, this._viewTimer = null, this._mappingStart = null, this._mappingEnd = null, this._mappingTimer = null, this._showAllMappings = !1, this._ledZoom = 1;
  }
  set narrow(t) {
    const e = !!t;
    e !== this._narrow && (this._narrow = e, this._render());
  }
  set panel(t) {
    this._panel = t, this._render();
  }
  set hass(t) {
    this._hass = t;
    const e = t?.states?.[this._config.layout_entity], i = t?.states?.[this._config.miniatures_entity], o = t?.states?.[this._config.scene_entity], r = `${e?.last_updated || ""}|${i?.last_updated || ""}|${o?.last_updated || ""}`;
    r !== this._dataSignature && (this._dataSignature = r, this._render());
  }
  get _config() {
    return { ...b, ...this._panel?.config || {} };
  }
  get _layout() {
    return this._hass?.states?.[this._config.layout_entity]?.attributes || { shelves: [], shelf_count: 0 };
  }
  get _miniatures() {
    return this._hass?.states?.[this._config.miniatures_entity]?.attributes?.items || [];
  }
  get _assignedMiniatures() {
    return this._miniatures.filter((t) => Number(t.shelf) > 0 && Number(t.location) > 0);
  }
  async _command(t) {
    this._hass && await this._hass.callService("mqtt", "publish", {
      topic: this._config.command_topic,
      payload: JSON.stringify(t),
      qos: 0,
      retain: !1
    });
  }
  async _miniLightsCommand(t) {
    this._hass && await this._hass.callService("mqtt", "publish", {
      topic: this._config.mini_lights_command_topic,
      payload: JSON.stringify(t),
      qos: 0,
      retain: !1
    });
  }
  _escape(t = "") {
    return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }
  _hexToRgb(t) {
    const e = t.replace("#", "");
    return {
      r: parseInt(e.slice(0, 2), 16),
      g: parseInt(e.slice(2, 4), 16),
      b: parseInt(e.slice(4, 6), 16)
    };
  }
  _rgbToHex(t = {}) {
    const e = (i) => Number(i || 0).toString(16).padStart(2, "0");
    return `#${e(t.r)}${e(t.g)}${e(t.b)}`;
  }
  _render() {
    if (!this.shadowRoot) return;
    const t = this.shadowRoot.querySelector(".led-runs");
    t && (this._ledScrollLeft = t.scrollLeft);
    const e = this._active === "configuration" ? this._layoutContent() : this._active === "miniatures" ? this._miniaturesContent() : this._active === "view" ? this._viewPickerContent() : this._searchContent();
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
        <div class="page">${e}</div>
      </div>`, this._bind();
    const i = this.shadowRoot.querySelector(".led-runs");
    i && Number.isFinite(this._ledScrollLeft) && (i.scrollLeft = this._ledScrollLeft), this._active === "search" && this._updateSearch(!1);
  }
  _bind() {
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((l) => l.onclick = () => {
      this._active = l.dataset.tab, this._render(), this._active === "view" && this._scheduleViewHighlight();
    }), this.shadowRoot.querySelectorAll("[data-action]").forEach((l) => l.onclick = () => this._action(l));
    const t = this.shadowRoot.querySelector("#highlight-color");
    t && (t.onchange = () => this._command({ action: "setHighlightColor", ...this._hexToRgb(t.value) }));
    const e = this.shadowRoot.querySelector("#location-start"), i = this.shadowRoot.querySelector("#location-leds");
    [e, i].filter(Boolean).forEach((l) => l.oninput = () => this._previewLocation());
    const o = this.shadowRoot.querySelector("#search-query"), r = this.shadowRoot.querySelector("#search-field");
    o && (o.oninput = () => {
      this._searchQuery = o.value, this._scheduleSearch();
    }), r && (r.onchange = () => {
      this._searchField = r.value, this._scheduleSearch();
    }), this._bindViewDial(), this._bindMappingLocationDial();
    const c = this.shadowRoot.querySelector("#show-all-mappings");
    c && (c.onchange = () => {
      this._showAllMappings = c.checked, this._render();
    });
    const a = this.shadowRoot.querySelector("#view-mini-color");
    a && (a.onchange = async () => {
      clearTimeout(this._viewTimer), await this._command({ action: "clearHighlight" }), await this._miniLightsCommand({ state: "ON", color: this._hexToRgb(a.value) });
    });
    const d = this.shadowRoot.querySelector("#view-mini-brightness");
    d && (d.oninput = () => {
      const l = Number(d.value), p = this.shadowRoot.querySelector("#view-mini-brightness-value");
      p && (p.textContent = `${l}%`), clearTimeout(this._viewTimer), this._viewTimer = setTimeout(async () => {
        await this._command({ action: "clearHighlight" }), await this._miniLightsCommand({ state: "ON", brightness: l });
      }, 180);
    });
  }
  async _action(t) {
    const e = t.dataset.action;
    if (e === "select-shelf")
      this._selectedShelf = Number(t.dataset.shelf), this._selectedLocation = 1, this._render();
    else if (e === "select-location")
      this._selectedLocation = Number(t.dataset.location), await this._command({ action: "highlightLocation", shelf: this._selectedShelf, location: this._selectedLocation }), this._render();
    else if (e === "insert-shelf")
      await this._command({ action: "insertShelf", position: Number(t.dataset.position) });
    else if (e === "duplicate-shelf")
      await this._command({ action: "duplicateShelf", shelf: Number(t.dataset.shelf) });
    else if (e === "delete-shelf")
      confirm(`Delete Shelf ${t.dataset.shelf}? Miniatures on it will become Unassigned.`) && await this._command({ action: "deleteShelf", shelf: Number(t.dataset.shelf) });
    else if (e === "move-shelf")
      await this._command({ action: "moveShelf", from: Number(t.dataset.from), to: Number(t.dataset.to) }), this._selectedShelf = Number(t.dataset.to);
    else if (e === "save-shelf")
      await this._command({
        action: "setShelfConfig",
        shelf: this._selectedShelf,
        total_leds: Number(this.shadowRoot.querySelector("#shelf-leds").value),
        total_locations: Number(this.shadowRoot.querySelector("#shelf-locations").value)
      });
    else if (e === "auto-map")
      await this._command({ action: "autoMapShelf", shelf: this._selectedShelf });
    else if (e === "clear-map")
      confirm("Clear every location mapping on this shelf?") && await this._command({ action: "clearShelfMapping", shelf: this._selectedShelf });
    else if (e === "toggle-direction") {
      const i = this._layout.shelves?.[this._selectedShelf - 1];
      await this._command({ action: "setShelfDirection", shelf: this._selectedShelf, mirrored: !i?.mirrored });
    } else if (e === "zoom-in")
      this._ledZoom = Math.min(2, this._ledZoom + 0.25), this._render();
    else if (e === "zoom-out")
      this._ledZoom = Math.max(0.5, this._ledZoom - 0.25), this._render();
    else if (e === "select-led") {
      const i = Number(t.dataset.led);
      if (this._mappingStart === null || this._mappingEnd !== null)
        this._mappingStart = i, this._mappingEnd = null;
      else {
        this._mappingEnd = i;
        const o = Math.min(this._mappingStart, this._mappingEnd);
        await this._command({ action: "previewLocation", shelf: this._selectedShelf, location: this._selectedLocation, start_led: o, leds: Math.abs(this._mappingEnd - this._mappingStart) + 1 });
      }
      this._render();
    } else if (e === "reset-led-range")
      this._mappingStart = null, this._mappingEnd = null, await this._command({ action: "highlightLocation", shelf: this._selectedShelf, location: this._selectedLocation }), this._render();
    else if (e === "save-led-range") {
      const i = Math.min(this._mappingStart, this._mappingEnd);
      await this._command({ action: "setLocationConfig", shelf: this._selectedShelf, location: this._selectedLocation, start_led: i, leds: Math.abs(this._mappingEnd - this._mappingStart) + 1 }), this._mappingStart = null, this._mappingEnd = null;
    } else if (e === "save-location")
      await this._command({
        action: "setLocationConfig",
        shelf: this._selectedShelf,
        location: this._selectedLocation,
        start_led: Number(this.shadowRoot.querySelector("#location-start").value),
        leds: Number(this.shadowRoot.querySelector("#location-leds").value)
      });
    else if (e === "edit-mini")
      this._editingMiniId = t.dataset.id, this._render();
    else if (e === "cancel-mini")
      this._editingMiniId = null, this._render();
    else if (e === "save-mini")
      await this._saveMini();
    else if (e === "delete-mini") {
      const i = this._miniatures.find((o) => o.id === t.dataset.id);
      confirm(`Delete ${i?.name || "this miniature"}?`) && await this._command({ action: "deleteMiniature", id: t.dataset.id });
    } else if (e === "highlight-one") {
      const i = this._miniatures.find((o) => o.id === t.dataset.id);
      i?.shelf && await this._command({ action: "highlightLocation", shelf: i.shelf, location: i.location });
    } else e === "clear-view-highlight" ? (clearTimeout(this._viewTimer), await this._command({ action: "clearHighlight" })) : e === "apply-scene" && (clearTimeout(this._viewTimer), await this._command({ action: "applyScene", scene: t.dataset.scene }));
  }
  _setViewIndex(t) {
    const e = this._assignedMiniatures;
    if (!e.length) return;
    this._viewIndex = (t % e.length + e.length) % e.length;
    const i = this.shadowRoot.querySelector("#view-selection"), o = this.shadowRoot.querySelector("#view-dial");
    i && (i.innerHTML = this._viewSelectionContent()), o && (o.innerHTML = this._viewDialContent()), this._scheduleViewHighlight();
  }
  _ledMappingContent(t, e) {
    const i = t.total_leds, o = Math.ceil(i / 2), r = t.mirrored ? [[...Array(o).keys()].reverse(), [...Array(i - o).keys()].map((n) => o + n)] : [[...Array(o).keys()], [...Array(i - o).keys()].map((n) => i - 1 - n)], c = this._mappingStart ?? (e?.mapped ? e.start_led : null), a = this._mappingEnd ?? (e?.mapped ? e.start_led + e.leds - 1 : null), d = (n) => n.map((h) => {
      const u = c !== null && a !== null && h >= Math.min(c, a) && h <= Math.max(c, a);
      return `<button class="led-cell ${this._showAllMappings && (t.locations || []).some((m) => m.mapped && h >= m.start_led && h < m.start_led + m.leds) ? "assigned" : ""} ${u ? "selected" : ""}${h === c ? " range-start" : h === a ? " range-end" : ""}" data-action="select-led" data-led="${h}" title="LED ${h + 1}"><i></i>${h % 5 === 0 ? `<small>${h + 1}</small>` : ""}</button>`;
    }).join(""), l = c === null || a === null ? "Tap the start LED" : `LED ${Math.min(c, a) + 1} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${Math.max(c, a) + 1} Ãƒâ€šÃ‚Â· ${Math.abs(a - c) + 1} LEDs`, p = this._mappingDialTicks(t.total_locations);
    return `<section class="mapping-visual">
      <div class="section-heading"><div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div><label class="mapping-toggle"><input id="show-all-mappings" type="checkbox" ${this._showAllMappings ? "checked" : ""}><span class="mapping-toggle-icon"><svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m-6.5-6.5a6 6 0 1 1 9 0c-.9.8-1.5 1.8-1.5 3.5h-6c0-1.7-.6-2.7-1.5-3.5Z"/></svg></span><span>Show all assigned</span></label></div>
      <div id="mapping-location-dial" class="picker-dial compact">${p}</div>
      <div class="mapping-tools"><button data-action="toggle-direction">${t.mirrored ? "Start at right" : "Start at left"}</button><button class="icon-button" data-action="zoom-out">ÃƒÂ¢Ã‹â€ Ã¢â‚¬â„¢</button><button class="icon-button" data-action="zoom-in">ÃƒÂ¯Ã‚Â¼Ã¢â‚¬Â¹</button><b>${l}</b></div>
      <p>Selected location: <b id="mapping-selected-label">${this._selectedLocation}</b>. Tap first and last LED to preview; save commits the range. Overlaps are allowed.</p>
      <div class="led-runs ${t.mirrored ? "mirrored" : ""}" style="--led-size:${this._ledZoom * 9}px"><div class="led-run"><div class="power-mark" aria-label="Strip power">ÃƒÂ¢Ã…Â¡Ã‚Â¡</div>${d(r[0])}</div><span class="strip-connector" aria-hidden="true"></span><div class="led-run return">${d(r[1])}</div></div>
      <div class="button-row end"><button data-action="reset-led-range">Go back</button><button class="primary" data-action="save-led-range" ${c === null || a === null ? "disabled" : ""}>Save location</button></div>
    </section>`;
  }
  _mappingDialTicks(t) {
    return [-3, -2, -1, 0, 1, 2, 3].map((e) => {
      const i = (this._selectedLocation - 1 + e + t) % t + 1;
      return `<span class="dial-tick ${e === 0 ? "active" : ""}">${e === 0 ? "<em>LOCATION</em>" : ""}<i></i><b>${i}</b></span>`;
    }).join("");
  }
  _bindViewDial() {
    const t = this.shadowRoot.querySelector("#view-dial");
    if (!t) return;
    let e = 0, i = 0, o = 0, r = !1;
    const c = 36;
    t.onpointerdown = (d) => {
      r = !0, e = d.clientX, i = this._viewIndex, o = 0, t.setPointerCapture?.(d.pointerId), t.classList.add("dragging");
    }, t.onpointermove = (d) => {
      if (!r) return;
      const l = Math.trunc((e - d.clientX) / c);
      l !== o && (o = l, this._setViewIndex(i + l));
    };
    const a = () => {
      r = !1, t.classList.remove("dragging");
    };
    t.onpointerup = a, t.onpointercancel = a;
  }
  _bindMappingLocationDial() {
    const t = this.shadowRoot.querySelector("#mapping-location-dial"), e = this._layout.shelves?.[this._selectedShelf - 1];
    if (!t || !e) return;
    let i = 0, o = 0, r = 0, c = !1, a = !1;
    t.onpointerdown = (l) => {
      c = !0, a = !1, i = l.clientX, o = this._selectedLocation - 1, r = 0, t.setPointerCapture?.(l.pointerId), t.classList.add("dragging");
    }, t.onpointermove = (l) => {
      if (!c) return;
      const p = Math.trunc((i - l.clientX) / 36);
      if (p === r) return;
      r = p, this._selectedLocation = ((o + p) % e.total_locations + e.total_locations) % e.total_locations + 1, this._mappingStart = null, this._mappingEnd = null, t.innerHTML = this._mappingDialTicks(e.total_locations);
      const n = this.shadowRoot.querySelector("#mapping-selected-label");
      n && (n.textContent = this._selectedLocation), this._refreshMappingLeds(e), this._scheduleMappingHighlight(), a = !0;
    };
    const d = () => {
      c = !1, t.classList.remove("dragging"), a && this._render();
    };
    t.onpointerup = d, t.onpointercancel = d;
  }
  _scheduleMappingHighlight() {
    clearTimeout(this._mappingTimer), this._mappingTimer = setTimeout(() => this._command({
      action: "highlightLocation",
      shelf: this._selectedShelf,
      location: this._selectedLocation
    }), 220);
  }
  _refreshMappingLeds(t) {
    const e = this.shadowRoot.querySelector(".led-runs"), i = t.locations?.[this._selectedLocation - 1];
    if (!e || !i) return;
    const o = document.createElement("div");
    o.innerHTML = this._ledMappingContent(t, i);
    const r = o.querySelector(".led-runs");
    r && (e.className = r.className, e.style.cssText = r.style.cssText, e.innerHTML = r.innerHTML);
  }
  _scheduleViewHighlight() {
    const t = this._viewItem(this._viewIndex);
    t && (clearTimeout(this._viewTimer), this._viewTimer = setTimeout(() => this._command({
      action: "highlightLocation",
      shelf: Number(t.shelf),
      location: Number(t.location)
    }), 220));
  }
  _previewLocation() {
    clearTimeout(this._previewTimer);
    const t = Number(this.shadowRoot.querySelector("#location-start")?.value), e = Number(this.shadowRoot.querySelector("#location-leds")?.value), i = this.shadowRoot.querySelector("#range-preview-text");
    i && (i.textContent = Number.isFinite(t) && e > 0 ? `${t} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${t + e - 1}` : "Invalid range"), !(!Number.isFinite(t) || t < 0 || !Number.isFinite(e) || e <= 0) && (this._previewTimer = setTimeout(() => this._command({
      action: "previewLocation",
      shelf: this._selectedShelf,
      location: this._selectedLocation,
      start_led: t,
      leds: e
    }), 180));
  }
  async _saveMini() {
    const t = this.shadowRoot.querySelector("#mini-name").value.trim(), e = this.shadowRoot.querySelector("#mini-collection").value.trim(), i = this.shadowRoot.querySelector("#mini-artist").value.trim();
    if (!t) return;
    const o = this._miniatures.find((r) => r.id === this._editingMiniId);
    o ? (await this._command({
      action: "updateMiniature",
      id: o.id,
      name: t,
      collection: e,
      artist: i,
      date: o.date || "",
      shelf: o.shelf || 0,
      location: o.location || 0,
      notes: o.notes || ""
    }), this._editingMiniId = null) : await this._command({ action: "createMiniature", name: t, collection: e, artist: i, date: "", shelf: 0, location: 0, notes: "" }), this._render();
  }
  _scheduleSearch() {
    clearTimeout(this._searchTimer), this._searchTimer = setTimeout(() => this._updateSearch(!0), 220);
  }
  async _updateSearch(t) {
    const e = this.shadowRoot.querySelector("#search-query"), i = this.shadowRoot.querySelector("#search-field"), o = this.shadowRoot.querySelector("#search-results"), r = this.shadowRoot.querySelector("#search-summary");
    if (!e || !o) return;
    const c = e.value.trim().toLocaleLowerCase(), a = i?.value || "all";
    if (!c) {
      o.innerHTML = "", r.textContent = "Start typing to search.", t && await this._command({ action: "clearHighlight" });
      return;
    }
    const d = a === "all" ? ["name", "collection", "artist"] : [a], l = this._miniatures.filter((n) => d.some((h) => String(n[h] || "").toLocaleLowerCase().includes(c))), p = l.filter((n) => n.shelf > 0 && n.location > 0);
    r.textContent = `${l.length} result${l.length === 1 ? "" : "s"} Ãƒâ€šÃ‚Â· ${p.length} assigned`, o.innerHTML = l.map((n) => `
      <button class="search-result" data-action="highlight-one" data-id="${this._escape(n.id)}" ${n.shelf ? "" : "disabled"}>
        <div class="mini-avatar">${this._escape(n.name?.[0] || "?")}</div>
        <div class="search-result-main"><b>${this._escape(n.name)}</b><span>${this._escape(n.collection || "No collection")} Ãƒâ€šÃ‚Â· ${this._escape(n.artist || "Unknown artist")}</span></div>
        <span class="position-badge ${n.shelf ? "" : "unassigned"}">${n.shelf ? `Shelf ${n.shelf} Ãƒâ€šÃ‚Â· Location ${n.location}` : "Unassigned"}</span>
      </button>`).join("") || '<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>', this.shadowRoot.querySelectorAll("[data-action='highlight-one']").forEach((n) => n.onclick = () => this._action(n)), t && (p.length ? await this._command({ action: "highlightLocations", locations: p.map((n) => ({ shelf: n.shelf, location: n.location })) }) : await this._command({ action: "clearHighlight" }));
  }
  _styles() {
    return f;
  }
}
Object.assign(g.prototype, v);
customElements.define("ha-panel-smart-cabinet", g);
