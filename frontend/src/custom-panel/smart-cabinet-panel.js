import { panelContent } from "./smart-cabinet-panel-templates.js";
import "../components/cabinet-panel-card.js";
import "../components/cabinet-dial-picker.js";
import panelStyles from "./smart-cabinet-panel.css?inline";
import { LitElement, html, unsafeCSS } from "lit";

const DEFAULT_CONFIG = {
	command_topic: "smartcabinet/cabinet01/api/command",
	layout_entity: "sensor.smart_cabinet_layout",
	miniatures_entity: "sensor.smart_cabinet_miniatures",
	scene_entity: "sensor.smart_cabinet_scene",
	mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set",
};

class HaPanelSmartCabinet extends LitElement {
	static styles = unsafeCSS(panelStyles);

	constructor() {
		super();
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
		return (
			this._hass?.states?.[this._config.layout_entity]?.attributes || {
				shelves: [],
				shelf_count: 0,
			}
		);
	}

	get _miniatures() {
		return (
			this._hass?.states?.[this._config.miniatures_entity]?.attributes
				?.items || []
		);
	}

	get _assignedMiniatures() {
		return this._miniatures.filter(
			(item) => Number(item.shelf) > 0 && Number(item.location) > 0,
		);
	}

	_viewItem(index) {
		const items = this._assignedMiniatures;
		return items.length
			? items[((index % items.length) + items.length) % items.length]
			: null;
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
		const part = (value) =>
			Number(value || 0)
				.toString(16)
				.padStart(2, "0");
		return `#${part(color.r)}${part(color.g)}${part(color.b)}`;
	}

	render() {
		const content = panelContent(this);
		return html`<div class="app-shell">
			<header class="topbar">
				<div class="topbar-main">
					<ha-menu-button class="ha-native-menu"></ha-menu-button>
					<div class="brand">
						<div class="brand-icon">SC</div>
						<div>
							<b>Smart Cabinet</b><span>Control & catalogue</span>
						</div>
					</div>
				</div>
				<nav>
					<button
						class="nav-tab ${this._active === "view"
							? "active"
							: ""}"
						@click=${() => this._selectTab("view")}
						aria-label="View"
						title="View">
						View</button
					><button
						class="nav-tab ${this._active === "configuration"
							? "active"
							: ""}"
						@click=${() => this._selectTab("configuration")}
						aria-label="Configuration"
						title="Configuration">
						Configuration</button
					><button
						class="nav-tab ${this._active === "miniatures"
							? "active"
							: ""}"
						@click=${() => this._selectTab("miniatures")}
						aria-label="Miniatures"
						title="Miniatures">
						Miniatures</button
					><button
						class="nav-tab ${this._active === "search"
							? "active"
							: ""}"
						@click=${() => this._selectTab("search")}
						aria-label="Search"
						title="Search">
						Search
					</button>
				</nav>
			</header>
			<div class="page">${content}</div>
		</div>`;
	}

	_render() {
		this.requestUpdate();
	}

	_selectTab(tab) {
		this._active = tab;
		this.requestUpdate();
		if (tab === "view") this._scheduleViewHighlight();
	}

	updated() {
		this._bind();
		if (this._active === "search") this._updateSearch(false);
	}

	_bind() {
		this.shadowRoot.querySelectorAll("[data-tab]").forEach(
			(button) =>
				(button.onclick = () => {
					this._active = button.dataset.tab;
					this._render();
					if (this._active === "view") this._scheduleViewHighlight();
				}),
		);

		this.shadowRoot
			.querySelectorAll("[data-action]")
			.forEach((button) => (button.onclick = () => this._action(button)));

		const color = this.shadowRoot.querySelector("#highlight-color");
		if (color)
			color.onchange = () =>
				this._command({
					action: "setHighlightColor",
					...this._hexToRgb(color.value),
				});

		const start = this.shadowRoot.querySelector("#location-start");
		const leds = this.shadowRoot.querySelector("#location-leds");
		[start, leds]
			.filter(Boolean)
			.forEach(
				(input) => (input.oninput = () => this._previewLocation()),
			);

		const query = this.shadowRoot.querySelector("#search-query");
		const field = this.shadowRoot.querySelector("#search-field");
		if (query)
			query.oninput = () => {
				this._searchQuery = query.value;
				this._scheduleSearch();
			};
		if (field)
			field.onchange = () => {
				this._searchField = field.value;
				this._scheduleSearch();
			};

		this._bindViewDial();
		this._bindMappingLocationDial();
		const showAll = this.shadowRoot.querySelector("#show-all-mappings");
		if (showAll)
			showAll.onchange = () => {
				this._showAllMappings = showAll.checked;
				this._render();
			};

		const miniColor = this.shadowRoot.querySelector("#view-mini-color");
		if (miniColor)
			miniColor.onchange = async () => {
				clearTimeout(this._viewTimer);
				await this._command({ action: "clearHighlight" });
				await this._miniLightsCommand({
					state: "ON",
					color: this._hexToRgb(miniColor.value),
				});
			};

		const miniBrightness = this.shadowRoot.querySelector(
			"#view-mini-brightness",
		);
		if (miniBrightness)
			miniBrightness.oninput = () => {
				const value = Number(miniBrightness.value);
				const output = this.shadowRoot.querySelector(
					"#view-mini-brightness-value",
				);
				if (output) output.textContent = `${value}%`;
				clearTimeout(this._viewTimer);
				this._viewTimer = setTimeout(async () => {
					await this._command({ action: "clearHighlight" });
					await this._miniLightsCommand({
						state: "ON",
						brightness: value,
					});
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
			await this._command({
				action: "highlightLocation",
				shelf: this._selectedShelf,
				location: this._selectedLocation,
			});
			this._render();
		} else if (action === "insert-shelf") {
			await this._command({
				action: "insertShelf",
				position: Number(button.dataset.position),
			});
		} else if (action === "duplicate-shelf") {
			await this._command({
				action: "duplicateShelf",
				shelf: Number(button.dataset.shelf),
			});
		} else if (action === "delete-shelf") {
			if (
				confirm(
					`Delete Shelf ${button.dataset.shelf}? Miniatures on it will become Unassigned.`,
				)
			) {
				await this._command({
					action: "deleteShelf",
					shelf: Number(button.dataset.shelf),
				});
			}
		} else if (action === "move-shelf") {
			await this._command({
				action: "moveShelf",
				from: Number(button.dataset.from),
				to: Number(button.dataset.to),
			});
			this._selectedShelf = Number(button.dataset.to);
		} else if (action === "save-shelf") {
			await this._command({
				action: "setShelfConfig",
				shelf: this._selectedShelf,
				total_leds: Number(
					this.shadowRoot.querySelector("#shelf-leds").value,
				),
				total_locations: Number(
					this.shadowRoot.querySelector("#shelf-locations").value,
				),
			});
		} else if (action === "auto-map") {
			await this._command({
				action: "autoMapShelf",
				shelf: this._selectedShelf,
			});
		} else if (action === "clear-map") {
			if (confirm("Clear every location mapping on this shelf?")) {
				await this._command({
					action: "clearShelfMapping",
					shelf: this._selectedShelf,
				});
			}
		} else if (action === "toggle-direction") {
			const shelf = this._layout.shelves?.[this._selectedShelf - 1];
			await this._command({
				action: "setShelfDirection",
				shelf: this._selectedShelf,
				mirrored: !shelf?.mirrored,
			});
		} else if (action === "zoom-in") {
			this._ledZoom = Math.min(2, this._ledZoom + 0.25);
			this._render();
		} else if (action === "zoom-out") {
			this._ledZoom = Math.max(0.5, this._ledZoom - 0.25);
			this._render();
		} else if (action === "select-led") {
			const led = Number(button.dataset.led);
			if (this._mappingStart === null || this._mappingEnd !== null) {
				this._mappingStart = led;
				this._mappingEnd = null;
			} else {
				this._mappingEnd = led;
				const start = Math.min(this._mappingStart, this._mappingEnd);
				await this._command({
					action: "previewLocation",
					shelf: this._selectedShelf,
					location: this._selectedLocation,
					start_led: start,
					leds: Math.abs(this._mappingEnd - this._mappingStart) + 1,
				});
			}
			this._render();
		} else if (action === "reset-led-range") {
			this._mappingStart = null;
			this._mappingEnd = null;
			await this._command({
				action: "highlightLocation",
				shelf: this._selectedShelf,
				location: this._selectedLocation,
			});
			this._render();
		} else if (action === "save-led-range") {
			const start = Math.min(this._mappingStart, this._mappingEnd);
			await this._command({
				action: "setLocationConfig",
				shelf: this._selectedShelf,
				location: this._selectedLocation,
				start_led: start,
				leds: Math.abs(this._mappingEnd - this._mappingStart) + 1,
			});
			this._mappingStart = null;
			this._mappingEnd = null;
		} else if (action === "save-location") {
			await this._command({
				action: "setLocationConfig",
				shelf: this._selectedShelf,
				location: this._selectedLocation,
				start_led: Number(
					this.shadowRoot.querySelector("#location-start").value,
				),
				leds: Number(
					this.shadowRoot.querySelector("#location-leds").value,
				),
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
			const item = this._miniatures.find(
				(mini) => mini.id === button.dataset.id,
			);
			if (confirm(`Delete ${item?.name || "this miniature"}?`)) {
				await this._command({
					action: "deleteMiniature",
					id: button.dataset.id,
				});
			}
		} else if (action === "highlight-one") {
			const item = this._miniatures.find(
				(mini) => mini.id === button.dataset.id,
			);
			if (item?.shelf)
				await this._command({
					action: "highlightLocation",
					shelf: item.shelf,
					location: item.location,
				});
		} else if (action === "clear-view-highlight") {
			clearTimeout(this._viewTimer);
			await this._command({ action: "clearHighlight" });
		} else if (action === "apply-scene") {
			clearTimeout(this._viewTimer);
			await this._command({
				action: "applyScene",
				scene: button.dataset.scene,
			});
		}
	}

	_setViewIndex(index) {
		const items = this._assignedMiniatures;
		if (!items.length) return;
		this._viewIndex =
			((index % items.length) + items.length) % items.length;
		this.requestUpdate();
		this._scheduleViewHighlight();
	}

	_ledMappingContent(shelf, selectedLocation) {
		const total = shelf.total_leds;
		const firstRun = Math.ceil(total / 2);
		const ids = shelf.mirrored
			? [
					[...Array(firstRun).keys()].reverse(),
					[...Array(total - firstRun).keys()].map(
						(i) => firstRun + i,
					),
				]
			: [
					[...Array(firstRun).keys()],
					[...Array(total - firstRun).keys()].map(
						(i) => total - 1 - i,
					),
				];
		const start =
			this._mappingStart ??
			(selectedLocation?.mapped ? selectedLocation.start_led : null);
		const end =
			this._mappingEnd ??
			(selectedLocation?.mapped
				? selectedLocation.start_led + selectedLocation.leds - 1
				: null);
		const cells = (run) =>
			run
				.map((led) => {
					const selected =
						start !== null &&
						end !== null &&
						led >= Math.min(start, end) &&
						led <= Math.max(start, end);
					const assigned =
						this._showAllMappings &&
						(shelf.locations || []).some(
							(loc) =>
								loc.mapped &&
								led >= loc.start_led &&
								led < loc.start_led + loc.leds,
						);
					const endpoint =
						led === start
							? " range-start"
							: led === end
								? " range-end"
								: "";
					return `<button class="led-cell ${assigned ? "assigned" : ""} ${selected ? "selected" : ""}${endpoint}" data-action="select-led" data-led="${led}" title="LED ${led + 1}"><i></i>${led % 5 === 0 ? `<small>${led + 1}</small>` : ""}</button>`;
				})
				.join("");
		const range =
			start === null || end === null
				? "Tap the start LED"
				: `LED ${Math.min(start, end) + 1} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${Math.max(start, end) + 1} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${Math.abs(end - start) + 1} LEDs`;
		const dial = this._mappingDialTicks(shelf.total_locations);
		return `<section class="mapping-visual">
      <div class="section-heading"><div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div><label class="mapping-toggle"><input id="show-all-mappings" type="checkbox" ${this._showAllMappings ? "checked" : ""}><span class="mapping-toggle-icon"><svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m-6.5-6.5a6 6 0 1 1 9 0c-.9.8-1.5 1.8-1.5 3.5h-6c0-1.7-.6-2.7-1.5-3.5Z"/></svg></span><span>Show all assigned</span></label></div>
      <div id="mapping-location-dial" class="picker-dial compact">${dial}</div>
      <div class="mapping-tools"><button data-action="toggle-direction">${shelf.mirrored ? "Start at right" : "Start at left"}</button><button class="icon-button" data-action="zoom-out">ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢</button><button class="icon-button" data-action="zoom-in">ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¼ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹</button><b>${range}</b></div>
      <p>Selected location: <b id="mapping-selected-label">${this._selectedLocation}</b>. Tap first and last LED to preview; save commits the range. Overlaps are allowed.</p>
      <div class="led-runs ${shelf.mirrored ? "mirrored" : ""}" style="--led-size:${this._ledZoom * 9}px"><div class="led-run"><div class="power-mark" aria-label="Strip power">ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â¡</div>${cells(ids[0])}</div><span class="strip-connector" aria-hidden="true"></span><div class="led-run return">${cells(ids[1])}</div></div>
      <div class="button-row end"><button data-action="reset-led-range">Go back</button><button class="primary" data-action="save-led-range" ${start === null || end === null ? "disabled" : ""}>Save location</button></div>
    </section>`;
	}

	_mappingDialTicks(totalLocations) {
		return [-3, -2, -1, 0, 1, 2, 3]
			.map((offset) => {
				const location =
					((this._selectedLocation - 1 + offset + totalLocations) %
						totalLocations) +
					1;
				return `<span class="dial-tick ${offset === 0 ? "active" : ""}">${offset === 0 ? "<em>LOCATION</em>" : ""}<i></i><b>${location}</b></span>`;
			})
			.join("");
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
		const finish = () => {
			active = false;
			dial.classList.remove("dragging");
		};
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
			active = true;
			changed = false;
			startX = event.clientX;
			initial = this._selectedLocation - 1;
			lastSteps = 0;
			dial.setPointerCapture?.(event.pointerId);
			dial.classList.add("dragging");
		};
		dial.onpointermove = (event) => {
			if (!active) return;
			const steps = Math.trunc((startX - event.clientX) / 36);
			if (steps === lastSteps) return;
			lastSteps = steps;
			this._selectedLocation =
				((((initial + steps) % shelf.total_locations) +
					shelf.total_locations) %
					shelf.total_locations) +
				1;
			this._mappingStart = null;
			this._mappingEnd = null;
			dial.innerHTML = this._mappingDialTicks(shelf.total_locations);
			const label = this.shadowRoot.querySelector(
				"#mapping-selected-label",
			);
			if (label) label.textContent = this._selectedLocation;
			this._refreshMappingLeds(shelf);
			this._scheduleMappingHighlight();
			changed = true;
		};
		const finish = () => {
			active = false;
			dial.classList.remove("dragging");
			if (changed) this._render();
		};
		dial.onpointerup = finish;
		dial.onpointercancel = finish;
	}

	_scheduleMappingHighlight() {
		clearTimeout(this._mappingTimer);
		this._mappingTimer = setTimeout(
			() =>
				this._command({
					action: "highlightLocation",
					shelf: this._selectedShelf,
					location: this._selectedLocation,
				}),
			220,
		);
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
		this._viewTimer = setTimeout(
			() =>
				this._command({
					action: "highlightLocation",
					shelf: Number(item.shelf),
					location: Number(item.location),
				}),
			220,
		);
	}

	_previewLocation() {
		clearTimeout(this._previewTimer);
		const start = Number(
			this.shadowRoot.querySelector("#location-start")?.value,
		);
		const leds = Number(
			this.shadowRoot.querySelector("#location-leds")?.value,
		);
		const preview = this.shadowRoot.querySelector("#range-preview-text");
		if (preview)
			preview.textContent =
				Number.isFinite(start) && leds > 0
					? `${start} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${start + leds - 1}`
					: "Invalid range";
		if (
			!Number.isFinite(start) ||
			start < 0 ||
			!Number.isFinite(leds) ||
			leds <= 0
		)
			return;
		this._previewTimer = setTimeout(
			() =>
				this._command({
					action: "previewLocation",
					shelf: this._selectedShelf,
					location: this._selectedLocation,
					start_led: start,
					leds,
				}),
			180,
		);
	}

	async _saveMini() {
		const name = this.shadowRoot.querySelector("#mini-name").value.trim();
		const collection = this.shadowRoot
			.querySelector("#mini-collection")
			.value.trim();
		const artist = this.shadowRoot
			.querySelector("#mini-artist")
			.value.trim();
		if (!name) return;

		const current = this._miniatures.find(
			(item) => item.id === this._editingMiniId,
		);
		if (current) {
			await this._command({
				action: "updateMiniature",
				id: current.id,
				name,
				collection,
				artist,
				date: current.date || "",
				shelf: current.shelf || 0,
				location: current.location || 0,
				notes: current.notes || "",
			});
			this._editingMiniId = null;
		} else {
			await this._command({
				action: "createMiniature",
				name,
				collection,
				artist,
				date: "",
				shelf: 0,
				location: 0,
				notes: "",
			});
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

		const fields =
			field === "all" ? ["name", "collection", "artist"] : [field];
		const results = this._miniatures.filter((item) =>
			fields.some((key) =>
				String(item[key] || "")
					.toLocaleLowerCase()
					.includes(q),
			),
		);
		const assigned = results.filter(
			(item) => item.shelf > 0 && item.location > 0,
		);

		summaryEl.textContent = `${results.length} result${results.length === 1 ? "" : "s"} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${assigned.length} assigned`;
		resultsEl.innerHTML =
			results
				.map(
					(item) => `
      <button class="search-result" data-action="highlight-one" data-id="${this._escape(item.id)}" ${item.shelf ? "" : "disabled"}>
        <div class="mini-avatar">${this._escape(item.name?.[0] || "?")}</div>
        <div class="search-result-main"><b>${this._escape(item.name)}</b><span>${this._escape(item.collection || "No collection")} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${this._escape(item.artist || "Unknown artist")}</span></div>
        <span class="position-badge ${item.shelf ? "" : "unassigned"}">${item.shelf ? `Shelf ${item.shelf} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· Location ${item.location}` : "Unassigned"}</span>
      </button>`,
				)
				.join("") ||
			`<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>`;

		this.shadowRoot
			.querySelectorAll("[data-action='highlight-one']")
			.forEach((button) => (button.onclick = () => this._action(button)));

		if (highlight) {
			if (assigned.length) {
				await this._command({
					action: "highlightLocations",
					locations: assigned.map((item) => ({
						shelf: item.shelf,
						location: item.location,
					})),
				});
			} else {
				await this._command({ action: "clearHighlight" });
			}
		}
	}

	_styles() {
		return panelStyles;
	}
}

customElements.define("ha-panel-smart-cabinet", HaPanelSmartCabinet);
