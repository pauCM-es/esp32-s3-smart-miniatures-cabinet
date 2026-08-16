import { html, type TemplateResult } from "lit";
import { isAssignedMiniature } from "../panel-selectors.js";
import type { PanelTemplateContext } from "../panel-template-types.js";
import { cabinetSummaryTemplate } from "./cabinet-summary-template.js";
import {
	avatarTemplate,
	dialTemplate,
	eventValue,
} from "./template-primitives.js";

const sceneIds = ["off", "display", "showcase"] as const;

const viewControlsTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => {
	const scene = panel._hass?.states?.[panel._config.scene_entity]?.state || "Off";
	const currentScene = scene.toLocaleLowerCase();
	return html`<div class="view-controls-grid">
		<section class="panel-card view-control-card">
			<div class="eyebrow">SCENES</div>
			<h3>Current: ${scene}</h3>
			<p>Choosing a scene stops locating and restores the full strip output.</p>
			<div class="scene-list">
				${sceneIds.map(
					(sceneId) => html`<button
						type="button"
						class="scene-button ${currentScene === sceneId ? "active" : ""}"
						aria-pressed=${String(currentScene === sceneId)}
						@click=${() => panel.actions.applyScene(sceneId)}>
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
					.value=${panel._miniatureColor}
					@change=${(event: Event) =>
						panel.actions.setMiniatureLights({ color: eventValue(event) })} /></label>
				<label><span>Brightness</span><input
					type="range"
					min="0"
					max="100"
					.value=${String(panel._miniatureBrightness)}
					@input=${(event: Event) =>
						panel.actions.setMiniatureLights({ brightness: eventValue(event) })} /></label>
				<output>${panel._miniatureBrightness}%</output>
			</div>
		</section>
	</div>`;
};

const selectedMiniatureTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => {
	const item = panel._viewItem(panel._viewIndex);
	if (!item) {
		return html`<cabinet-panel-card class="view-card empty-state">
			<b>No assigned miniatures</b>
		</cabinet-panel-card>`;
	}
	const unassigned = panel._miniatures.filter(
		(miniature) => !isAssignedMiniature(miniature),
	).length;
	return html`<section class="panel-card view-card">
		<div class="section-heading view-heading">
			<div><div class="eyebrow">CABINET VIEW</div><h2>Browse miniatures</h2></div>
			<span class="position-badge unassigned">${unassigned} unassigned</span>
		</div>
		<div id="view-selection" class="view-mini-card">
			${avatarTemplate(item.name)}
			<div class="view-mini-content">
				<div class="view-index">${panel._viewIndex + 1} / ${panel._assignedMiniatures.length}</div>
				<h3>${item.name}</h3>
				<p>${item.collection || "No collection"} · ${item.artist || "Unknown artist"}</p>
			</div>
		</div>
		<div class="view-position">SHELF ${item.shelf} · LOCATION ${item.location}</div>
		<div class="picker-shell">
			<div class="picker-caption">Swipe or drag to locate</div>
			${dialTemplate(
				panel,
				panel._viewIndex,
				panel._assignedMiniatures.length,
				false,
				(value) => panel.actions.setViewIndex(value),
			)}
		</div>
		<div class="view-actions">
			<button type="button" @click=${panel.actions.clearViewHighlight}>Stop locating</button>
		</div>
	</section>`;
};

export const viewTemplate = (panel: PanelTemplateContext): TemplateResult =>
	html`${selectedMiniatureTemplate(panel)}${viewControlsTemplate(panel)}${cabinetSummaryTemplate(panel)}`;
