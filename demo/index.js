$(demo_holder).empty();
(async () => {
	const res = await fetch(
		"https://super-mari-o.github.io/map-editor-art/data/map-editor.yml",
	);
	const str = await res.text();
	const ymlArray = str
		.trim()
		.split("\n")
		.map((v) => v.split(": "));
	for (const [ymlKey, imgUrl] of ymlArray) {
		$("<dt>").appendTo(demo_holder).text(ymlKey);
		const dd = $("<dd>").appendTo(demo_holder);
		dd.append(Object.assign(new Image(), { src: imgUrl, alt: ymlKey }));
	}
})();
