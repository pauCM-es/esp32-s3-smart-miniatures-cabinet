import { html, nothing, type TemplateResult } from "lit";
import { sortControls } from "../../components/cabinet-sort-controls.js";
import { sortMiniatures } from "../miniature-sort.js";
import { catalogueMiniatures } from "../panel-selectors.js";
import type { PanelTemplateContext } from "../panel-template-types.js";
import type { Miniature } from "../panel-types.js";
import {
	avatarTemplate,
	iconButtonTemplate,
} from "./template-primitives.js";

const miniatureFormTemplate = (
	panel: PanelTemplateContext,
	editing: Miniature | undefined,
): TemplateResult => html`<section class="panel-card mini-editor">
	<div class="eyebrow">${editing ? "EDIT MINIATURE" : "NEW MINIATURE"}</div>
	<h2>${editing?.name || "Add to catalogue"}</h2>
	<div class="form-grid">
		<label><span>Name</span><input id="mini-name" maxlength="80" .value=${editing?.name || ""} /></label>
		<label><span>Collection</span><input
			id="mini-collection"
			maxlength="80"
			.value=${editing?.collection || ""} /></label>
		<label><span>Artist</span><input id="mini-artist" maxlength="80" .value=${editing?.artist || ""} /></label>
	</div>
	<div class="button-row end">
		<button type="button" @click=${panel.actions.cancelMini}>Cancel</button>
		<button type="button" class="primary" @click=${panel.actions.saveMini}>
			${editing ? "Save changes" : "Add miniature"}
		</button>
	</div>
</section>`;

const miniatureActionsTemplate = (
	panel: PanelTemplateContext,
	item: Miniature,
	isGrid: boolean,
): TemplateResult => {
	if (isGrid) {
		return html`${iconButtonTemplate({
			label: `Edit ${item.name}`,
			icon: "edit",
			onClick: () => panel.actions.editMini(item.id),
		})}${iconButtonTemplate({
			label: `Delete ${item.name}`,
			icon: "delete",
			className: "danger",
			onClick: () => panel.actions.deleteMini(item.id),
		})}`;
	}
	return html`<button type="button" class="ghost" @click=${() => panel.actions.editMini(item.id)}>Edit</button>
		<button type="button" class="danger ghost" @click=${() => panel.actions.deleteMini(item.id)}>Delete</button>`;
};

const miniatureRowTemplate = (
	panel: PanelTemplateContext,
	item: Miniature,
	isGrid: boolean,
): TemplateResult => html`<div class="mini-row ${isGrid ? "mini-card" : ""}">
	${avatarTemplate(item.name)}
	<div class="mini-main"><b>${item.name}</b><span>${item.collection || "No collection"}</span></div>
	<div class="mini-artist">${item.artist || "Unknown artist"}</div>
	<div class="position-badge ${item.shelf ? "" : "unassigned"}">
		${item.shelf ? `S${item.shelf} · L${item.location}` : "Unassigned"}
	</div>
	<div class="row-actions">${miniatureActionsTemplate(panel, item, isGrid)}</div>
</div>`;

const catalogueViewToggleTemplate = (
	panel: PanelTemplateContext,
	isGrid: boolean,
): TemplateResult => html`<div class="view-toggle" role="group" aria-label="Catalogue view">
	${iconButtonTemplate({
		label: "List view",
		icon: "list",
		className: isGrid ? "" : "active",
		pressed: !isGrid,
		onClick: () => panel.actions.setCatalogueView("list"),
	})}
	${iconButtonTemplate({
		label: "Grid view",
		icon: "grid",
		className: isGrid ? "active" : "",
		pressed: isGrid,
		onClick: () => panel.actions.setCatalogueView("grid"),
	})}
</div>`;

export const miniaturesTemplate = (
	panel: PanelTemplateContext,
): TemplateResult => {
	const editing = panel._miniatures.find(
		(item) => item.id === panel._editingMiniId,
	);
	const showEditor = Boolean(editing || panel._addingMini);
	const items = catalogueMiniatures(panel._miniatures);
	const sortedItems = sortMiniatures(items, panel._catalogueSort);
	const isGrid = panel._catalogueView === "grid";
	return html`<div class="miniatures-grid ${showEditor ? "" : "catalogue-only"}">
		${showEditor ? miniatureFormTemplate(panel, editing) : nothing}
		<section class="panel-card mini-list-card">
			<div class="section-heading">
				<div><div class="eyebrow">CATALOGUE</div><h2>${items.length} miniatures</h2></div>
				<div class="catalogue-toolbar">
					${catalogueViewToggleTemplate(panel, isGrid)}
					<button type="button" class="primary small" @click=${panel.actions.addMini}>Add new mini</button>
				</div>
			</div>
			${sortControls(panel._catalogueSort, (sort) =>
				panel.actions.setSort("_catalogueSort", sort),
			)}
			<div class="mini-list ${isGrid ? "grid" : ""}">
				${sortedItems.map((item) => miniatureRowTemplate(panel, item, isGrid))}
			</div>
		</section>
	</div>`;
};
