import type { TemplateResult } from "lit";
import type { PanelTemplateContext } from "./panel-template-types.js";
import { configurationTemplate } from "./templates/configuration-template.js";
import { miniaturesTemplate } from "./templates/miniatures-template.js";
import { searchTemplate } from "./templates/search-template.js";
import { viewTemplate } from "./templates/view-template.js";

const templates = {
	configuration: configurationTemplate,
	miniatures: miniaturesTemplate,
	search: searchTemplate,
	view: viewTemplate,
} as const;

export const panelContent = (
	panel: PanelTemplateContext,
): TemplateResult => templates[panel._active](panel);
