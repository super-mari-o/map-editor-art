$(demo_holder).empty();
const measurePureWidth = ({ rgbaArray, width, height }) => {
	let minX = width,
		maxX = 0;
	let minY = height,
		maxY = 0;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4;
			const alpha = rgbaArray[index + 3];
			if (alpha > 0) {
				if (x < minX) minX = x;
				if (x > maxX) maxX = x;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}
		}
	}
	pureWidth = maxX - minX + 1;
	pureHeight = maxY - minY + 1;
	let coloredCount = 0;
	let colorlessCount = 0;
	for (let y = minY; y <= maxY; y++) {
		for (let x = minX; x <= maxX; x++) {
			const index = (y * width + x) * 4;
			const alpha = rgbaArray[index + 3];
			if (alpha > 0) {
				coloredCount++;
			} else {
				colorlessCount++;
			}
		}
	}
	const coloredRatio = coloredCount / (coloredCount + colorlessCount);
	return { pureWidth, pureHeight, coloredRatio };
};
(async () => {
	const res = await fetch(
		"https://super-mari-o.github.io/map-editor-art/data/map-editor.yml",
	);
	const str = await res.text();
	const ymlArray = str
		.replaceAll(
			"https://devast.io/img/",
			"https://devasio.github.io/Devast/img/",
		)
		.trim()
		.split("\n")
		.map((v) => v.split(": "));
	for (const [ymlKey, imgUrl] of ymlArray) {
		$("<dt>").appendTo(demo_holder).text(ymlKey);
		const dd = $("<dd>").appendTo(demo_holder);
		const response = await fetch(imgUrl);
		const img = Object.assign(new Image(), {
			src: imgUrl,
			alt: ymlKey,
			crossOrigin: "anonymous",
			onload: (elm) => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const { pureWidth, pureHeight, coloredRatio } = measurePureWidth({
					rgbaArray: imageData.data,
					width: canvas.width,
					height: canvas.height,
				});
				$("<div>").appendTo(dd).text(`Size: ${pureWidth}x${pureHeight}`).css({
					color: "blue",
				});
				$("<div>")
					.appendTo(dd)
					.text(`Colored: ${Math.round(coloredRatio * 100)}%`)
					.css({
						color: "green",
					});
				const MIN_WIDTH = 165;
				const MAX_WIDTH = 250;
				let errorMessage = null;
				if (
					pureWidth < MIN_WIDTH ||
					pureWidth > MAX_WIDTH ||
					pureHeight < MIN_WIDTH ||
					pureHeight > MAX_WIDTH
				) {
					errorMessage = "Invalid size";
				} else if (coloredRatio < 0.5) {
					errorMessage = "Low color ratio";
				} else if (/-wall[0-9]*.png/.test(imgUrl)) {
					errorMessage = "Wall";
				} else if (
					/day-road[0-9]*.png/.test(imgUrl) &&
					!/day-road9.png/.test(imgUrl)
				) {
					errorMessage = "Road";
				}
				if (errorMessage) {
					$("<div>").appendTo(dd).text(errorMessage).css({
						color: "red",
						"font-weight": "bold",
						"background-color": "pink",
					});
				} else {
					dd.append(img);
				}
			},
		});
	}
})();
