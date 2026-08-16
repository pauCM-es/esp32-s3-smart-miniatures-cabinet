import { html, type TemplateResult } from "lit";
import { hsvToHex } from "../miniature-palette.js";
import { isAssignedMiniature } from "../panel-selectors.js";
import type { PanelTemplateContext } from "../panel-template-types.js";
import { cabinetSummaryTemplate } from "./cabinet-summary-template.js";
import {
	avatarTemplate,
	dialTemplate,
	eventValue,
} from "./template-primitives.js";

const sceneIds = ["off", "display", "showcase"] as const;

const setPwmBrightnessFromPointer = (
	panel: PanelTemplateContext,
	event: PointerEvent,
): void => {
	const target = event.currentTarget as HTMLElement;
	const bounds = target.getBoundingClientRect();
	const x = event.clientX - bounds.left - bounds.width / 2;
	const y = event.clientY - bounds.top - bounds.height / 2;
	let angle = (Math.atan2(y, x) * 180) / Math.PI;
	if (angle < 135) angle += 360;
	const clampedAngle = Math.max(135, Math.min(405, angle));
	panel.actions.setCabinetBrightness(
		Math.round(((clampedAngle - 135) / 270) * 100),
	);
};

const handlePwmBrightnessKey = (
	panel: PanelTemplateContext,
	event: KeyboardEvent,
): void => {
	const step = event.shiftKey ? 10 : 5;
	let brightness: number | null = null;
	if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
		brightness = panel._cabinetBrightness - step;
	}
	if (event.key === "ArrowRight" || event.key === "ArrowUp") {
		brightness = panel._cabinetBrightness + step;
	}
	if (event.key === "Home") brightness = 0;
	if (event.key === "End") brightness = 100;
	if (brightness === null) return;
	event.preventDefault();
	panel.actions.setCabinetBrightness(Math.max(0, Math.min(100, brightness)));
};

const setPaletteColorFromPointer = (
	panel: PanelTemplateContext,
	event: PointerEvent,
): void => {
	const target = event.currentTarget as HTMLElement;
	const bounds = target.getBoundingClientRect();
	const x = event.clientX - bounds.left - bounds.width / 2;
	const y = event.clientY - bounds.top - bounds.height / 2;
	const radius = Math.min(bounds.width, bounds.height) / 2;
	const saturation = Math.min(1, Math.hypot(x, y) / radius);
	// The wheel's conic gradient starts red at the left edge.
	const hue = (Math.atan2(y, x) * 180) / Math.PI + 180;
	panel.actions.setPaletteColor(hsvToHex(hue, saturation));
};

const pwmLightTemplate = (panel: PanelTemplateContext): TemplateResult => {
	const arcAngle = 135 + panel._cabinetBrightness * 2.7;
	const radians = (arcAngle * Math.PI) / 180;
	const dotX = 50 + 43 * Math.cos(radians);
	const dotY = 50 + 43 * Math.sin(radians);
	return html`<section class="panel-card pwm-light-card">
		<span class="pwm-light-menu" aria-hidden="true">⋮</span>
		<div
			class="pwm-arc"
			role="slider"
			tabindex="0"
			aria-label="Cabinet brightness"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow=${panel._cabinetBrightness}
			@keydown=${(event: KeyboardEvent) =>
				handlePwmBrightnessKey(panel, event)}
			@pointerdown=${(event: PointerEvent) => {
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
				setPwmBrightnessFromPointer(panel, event);
			}}
			@pointermove=${(event: PointerEvent) => {
				if (event.buttons === 1) setPwmBrightnessFromPointer(panel, event);
			}}>
			<svg viewBox="0 0 200 200" aria-hidden="true">
				<path d="M39 161 A86 86 0 1 1 161 161" />
				<path
					class="pwm-arc-progress"
					d="M39 161 A86 86 0 1 1 161 161"
					pathLength="100"
					style=${`stroke-dasharray:${panel._cabinetBrightness} 100`}/>
			</svg>
			<span
				class="pwm-arc-dot"
				style=${`--arc-dot-x:${dotX}%;--arc-dot-y:${dotY}%`}></span>
		</div>
		<button
			type="button"
			class="pwm-bulb ${panel._cabinetPower ? "on" : "off"}"
			role="switch"
			aria-checked=${String(panel._cabinetPower)}
			aria-label="Cabinet power"
			@click=${() => panel.actions.setCabinetPower(!panel._cabinetPower)}>
			<svg viewBox="0 0 64 64" aria-hidden="true">
				<path d="M22 37a17 17 0 1 1 20 0c-3 2-4 5-4 8H26c0-3-1-6-4-8Z" />
				<path d="M27 51h10M29 56h6" />
				${panel._cabinetPower
					? null
					: html`<path class="pwm-bulb-slash" d="m15 15 34 34" />`}
			</svg>
		</button>
		<div class="pwm-light-label">
			<b>Cabinet light</b>
			<span>${panel._cabinetPower ? `${panel._cabinetBrightness}%` : "Off"}</span>
		</div>
	</section>`;
};

const miniatureLightsTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => html`<div class="miniature-light-widgets">
	<section class="panel-card miniature-widget-card">
		<div class="miniature-widget-heading">
			<div class="mini-widget-icon" aria-hidden="true">▰</div>
			<div><b>Miniature Lights Power</b><span>${panel._miniaturePower ? "On" : "Off"}</span></div>
		</div>
		<button
			type="button"
			class="ha-power-toggle ${panel._miniaturePower ? "on" : ""}"
			role="switch"
			aria-checked=${String(panel._miniaturePower)}
			aria-label="Miniature lights power"
			@click=${() =>
				panel.actions.setMiniatureLights({ power: !panel._miniaturePower })}>
			<span></span>
		</button>
	</section>
	<section class="panel-card miniature-widget-card">
		<div class="miniature-widget-heading">
			<div class="mini-widget-icon sliders" aria-hidden="true">⌁</div>
			<div><b>Miniature Lights Brightness</b><span>${panel._miniatureBrightness}%</span></div>
		</div>
		<input
			class="ha-brightness-slider"
			style=${`--brightness:${panel._miniatureBrightness}%`}
			aria-label="Miniature lights brightness"
			type="range"
			min="0"
			max="100"
			.value=${String(panel._miniatureBrightness)}
			@input=${(event: Event) =>
				panel.actions.setMiniatureLights({ brightness: eventValue(event) })} />
	</section>
	<section
		class="panel-card miniature-widget-card miniature-colour-widget"
		role="button"
		tabindex="0"
		aria-label="Edit miniature light palette"
		@click=${panel.actions.openPaletteEditor}
		@keydown=${(event: KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				panel.actions.openPaletteEditor();
			}
		}}>
		<div class="miniature-widget-heading">
			<div class="mini-widget-icon colour" aria-hidden="true">▰</div>
			<div><b>Miniature Lights Colour</b><span>Preset or custom colour</span></div>
		</div>
		<div class="color-swatches" role="group" aria-label="Miniature light colour">
			${panel._miniaturePalette.map(
				(color) => html`<button
					type="button"
					class="color-swatch ${panel._miniatureColor.toLocaleLowerCase() === color
						? "selected"
						: ""}"
					style=${`--swatch:${color}`}
					aria-label=${`Set colour to ${color}`}
					aria-pressed=${String(
						panel._miniatureColor.toLocaleLowerCase() === color,
					)}
					@click=${(event: Event) => {
						event.stopPropagation();
						panel.actions.setMiniatureLights({ color });
					}}></button>`,
			)}
		</div>
	</section>
</div>`;

const paletteEditorTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => {
	if (!panel._paletteEditorOpen) return html``;
	const selectedColor =
		panel._miniaturePalette[panel._paletteSelectedIndex] ||
		panel._miniatureColor;
	return html`<div
		class="palette-sheet-backdrop"
		@click=${panel.actions.closePaletteEditor}>
		<section
			class="palette-sheet"
			role="dialog"
			aria-modal="true"
			aria-label="Edit miniature light palette"
			@click=${(event: Event) => event.stopPropagation()}>
			<div class="palette-sheet-handle" aria-hidden="true"></div>
			<header class="palette-sheet-header">
				<div>
					<div class="eyebrow">SMART CABINET</div>
					<h2>Miniature Lights</h2>
				</div>
				<button
					type="button"
					class="icon-button palette-sheet-close"
					aria-label="Close palette editor"
					@click=${panel.actions.closePaletteEditor}>
					×
				</button>
			</header>
			<div class="palette-current-colour" aria-live="polite">
				${selectedColor.toLocaleUpperCase()}
			</div>
			<div
				class="palette-colour-wheel"
				role="button"
				tabindex="0"
				aria-label="Choose a replacement colour for the selected preset"
				@pointerdown=${(event: PointerEvent) =>
					setPaletteColorFromPointer(panel, event)}
				@keydown=${(event: KeyboardEvent) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						(event.currentTarget as HTMLInputElement).click();
					}
				}}>
				<span
					class="palette-colour-wheel-marker"
					style=${`--selected-colour:${selectedColor}`}></span>
			</div>
			<div class="palette-editor-list" role="list" aria-label="Palette presets">
				${panel._miniaturePalette.map(
					(color, index) => html`<div class="palette-editor-item" role="listitem">
						<button
							type="button"
							class="palette-editor-swatch ${index === panel._paletteSelectedIndex
								? "selected"
								: ""}"
							style=${`--swatch:${color}`}
							draggable="true"
							aria-label=${`Select ${color}; drag to reorder`}
							aria-pressed=${String(index === panel._paletteSelectedIndex)}
							@click=${() => panel.actions.selectPaletteColor(index)}
							@dragstart=${(event: DragEvent) =>
								panel.actions.startPaletteDrag(index, event)}
							@dragover=${(event: DragEvent) => event.preventDefault()}
							@drop=${(event: DragEvent) =>
								panel.actions.dropPaletteColor(index, event)}
							@dragend=${panel.actions.finishPaletteDrag}></button>
						<button
							type="button"
							class="palette-remove"
							aria-label=${`Remove ${color}`}
							?disabled=${panel._miniaturePalette.length <= 1}
							@click=${() => panel.actions.removePaletteColor(index)}>
							−
						</button>
					</div>`,
				)}
			</div>
			<footer class="palette-sheet-footer">
				<button type="button" class="palette-add" @click=${panel.actions.addPaletteColor}>
					＋ Add colour
				</button>
				<button type="button" class="primary" @click=${panel.actions.closePaletteEditor}>
					Done
				</button>
			</footer>
		</section>
	</div>`;
};

const lightControlsTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => html`<section class="light-controls-grid">
	${pwmLightTemplate(panel)}${miniatureLightsTemplate(panel)}
</section>`;

const viewControlsTemplate = (panel: PanelTemplateContext): TemplateResult => {
	const scene =
		panel._hass?.states?.[panel._config.scene_entity]?.state || "Off";
	const currentScene = scene.toLocaleLowerCase();
	return html`${lightControlsTemplate(panel)}<div class="view-controls-grid">
		<section class="panel-card view-control-card">
			<div class="eyebrow">SCENES</div>
			<h3>Current: ${scene}</h3>
			<p>
				Choosing a scene stops locating and restores the full strip
				output.
			</p>
			<div class="scene-list">
				${sceneIds.map(
					(sceneId) =>
						html`<button
							type="button"
							class="scene-button ${currentScene === sceneId
								? "active"
								: ""}"
							aria-pressed=${String(currentScene === sceneId)}
							@click=${() => panel.actions.applyScene(sceneId)}>
							${sceneId[0].toUpperCase() + sceneId.slice(1)}
						</button>`,
				)}
			</div>
		</section>
	</div>${paletteEditorTemplate(panel)}`;
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
			${avatarTemplate(item.name)}
			<div class="view-mini-content">
				<div class="view-index">
					${panel._viewIndex + 1} /
					${panel._assignedMiniatures.length}
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
				panel,
				panel._viewIndex,
				panel._assignedMiniatures.length,
				false,
				(value) => panel.actions.setViewIndex(value),
			)}
		</div>
		<div class="view-actions">
			<button
				type="button"
				@click=${panel.actions.clearViewHighlight}>
				Stop locating
			</button>
		</div>
	</section>`;
};

export const viewTemplate = (panel: PanelTemplateContext): TemplateResult =>
	html`${viewControlsTemplate(panel)}${selectedMiniatureTemplate(
		panel,
	)}${cabinetSummaryTemplate(panel)}`;
