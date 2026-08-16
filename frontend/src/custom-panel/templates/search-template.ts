import { html, nothing, type TemplateResult } from "lit";
import { sortControls } from "../../components/cabinet-sort-controls.js";
import { sortMiniatures } from "../miniature-sort.js";
import {
	isAssignedMiniature,
	searchMiniatures,
} from "../panel-selectors.js";
import type { PanelTemplateContext } from "../panel-template-types.js";
import type { Miniature } from "../panel-types.js";
import { avatarTemplate, eventValue } from "./template-primitives.js";

const searchResultTemplate = (
	panel: PanelTemplateContext,
	item: Miniature,
): TemplateResult => html`<button
	type="button"
	class="search-result"
	@click=${() => panel.actions.highlightOne(item.id)}
	?disabled=${!isAssignedMiniature(item)}>
	${avatarTemplate(item.name)}
	<div class="search-result-main">
		<b>${item.name}</b>
		<span>${item.collection || "No collection"} · ${item.artist || "Unknown artist"}</span>
	</div>
	<span class="position-badge ${isAssignedMiniature(item) ? "" : "unassigned"}">
		${isAssignedMiniature(item)
			? `Shelf ${item.shelf} · Location ${item.location}`
			: "Unassigned"}
	</span>
</button>`;

export const searchTemplate = (panel: PanelTemplateContext): TemplateResult => {
	const query = panel._searchQuery.trim().toLocaleLowerCase();
	const results = searchMiniatures(
		panel._miniatures,
		query,
		panel._searchField,
	);
	const sortedResults = sortMiniatures(results, panel._searchSort);
	const assignedCount = results.filter(isAssignedMiniature).length;
	return html`<section class="panel-card search-card">
		<div class="eyebrow">FIND & HIGHLIGHT</div>
		<h2>Find a miniature in the cabinet</h2>
		<div class="search-controls">
			<input
				id="search-query"
				type="search"
				@input=${(event: Event) => panel.actions.setSearchQuery(eventValue(event))}
				placeholder="Search miniatures…"
				autocomplete="off"
				.value=${panel._searchQuery} />
			<select
				id="search-field"
				aria-label="Search field"
				@change=${(event: Event) =>
					panel.actions.setSearchField(
						eventValue(event) as typeof panel._searchField,
					)}
				.value=${panel._searchField}>
				<option value="all">All fields</option>
				<option value="name">Name</option>
				<option value="collection">Collection</option>
				<option value="artist">Artist</option>
			</select>
		</div>
		<div id="search-summary" class="search-summary muted" aria-live="polite">
			${query
				? `${results.length} result${results.length === 1 ? "" : "s"} · ${assignedCount} assigned`
				: "Start typing to search."}
		</div>
		${query
			? sortControls(panel._searchSort, (sort) =>
					panel.actions.setSort("_searchSort", sort),
				)
			: nothing}
		<div id="search-results" class="search-results">
			${query
				? sortedResults.length
					? sortedResults.map((item) => searchResultTemplate(panel, item))
					: html`<div class="empty-state"><b>No matches</b><span>Try another term or field.</span></div>`
				: nothing}
		</div>
	</section>`;
};
