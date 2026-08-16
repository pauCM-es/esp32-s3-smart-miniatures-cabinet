export interface RgbColor {
	r: number;
	g: number;
	b: number;
}
export interface Location {
	location: number;
	start_led: number;
	leds: number;
	mapped: boolean;
}
export interface Shelf {
	shelf: number;
	total_leds: number;
	total_locations: number;
	mirrored: boolean;
	locations: Location[];
}
export interface Layout {
	shelf_count: number;
	highlight_color?: RgbColor;
	shelves: Shelf[];
}
export interface Miniature {
	id: string;
	name: string;
	collection?: string;
	artist?: string;
	date?: string;
	shelf: number;
	location: number;
	notes?: string;
}
export interface HassState {
	state: string;
	attributes: Record<string, unknown> & {
		items?: Miniature[];
		shelves?: Shelf[];
		shelf_count?: number;
		highlight_color?: RgbColor;
	};
	last_updated?: string;
}
export interface Hass {
	states: Record<string, HassState | undefined>;
	callService(
		domain: string,
		service: string,
		data: Record<string, unknown>,
	): Promise<void>;
}
export type CabinetCommand = Record<string, unknown> & { action: string };
