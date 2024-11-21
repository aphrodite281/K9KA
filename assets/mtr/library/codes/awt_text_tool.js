importPackage(java.awt);
var texture = new GraphicsTexture(200, 200);
var g = texture.graphics;
const textTools = {
	/**
	 *给定参数，返回每个字符最左侧的x坐标（实现效果应类似Word的分散对齐）
	 * @param {derivedFont} font 需要使用的字体
	 * @param {int} totalPX 总像素
	 * @param {string} content 要进行宽度计算的内容
	 * @returns {int[]} 每个字符所在的最左端位置
	 */
	justifiedText: (font, totalPX, content) => {
		if (content.length == 1) return [0];
		let FontMetrices = g.getFontMetrics(font);
		let width = [];
		let position = [];
		{
			for (let i = 0; i < content.length; i++) {
				let char = content[i];
				width[i] = FontMetrices.stringWidth(char);
			}
		}
		let space =
			(totalPX - FontMetrices.stringWidth(content)) / (content.length - 1);
		for (let i = 0; i < content.length; i++) {
			let totalwidth = 0;
			for (let l = 0; l < i; l++) {
				totalwidth += width[l];
			}
			position[i] = totalwidth + i * space;
		}
		return position;
	},
	/**
	 * 计算输入文本的宽度
	 * @param {derivedFont} font  需要使用的字体
	 * @param {string} content要进行宽度计算的内容
	 * @returns
	 */
	getTextWidth: (font, content) => {
		let FontMetrices = g.getFontMetrics(font);
		return FontMetrices.stringWidth(content);
	},
	/**
	 * 计算最大字体大小
	 * @param
	 * @returns
	 */
	getFontMaxSize: (font, intialSize, content, totalPX) => {
		let size = intialSize;
		while (size > 0) {
			let Font = font.deriveFont(size);
			let FontMetrices = g.getFontMetrics(Font);
			if (FontMetrices.stringWidth(content) < totalPX) {
				break;
			} else {
				size--;
			}
		}
		return size == 0 ? -1 : size;
	},
	/**
	 * 计算文本居中实际左边位置
	 * @param {int} width
	 * @param {int} totalPX
	 * @returns int
	 */
	centerTextHorizon: (width, totalPX) => {
		return totalPX / 2 - width / 2;
	},
	centerTextVetrical: (font, totalHeight) => {
		let FontMetrices = g.getFontMetrics(font);
		let fontHeight = FontMetrices.getHeight();
		let space = (totalHeight - fontHeight) / 2;
		let fontAscent = FontMetrices.getAscent();
		return space + fontAscent;
	},
	verticalText: (font, height, content) => {
		if (content.length == 1) return [0];
		let FontMetrices = g.getFontMetrics(font);
		let fontHeight = FontMetrices.getHeight();
		let fontAscent = FontMetrices.getAscent();
		let contentHeight = fontHeight * content.length;
		let space = (height - contentHeight) / (content.length - 1);
		let positionY = [];
		let positionX = [];
		for (let i = 0; i < content.length; i++) {
			positionY[i] = (fontHeight + space) * i + fontAscent;
			positionX[i] = -(1 / 2) * FontMetrices.stringWidth(content[i]);
		}
		return [positionX, positionY];
	},
	getTextHeight: (font, content) => {
		let FontMetrices = g.getFontMetrics(font);
		let fontHeight = FontMetrices.getHeight();
		return fontHeight * content.length;
	},
	getCharMaxWidth: (font, content) => {
		let width = 0;
		let FontMetrices = g.getFontMetrics(font);
		for (let char of content) {
			FontMetrices.stringWidth(char) > width
				? (width = FontMetrices.stringWidth(char))
				: null;
		}
		return width;
	}
};
