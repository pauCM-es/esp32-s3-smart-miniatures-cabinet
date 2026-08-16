import { html, nothing } from "lit";

const action = (name, data = {}) =>
	html`data-action=${name}
	${Object.entries(data).map(([key, value]) => html`data-${key}=${value}`)}`;
const avatar = (name) =>
	html`<div class="mini-avatar">${name?.[0] || "?"}</div>`;

export const panelContent = (panel) => {
	if (panel._active === "configuration") return configurationTemplate(panel);
	if (panel._active === "miniatures") return miniaturesTemplate(panel);
	if (panel._active === "view") return viewTemplate(panel);
	return searchTemplate(panel);
};

const configurationTemplate = (p) => {
	const layout = p._layout;
	const shelves = layout.shelves || [];
	if (!shelves.length)
		return html`<div class="empty-state">
			<b>Waiting for cabinet layout</b
			><span
				>The panel will populate when the ESP32 publishes its retained
				layout state.</span
			>
		</div>`;
	p._selectedShelf = Math.min(p._selectedShelf, shelves.length);
	const selected = shelves[p._selectedShelf - 1] || shelves[0];
	p._selectedLocation = Math.min(
		p._selectedLocation,
		selected.total_locations || 1,
	);
	const selectedLocation = selected.locations?.[p._selectedLocation - 1];
	return html` <section class="general-card panel-card">
			<div>
				<div class="eyebrow">GENERAL</div>
				<h2>Cabinet configuration</h2>
				<p>
					Physical structure and the color used to identify miniature
					locations.
				</p>
			</div>
			<div class="general-values">
				<div class="metric">
					<span>Shelves</span
					><b>${layout.shelf_count || shelves.length}</b>
				</div>
				<label class="color-control"
					><span>Highlight color</span
					><input
						id="highlight-color"
						type="color"
						.value=${p._rgbToHex(
							layout.highlight_color || { r: 156, g: 39, b: 176 },
						)}
				/></label>
			</div>
		</section>
		<div class="configuration-grid">
			<aside class="panel-card shelf-list">
				<div class="section-heading">
					<div>
						<div class="eyebrow">SHELVES</div>
						<h3>Physical order</h3>
					</div>
					<button
						class="primary small"
						data-action="insert-shelf"
						data-position=${shelves.length + 1}>
						＋ Add shelf
					</button>
				</div>
				<div class="shelf-items">
					${shelves.map(
						(shelf, index) =>
							html`<div
									class="shelf-row ${shelf.shelf ===
									p._selectedShelf
										? "selected"
										: ""}">
									<button
										class="shelf-select"
										data-action="select-shelf"
										data-shelf=${shelf.shelf}>
										<span class="shelf-number"
											>${String(shelf.shelf).padStart(
												2,
												"0",
											)}</span
										><span
											><b>Shelf ${shelf.shelf}</b
											><small
												>${shelf.total_locations}
												locations · ${shelf.total_leds}
												LEDs</small
											></span
										>
									</button>
									<div class="row-actions">
										<button
											class="icon-button"
											data-action="move-shelf"
											data-from=${shelf.shelf}
											data-to=${Math.max(
												1,
												shelf.shelf - 1,
											)}
											?disabled=${index === 0}>
											↑</button
										><button
											class="icon-button"
											data-action="move-shelf"
											data-from=${shelf.shelf}
											data-to=${Math.min(
												shelves.length,
												shelf.shelf + 1,
											)}
											?disabled=${index ===
											shelves.length - 1}>
											↓
										</button>
									</div>
								</div>
								<button
									class="insert-shelf"
									data-action="insert-shelf"
									data-position=${shelf.shelf + 1}>
									＋ Insert shelf here
								</button>`,
					)}
				</div>
			</aside>
			<main class="panel-card shelf-detail">
				<div class="section-heading detail-heading">
					<div>
						<div class="eyebrow">SELECTED SHELF</div>
						<h2>Shelf ${selected.shelf}</h2>
					</div>
					<button
						class="danger ghost"
						data-action="delete-shelf"
						data-shelf=${selected.shelf}
						?disabled=${shelves.length <= 1}>
						Delete shelf
					</button>
				</div>
				<div class="form-grid two">
					<label
						><span>Total LEDs</span
						><input
							id="shelf-leds"
							type="number"
							min="1"
							.value=${String(selected.total_leds)} /></label
					><label
						><span>Total locations</span
						><input
							id="shelf-locations"
							type="number"
							min="1"
							.value=${String(selected.total_locations)}
					/></label>
				</div>
				<div class="button-row">
					<button
						class="primary"
						data-action="save-shelf">
						Save shelf</button
					><button
						data-action="duplicate-shelf"
						data-shelf=${selected.shelf}>
						Duplicate shelf</button
					><button data-action="auto-map">Auto map</button
					><button data-action="clear-map">Clear mapping</button>
				</div>
				<div class="divider"></div>
				${mappingTemplate(p, selected, selectedLocation)}
			</main>
		</div>`;
};

const mappingTemplate = (p, shelf, location) => {
	const start =
		p._mappingStart ?? (location?.mapped ? location.start_led : null);
	const end =
		p._mappingEnd ??
		(location?.mapped ? location.start_led + location.leds - 1 : null);
	const leds = Array.from({ length: shelf.total_leds }, (_, led) => {
		const selected =
			start !== null &&
			end !== null &&
			led >= Math.min(start, end) &&
			led <= Math.max(start, end);
		const assigned =
			p._showAllMappings &&
			shelf.locations.some(
				(loc) =>
					loc.mapped &&
					led >= loc.start_led &&
					led < loc.start_led + loc.leds,
			);
		return html`<button
			class="led-cell ${assigned ? "assigned" : ""} ${selected
				? "selected"
				: ""} ${led === start ? "range-start" : ""} ${led === end
				? "range-end"
				: ""}"
			data-action="select-led"
			data-led=${led}
			title="LED ${led + 1}">
			${led % 5 === 0 ? html`<small>${led + 1}</small>` : nothing}
		</button>`;
	});
	const firstRun = Math.ceil(shelf.total_leds / 2);
	const runs = shelf.mirrored
		? [leds.slice(0, firstRun).reverse(), leds.slice(firstRun)]
		: [leds.slice(0, firstRun), leds.slice(firstRun).reverse()];
	return html`<section class="mapping-visual">
		<div class="section-heading">
			<div>
				<div class="eyebrow">LOCATIONS</div>
				<h3>LED mapping</h3>
			</div>
			<label class="mapping-toggle"
				><input
					id="show-all-mappings"
					type="checkbox"
					.checked=${p._showAllMappings} /><span
					>Show all assigned</span
				></label
			>
		</div>
		<cabinet-dial-picker
			.compact=${true}
			.value=${p._selectedLocation - 1}
			.total=${shelf.total_locations}
			.ticks=${3}
			@dial-change=${(event) => {
				p._selectedLocation = ((event.detail.value % shelf.total_locations) + shelf.total_locations) % shelf.total_locations + 1;
				p._mappingStart = null; p._mappingEnd = null; p._render(); p._scheduleMappingHighlight();
			}}>
		</cabinet-dial-picker>
		<div class="mapping-tools">
			<button data-action="toggle-direction">
				${shelf.mirrored ? "Start at right" : "Start at left"}</button
			><button
				class="icon-button"
				data-action="zoom-out">
				−</button
			><button
				class="icon-button"
				data-action="zoom-in">
				＋
			</button>
		</div>
		<p>
			Selected location: <b>${p._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${shelf.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${p._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run"><div class="power-mark" aria-label="Strip power">⚡</div>${runs[0]}<span class="strip-connector" aria-hidden="true"></span></div>
				<div class="led-run return">${runs[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button data-action="reset-led-range">Go back</button
			><button
				class="primary"
				data-action="save-led-range"
				?disabled=${start === null || end === null}>
				Save location
			</button>
		</div>
	</section>`;
};

const miniaturesTemplate = (p) => {
	const items = p._miniatures;
	const editing = items.find((item) => item.id === p._editingMiniId);
	return html`<div class="miniatures-grid">
		<section class="panel-card mini-editor">
			<div class="eyebrow">
				${editing ? "EDIT MINIATURE" : "NEW MINIATURE"}
			</div>
			<h2>${editing?.name || "Add to catalogue"}</h2>
			<div class="form-grid">
				<label
					><span>Name</span
					><input
						id="mini-name"
						maxlength="80"
						.value=${editing?.name || ""} /></label
				><label
					><span>Collection</span
					><input
						id="mini-collection"
						maxlength="80"
						.value=${editing?.collection || ""} /></label
				><label
					><span>Artist</span
					><input
						id="mini-artist"
						maxlength="80"
						.value=${editing?.artist || ""}
				/></label>
			</div>
			<div class="button-row end">
				${editing
					? html`<button data-action="cancel-mini">Cancel</button>`
					: nothing}<button
					class="primary"
					data-action="save-mini">
					${editing ? "Save changes" : "Add miniature"}
				</button>
			</div>
		</section>
		<section class="panel-card mini-list-card">
			<div class="section-heading">
				<div>
					<div class="eyebrow">CATALOGUE</div>
					<h2>${items.length} miniatures</h2>
				</div>
			</div>
			<div class="mini-list">
				${items.map(
					(item) =>
						html`<div class="mini-row">
							${avatar(item.name)}
							<div class="mini-main">
								<b>${item.name}</b
								><span
									>${item.collection || "No collection"}</span
								>
							</div>
							<div class="mini-artist">
								${item.artist || "Unknown artist"}
							</div>
							<div
								class="position-badge ${item.shelf
									? ""
									: "unassigned"}">
								${item.shelf
									? `S${item.shelf} · L${item.location}`
									: "Unassigned"}
							</div>
							<div class="row-actions">
								<button
									class="ghost"
									data-action="edit-mini"
									data-id=${item.id}>
									Edit</button
								><button
									class="danger ghost"
									data-action="delete-mini"
									data-id=${item.id}>
									Delete
								</button>
							</div>
						</div>`,
				)}
			</div>
		</section>
	</div>`;
};

const searchTemplate = (p) =>
	html`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${p._searchQuery} /><select
				id="search-field"
				.value=${p._searchField}>
				<option value="all">All fields</option>
				<option value="name">Name</option>
				<option value="collection">Collection</option>
				<option value="artist">Artist</option>
			</select>
		</div>
		<div
			id="search-summary"
			class="search-summary muted">
			Start typing to search.
		</div>
		<div
			id="search-results"
			class="search-results"></div>
	</section>`;

const viewTemplate = (p) => {
	const item = p._viewItem(p._viewIndex);
	if (!item)
		return html`<cabinet-panel-card class="view-card empty-state">
			<b>No assigned miniatures</b>
		</cabinet-panel-card>`;
	return html`<section class="panel-card view-card">
		<div id="view-selection">
			${avatar(item.name)}
			<h3>${item.name}</h3>
			<p>
				${item.collection || "No collection"} ·
				${item.artist || "Unknown artist"}
			</p>
			<div class="view-position">
				SHELF ${item.shelf} · LOCATION ${item.location}
			</div>
		</div>
		<div class="picker-shell">
			<cabinet-dial-picker
				.value=${p._viewIndex}
				.total=${p._assignedMiniatures.length}
				.ticks=${3}
				@dial-change=${(event) => p._setViewIndex(event.detail.value)}>
			</cabinet-dial-picker>
		</div>
		<div class="view-actions">
			<button data-action="clear-view-highlight">Stop locating</button>
		</div>
	</section>`;
};
