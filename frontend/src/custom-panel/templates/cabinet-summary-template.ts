import { html, type TemplateResult } from "lit";
import {
	indexMiniaturesByLocation,
	locationKey,
	mappedLocations,
} from "../panel-selectors.js";
import type { PanelTemplateContext } from "../panel-template-types.js";
import type { Location, Shelf } from "../panel-types.js";

const shelfSummaryTemplate = (
	panel: PanelTemplateContext,
	shelf: Shelf,
	miniaturesByLocation: ReturnType<typeof indexMiniaturesByLocation>,
): TemplateResult => {
	const mapped = mappedLocations(shelf);
	const assignedCount = mapped.filter((location) =>
		miniaturesByLocation.has(locationKey(shelf.shelf, location.location)),
	).length;
	return html`<section class="summary-shelf">
		<header class="summary-shelf-heading">
			<b>Shelf ${shelf.shelf}</b>
			<span>${mapped.length} mapped · ${assignedCount} assigned</span>
		</header>
		<div class="summary-scroll">
			<div class="summary-map ${shelf.mirrored ? "mirrored" : ""}">
				<div class="summary-run forward"></div>
				<div class="summary-run return"></div>
				<div class="summary-connector" aria-hidden="true"></div>
				${mapped.map((location) =>
					locationTemplate(panel, shelf, location, miniaturesByLocation),
				)}
			</div>
		</div>
	</section>`;
};

const locationTemplate = (
	panel: PanelTemplateContext,
	shelf: Shelf,
	location: Location,
	miniaturesByLocation: ReturnType<typeof indexMiniaturesByLocation>,
): TemplateResult => {
	const anchor = panel._summaryLocationAnchor(shelf, location);
	const miniature = miniaturesByLocation.get(
		locationKey(shelf.shelf, location.location),
	);
	const isSource =
		panel._summaryMoveSource?.shelf === shelf.shelf &&
		panel._summaryMoveSource.location === location.location;
	const isTarget =
		panel._summaryMoveTarget?.shelf === shelf.shelf &&
		panel._summaryMoveTarget.location === location.location;
	const isSelected =
		panel._summarySelected?.shelf === shelf.shelf &&
		panel._summarySelected.location === location.location;
	const label = miniature
		? `Location ${location.location}: ${miniature.name}`
		: `Location ${location.location}: no miniature assigned`;
	return html`<button
		type="button"
		class="summary-hex ${anchor.run} ${miniature ? "assigned" : ""} ${isSelected
			? "selected"
			: ""} ${isSource ? "moving" : ""} ${isTarget ? "target" : ""}"
		style=${`--anchor:${anchor.percent}`}
		aria-label=${label}
		aria-pressed=${String(isSelected)}
		@click=${() =>
			panel.actions.selectSummaryLocation(shelf.shelf, location.location)}
		title=${label}>
		<span>${location.location}</span>
	</button>`;
};

export const cabinetSummaryTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => {
	const { shelves } = panel._layout;
	const selectedMiniature =
		panel._summarySelected &&
		panel._miniatures.find(
			(item) =>
				item.shelf === panel._summarySelected?.shelf &&
				item.location === panel._summarySelected.location,
		);
	const miniaturesByLocation = indexMiniaturesByLocation(
		panel._assignedMiniatures,
	);
	return html`<section
		class="panel-card cabinet-summary"
		@click=${(event: Event) => event.stopPropagation()}>
		<div class="section-heading">
			<div><div class="eyebrow">CABINET SUMMARY</div><h2>All shelves</h2></div>
			<div class="summary-actions">
				<span class="muted">${panel._summaryMoveSource
					? "Choose a target location."
					: "Tap a location to locate it."}</span>
				<button
					type="button"
					class="small"
					?disabled=${!selectedMiniature || Boolean(panel._summaryMoveSource)}
					@click=${panel.actions.startSummaryMove}>
					Move
				</button>
			</div>
		</div>
		${shelves.length
			? html`<div class="summary-shelves">
					${shelves.map((shelf) =>
						shelfSummaryTemplate(panel, shelf, miniaturesByLocation),
					)}
				</div>`
			: html`<div class="empty-state"><b>Waiting for cabinet layout</b></div>`}
	</section>`;
};
