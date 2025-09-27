/***
 * Blends two colors together
 *
 * @param {string} hex1 - color as a hex
 * @param {string} hex3 - color as a hex
 */
function blendHexColors(hex1, hex2) {
	// Helper to convert hex to RGB
	function hexToRgb(hex) {
		const cleanHex = hex.replace("#", "");
		return {
			r: parseInt(cleanHex.substring(0, 2), 16),
			g: parseInt(cleanHex.substring(2, 4), 16),
			b: parseInt(cleanHex.substring(4, 6), 16),
		};
	}

	function rgbToHex(r, g, b) {
		return (
			"#" +
			[r, g, b]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? "0" + hex : hex;
				})
				.join("")
		);
	}

	const rgb1 = hexToRgb(hex1);
	const rgb2 = hexToRgb(hex2);

	const blended = {
		r: Math.round((rgb1.r + rgb2.r) / 2),
		g: Math.round((rgb1.g + rgb2.g) / 2),
		b: Math.round((rgb1.b + rgb2.b) / 2),
	};

	return rgbToHex(blended.r, blended.g, blended.b);
}