type Panel = any;

const inputValue = (panel: Panel, selector: string): string | undefined =>
	panel.shadowRoot.querySelector(selector)?.value;

export const createPanelActions = (p: Panel) => ({
	setHighlightColor: (hex) =>
		p._command({ action: "setHighlightColor", ...p._hexToRgb(hex) }),
	selectShelf: (shelf) => {
		p._selectedShelf = shelf;
		p._selectedLocation = 1;
		p._render();
	},
	selectLocation: async (location) => {
		p._selectedLocation = location;
		await p._command({
			action: "highlightLocation",
			shelf: p._selectedShelf,
			location,
		});
		p._render();
	},
	insertShelf: (position) => p._command({ action: "insertShelf", position }),
	duplicateShelf: (shelf) => p._command({ action: "duplicateShelf", shelf }),
	deleteShelf: async (shelf) => {
		if (
			confirm(
				`Delete Shelf ${shelf}? Miniatures on it will become Unassigned.`,
			)
		) {
			await p._command({ action: "deleteShelf", shelf });
		}
	},
	moveShelf: async (from, to) => {
		await p._command({ action: "moveShelf", from, to });
		p._selectedShelf = to;
	},
	saveShelf: () =>
		p._command({
			action: "setShelfConfig",
			shelf: p._selectedShelf,
			total_leds: Number(inputValue(p, "#shelf-leds")),
			total_locations: Number(inputValue(p, "#shelf-locations")),
		}),
	autoMap: () =>
		p._command({ action: "autoMapShelf", shelf: p._selectedShelf }),
	clearMap: async () => {
		if (confirm("Clear every location mapping on this shelf?")) {
			await p._command({
				action: "clearShelfMapping",
				shelf: p._selectedShelf,
			});
		}
	},
	toggleDirection: () => {
		const shelf = p._layout.shelves?.[p._selectedShelf - 1];
		return p._command({
			action: "setShelfDirection",
			shelf: p._selectedShelf,
			mirrored: !shelf?.mirrored,
		});
	},
	zoom: (delta) => {
		p._ledZoom = Math.min(2, Math.max(0.5, p._ledZoom + delta));
		p._render();
	},
	setShowAllMappings: (checked) => {
		p._showAllMappings = checked;
		p._render();
	},
	selectMappingLocation: (value, total) => {
		p._selectedLocation = (((value % total) + total) % total) + 1;
		p._mappingStart = null;
		p._mappingEnd = null;
		p._render();
		p._scheduleMappingHighlight();
	},
	selectLed: async (led) => {
		if (p._mappingStart === null || p._mappingEnd !== null) {
			p._mappingStart = led;
			p._mappingEnd = null;
		} else {
			p._mappingEnd = led;
			const start = Math.min(p._mappingStart, p._mappingEnd);
			await p._command({
				action: "previewLocation",
				shelf: p._selectedShelf,
				location: p._selectedLocation,
				start_led: start,
				leds: Math.abs(p._mappingEnd - p._mappingStart) + 1,
			});
		}
		p._render();
	},
	resetLedRange: async () => {
		p._mappingStart = null;
		p._mappingEnd = null;
		await p._command({
			action: "highlightLocation",
			shelf: p._selectedShelf,
			location: p._selectedLocation,
		});
		p._render();
	},
	saveLedRange: async () => {
		const start = Math.min(p._mappingStart, p._mappingEnd);
		await p._command({
			action: "setLocationConfig",
			shelf: p._selectedShelf,
			location: p._selectedLocation,
			start_led: start,
			leds: Math.abs(p._mappingEnd - p._mappingStart) + 1,
		});
		p._mappingStart = null;
		p._mappingEnd = null;
	},
	editMini: (id) => {
		p._editingMiniId = id;
		p._addingMini = false;
		p._render();
	},
	addMini: () => {
		p._editingMiniId = null;
		p._addingMini = true;
		p._render();
	},
	cancelMini: () => {
		p._editingMiniId = null;
		p._addingMini = false;
		p._render();
	},
	saveMini: () => p._saveMini(),
	deleteMini: async (id) => {
		const item = p._miniatures.find((mini) => mini.id === id);
		if (confirm(`Delete ${item?.name || "this miniature"}?`))
			await p._command({ action: "deleteMiniature", id });
	},
	highlightOne: (id) => {
		const item = p._miniatures.find((mini) => mini.id === id);
		return item?.shelf
			? p._command({
					action: "highlightLocation",
					shelf: item.shelf,
					location: item.location,
				})
			: undefined;
	},
	setViewIndex: (index) => p._setViewIndex(index),
	clearViewHighlight: async () => {
		clearTimeout(p._viewTimer);
		await p._command({ action: "clearHighlight" });
	},
	applyScene: async (scene) => {
		clearTimeout(p._viewTimer);
		await p._command({ action: "applyScene", scene });
	},
	setSearchQuery: (query) => {
		p._searchQuery = query;
		p._render();
		p._scheduleSearch();
	},
	setSearchField: (field) => {
		p._searchField = field;
		p._render();
		p._scheduleSearch();
	},
	setSort: (target, sort) => {
		p[target] = sort;
		p._render();
	},
	setCatalogueView: (view) => {
		p._catalogueView = view;
		p._render();
	},
});
