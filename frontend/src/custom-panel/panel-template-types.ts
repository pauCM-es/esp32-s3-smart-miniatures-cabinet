import type { TemplateResult } from "lit";
import type { MiniatureSort } from "./miniature-sort.js";
import type {
	CabinetCommand,
	Hass,
	Layout,
	Location,
	Miniature,
	RgbColor,
	Shelf,
} from "./panel-types.js";

export type PanelView = "view" | "configuration" | "miniatures" | "search";
export type CatalogueView = "list" | "grid";
export type MiniatureSearchField = "all" | "name" | "collection" | "artist";
export type SortTarget = "_catalogueSort" | "_searchSort";

export interface CabinetPosition {
	shelf: number;
	location: number;
}

export interface LocationAnchor {
	run: "forward" | "return";
	percent: number;
}

export interface PanelConfig {
	command_topic: string;
	layout_entity: string;
	miniatures_entity: string;
	scene_entity: string;
	mini_lights_command_topic: string;
	power_entity: string;
	brightness_entity: string;
	mini_lights_entity: string;
}

export interface PanelActions {
	setHighlightColor(hex: string): Promise<void>;
	openHighlightColorPicker(): void;
	closeHighlightColorPicker(): void;
	selectShelf(shelf: number): void;
	selectLocation(location: number): Promise<void>;
	insertShelf(position: number): Promise<void>;
	duplicateShelf(shelf: number): Promise<void>;
	deleteShelf(shelf: number): Promise<void>;
	moveShelf(from: number, to: number): Promise<void>;
	saveShelf(): Promise<void>;
	autoMap(): Promise<void>;
	clearMap(): Promise<void>;
	toggleDirection(): Promise<void>;
	zoom(delta: number): void;
	setShowAllMappings(checked: boolean): void;
	selectMappingLocation(value: number, total: number): void;
	selectLed(led: number): Promise<void>;
	resetLedRange(): Promise<void>;
	saveLedRange(): Promise<void>;
	editMini(id: string): void;
	addMini(): void;
	cancelMini(): void;
	saveMini(): Promise<void>;
	deleteMini(id: string): Promise<void>;
	highlightOne(id: string): Promise<void> | undefined;
	setViewIndex(index: number): void;
	clearViewHighlight(): Promise<void>;
	applyScene(scene: string): Promise<void>;
	setCabinetPower(on: boolean): Promise<void>;
	setCabinetBrightness(brightness: number | string): Promise<void>;
	setMiniatureLights(update: {
		power?: boolean;
		brightness?: number | string;
		color?: string;
	}): Promise<void>;
	openPaletteEditor(): void;
	closePaletteEditor(): void;
	selectPaletteColor(index: number): void;
	setPaletteColor(color: string): Promise<void>;
	addPaletteColor(): void;
	removePaletteColor(index: number): void;
	startPaletteDrag(index: number, event: DragEvent): void;
	dropPaletteColor(targetIndex: number, event: DragEvent): void;
	finishPaletteDrag(): void;
	setSearchQuery(query: string): void;
	setSearchField(field: MiniatureSearchField): void;
	setSort(target: SortTarget, sort: MiniatureSort): void;
	setCatalogueView(view: CatalogueView): void;
	selectSummaryLocation(shelf: number, location: number): void;
	startSummaryMove(): void;
}

export interface PanelTemplateContext {
	_hass: Hass | null;
	_active: PanelView;
	_selectedShelf: number;
	_selectedLocation: number;
	_editingMiniId: string | null;
	_addingMini: boolean;
	_searchQuery: string;
	_searchField: MiniatureSearchField;
	_searchSort: MiniatureSort;
	_catalogueSort: MiniatureSort;
	_catalogueView: CatalogueView;
	_summarySelected: CabinetPosition | null;
	_summaryMoveSource: CabinetPosition | null;
	_summaryMoveTarget: CabinetPosition | null;
	_viewIndex: number;
	_mappingStart: number | null;
	_mappingEnd: number | null;
	_showAllMappings: boolean;
	_ledZoom: number;
	_miniatureBrightness: number;
	_miniatureColor: string;
	_miniaturePower: boolean;
	_miniaturePalette: string[];
	_paletteEditorOpen: boolean;
	_paletteSelectedIndex: number;
	_highlightColor: string;
	_highlightColorPickerOpen: boolean;
	_cabinetBrightness: number;
	_cabinetPower: boolean;
	readonly _config: PanelConfig;
	readonly _layout: Layout;
	readonly _miniatures: Miniature[];
	readonly _assignedMiniatures: Miniature[];
	actions: PanelActions;
	_viewItem(index: number): Miniature | null;
	_summaryLocationAnchor(shelf: Shelf, location: Location): LocationAnchor;
	_startDial(event: PointerEvent, value: number): void;
	_moveDial(
		event: PointerEvent,
		total: number,
		onChange: (value: number) => void,
	): void;
	_finishDial(event?: PointerEvent): void;
	_rgbToHex(color?: Partial<RgbColor>): string;
}

export interface PanelActionHost extends PanelTemplateContext {
	shadowRoot: ShadowRoot | null;
	_render(): void;
	_command(payload: CabinetCommand): Promise<void>;
	_hexToRgb(hex: string): RgbColor;
	_setHighlightColor(hex: string): Promise<void>;
	_openHighlightColorPicker(): void;
	_closeHighlightColorPicker(): void;
	_selectSummaryLocation(shelf: number, location: number): void;
	_startSummaryMove(): void;
	_setMiniatureLights(update: {
		power?: boolean;
		brightness?: number | string;
		color?: string;
	}): Promise<void>;
	_openPaletteEditor(): void;
	_closePaletteEditor(): void;
	_selectPaletteColor(index: number): void;
	_setPaletteColor(color: string): Promise<void>;
	_addPaletteColor(): void;
	_removePaletteColor(index: number): void;
	_startPaletteDrag(index: number, event: DragEvent): void;
	_dropPaletteColor(targetIndex: number, event: DragEvent): void;
	_finishPaletteDrag(): void;
	_setCabinetPower(on: boolean): Promise<void>;
	_setCabinetBrightness(brightness: number | string): Promise<void>;
	_saveMini(): Promise<void>;
	_setViewIndex(index: number): void;
	_scheduleMappingHighlight(): void;
	_scheduleSearch(): void;
	_searchTimer: ReturnType<typeof setTimeout> | null;
	_viewTimer: ReturnType<typeof setTimeout> | null;
}

export type PanelTemplate = (panel: PanelTemplateContext) => TemplateResult;
