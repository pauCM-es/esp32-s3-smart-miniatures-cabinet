import { html, nothing, type TemplateResult } from "lit";
import { assignedLedIndexes } from "../panel-selectors.js";
import type { PanelTemplateContext } from "../panel-template-types.js";
import type { Location, Shelf } from "../panel-types.js";
import {
	dialTemplate,
	eventChecked,
} from "./template-primitives.js";

export const mappingTemplate = (
	panel: PanelTemplateContext,
	shelf: Shelf,
	location: Location | undefined,
): TemplateResult => {
	const start =
		panel._mappingStart ?? (location?.mapped ? location.start_led : null);
	const end =
		panel._mappingEnd ??
		(location?.mapped ? location.start_led + location.leds - 1 : null);
	const assigned = panel._showAllMappings
		? assignedLedIndexes(shelf)
		: new Set<number>();
	const leds = Array.from({ length: shelf.total_leds }, (_, led) => {
		const isSelected =
			start !== null &&
			end !== null &&
			led >= Math.min(start, end) &&
			led <= Math.max(start, end);
		return html`<button
			type="button"
			class="led-cell ${assigned.has(led) ? "assigned" : ""} ${isSelected
				? "selected"
				: ""} ${led === start ? "range-start" : ""} ${led === end
				? "range-end"
				: ""}"
			aria-label="LED ${led + 1}"
			aria-pressed=${String(isSelected)}
			@click=${() => panel.actions.selectLed(led)}>
			${led % 5 === 0 ? html`<small>${led + 1}</small>` : nothing}
		</button>`;
	});
	const firstRun = Math.ceil(shelf.total_leds / 2);
	const runs = shelf.mirrored
		? [leds.slice(0, firstRun).reverse(), leds.slice(firstRun)]
		: [leds.slice(0, firstRun), leds.slice(firstRun).reverse()];
	return html`<section class="mapping-visual">
		<div class="section-heading">
			<div><div class="eyebrow">LOCATIONS</div><h3>LED mapping</h3></div>
			<label class="mapping-toggle">
				<input
					id="show-all-mappings"
					type="checkbox"
					.checked=${panel._showAllMappings}
					@change=${(event: Event) =>
						panel.actions.setShowAllMappings(eventChecked(event))} />
				<span class="mapping-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24">
					<path d="M9 18h6M10 22h4M8.5 15.5C7.6 14.5 7 13.1 7 11.5a5 5 0 0 1 10 0c0 1.6-.6 3-1.5 4" />
				</svg></span>
				<span>Show all assigned</span>
			</label>
		</div>
		<div class="mapping-dial-selected" role="status" aria-live="polite">
			${panel._selectedLocation}
		</div>
		${dialTemplate(
			panel,
			panel._selectedLocation - 1,
			shelf.total_locations,
			true,
			(value) => panel.actions.selectMappingLocation(value, shelf.total_locations),
		)}
		<div class="mapping-tools">
			<button type="button" @click=${panel.actions.toggleDirection}>
				${shelf.mirrored ? "Start at right" : "Start at left"}
			</button>
			<button
				type="button"
				class="icon-button"
				aria-label="Zoom out"
				title="Zoom out"
				@click=${() => panel.actions.zoom(-0.25)}>
				−
			</button>
			<button
				type="button"
				class="icon-button"
				aria-label="Zoom in"
				title="Zoom in"
				@click=${() => panel.actions.zoom(0.25)}>
				＋
			</button>
			${start !== null && end !== null
				? html`<div class="mapping-range">
						LED ${Math.min(start, end) + 1} → ${Math.max(start, end) + 1}
						<span>${Math.abs(end - start) + 1} LEDs</span>
					</div>`
				: nothing}
		</div>
		<p>
			Selected location: <b>${panel._selectedLocation}</b>. Tap first and last
			LED to preview; save commits the range.
		</p>
		<div
			class="led-runs ${shelf.mirrored ? "mirrored" : ""}"
			style=${`--led-size:${panel._ledZoom * 9}px`}>
			<div class="led-runs-content">
				<div class="led-run">
					<div class="power-mark" role="img" aria-label="Strip power">⚡</div>
					${runs[0]}<span class="strip-connector" aria-hidden="true"></span>
				</div>
				<div class="led-run return">${runs[1]}</div>
			</div>
		</div>
		<div class="button-row end">
			<button type="button" @click=${panel.actions.resetLedRange}>Go back</button>
			<button
				type="button"
				class="primary"
				@click=${panel.actions.saveLedRange}
				?disabled=${start === null || end === null}>
				Save location
			</button>
		</div>
	</section>`;
};
