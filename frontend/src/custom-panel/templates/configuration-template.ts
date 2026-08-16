import { html, type TemplateResult } from "lit";
import type { PanelTemplateContext } from "../panel-template-types.js";
import type { Shelf } from "../panel-types.js";
import { mappingTemplate } from "./mapping-template.js";
import { eventValue } from "./template-primitives.js";

const shelfListTemplate = (
	panel: PanelTemplateContext,
	shelves: Shelf[],
): TemplateResult => html`<aside class="panel-card shelf-list">
	<div class="section-heading">
		<div><div class="eyebrow">SHELVES</div><h3>Physical order</h3></div>
		<button
			type="button"
			class="primary small"
			@click=${() => panel.actions.insertShelf(shelves.length + 1)}>
			＋ Add shelf
		</button>
	</div>
	<div class="shelf-items">
		${shelves.map(
			(shelf, index) => html`<div
					class="shelf-row ${shelf.shelf === panel._selectedShelf
						? "selected"
						: ""}">
					<button
						type="button"
						class="shelf-select"
						aria-current=${shelf.shelf === panel._selectedShelf
							? "true"
							: "false"}
						@click=${() => panel.actions.selectShelf(shelf.shelf)}>
						<span class="shelf-number">${String(shelf.shelf).padStart(2, "0")}</span>
						<span><b>Shelf ${shelf.shelf}</b><small
							>${shelf.total_locations} locations · ${shelf.total_leds}
							LEDs</small
						></span>
					</button>
					<div class="row-actions">
						<button
							type="button"
							class="icon-button"
							aria-label="Move Shelf ${shelf.shelf} up"
							title="Move Shelf ${shelf.shelf} up"
							@click=${() =>
								panel.actions.moveShelf(
									shelf.shelf,
									Math.max(1, shelf.shelf - 1),
								)}
							?disabled=${index === 0}>
							↑
						</button>
						<button
							type="button"
							class="icon-button"
							aria-label="Move Shelf ${shelf.shelf} down"
							title="Move Shelf ${shelf.shelf} down"
							@click=${() =>
								panel.actions.moveShelf(
									shelf.shelf,
									Math.min(shelves.length, shelf.shelf + 1),
								)}
							?disabled=${index === shelves.length - 1}>
							↓
						</button>
					</div>
				</div>
				<button
					type="button"
					class="insert-shelf"
					@click=${() => panel.actions.insertShelf(shelf.shelf + 1)}>
					＋ Insert shelf here
				</button>`,
		)}
	</div>
</aside>`;

const shelfDetailTemplate = (
	panel: PanelTemplateContext,
	selected: Shelf,
	shelfCount: number,
): TemplateResult => {
	const selectedLocation = selected.locations[panel._selectedLocation - 1];
	return html`<main class="panel-card shelf-detail">
		<div class="section-heading detail-heading">
			<div><div class="eyebrow">SELECTED SHELF</div><h2>Shelf ${selected.shelf}</h2></div>
			<button
				type="button"
				class="danger ghost"
				@click=${() => panel.actions.deleteShelf(selected.shelf)}
				?disabled=${shelfCount <= 1}>
				Delete shelf
			</button>
		</div>
		<div class="form-grid two">
			<label><span>Total LEDs</span><input
				id="shelf-leds"
				type="number"
				min="1"
				.value=${String(selected.total_leds)} /></label>
			<label><span>Total locations</span><input
				id="shelf-locations"
				type="number"
				min="1"
				.value=${String(selected.total_locations)} /></label>
		</div>
		<div class="button-row">
			<button type="button" class="primary" @click=${panel.actions.saveShelf}>Save shelf</button>
			<button type="button" @click=${() => panel.actions.duplicateShelf(selected.shelf)}>Duplicate shelf</button>
			<button type="button" @click=${panel.actions.autoMap}>Auto map</button>
			<button type="button" @click=${panel.actions.clearMap}>Clear mapping</button>
		</div>
		<div class="divider"></div>
		${mappingTemplate(panel, selected, selectedLocation)}
	</main>`;
};

export const configurationTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => {
	const { _layout: layout } = panel;
	const { shelves } = layout;
	if (!shelves.length) {
		return html`<div class="empty-state">
			<b>Waiting for cabinet layout</b>
			<span>The panel will populate when the ESP32 publishes its retained layout state.</span>
		</div>`;
	}
	const selected = shelves[panel._selectedShelf - 1] ?? shelves[0];
	return html`<section class="general-card panel-card">
		<div>
			<div class="eyebrow">GENERAL</div>
			<h2>Cabinet configuration</h2>
			<p>Physical structure and the color used to identify miniature locations.</p>
		</div>
		<div class="general-values">
			<div class="metric"><span>Shelves</span><b>${layout.shelf_count || shelves.length}</b></div>
			<label class="color-control">
				<span>Highlight color</span>
				<input
					id="highlight-color"
					type="color"
					@change=${(event: Event) =>
						panel.actions.setHighlightColor(eventValue(event))}
					.value=${panel._rgbToHex(
						layout.highlight_color || { r: 156, g: 39, b: 176 },
					)} />
			</label>
		</div>
	</section>
	<div class="configuration-grid">
		${shelfListTemplate(panel, shelves)}
		${shelfDetailTemplate(panel, selected, shelves.length)}
	</div>`;
};
