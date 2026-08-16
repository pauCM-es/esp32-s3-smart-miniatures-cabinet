import { LitElement, html, unsafeCSS } from "lit";
import "../components/cabinet-panel-card.js";
import { createPanelActions } from "./panel-actions.js";
import panelStyles from "./smart-cabinet-panel.css?inline";
import { panelContent } from "./smart-cabinet-panel-templates.js";
import { publishMqtt } from "./panel-service.js";
import type { Hass } from "./panel-types.js";

const DEFAULT_CONFIG = {
	command_topic: "smartcabinet/cabinet01/api/command",
	layout_entity: "sensor.smart_cabinet_layout",
	miniatures_entity: "sensor.smart_cabinet_miniatures",
	scene_entity: "sensor.smart_cabinet_scene",
	mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set",
};

class HaPanelSmartCabinet extends LitElement {
	static styles = unsafeCSS(panelStyles);
	_hass: Hass | null = null;
	_panel: { config?: Record<string, string> } | null = null;
	_narrow = false;
	_active = "configuration";
	_selectedShelf = 1;
	_selectedLocation = 1;
	_editingMiniId: string | null = null;
	_addingMini = false;
	_searchTimer: ReturnType<typeof setTimeout> | null = null;
	_dataSignature: string | null = null;
	_searchQuery = "";
	_searchField = "all";
	_searchSort = "name";
	_catalogueSort = "name";
	_catalogueView = "list";
	_viewIndex = 0;
	_viewTimer: ReturnType<typeof setTimeout> | null = null;
	_mappingStart: number | null = null;
	_mappingEnd: number | null = null;
	_mappingTimer: ReturnType<typeof setTimeout> | null = null;
	_showAllMappings = false;
	_ledZoom = 1;
	_dialDrag: { pointerId: number; x: number; value: number; steps: number } | null = null;
	_miniatureBrightness = 45;
	_miniatureColor = "#03a9e6";
	actions: any;

	constructor() {
		super();
		this._hass = null;
		this._panel = null;
		this._narrow = false;
		this._active = "configuration";
		this._selectedShelf = 1;
		this._selectedLocation = 1;
		this._editingMiniId = null;
		this._addingMini = false;
		this._searchTimer = null;
		this._dataSignature = null;
		this._searchQuery = "";
		this._searchField = "all";
		this._searchSort = "name";
		this._catalogueSort = "name";
		this._catalogueView = "list";
		this._viewIndex = 0;
		this._viewTimer = null;
		this._mappingStart = null;
		this._mappingEnd = null;
		this._mappingTimer = null;
		this._showAllMappings = false;
		this._ledZoom = 1;
		this._dialDrag = null;
		this._miniatureBrightness = 45;
		this._miniatureColor = "#03a9e6";
		this.actions = createPanelActions(this);
	}

	set narrow(value: boolean) {
		const next = Boolean(value);
		if (next === this._narrow) return;
		this._narrow = next;
		this._render();
	}

	set panel(value: { config?: Record<string, string> } | null) {
		this._panel = value;
		this._render();
	}

	set hass(value: Hass | null) {
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

	_summaryLocationAnchor(shelf, location) {
		const total = Number(shelf.total_leds) || 0;
		const firstRun = Math.ceil(total / 2);
		const secondRun = total - firstRun;
		const center = Number(location.start_led) + (Number(location.leds) - 1) / 2;
		if (center < firstRun) {
			if (shelf.mirrored) {
				return { run: "forward", percent: ((firstRun - center - 0.5) / firstRun) * 100 };
			}
			return { run: "forward", percent: ((center + 0.5) / firstRun) * 100 };
		}
		if (shelf.mirrored) {
			return {
				run: "return",
				percent: secondRun ? ((center - firstRun + 0.5) / secondRun) * 100 : 50,
			};
		}
		return {
			run: "return",
			percent: secondRun ? ((total - center - 0.5) / secondRun) * 100 : 50,
		};
	}

	_selectSummaryLocation(shelf, location) {
		const itemIndex = this._assignedMiniatures.findIndex(
			(item) => Number(item.shelf) === Number(shelf) && Number(item.location) === Number(location),
		);
		if (itemIndex >= 0) this._viewIndex = itemIndex;
		this._command({ action: "highlightLocation", shelf: Number(shelf), location: Number(location) });
		this._render();
	}

	_startDial(event: PointerEvent, value: number) {
		if (event.button !== 0) return;
		this._dialDrag = { pointerId: event.pointerId, x: event.clientX, value, steps: 0 };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		(event.currentTarget as HTMLElement).classList.add("dragging");
	}

	_moveDial(event: PointerEvent, total: number, onChange: (value: number) => void) {
		if (!this._dialDrag || event.pointerId !== this._dialDrag.pointerId) return;
		const steps = Math.trunc((this._dialDrag.x - event.clientX) / 36);
		if (steps === this._dialDrag.steps) return;
		this._dialDrag.steps = steps;
		onChange(((this._dialDrag.value + steps) % total + total) % total);
	}

	_finishDial(event?: PointerEvent) {
		if (event && event.pointerId !== this._dialDrag?.pointerId) return;
		this._dialDrag = null;
		(event?.currentTarget as HTMLElement | undefined)?.classList.remove("dragging");
	}

	_command(payload) {
		return publishMqtt(this._hass, this._config.command_topic, payload);
	}

	_setMiniatureLights({ brightness, color }: { brightness?: number; color?: string }) {
		if (brightness !== undefined)
			this._miniatureBrightness = Math.max(0, Math.min(100, Number(brightness) || 0));
		if (color) this._miniatureColor = color;
		this._render();
		return publishMqtt(this._hass, this._config.mini_lights_command_topic, {
			state: "ON",
			brightness: this._miniatureBrightness,
			color: this._hexToRgb(this._miniatureColor),
		});
	}

	_hexToRgb(hex) {
		const value = hex.replace("#", "");
		return {
			r: parseInt(value.slice(0, 2), 16),
			g: parseInt(value.slice(2, 4), 16),
			b: parseInt(value.slice(4, 6), 16),
		};
	}

	_rgbToHex(color: { r?: number; g?: number; b?: number } = {}) {
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
		const name = (this.shadowRoot.querySelector("#mini-name") as HTMLInputElement).value.trim();
		const collectionValue = (
			this.shadowRoot.querySelector("#mini-collection") as HTMLInputElement
		).value.trim();
		const artistValue = (
			this.shadowRoot.querySelector("#mini-artist") as HTMLInputElement
		).value.trim();
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
				collection: collectionValue,
				artist: artistValue,
						date: current.date || "",
						shelf: current.shelf || 0,
						location: current.location || 0,
						notes: current.notes || "",
					}
				: {
						action: "createMiniature",
						name,
				collection: collectionValue,
				artist: artistValue,
						date: "",
						shelf: 0,
						location: 0,
						notes: "",
					},
		);
		this._editingMiniId = null;
		this._addingMini = false;
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
