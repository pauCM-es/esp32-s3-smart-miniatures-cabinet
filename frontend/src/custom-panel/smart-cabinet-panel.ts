import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
import "../components/cabinet-panel-card.js";
import { createPanelActions } from "./panel-actions.js";
import { normalizeLayout, normalizeMiniatures } from "./panel-data.js";
import { DEFAULT_MINIATURE_PALETTE } from "./miniature-palette.js";
import { isAssignedMiniature, searchMiniatures } from "./panel-selectors.js";
import panelStyles from "./smart-cabinet-panel.css?inline";
import { panelContent } from "./smart-cabinet-panel-templates.js";
import { publishMqtt } from "./panel-service.js";
import type {
	CabinetPosition,
	CatalogueView,
	LocationAnchor,
	MiniatureSearchField,
	PanelActions,
	PanelConfig,
	PanelView,
} from "./panel-template-types.js";
import type {
	CabinetCommand,
	Hass,
	Layout,
	Location,
	Miniature,
	RgbColor,
	Shelf,
} from "./panel-types.js";

const DEFAULT_CONFIG: PanelConfig = {
	command_topic: "smartcabinet/cabinet01/api/command",
	layout_entity: "sensor.smart_cabinet_layout",
	miniatures_entity: "sensor.smart_cabinet_miniatures",
	scene_entity: "sensor.smart_cabinet_scene",
	mini_lights_command_topic: "smartcabinet/cabinet01/ha/mini_lights/set",
	power_entity: "switch.smart_cabinet_power",
	brightness_entity: "number.smart_cabinet_brightness",
	mini_lights_entity: "light.miniature_lights",
};

class HaPanelSmartCabinet extends LitElement {
	static styles = unsafeCSS(panelStyles);
	_hass: Hass | null = null;
	_panel: { config?: Record<string, string> } | null = null;
	_narrow = false;
	_active: PanelView = "view";
	_selectedShelf = 1;
	_selectedLocation = 1;
	_editingMiniId: string | null = null;
	_addingMini = false;
	_searchTimer: ReturnType<typeof setTimeout> | null = null;
	_dataSignature: string | null = null;
	_searchQuery = "";
	_searchField: MiniatureSearchField = "all";
	_searchSort: "name" | "location" | "newest" = "name";
	_catalogueSort: "name" | "location" | "newest" = "name";
	_catalogueView: CatalogueView = "list";
	_summarySelected: CabinetPosition | null = null;
	_summaryMoveSource: CabinetPosition | null = null;
	_summaryMoveTarget: CabinetPosition | null = null;
	_viewIndex = 0;
	_viewTimer: ReturnType<typeof setTimeout> | null = null;
	_mappingStart: number | null = null;
	_mappingEnd: number | null = null;
	_mappingTimer: ReturnType<typeof setTimeout> | null = null;
	_showAllMappings = false;
	_ledZoom = 1;
	_dialDrag: {
		pointerId: number;
		x: number;
		value: number;
		steps: number;
	} | null = null;
	_miniatureBrightness = 45;
	_miniatureColor = "#03a9e6";
	_miniaturePower = true;
	_miniaturePalette: string[] = [...DEFAULT_MINIATURE_PALETTE];
	_paletteEditorOpen = false;
	_paletteSelectedIndex = 0;
	_paletteDragIndex: number | null = null;
	_loadedPaletteStorageKey: string | null = null;
	_cabinetBrightness = 0;
	_cabinetPower = false;
	_layoutData: Layout = { shelf_count: 0, shelves: [] };
	_miniaturesData: Miniature[] = [];
	actions: PanelActions;

	constructor() {
		super();
		this._hass = null;
		this._panel = null;
		this._narrow = false;
		this._active = "view";
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
		this._summarySelected = null;
		this._summaryMoveSource = null;
		this._summaryMoveTarget = null;
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
		this._miniaturePower = true;
		this._miniaturePalette = [...DEFAULT_MINIATURE_PALETTE];
		this._paletteEditorOpen = false;
		this._paletteSelectedIndex = 0;
		this._paletteDragIndex = null;
		this._loadedPaletteStorageKey = null;
		this._cabinetBrightness = 0;
		this._cabinetPower = false;
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
		this._loadPalette();
		this._syncStateData();
		this._render();
	}

	set hass(value: Hass | null) {
		this._hass = value;
		this._syncStateData();
		const layout = value?.states?.[this._config.layout_entity];
		const miniatures = value?.states?.[this._config.miniatures_entity];
		const scene = value?.states?.[this._config.scene_entity];
		const signature = `${layout?.last_updated || ""}|${miniatures?.last_updated || ""}|${scene?.last_updated || ""}`;
		if (signature !== this._dataSignature) {
			this._dataSignature = signature;
			this._render();
		}
	}

	get _config(): PanelConfig {
		return { ...DEFAULT_CONFIG, ...(this._panel?.config || {}) };
	}
	get _paletteStorageKey(): string {
		return `smart-cabinet:miniature-palette:${this._config.mini_lights_entity}`;
	}
	get _layout(): Layout {
		return this._layoutData;
	}
	get _miniatures(): Miniature[] {
		return this._miniaturesData;
	}
	get _assignedMiniatures(): Miniature[] {
		return this._miniatures.filter(isAssignedMiniature);
	}

	_syncStateData(): void {
		const layout = this._hass?.states?.[this._config.layout_entity];
		const miniatures = this._hass?.states?.[this._config.miniatures_entity];
		this._layoutData = normalizeLayout(layout?.attributes);
		this._miniaturesData = normalizeMiniatures(miniatures?.attributes);
		const powerState =
			this._hass?.states?.[this._config.power_entity]?.state;
		if (powerState !== undefined) {
			this._cabinetPower = powerState.toLocaleLowerCase() === "on";
		}
		const brightnessState =
			this._hass?.states?.[this._config.brightness_entity]?.state;
		if (
			brightnessState !== undefined &&
			Number.isFinite(Number(brightnessState))
		) {
			this._cabinetBrightness = Math.max(
				0,
				Math.min(100, Number(brightnessState)),
			);
		}
		const miniatureState =
			this._hass?.states?.[this._config.mini_lights_entity];
		if (miniatureState) {
			this._miniaturePower =
				miniatureState.state.toLocaleLowerCase() === "on";
			const brightness = Number(miniatureState.attributes.brightness);
			if (Number.isFinite(brightness))
				this._miniatureBrightness = brightness;
			const rgb = miniatureState.attributes.rgb_color;
			if (Array.isArray(rgb) && rgb.length >= 3) {
				this._miniatureColor = this._rgbToHex({
					r: Number(rgb[0]),
					g: Number(rgb[1]),
					b: Number(rgb[2]),
				});
			}
		}
		this._normalizeSelection();
	}

	_normalizeSelection(): void {
		const assignedCount = this._assignedMiniatures.length;
		this._viewIndex = assignedCount
			? ((this._viewIndex % assignedCount) + assignedCount) %
				assignedCount
			: 0;
		const shelves = this._layout.shelves;
		if (!shelves.length) {
			this._selectedShelf = 1;
			this._selectedLocation = 1;
			return;
		}
		this._selectedShelf = Math.min(
			Math.max(1, this._selectedShelf),
			shelves.length,
		);
		const selected = shelves[this._selectedShelf - 1];
		this._selectedLocation = Math.min(
			Math.max(1, this._selectedLocation),
			Math.max(1, selected.total_locations),
		);
	}

	_viewItem(index: number): Miniature | null {
		const items = this._assignedMiniatures;
		return items.length
			? items[((index % items.length) + items.length) % items.length]
			: null;
	}

	_summaryLocationAnchor(shelf: Shelf, location: Location): LocationAnchor {
		const total = shelf.total_leds;
		const firstRun = Math.ceil(total / 2);
		const secondRun = total - firstRun;
		const center = location.start_led + (location.leds - 1) / 2;
		if (center < firstRun) {
			if (shelf.mirrored) {
				return {
					run: "forward",
					percent: ((firstRun - center - 0.5) / firstRun) * 100,
				};
			}
			return {
				run: "forward",
				percent: ((center + 0.5) / firstRun) * 100,
			};
		}
		if (shelf.mirrored) {
			return {
				run: "return",
				percent: secondRun
					? ((center - firstRun + 0.5) / secondRun) * 100
					: 50,
			};
		}
		return {
			run: "return",
			percent: secondRun
				? ((total - center - 0.5) / secondRun) * 100
				: 50,
		};
	}

	_selectSummaryLocation(shelf: number, location: number): void {
		if (this._summaryMoveSource) {
			this._selectSummaryMoveTarget(shelf, location);
			return;
		}
		this._summarySelected = { shelf, location };
		const itemIndex = this._assignedMiniatures.findIndex(
			(item) => item.shelf === shelf && item.location === location,
		);
		if (itemIndex >= 0) this._viewIndex = itemIndex;
		this._command({ action: "highlightLocation", shelf, location });
		this._render();
	}

	_startSummaryMove(): void {
		const selected = this._summarySelected;
		const miniature =
			selected &&
			this._miniatures.find(
				(item) =>
					item.shelf === selected.shelf &&
					item.location === selected.location,
			);
		if (!selected || !miniature) return;
		this._summaryMoveSource = selected;
		this._summaryMoveTarget = null;
		this._render();
	}

	_cancelSummaryMove(clearSelection = false): void {
		if (
			!this._summaryMoveSource &&
			(!clearSelection || !this._summarySelected)
		)
			return;
		if (clearSelection) this._summarySelected = null;
		this._summaryMoveSource = null;
		this._summaryMoveTarget = null;
		if (clearSelection) this._command({ action: "clearHighlight" });
		this._render();
	}

	async _selectSummaryMoveTarget(
		shelf: number,
		location: number,
	): Promise<void> {
		const source = this._summaryMoveSource;
		const target = { shelf, location };
		if (
			!source ||
			(source.shelf === target.shelf &&
				source.location === target.location)
		)
			return;
		const miniature = this._miniatures.find(
			(item) =>
				item.shelf === source.shelf &&
				item.location === source.location,
		);
		if (!miniature) return this._cancelSummaryMove();
		const displaced = this._miniatures.find(
			(item) =>
				item.shelf === target.shelf &&
				item.location === target.location,
		);
		this._summaryMoveTarget = target;
		this._render();
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
		const message = displaced
			? `Move ${miniature.name} to Shelf ${target.shelf}, Location ${target.location}?\n\n${displaced.name} will become Unassigned.`
			: `Move ${miniature.name} to Shelf ${target.shelf}, Location ${target.location}?`;
		if (!confirm(message)) return this._cancelSummaryMove();
		const update = (
			item: Miniature,
			destinationShelf: number,
			destinationLocation: number,
		) =>
			this._command({
				action: "updateMiniature",
				id: item.id,
				name: item.name || "",
				collection: item.collection || "",
				artist: item.artist || "",
				date: item.date || "",
				shelf: destinationShelf,
				location: destinationLocation,
				notes: item.notes || "",
			});
		if (displaced) await update(displaced, 0, 0);
		await update(miniature, target.shelf, target.location);
		this._summarySelected = target;
		this._summaryMoveSource = null;
		this._summaryMoveTarget = null;
		this._render();
	}

	_startDial(event: PointerEvent, value: number) {
		if (event.button !== 0) return;
		this._dialDrag = {
			pointerId: event.pointerId,
			x: event.clientX,
			value,
			steps: 0,
		};
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		(event.currentTarget as HTMLElement).classList.add("dragging");
	}

	_moveDial(
		event: PointerEvent,
		total: number,
		onChange: (value: number) => void,
	) {
		if (!this._dialDrag || event.pointerId !== this._dialDrag.pointerId)
			return;
		const steps = Math.trunc((this._dialDrag.x - event.clientX) / 36);
		if (steps === this._dialDrag.steps) return;
		this._dialDrag.steps = steps;
		onChange((((this._dialDrag.value + steps) % total) + total) % total);
	}

	_finishDial(event?: PointerEvent) {
		if (event && event.pointerId !== this._dialDrag?.pointerId) return;
		this._dialDrag = null;
		(event?.currentTarget as HTMLElement | undefined)?.classList.remove(
			"dragging",
		);
	}

	_command(payload: CabinetCommand): Promise<void> {
		return publishMqtt(this._hass, this._config.command_topic, payload);
	}

	_setMiniatureLights({
		power,
		brightness,
		color,
	}: {
		power?: boolean;
		brightness?: number | string;
		color?: string;
	}): Promise<void> {
		if (power !== undefined) this._miniaturePower = power;
		if (power === undefined && (brightness !== undefined || color)) {
			this._miniaturePower = true;
		}
		if (brightness !== undefined)
			this._miniatureBrightness = Math.max(
				0,
				Math.min(100, Number(brightness) || 0),
			);
		if (color) this._miniatureColor = color;
		this._render();
		return publishMqtt(this._hass, this._config.mini_lights_command_topic, {
			state: this._miniaturePower ? "ON" : "OFF",
			brightness: this._miniatureBrightness,
			color: this._hexToRgb(this._miniatureColor),
		});
	}

	_loadPalette(): void {
		const storageKey = this._paletteStorageKey;
		if (storageKey === this._loadedPaletteStorageKey) return;
		this._loadedPaletteStorageKey = storageKey;
		this._miniaturePalette = [...DEFAULT_MINIATURE_PALETTE];
		this._paletteSelectedIndex = 0;
		try {
			const raw = localStorage.getItem(storageKey);
			if (!raw) return;
			const stored = JSON.parse(raw) as unknown;
			if (!Array.isArray(stored)) return;
			const colors = stored.filter(
				(value): value is string =>
					typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value),
			);
			if (colors.length) this._miniaturePalette = colors.map((color) => color.toLowerCase());
		} catch {
			// Storage is optional; a clean default palette is always available.
		}
	}

	_savePalette(): void {
		try {
			localStorage.setItem(
				this._paletteStorageKey,
				JSON.stringify(this._miniaturePalette),
			);
		} catch {
			// Some privacy modes disable storage; palette editing still works for this session.
		}
	}

	_openPaletteEditor(): void {
		const currentIndex = this._miniaturePalette.findIndex(
			(color) => color.toLocaleLowerCase() === this._miniatureColor.toLocaleLowerCase(),
		);
		this._paletteSelectedIndex = currentIndex >= 0 ? currentIndex : 0;
		this._paletteEditorOpen = true;
		this._render();
	}

	_closePaletteEditor(): void {
		this._paletteEditorOpen = false;
		this._paletteDragIndex = null;
		this._render();
	}

	_selectPaletteColor(index: number): void {
		if (!this._miniaturePalette[index]) return;
		this._paletteSelectedIndex = index;
		this._render();
	}

	_setPaletteColor(color: string): Promise<void> {
		if (!this._miniaturePalette[this._paletteSelectedIndex]) {
			this._miniaturePalette.push(color);
			this._paletteSelectedIndex = this._miniaturePalette.length - 1;
		} else {
			this._miniaturePalette[this._paletteSelectedIndex] = color;
		}
		this._savePalette();
		return this._setMiniatureLights({ color });
	}

	_addPaletteColor(): void {
		this._miniaturePalette.push(this._miniatureColor);
		this._paletteSelectedIndex = this._miniaturePalette.length - 1;
		this._savePalette();
		this._render();
	}

	_removePaletteColor(index: number): void {
		if (this._miniaturePalette.length <= 1 || !this._miniaturePalette[index]) return;
		this._miniaturePalette.splice(index, 1);
		this._paletteSelectedIndex = Math.min(
			this._paletteSelectedIndex,
			this._miniaturePalette.length - 1,
		);
		this._savePalette();
		this._render();
	}

	_startPaletteDrag(index: number, event: DragEvent): void {
		this._paletteDragIndex = index;
		event.dataTransfer?.setData("text/plain", String(index));
		if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
		(event.currentTarget as HTMLElement).classList.add("dragging");
	}

	_dropPaletteColor(targetIndex: number, event: DragEvent): void {
		event.preventDefault();
		const sourceIndex = this._paletteDragIndex ?? Number(event.dataTransfer?.getData("text/plain"));
		if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex === targetIndex) {
			this._finishPaletteDrag();
			return;
		}
		const [color] = this._miniaturePalette.splice(sourceIndex, 1);
		this._miniaturePalette.splice(targetIndex, 0, color);
		if (this._paletteSelectedIndex === sourceIndex) {
			this._paletteSelectedIndex = targetIndex;
		} else if (sourceIndex < this._paletteSelectedIndex && targetIndex >= this._paletteSelectedIndex) {
			this._paletteSelectedIndex -= 1;
		} else if (sourceIndex > this._paletteSelectedIndex && targetIndex <= this._paletteSelectedIndex) {
			this._paletteSelectedIndex += 1;
		}
		this._savePalette();
		this._finishPaletteDrag();
	}

	_finishPaletteDrag(): void {
		this._paletteDragIndex = null;
		this._render();
	}

	_setCabinetPower(on: boolean): Promise<void> {
		this._cabinetPower = on;
		this._render();
		return (
			this._hass?.callService("switch", on ? "turn_on" : "turn_off", {
				entity_id: this._config.power_entity,
			}) ?? Promise.resolve()
		);
	}

	_setCabinetBrightness(brightness: number | string): Promise<void> {
		this._cabinetBrightness = Math.max(
			0,
			Math.min(100, Number(brightness) || 0),
		);
		this._render();
		return (
			this._hass?.callService("number", "set_value", {
				entity_id: this._config.brightness_entity,
				value: this._cabinetBrightness,
			}) ?? Promise.resolve()
		);
	}

	_hexToRgb(hex: string): RgbColor {
		const value = hex.replace("#", "");
		return {
			r: parseInt(value.slice(0, 2), 16),
			g: parseInt(value.slice(2, 4), 16),
			b: parseInt(value.slice(4, 6), 16),
		};
	}

	_rgbToHex(color: Partial<RgbColor> = {}): string {
		const part = (value: number | undefined) =>
			Number(value || 0)
				.toString(16)
				.padStart(2, "0");
		return `#${part(color.r)}${part(color.g)}${part(color.b)}`;
	}

	render(): TemplateResult {
		const nav: Array<[PanelView, string, TemplateResult]> = [
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
			<div
				class="app-shell"
				@click=${() => this._cancelSummaryMove(true)}>
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

	_render(): void {
		this.requestUpdate();
	}

	_selectTab(tab: PanelView): void {
		this._active = tab;
		this._render();
		if (tab === "view") this._scheduleViewHighlight();
	}

	_setViewIndex(index: number): void {
		const items = this._assignedMiniatures;
		if (!items.length) return;
		this._viewIndex =
			((index % items.length) + items.length) % items.length;
		this._render();
		this._scheduleViewHighlight();
	}

	_scheduleMappingHighlight(): void {
		if (this._mappingTimer !== null) clearTimeout(this._mappingTimer);
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

	_scheduleViewHighlight(): void {
		const item = this._viewItem(this._viewIndex);
		if (!item) return;
		if (this._viewTimer !== null) clearTimeout(this._viewTimer);
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

	async _saveMini(): Promise<void> {
		const nameInput =
			this.shadowRoot?.querySelector<HTMLInputElement>("#mini-name");
		const collectionInput =
			this.shadowRoot?.querySelector<HTMLInputElement>(
				"#mini-collection",
			);
		const artistInput =
			this.shadowRoot?.querySelector<HTMLInputElement>("#mini-artist");
		if (!nameInput || !collectionInput || !artistInput) return;
		const name = nameInput.value.trim();
		const collectionValue = collectionInput.value.trim();
		const artistValue = artistInput.value.trim();
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

	_scheduleSearch(): void {
		if (this._searchTimer !== null) clearTimeout(this._searchTimer);
		this._searchTimer = setTimeout(() => this._highlightSearch(), 220);
	}

	async _highlightSearch(): Promise<void> {
		const query = this._searchQuery.trim().toLocaleLowerCase();
		if (!query) return this._command({ action: "clearHighlight" });
		const assigned = searchMiniatures(
			this._miniatures,
			query,
			this._searchField,
		).filter(isAssignedMiniature);
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
