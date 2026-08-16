const layoutEntity = "sensor.smart_cabinet_layout";
const miniaturesEntity = "sensor.smart_cabinet_miniatures";
const sceneEntity = "sensor.smart_cabinet_scene";
const location = (index, start, leds) => ({
	location: index,
	start_led: start,
	leds,
	mapped: leds > 0,
});
const shelf = (number, leds, locations, mirrored = false) => ({
	shelf: number,
	total_leds: leds,
	total_locations: locations,
	mirrored,
	locations: Array.from({ length: locations }, (_, index) =>
		location(
			index + 1,
			index * Math.floor(leds / locations),
			Math.floor(leds / locations),
		),
	),
});
const fixture = () => ({
	layout: {
		shelf_count: 5,
		highlight_color: { r: 156, g: 39, b: 176 },
		shelves: [
			shelf(1, 160, 26),
			shelf(2, 160, 26),
			shelf(3, 160, 26),
			shelf(4, 160, 26),
			shelf(5, 160, 10, true),
		],
	},
	miniatures: [
		{
			id: "dragon-01",
			name: "Forest Dragon",
			collection: "Mythic Realms",
			artist: "A. Martin",
			date: "",
			shelf: 1,
			location: 1,
			notes: "",
		},
		{
			id: "knight-02",
			name: "Silver Knight",
			collection: "Kingdoms",
			artist: "L. Perez",
			date: "",
			shelf: 1,
			location: 4,
			notes: "",
		},
		{
			id: "mage-03",
			name: "Arcane Mage",
			collection: "Mythic Realms",
			artist: "I. Gomez",
			date: "",
			shelf: 2,
			location: 2,
			notes: "",
		},
		{
			id: "unassigned-04",
			name: "Unpainted Scout",
			collection: "Work in progress",
			artist: "",
			date: "",
			shelf: 0,
			location: 0,
			notes: "",
		},
		{
			id: "marvel-01",
			name: "Captain America",
			collection: "Marvel United",
			artist: "CMon Games",
			date: "2024-06-12",
			shelf: 1,
			location: 6,
			notes: "",
		},
		{
			id: "marvel-02",
			name: "Spider-Man",
			collection: "Marvel United",
			artist: "CMon Games",
			date: "2024-07-03",
			shelf: 2,
			location: 8,
			notes: "",
		},
		{
			id: "marvel-03",
			name: "Iron Man",
			collection: "Marvel United",
			artist: "CMon Games",
			date: "2024-07-18",
			shelf: 5,
			location: 2,
			notes: "",
		},
		{
			id: "marvel-04",
			name: "Black Panther",
			collection: "Marvel United",
			artist: "CMon Games",
			date: "2024-08-02",
			shelf: 0,
			location: 0,
			notes: "",
		},
		{
			id: "marvel-05",
			name: "Scarlet Witch",
			collection: "Marvel United",
			artist: "CMon Games",
			date: "2024-08-15",
			shelf: 0,
			location: 0,
			notes: "",
		},
		{
			id: "warhammer-01",
			name: "Space Marine Intercessor",
			collection: "Warhammer 40,000",
			artist: "Games Workshop",
			date: "2024-09-01",
			shelf: 1,
			location: 10,
			notes: "",
		},
		{
			id: "warhammer-02",
			name: "Necron Warrior",
			collection: "Warhammer 40,000",
			artist: "Games Workshop",
			date: "2024-09-13",
			shelf: 3,
			location: 4,
			notes: "",
		},
		{
			id: "warhammer-03",
			name: "Ork Boy",
			collection: "Warhammer 40,000",
			artist: "Games Workshop",
			date: "2024-09-25",
			shelf: 4,
			location: 12,
			notes: "",
		},
		{
			id: "warhammer-04",
			name: "Sister of Battle",
			collection: "Warhammer 40,000",
			artist: "Games Workshop",
			date: "2024-10-06",
			shelf: 0,
			location: 0,
			notes: "",
		},
		{
			id: "warhammer-05",
			name: "Skaven Clanrat",
			collection: "Warhammer Age of Sigmar",
			artist: "Games Workshop",
			date: "2024-10-18",
			shelf: 0,
			location: 0,
			notes: "",
		},
		{
			id: "original-01",
			name: "Sunken Oracle",
			collection: "Cabinet Originals",
			artist: "Studio Aurora",
			date: "2024-11-02",
			shelf: 2,
			location: 16,
			notes: "",
		},
		{
			id: "original-02",
			name: "Copper Automaton",
			collection: "Cabinet Originals",
			artist: "Studio Aurora",
			date: "2024-11-16",
			shelf: 3,
			location: 20,
			notes: "",
		},
		{
			id: "original-03",
			name: "Moonlit Ranger",
			collection: "Cabinet Originals",
			artist: "Studio Aurora",
			date: "2024-12-01",
			shelf: 5,
			location: 7,
			notes: "",
		},
		{
			id: "original-04",
			name: "Clockwork Familiar",
			collection: "Cabinet Originals",
			artist: "Studio Aurora",
			date: "2024-12-14",
			shelf: 0,
			location: 0,
			notes: "",
		},
		{
			id: "original-05",
			name: "Frostglass Golem",
			collection: "Cabinet Originals",
			artist: "Studio Aurora",
			date: "2025-01-04",
			shelf: 0,
			location: 0,
			notes: "",
		},
	],
	scene: "Display",
});
const shelfAt = (layout, number) =>
	layout.shelves.find((item) => item.shelf === Number(number));
const reindex = (layout) => {
	layout.shelves.forEach((item, index) => {
		item.shelf = index + 1;
	});
	layout.shelf_count = layout.shelves.length;
};

export const createMockHass = (onChange) => {
	const data = fixture();
	const states = {
		[layoutEntity]: { state: "ready", attributes: data.layout },
		[miniaturesEntity]: {
			state: "ready",
			attributes: { items: data.miniatures },
		},
		[sceneEntity]: { state: data.scene, attributes: {} },
	};
	const publish = () => {
		const now = new Date().toISOString();
		Object.values(states).forEach((state) => {
			state.last_updated = now;
		});
		onChange();
	};
	const command = (payload) => {
		const selectedShelf = shelfAt(data.layout, payload.shelf);
		switch (payload.action) {
			case "setHighlightColor":
				data.layout.highlight_color = {
					r: payload.r,
					g: payload.g,
					b: payload.b,
				};
				break;
			case "insertShelf":
				data.layout.shelves.splice(
					Number(payload.position) - 1,
					0,
					shelf(0, 160, 26),
				);
				reindex(data.layout);
				break;
			case "duplicateShelf":
				if (selectedShelf) {
					data.layout.shelves.splice(
						selectedShelf.shelf,
						0,
						structuredClone(selectedShelf),
					);
					reindex(data.layout);
				}
				break;
			case "deleteShelf":
				if (selectedShelf && data.layout.shelves.length > 1) {
					data.miniatures.forEach((item) => {
						if (item.shelf === selectedShelf.shelf)
							Object.assign(item, { shelf: 0, location: 0 });
					});
					data.layout.shelves.splice(selectedShelf.shelf - 1, 1);
					reindex(data.layout);
				}
				break;
			case "moveShelf": {
				const [moved] = data.layout.shelves.splice(
					Number(payload.from) - 1,
					1,
				);
				data.layout.shelves.splice(Number(payload.to) - 1, 0, moved);
				reindex(data.layout);
				break;
			}
			case "setShelfConfig":
				if (selectedShelf) {
					selectedShelf.total_leds = Number(payload.total_leds);
					selectedShelf.total_locations = Number(
						payload.total_locations,
					);
					selectedShelf.locations = Array.from(
						{ length: selectedShelf.total_locations },
						(_, index) =>
							selectedShelf.locations[index] ||
							location(index + 1, 0, 0),
					);
				}
				break;
			case "autoMapShelf":
				if (selectedShelf) {
					const size = Math.floor(
						selectedShelf.total_leds /
							selectedShelf.total_locations,
					);
					selectedShelf.locations.forEach((item, index) =>
						Object.assign(
							item,
							location(
								index + 1,
								index * size,
								index === selectedShelf.total_locations - 1
									? selectedShelf.total_leds - index * size
									: size,
							),
						),
					);
				}
				break;
			case "clearShelfMapping":
				if (selectedShelf)
					selectedShelf.locations.forEach((item) =>
						Object.assign(item, location(item.location, 0, 0)),
					);
				break;
			case "setShelfDirection":
				if (selectedShelf)
					selectedShelf.mirrored = Boolean(payload.mirrored);
				break;
			case "setLocationConfig":
				if (selectedShelf)
					Object.assign(
						selectedShelf.locations[Number(payload.location) - 1],
						location(
							Number(payload.location),
							Number(payload.start_led),
							Number(payload.leds),
						),
					);
				break;
			case "createMiniature":
				data.miniatures.push({
					...payload,
					id: `mock-${crypto.randomUUID()}`,
				});
				break;
			case "updateMiniature": {
				const item = data.miniatures.find(
					(mini) => mini.id === payload.id,
				);
				if (item) Object.assign(item, payload);
				break;
			}
			case "deleteMiniature":
				data.miniatures.splice(
					data.miniatures.findIndex((item) => item.id === payload.id),
					1,
				);
				break;
			case "applyScene":
				data.scene =
					payload.scene[0].toUpperCase() + payload.scene.slice(1);
				states[sceneEntity].state = data.scene;
				break;
			default:
				break;
		}
		console.info("[Smart Cabinet mock]", payload);
		publish();
	};
	return {
		states,
		callService: async (domain, service, serviceData) => {
			if (domain === "mqtt" && service === "publish")
				command(JSON.parse(serviceData.payload));
		},
	};
};
