export interface ContrastKit {
	parse(color: string): number[];
	over(color: number[], under: number[]): number[];
	luminance(rgb: number[]): number;
	contrast(one: number[], two: number[]): number;
}

declare global {
	interface Window {
		contrast: ContrastKit;
	}
}

export function installContrast() {
	const probe = document.createElement("canvas").getContext("2d", {
		willReadFrequently: true,
	}) as CanvasRenderingContext2D;
	const parse = (color: string) => {
		probe.clearRect(0, 0, 1, 1);
		probe.fillStyle = color;
		probe.fillRect(0, 0, 1, 1);

		return [...probe.getImageData(0, 0, 1, 1).data];
	};
	const over = (color: number[], under: number[]) => {
		const alpha = (color[3] ?? 255) / 255;

		return under
			.slice(0, 3)
			.map((value, index) => (color[index] ?? 0) * alpha + value * (1 - alpha));
	};
	const luminance = (rgb: number[]) => {
		const [r = 0, g = 0, b = 0] = rgb.map((value) => {
			const channel = value / 255;

			return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
		});

		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const contrast = (one: number[], two: number[]) => {
		const [low = 0, high = 0] = [luminance(one), luminance(two)].sort((a, b) => a - b);

		return (high + 0.05) / (low + 0.05);
	};

	window.contrast = { parse, over, luminance, contrast };
}
