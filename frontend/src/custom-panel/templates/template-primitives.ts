import { html, nothing, type TemplateResult } from "lit";
import type { PanelTemplateContext } from "../panel-template-types.js";

type IconName = "edit" | "delete" | "grid" | "list";

const iconTemplate = (name: IconName): TemplateResult => {
	switch (name) {
		case "edit":
			return html`<svg viewBox="0 0 24 24">
				<path d="M12 20h9" />
				<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
			</svg>`;
		case "delete":
			return html`<svg viewBox="0 0 24 24">
				<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v4M14 11v4" />
			</svg>`;
		case "grid":
			return html`<svg viewBox="0 0 24 24">
				<rect x="4" y="4" width="6" height="6" rx="1" />
				<rect x="14" y="4" width="6" height="6" rx="1" />
				<rect x="4" y="14" width="6" height="6" rx="1" />
				<rect x="14" y="14" width="6" height="6" rx="1" />
			</svg>`;
		case "list":
			return html`<svg viewBox="0 0 24 24">
				<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
			</svg>`;
	}
};

interface IconButtonOptions {
	label: string;
	icon: IconName;
	onClick: () => void;
	className?: string;
	disabled?: boolean;
	pressed?: boolean;
}

export const iconButtonTemplate = ({
	label,
	icon,
	onClick,
	className = "",
	disabled = false,
	pressed,
}: IconButtonOptions): TemplateResult => html`<button
	type="button"
	class="icon-button ${className}"
	aria-label=${label}
	title=${label}
	aria-pressed=${pressed === undefined ? nothing : String(pressed)}
	?disabled=${disabled}
	@click=${onClick}>
	${iconTemplate(icon)}
</button>`;

export const avatarTemplate = (name?: string): TemplateResult =>
	html`<div class="mini-avatar" aria-hidden="true">${name?.[0] || "?"}</div>`;

export const eventValue = (event: Event): string =>
	(event.currentTarget as HTMLInputElement | HTMLSelectElement).value;

export const eventChecked = (event: Event): boolean =>
	(event.currentTarget as HTMLInputElement).checked;

const updateDialFromKeyboard = (
	event: KeyboardEvent,
	selected: number,
	count: number,
	onChange: (value: number) => void,
): void => {
	let next: number | null = null;
	if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = selected - 1;
	if (event.key === "ArrowRight" || event.key === "ArrowUp") next = selected + 1;
	if (event.key === "Home") next = 0;
	if (event.key === "End") next = count - 1;
	if (next === null) return;
	event.preventDefault();
	onChange(((next % count) + count) % count);
};

export const dialTemplate = (
	panel: PanelTemplateContext,
	value: number,
	total: number,
	compact: boolean,
	onChange: (value: number) => void,
): TemplateResult => {
	const count = Math.max(1, total);
	const selected = value || 0;
	const offsets = [-3, -2, -1, 0, 1, 2, 3];
	return html`<div
		class="picker-dial ${compact ? "compact" : ""}"
		role="slider"
		tabindex="0"
		aria-label=${compact ? "Location" : "Miniature"}
		aria-valuemin="1"
		aria-valuemax=${count}
		aria-valuenow=${selected + 1}
		@keydown=${(event: KeyboardEvent) =>
			updateDialFromKeyboard(event, selected, count, onChange)}
		@pointerdown=${(event: PointerEvent) => panel._startDial(event, selected)}
		@pointermove=${(event: PointerEvent) =>
			panel._moveDial(event, count, onChange)}
		@pointerup=${(event: PointerEvent) => panel._finishDial(event)}
		@pointercancel=${(event: PointerEvent) => panel._finishDial(event)}
		@lostpointercapture=${(event: PointerEvent) => panel._finishDial(event)}>
		${offsets.map(
			(offset) => html`<span class="dial-tick ${offset === 0 ? "active" : ""}">
				${compact && offset === 0 ? html`<em>LOCATION</em>` : nothing}<i></i>
				<b>${((((selected + offset) % count) + count) % count) + 1}</b>
			</span>`,
		)}
	</div>`;
};
