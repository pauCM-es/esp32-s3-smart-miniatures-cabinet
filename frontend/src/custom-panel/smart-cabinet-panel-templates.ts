import { html, nothing } from "lit";
import { sortControls } from "../components/cabinet-sort-controls.js";
import { sortMiniatures } from "./miniature-sort.js";
const avatar = (name?: string) =>
	html`<div class="mini-avatar">${name?.[0] || "?"}</div>`;

const dialTemplate = (
	p: any,
	value: number,
	total: number,
	compact: boolean,
	onChange: (value: number) => void,
) => {
	const count = Math.max(1, Number(total) || 1);
	const selected = Number(value) || 0;
	const offsets = [-3, -2, -1, 0, 1, 2, 3];
	return html`<div
		class="picker-dial ${compact ? "compact" : ""}"
		@pointerdown=${(event) => p._startDial(event, selected)}
		@pointermove=${(event) => p._moveDial(event, count, onChange)}
		@pointerup=${(event) => p._finishDial(event)}
		@pointercancel=${(event) => p._finishDial(event)}
		@lostpointercapture=${(event) => p._finishDial(event)}>
		${offsets.map(
			(offset) =>
				html`<span class="dial-tick ${offset === 0 ? "active" : ""}">
					${compact && offset === 0
						? html`<em>LOCATION</em>`
						: nothing}<i></i>
					<b
						>${((((selected + offset) % count) + count) % count) +
						1}</b
					>
				</span>`,
		)}
	</div>`;
};

export const panelContent = (panel: any) => {
	if (panel._active === "configuration") return configurationTemplate(panel);
	if (panel._active === "miniatures") return miniaturesTemplate(panel);
	if (panel._active === "view") return viewTemplate(panel);
	return searchTemplate(panel);
};

const configurationTemplate = (p: any) => {
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
						@change=${(event) =>
							p.actions.setHighlightColor(event.target.value)}
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
						@click=${() =>
							p.actions.insertShelf(shelves.length + 1)}>
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
										@click=${() =>
											p.actions.selectShelf(shelf.shelf)}>
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
											@click=${() =>
												p.actions.moveShelf(
													shelf.shelf,
													Math.max(
														1,
														shelf.shelf - 1,
													),
												)}
											?disabled=${index === 0}>
											↑</button
										><button
											class="icon-button"
											@click=${() =>
												p.actions.moveShelf(
													shelf.shelf,
													Math.min(
														shelves.length,
														shelf.shelf + 1,
													),
												)}
											?disabled=${index ===
											shelves.length - 1}>
											↓
										</button>
									</div>
								</div>
								<button
									class="insert-shelf"
									@click=${() =>
										p.actions.insertShelf(shelf.shelf + 1)}>
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
						@click=${() => p.actions.deleteShelf(selected.shelf)}
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
						@click=${p.actions.saveShelf}>
						Save shelf</button
					><button
						@click=${() =>
							p.actions.duplicateShelf(selected.shelf)}>
						Duplicate shelf</button
					><button @click=${p.actions.autoMap}>Auto map</button
					><button @click=${p.actions.clearMap}>Clear mapping</button>
				</div>
				<div class="divider"></div>
				${mappingTemplate(p, selected, selectedLocation)}
			</main>
		</div>`;
};

const mappingTemplate = (p: any, shelf: any, location: any) => {
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
			@click=${() => p.actions.selectLed(led)}
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
					.checked=${p._showAllMappings}
					@change=${(event) =>
						p.actions.setShowAllMappings(
							event.target.checked,
						)} /><span
					class="mapping-toggle-icon"
					aria-hidden="true"
					><svg viewBox="0 0 24 24">
						<path
							d="M9 18h6M10 22h4M8.5 15.5C7.6 14.5 7 13.1 7 11.5a5 5 0 0 1 10 0c0 1.6-.6 3-1.5 4" /></svg></span
				><span>Show all assigned</span></label
			>
		</div>
		<div
			class="mapping-dial-selected"
			aria-label="Selected location">
			${p._selectedLocation}
		</div>
		${dialTemplate(
			p,
			p._selectedLocation - 1,
			shelf.total_locations,
			true,
			(value) =>
				p.actions.selectMappingLocation(value, shelf.total_locations),
		)}
		<div class="mapping-tools">
			<button @click=${p.actions.toggleDirection}>
				${shelf.mirrored ? "Start at right" : "Start at left"}</button
			><button
				class="icon-button"
				@click=${() => p.actions.zoom(-0.25)}>
				−</button
			><button
				class="icon-button"
				@click=${() => p.actions.zoom(0.25)}>
				＋
			</button>
			${start !== null && end !== null
				? html`<div class="mapping-range">
						LED ${Math.min(start, end) + 1} →
						${Math.max(start, end) + 1}
						<span>${Math.abs(end - start) + 1} LEDs</span>
					</div>`
				: nothing}
		</div>
		<p>
			Selected location: <b>${p._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${shelf.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${p._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run">
					<div
						class="power-mark"
						aria-label="Strip power">
						⚡
					</div>
					${runs[0]}<span
						class="strip-connector"
						aria-hidden="true"></span>
				</div>
				<div class="led-run return">${runs[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button @click=${p.actions.resetLedRange}>Go back</button
			><button
				class="primary"
				@click=${p.actions.saveLedRange}
				?disabled=${start === null || end === null}>
				Save location
			</button>
		</div>
	</section>`;
};

const miniaturesTemplate = (p: any) => {
	const items = p._miniatures;
	const editing = items.find((item) => item.id === p._editingMiniId);
	const showEditor = Boolean(editing || p._addingMini);
	const catalogueItems = items.filter(
		(item) =>
			item.name ||
			item.collection ||
			item.artist ||
			Number(item.shelf) > 0 ||
			Number(item.location) > 0,
	);
	const sortedItems = sortMiniatures(catalogueItems, p._catalogueSort);
	const isGrid = p._catalogueView === "grid";
	return html`<div class="miniatures-grid ${showEditor ? "" : "catalogue-only"}">
		${showEditor
			? html`<section class="panel-card mini-editor">
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
				<button @click=${p.actions.cancelMini}>Cancel</button><button
					class="primary"
					@click=${p.actions.saveMini}>
					${editing ? "Save changes" : "Add miniature"}
				</button>
			</div>
		</section>`
			: nothing}
		<section class="panel-card mini-list-card">
			<div class="section-heading">
				<div>
					<div class="eyebrow">CATALOGUE</div>
					<h2>${catalogueItems.length} miniatures</h2>
				</div>
				<div class="catalogue-toolbar">
					<div class="view-toggle" role="group" aria-label="Catalogue view">
						<button class="icon-button ${isGrid ? "" : "active"}" aria-label="List view" title="List view" aria-pressed=${String(!isGrid)} @click=${() => p.actions.setCatalogueView("list")}><svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg></button>
						<button class="icon-button ${isGrid ? "active" : ""}" aria-label="Grid view" title="Grid view" aria-pressed=${String(isGrid)} @click=${() => p.actions.setCatalogueView("grid")}><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg></button>
					</div>
					<button class="primary small" @click=${p.actions.addMini}>Add new mini</button>
				</div>
			</div>
			${sortControls(p._catalogueSort, (sort) =>
				p.actions.setSort("_catalogueSort", sort),
			)}
			<div class="mini-list ${isGrid ? "grid" : ""}">
				${sortedItems.map(
					(item) =>
						html`<div class="mini-row ${isGrid ? "mini-card" : ""}">
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
								${isGrid
									? html`<button class="icon-button" aria-label="Edit ${item.name}" title="Edit ${item.name}" @click=${() => p.actions.editMini(item.id)}><svg viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg></button><button class="icon-button danger" aria-label="Delete ${item.name}" title="Delete ${item.name}" @click=${() => p.actions.deleteMini(item.id)}><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v4M14 11v4" /></svg></button>`
									: html`<button
									class="ghost"
									@click=${() => p.actions.editMini(item.id)}>
									Edit</button
								><button
									class="danger ghost"
									@click=${() =>
										p.actions.deleteMini(item.id)}>
									Delete
								</button>`}
							</div>
						</div>`,
				)}
			</div>
		</section>
	</div>`;
};

const searchTemplate = (p: any) => {
	const query = p._searchQuery.trim().toLocaleLowerCase();
	const fields =
		p._searchField === "all"
			? ["name", "collection", "artist"]
			: [p._searchField];
	const results = query
		? p._miniatures.filter((item) =>
				fields.some((key) =>
					String(item[key] || "")
						.toLocaleLowerCase()
						.includes(query),
			),
		)
		: [];
	const sortedResults = sortMiniatures(results, p._searchSort);
	const assigned = results.filter(
		(item) => item.shelf > 0 && item.location > 0,
	);
	return html`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				@input=${(event) =>
					p.actions.setSearchQuery(event.target.value)}
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${p._searchQuery} /><select
				id="search-field"
				@change=${(event) =>
					p.actions.setSearchField(event.target.value)}
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
			${query
				? `${results.length} result${results.length === 1 ? "" : "s"} · ${assigned.length} assigned`
				: "Start typing to search."}
		</div>
		${query
			? sortControls(p._searchSort, (sort) =>
					p.actions.setSort("_searchSort", sort),
				)
			: nothing}
		<div
			id="search-results"
			class="search-results">
			${query
				? sortedResults.length
					? sortedResults.map(
							(item) =>
								html`<button
									class="search-result"
									@click=${() =>
										p.actions.highlightOne(item.id)}
									?disabled=${!item.shelf}>
									${avatar(item.name)}
									<div class="search-result-main">
										<b>${item.name}</b
										><span
											>${item.collection ||
											"No collection"}
											·
											${item.artist ||
											"Unknown artist"}</span
										>
									</div>
									<span
										class="position-badge ${item.shelf
											? ""
											: "unassigned"}"
										>${item.shelf
											? `Shelf ${item.shelf} · Location ${item.location}`
											: "Unassigned"}</span
									>
								</button>`,
						)
					: html`<div class="empty-state">
							<b>No matches</b
							><span>Try another term or field.</span>
						</div>`
				: nothing}
		</div>
	</section>`;
};

const viewTemplate = (p: any) => {
	const item = p._viewItem(p._viewIndex);
	const unassigned = p._miniatures.filter(
		(miniature) =>
			Number(miniature.shelf) <= 0 || Number(miniature.location) <= 0,
	).length;
	return html`${item
		? html`<section class="panel-card view-card">
				<div class="section-heading view-heading">
					<div>
						<div class="eyebrow">CABINET VIEW</div>
						<h2>Browse miniatures</h2>
					</div>
					<span class="position-badge unassigned"
						>${unassigned} unassigned</span
					>
				</div>
				<div
					id="view-selection"
					class="view-mini-card">
					${avatar(item.name)}
					<div class="view-mini-content">
						<div class="view-index">
							${p._viewIndex + 1} /
							${p._assignedMiniatures.length}
						</div>
						<h3>${item.name}</h3>
						<p>
							${item.collection || "No collection"} ·
							${item.artist || "Unknown artist"}
						</p>
					</div>
				</div>
				<div class="view-position">
					SHELF ${item.shelf} · LOCATION ${item.location}
				</div>
				<div class="picker-shell">
					<div class="picker-caption">Swipe or drag to locate</div>
					${dialTemplate(
						p,
						p._viewIndex,
						p._assignedMiniatures.length,
						false,
						(value) => p.actions.setViewIndex(value),
					)}
				</div>
				<div class="view-actions">
					<button @click=${p.actions.clearViewHighlight}>
						Stop locating
					</button>
				</div>
	</section>`
		: html`<cabinet-panel-card class="view-card empty-state">
				<b>No assigned miniatures</b>
			</cabinet-panel-card>`}${viewControlsTemplate(p)}${cabinetSummaryTemplate(p)}`;
};

const viewControlsTemplate = (p: any) => {
	const scene = p._hass?.states?.[p._config.scene_entity]?.state || "Off";
	const currentScene = String(scene).toLocaleLowerCase();
	return html`<div class="view-controls-grid">
		<section class="panel-card view-control-card">
			<div class="eyebrow">SCENES</div>
			<h3>Current: ${scene}</h3>
			<p>Choosing a scene stops locating and restores the full strip output.</p>
			<div class="scene-list">
				${["off", "display", "showcase"].map(
					(sceneId) => html`<button
						class="scene-button ${currentScene === sceneId ? "active" : ""}"
						@click=${() => p.actions.applyScene(sceneId)}>
						${sceneId[0].toUpperCase() + sceneId.slice(1)}
					</button>`,
				)}
			</div>
		</section>
		<section class="panel-card view-control-card">
			<div class="eyebrow">MINIATURE STRIP</div>
			<h3>All miniatures</h3>
			<p>Colour or brightness stops locating and applies to the complete strip.</p>
			<div class="strip-controls">
				<label><span>Colour</span><input
					type="color"
					.value=${p._miniatureColor}
					@change=${(event) => p._setMiniatureLights({ color: event.target.value })} /></label>
				<label><span>Brightness</span><input
					type="range"
					min="0"
					max="100"
					.value=${p._miniatureBrightness}
					@input=${(event) => p._setMiniatureLights({ brightness: event.target.value })} /></label>
				<output>${p._miniatureBrightness}%</output>
			</div>
		</section>
	</div>`;
};

const cabinetSummaryTemplate = (p: any) => {
	const shelves = p._layout.shelves || [];
	const miniaturesByLocation = new Map<string, any>(
		p._assignedMiniatures.map((item) => [
			`${item.shelf}:${item.location}`,
			item,
		]),
	);
	return html`<section class="panel-card cabinet-summary">
		<div class="section-heading">
			<div>
				<div class="eyebrow">CABINET SUMMARY</div>
				<h2>All shelves</h2>
			</div>
			<span class="muted">Tap a location to locate it.</span>
		</div>
		${shelves.length
			? html`<div class="summary-shelves">
					${shelves.map((shelf) => {
						const mapped = (shelf.locations || []).filter(
							(location) => location.mapped,
						);
						const assigned = mapped.filter((location) =>
							miniaturesByLocation.has(
								`${shelf.shelf}:${location.location}`,
							),
						).length;
						return html`<section class="summary-shelf">
							<header class="summary-shelf-heading">
								<b>Shelf ${shelf.shelf}</b>
								<span
									>${mapped.length} mapped · ${assigned}
									assigned</span
								>
							</header>
							<div class="summary-scroll">
								<div
									class="summary-map ${shelf.mirrored
										? "mirrored"
										: ""}">
									<div class="summary-run forward"></div>
									<div class="summary-run return"></div>
									<div
										class="summary-connector"
										aria-hidden="true"></div>
									${mapped.map((location) => {
										const anchor = p._summaryLocationAnchor(
											shelf,
											location,
										);
										const miniature =
											miniaturesByLocation.get(
												`${shelf.shelf}:${location.location}`,
											);
										return html`<button
											class="summary-hex ${anchor.run} ${miniature
												? "assigned"
												: ""}"
											style=${`--anchor:${anchor.percent}`}
											@click=${() =>
												p._selectSummaryLocation(
													shelf.shelf,
													location.location,
												)}
											title=${miniature
												? `Location ${location.location}: ${miniature.name}`
												: `Location ${location.location}: no miniature assigned`}>
											<span>${location.location}</span>
										</button>`;
									})}
								</div>
							</div>
						</section>`;
					})}
				</div>`
			: html`<div class="empty-state">
					<b>Waiting for cabinet layout</b>
				</div>`}
	</section>`;
};
