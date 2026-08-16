import type { Miniature } from "./panel-types.js";

export const miniatureSortOptions = [
	["name", "Name"],
	["location", "Location"],
	["newest", "Newest"],
] as const;

export type MiniatureSort = (typeof miniatureSortOptions)[number][0];

export const sortMiniatures = (
	items: Miniature[],
	sort: MiniatureSort = "name",
) =>
	[...items].sort((left, right) => {
		if (sort === "location") {
			const leftAssigned = Number(left.shelf) > 0 && Number(left.location) > 0;
			const rightAssigned = Number(right.shelf) > 0 && Number(right.location) > 0;
			if (leftAssigned !== rightAssigned) return leftAssigned ? -1 : 1;
			return Number(left.shelf) - Number(right.shelf) ||
				Number(left.location) - Number(right.location) ||
				String(left.name).localeCompare(String(right.name));
		}
		if (sort === "newest") {
			return Number(new Date(right.date || 0)) - Number(new Date(left.date || 0)) ||
				String(left.name).localeCompare(String(right.name));
		}
		return String(left.name).localeCompare(String(right.name));
	});
