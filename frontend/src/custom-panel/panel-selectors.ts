import type { MiniatureSearchField } from "./panel-template-types.js";
import type { Location, Miniature, Shelf } from "./panel-types.js";

export const isAssignedMiniature = (miniature: Miniature): boolean =>
	miniature.shelf > 0 && miniature.location > 0;

export const catalogueMiniatures = (miniatures: Miniature[]): Miniature[] =>
	miniatures.filter(
		(item) =>
			item.name ||
			item.collection ||
			item.artist ||
			isAssignedMiniature(item),
	);

export const searchMiniatures = (
	miniatures: Miniature[],
	query: string,
	field: MiniatureSearchField,
): Miniature[] => {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	if (!normalizedQuery) return [];
	const fields: Array<keyof Pick<Miniature, "name" | "collection" | "artist">> =
		field === "all" ? ["name", "collection", "artist"] : [field];
	return miniatures.filter((item) =>
		fields.some((key) =>
			String(item[key] || "")
				.toLocaleLowerCase()
				.includes(normalizedQuery),
		),
	);
};

export const locationKey = (shelf: number, location: number): string =>
	`${shelf}:${location}`;

export const indexMiniaturesByLocation = (
	miniatures: Miniature[],
): ReadonlyMap<string, Miniature> =>
	new Map(
		miniatures.map((item) => [locationKey(item.shelf, item.location), item]),
	);

export const mappedLocations = (shelf: Shelf): Location[] =>
	shelf.locations.filter((location) => location.mapped);

export const assignedLedIndexes = (shelf: Shelf): ReadonlySet<number> => {
	const indexes = new Set<number>();
	for (const location of shelf.locations) {
		if (!location.mapped) continue;
		for (let offset = 0; offset < location.leds; offset += 1) {
			indexes.add(location.start_led + offset);
		}
	}
	return indexes;
};
