import { diffColor } from "https://rpgen3.github.io/projector/mjs/diffColor.mjs";
const res = await fetch(
	"https://super-mari-o.github.io/map-editor-art/data/rgb2tile.yml",
);
const str = await res.text();
const ymlArray = str
	.trim()
	.split("\n")
	.map((v) => v.split(": "));
const rgb2HexArray = new Map(
	ymlArray.map(([rgb]) => [
		rgb,
		rgb.match(/.{2}/g).map((v) => Number.parseInt(v, 16)),
	]),
);
export const calcClosestColor = (r, g, b, type = 0) => {
	let min = 1;
	let output = null;
	for (const [rgb, tile] of ymlArray) {
		const hexArray = rgb2HexArray.get(rgb);
		const dif = diffColor([r, g, b], hexArray, type);
		if (min > dif) {
			min = dif;
			output = tile;
		}
	}
	return output;
};
