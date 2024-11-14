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
			content.length == 1
				? 0
				: (totalPX - FontMetrices.stringWidth(content)) / (content.length - 1);
		for (let i = 0; i < content.length; i++) {
			let totalwidth = 0;
			for (let l = 0; l < i; l++) {
				totalwidth += width[l];
			}
			position[i] = totalwidth + i * space;
		}
		return {
			position: position,
			totalWidth:
				FontMetrices.stringWidth(content) + space * (content.length - 1)
		};
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
	centerText: (width, totalPX) => {
		return totalPX / 2 - width / 2;
	},
	getFontHeight: (font) => {
		let FontMetrices = g.getFontMetrics(font);
		return FontMetrices.getHeight();
	},
	getFontCLtoBL: (font) => {
		let FontMetrices = g.getFontMetrics(font);
		let height = FontMetrices.getHeight();
		let ascent = FontMetrices.getAscent();
		let descent = FontMetrices.getDescent();
		print("FontHeight", height);
		print("FontAscent", ascent);
		print("FontDescent", descent);
		return height / 2 - descent;
	}
};
