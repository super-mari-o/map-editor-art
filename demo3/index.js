const { $ } = window;
const regExpId = /[0-9]+(_[0-9]+)?/;
(async () => {
	const { calcClosestColor } = await import(
		"https://super-mari-o.github.io/map-editor-art/demo3/index.mjs"
	);
	const img = $("#input_img").get(0);
	$("#input_file").on(
		"change",
		({
			target: {
				files: [file],
			},
		}) => {
			if (file.type.includes("image")) {
				img.src = URL.createObjectURL(file);
			}
		},
	);
	const background = "46664d";
	const maxWidthOfDevastMap = 150;
	$("#output_button").on("click", () => {
		if (img.src === "") {
			return $("#error_message").text("No image");
		}
		if (img.width > maxWidthOfDevastMap || img.height > maxWidthOfDevastMap) {
			return $("#error_message").text("Too large");
		}
		const type = $("#select_type").val();
		const ctx = Object.assign(document.createElement("canvas"), {
			width: img.width,
			height: img.height,
		}).getContext("2d");
		ctx.fillStyle = `#${background}`;
		ctx.fillRect(0, 0, img.width, img.height);
		ctx.drawImage(img, 0, 0);
		const { data } = ctx.getImageData(0, 0, img.width, img.height);
		let output = "";
		for (let i = 0; i < data; i += 4) {
			const x = (i / 4) % img.width;
			const y = Math.floor(i / 4 / img.width);
			const [r, g, b] = data.subarray(i, i + 3);
			const closest = calcClosestColor(r, g, b, type);
			if (closest !== "background") {
				// !b=[ID]:[X]:[Y]:[Rotation]
				output += `!b=${closest.match(regExpId)[0].split("_").join(":")}:${x}:${y}:0`;
			}
		}
		$("#output_textarea").text(output);
	});
})();
