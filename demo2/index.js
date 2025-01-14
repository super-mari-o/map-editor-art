const { $ } = window;
const measurePureSize = ({ rgbaArray, width, height }) => {
	let minX = width;
	let maxX = 0;
	let minY = height;
	let maxY = 0;
	for (let i = 0; i < rgbaArray.length; i += 4) {
		const x = (i / 4) % width;
		const y = (i / 4 / width) | 0;
		const a = rgbaArray[i + 3];
		if (a > 0) {
			if (x < minX) {
				minX = x;
			}
			if (x > maxX) {
				maxX = x;
			}
			if (y < minY) {
				minY = y;
			}
			if (y > maxY) {
				maxY = y;
			}
		}
	}
	const pureWidth = maxX - minX + 1;
	const pureHeight = maxY - minY + 1;
	return { pureWidth, pureHeight, offsetX: minX, offsetY: minY };
};
const calcColoredRatio = ({ rgbaArray }) => {
	let coloredCount = 0;
	let colorlessCount = 0;
	for (let i = 0; i < rgbaArray.length; i += 4) {
		const a = rgbaArray[i + 3];
		if (a > 0) {
			coloredCount++;
		} else {
			colorlessCount++;
		}
	}
	return coloredCount / (coloredCount + colorlessCount);
};
const calcRepresentativeColor = ({ rgbaArray }) => {
	const sum = [0, 0, 0];
	for (let i = 0; i < rgbaArray.length; i += 4) {
		const rgb = rgbaArray.subarray(i, i + 3);
		sum[0] += rgb[0];
		sum[1] += rgb[1];
		sum[2] += rgb[2];
	}
	return sum
		.map((v) => Math.round(v / (rgbaArray.length / 4)))
		.map((v) => (v | 0).toString(16).padStart(2, "0"))
		.join("");
};
const regExpWallPng = /-wall[0-9]*.png/;
const regExpRoadPng = /day-road[0-9]*.png/;
const regExpRoad9Png = /day-road9.png/;
const validate = ({ pureWidth, pureHeight, coloredRatio, imgUrl }) => {
	const minWidth = 165;
	const maxWidth = 250;
	let errorMessage = null;
	if (
		pureWidth < minWidth ||
		pureWidth > maxWidth ||
		pureHeight < minWidth ||
		pureHeight > maxWidth
	) {
		errorMessage = "Invalid size";
	} else if (coloredRatio < 0.7) {
		errorMessage = "Low color ratio";
	} else if (regExpWallPng.test(imgUrl)) {
		errorMessage = "Wall";
	} else if (regExpRoadPng.test(imgUrl) && !regExpRoad9Png.test(imgUrl)) {
		errorMessage = "Road";
	}
	return errorMessage;
};
const background = "46664d";
const color2YmlKey = new Map();
$("#output_button").on("click", () => {
	color2YmlKey.set(background, "background");
	$("#output_textarea").text(
		[...color2YmlKey]
			.map(([color, ymlKey]) => `${color}: ${ymlKey}`)
			.join("\n"),
	);
});
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
	let loadCount = 0;
	for (const [ymlKey, imgUrl] of ymlArray) {
		$("<dt>").appendTo($("#demo_holder")).text(ymlKey);
		const dd = $("<dd>").appendTo($("#demo_holder"));
		const img = Object.assign(new Image(), {
			src: imgUrl,
			alt: ymlKey,
			crossOrigin: "anonymous",
			onload: () => {
				const ctx = Object.assign(document.createElement("canvas"), {
					width: img.width,
					height: img.height,
				}).getContext("2d");
				ctx.drawImage(img, 0, 0);
				const imageData = ctx.getImageData(0, 0, img.width, img.height);
				const { pureWidth, pureHeight, offsetX, offsetY } = measurePureSize({
					rgbaArray: imageData.data,
					width: img.width,
					height: img.height,
				});
				const ctx2 = Object.assign(document.createElement("canvas"), {
					width: pureWidth,
					height: pureHeight,
				}).getContext("2d");
				ctx2.drawImage(img, -offsetX, -offsetY);
				const imageData2 = ctx2.getImageData(0, 0, pureWidth, pureHeight);
				const coloredRatio = calcColoredRatio({
					rgbaArray: imageData2.data,
				});
				const ctx3 = Object.assign(document.createElement("canvas"), {
					width: pureWidth,
					height: pureHeight,
				}).getContext("2d");
				ctx3.fillStyle = `#${background}`;
				ctx3.fillRect(0, 0, pureWidth, pureHeight);
				ctx3.drawImage(img, -offsetX, -offsetY);
				const imageData3 = ctx3.getImageData(0, 0, pureWidth, pureHeight);
				const representativeColor = calcRepresentativeColor({
					rgbaArray: imageData3.data,
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
				const errorMessage = validate({
					pureWidth,
					pureHeight,
					coloredRatio,
					imgUrl,
				});
				if (errorMessage) {
					$("<div>").appendTo(dd).text(errorMessage).css({
						color: "red",
						"font-weight": "bold",
						"background-color": "pink",
					});
				} else {
					if (color2YmlKey.has(representativeColor)) {
						dd.append(
							$("<div>")
								.text(
									`Duplicate color: ${color2YmlKey.get(representativeColor)}`,
								)
								.css({
									color: "red",
									"font-weight": "bold",
									"background-color": "pink",
								}),
						);
					} else {
						color2YmlKey.set(representativeColor, ymlKey);
					}
					dd.append(img);
					$("<input>")
						.appendTo(dd)
						.attr({
							type: "color",
							value: `#${representativeColor}`,
						});
				}
				loadCount++;
				const progress = (loadCount / ymlArray.length) * 100;
				$("#demo_progress").val(progress);
			},
		});
	}
})();
