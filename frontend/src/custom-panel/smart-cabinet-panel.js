import { LitElement, html, unsafeCSS } from "lit";
import "../components/cabinet-dial-picker.js";
import "../components/cabinet-panel-card.js";
import { createPanelActions } from "./panel-actions.js";
import panelStyles from "./smart-cabinet-panel.css?inline";
import { panelContent } from "./smart-cabinet-panel-templates.js";
import { publishMqtt } from "./panel-service.js";

const DEFAULT_CONFIG = {
	command_topic: "smartcabinet/cabinet01/api/command",
	layout_entity: "sensor.smart_cabinet_layout",
	miniatures_entity: "sensor.smart_cabinet_miniatures",
	scene_entity: "sensor.smart_cabinet_scene",
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
		this.actions = createPanelActions(this);
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
		const layout = value?.states?.[this._config.layout_entity];
		const miniatures = value?.states?.[this._config.miniatures_entity];
		const scene = value?.states?.[this._config.scene_entity];
		const signature = `${layout?.last_updated || ""}|${miniatures?.last_updated || ""}|${scene?.last_updated || ""}`;
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

	_command(payload) {
		return publishMqtt(this._hass, this._config.command_topic, payload);
	}

	_hexToRgb(hex) {
		const value = hex.replace("#", "");
		return {
			r: parseInt(value.slice(0, 2), 16),
			g: parseInt(value.slice(2, 4), 16),
			b: parseInt(value.slice(4, 6), 16),
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
		const nav = [
			[
				"view",
				"View",
				html`<svg viewBox="0 0 24 24">
					<path d="M4 19V5m5 14V9m5 10V4m5 15v-8" />
				</svg>`,
			],
			[
				"configuration",
				"Configuration",
				html`<svg viewBox="0 0 24 24">
					<path d="M4 4h16v5H4zm0 11h16v5H4zm4-6v6m8-6v6" />
				</svg>`,
			],
			[
				"miniatures",
				"Miniatures",
				html`<svg viewBox="0 0 24 24">
					<path
						d="M7 20v-2a5 5 0 0 1 10 0v2M12 4a4 4 0 1 1 0 8 4 4 0 0" />
				</svg>`,
			],
			[
				"search",
				"Search",
				html`<svg viewBox="0 0 24 24">
					<circle
						cx="10.5"
						cy="10.5"
						r="5.5" />
					<path d="m15 15 5 5" />
				</svg>`,
			],
		];
		return html`<style>
				${panelStyles}
			</style>
			<div class="app-shell">
				<header class="topbar">
					<div class="topbar-main">
						<ha-menu-button class="ha-native-menu"></ha-menu-button>
						<div class="brand">
							<div class="brand-icon">SC</div>
							<div>
								<b>Smart Cabinet</b
								><span>Control & catalogue</span>
							</div>
						</div>
					</div>
					<nav>
						${nav.map(
							([id, label, icon]) =>
								html`<button
									class="nav-tab ${this._active === id
										? "active"
										: ""}"
									@click=${() => this._selectTab(id)}
									aria-label=${label}
									title=${label}>
									${icon}
								</button>`,
						)}
					</nav>
				</header>
				<div class="page">${panelContent(this)}</div>
			</div>`;
	}

	_render() {
		this.requestUpdate();
	}

	_selectTab(tab) {
		this._active = tab;
		this._render();
		if (tab === "view") this._scheduleViewHighlight();
	}

	_setViewIndex(index) {
		const items = this._assignedMiniatures;
		if (!items.length) return;
		this._viewIndex =
			((index % items.length) + items.length) % items.length;
		this._render();
		this._scheduleViewHighlight();
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
		await this._command(
			current
				? {
						action: "updateMiniature",
						id: current.id,
						name,
						collection,
						artist,
						date: current.date || "",
						shelf: current.shelf || 0,
						location: current.location || 0,
						notes: current.notes || "",
					}
				: {
						action: "createMiniature",
						name,
						collection,
						artist,
						date: "",
						shelf: 0,
						location: 0,
						notes: "",
					},
		);
		this._editingMiniId = null;
		this._render();
	}

	_scheduleSearch() {
		clearTimeout(this._searchTimer);
		this._searchTimer = setTimeout(() => this._highlightSearch(), 220);
	}

	async _highlightSearch() {
		const query = this._searchQuery.trim().toLocaleLowerCase();
		if (!query) return this._command({ action: "clearHighlight" });
		const fields =
			this._searchField === "all"
				? ["name", "collection", "artist"]
				: [this._searchField];
		const assigned = this._miniatures.filter(
			(item) =>
				Number(item.shelf) > 0 &&
				Number(item.location) > 0 &&
				fields.some((key) =>
					String(item[key] || "")
						.toLocaleLowerCase()
						.includes(query),
				),
		);
		return this._command(
			assigned.length
				? {
						action: "highlightLocations",
						locations: assigned.map((item) => ({
							shelf: item.shelf,
							location: item.location,
						})),
					}
				: { action: "clearHighlight" },
		);
	}
}

customElements.define("ha-panel-smart-cabinet", HaPanelSmartCabinet);
