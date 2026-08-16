export const DEFAULT_MINIATURE_PALETTE = [
	"#ff8a00",
	"#ffbd89",
	"#ffe1ca",
	"#ffffff",
	"#7ca6f8",
	"#c87ded",
	"#ef8fe1",
	"#ff6e5d",
] as const;

export const hsvToHex = (hue: number, saturation: number): string => {
	const h = ((hue % 360) + 360) % 360;
	const s = Math.max(0, Math.min(1, saturation));
	const chroma = s;
	const second = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
	const white = 1 - chroma;
	const [red, green, blue] =
		h < 60
			? [chroma, second, 0]
			: h < 120
				? [second, chroma, 0]
				: h < 180
					? [0, chroma, second]
					: h < 240
						? [0, second, chroma]
						: h < 300
							? [second, 0, chroma]
							: [chroma, 0, second];
	const part = (value: number) => Math.round(value * 255).toString(16).padStart(2, "0");
	return `#${part(red + white)}${part(green + white)}${part(blue + white)}`;
};
