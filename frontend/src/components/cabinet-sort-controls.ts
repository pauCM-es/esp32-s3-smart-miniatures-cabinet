import { html } from "lit";
import { miniatureSortOptions, type MiniatureSort } from "../custom-panel/miniature-sort.js";

export const sortControls = (
	selected: MiniatureSort,
	onChange: (sort: MiniatureSort) => void,
) => html`<div class="sort-controls">
	<span>Sort by</span>
	${miniatureSortOptions.map(
		([value, label]) => html`<button
			class="sort-button ${selected === value ? "active" : ""}"
			@click=${() => onChange(value)}>
			${label}
		</button>`,
	)}
</div>`;
