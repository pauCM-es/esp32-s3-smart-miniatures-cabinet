import type {
	Layout,
	Location,
	Miniature,
	RgbColor,
	Shelf,
} from "./panel-types.js";

const asRecord = (value: unknown): Record<string, unknown> =>
	value !== null && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};

const asArray = (value: unknown): unknown[] =>
	Array.isArray(value) ? value : [];

const asNumber = (value: unknown, fallback = 0): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const asInteger = (value: unknown, fallback = 0): number =>
	Math.trunc(asNumber(value, fallback));

const asString = (value: unknown, fallback = ""): string =>
	typeof value === "string" ? value : fallback;

const optionalString = (value: unknown): string | undefined => {
	const text = asString(value);
	return text || undefined;
};

const normalizeColor = (value: unknown): RgbColor | undefined => {
	const color = asRecord(value);
	if (!("r" in color) || !("g" in color) || !("b" in color)) return undefined;
	return {
		r: asInteger(color.r),
		g: asInteger(color.g),
		b: asInteger(color.b),
	};
};

const normalizeLocation = (value: unknown, index: number): Location => {
	const location = asRecord(value);
	return {
		location: asInteger(location.location, index + 1),
		start_led: asInteger(location.start_led),
		leds: Math.max(0, asInteger(location.leds)),
		mapped: Boolean(location.mapped),
	};
};

const normalizeShelf = (value: unknown, index: number): Shelf => {
	const shelf = asRecord(value);
	return {
		shelf: asInteger(shelf.shelf, index + 1),
		total_leds: Math.max(0, asInteger(shelf.total_leds)),
		total_locations: Math.max(0, asInteger(shelf.total_locations)),
		mirrored: Boolean(shelf.mirrored),
		locations: asArray(shelf.locations).map(normalizeLocation),
	};
};

export const normalizeLayout = (value: unknown): Layout => {
	const source = asRecord(value);
	const shelves = asArray(source.shelves).map(normalizeShelf);
	return {
		shelf_count: asInteger(source.shelf_count, shelves.length),
		highlight_color: normalizeColor(source.highlight_color),
		shelves,
	};
};

const normalizeMiniature = (value: unknown): Miniature => {
	const miniature = asRecord(value);
	return {
		id: asString(miniature.id),
		name: asString(miniature.name),
		collection: optionalString(miniature.collection),
		artist: optionalString(miniature.artist),
		date: optionalString(miniature.date),
		shelf: asInteger(miniature.shelf),
		location: asInteger(miniature.location),
		notes: optionalString(miniature.notes),
	};
};

export const normalizeMiniatures = (value: unknown): Miniature[] => {
	const source = asRecord(value);
	return asArray(source.items).map(normalizeMiniature);
};
