include("mtr:library/codes/base.js"); //功能性代码库（由Aphrodite28开发）
include("mtr:library/codes/rawface.js");
include("mtr:library/codes/awt_text_tool.js");
importPackage(java.awt);
importPackage(java.awt.geom); //导入Java.awt库
/*{
	boardFront = {
    vertexL:[new Vector3f(-0.24,1.48,6.07),new Vector3f(-0.24,1.24,6.07),new Vector3f(-0.86,1.24,6.07),new Vector3f(-0.86,1.48,6.07)],//Blender计算，最小单位最好为0.01（向上取整）,从左上逆时针转一圈
    vertexM:[],
    pixelLR:[62,24],PixelM:[48,24]
}
	//const half_numberWidth = [7.5, 3.5, 6.5, 7, 7.5, 7, 6.5, 6.5, 7, 6.5];
}*/
const boardNames = ["front", "side", "back"];
const boardParts = ["left", "middle", "right"];
//prettier-ignore
const font = new Map()
	.set("HZK12", Resources.readFont(Resources.id("mtr:k9ka/font/ipix_12px.ttf")))
	.set("HZK24S", Resources.readFont(Resources.id("mtr:k9ka/font/hzk24s.ttf")))
	.set("MSYH",Resources.readFont(Resources.id("mtr:k9ka/font/microsoftyahei.ttf")));
const color = new Map()
	.set("Tongda red", new Color(0xda2d33))
	.set("Tongda yellow", new Color(0xf8cf8b));
const baseUV = [
	[1, 0],
	[0, 0],
	[0, 1],
	[1, 1]
];
const boardsPixel = {
	front: {
		left: [62, 24],
		middle: [48, 24],
		right: [62, 24]
	},
	back: {
		left: [62, 24],
		middle: [48, 24],
		right: [62, 24]
	},
	side: [226, 68]
};
const boardsVertices = {
	front: {
		left: [
			new Vector3f(-0.24, 1.48, 6.07),
			new Vector3f(-0.86, 1.48, 6.07),
			new Vector3f(-0.86, 1.24, 6.07),
			new Vector3f(-0.24, 1.24, 6.07)
		],
		middle: [
			new Vector3f(0.24, 1.48, 6.07),
			new Vector3f(-0.24, 1.48, 6.07),
			new Vector3f(-0.24, 1.24, 6.07),
			new Vector3f(0.24, 1.24, 6.07)
		],
		right: [
			new Vector3f(0.86, 1.48, 6.07),
			new Vector3f(0.24, 1.48, 6.07),
			new Vector3f(0.24, 1.24, 6.07),
			new Vector3f(0.86, 1.24, 6.07)
		]
	},
	back: {
		left: [
			new Vector3f(0.24, 1.47, -5.87),
			new Vector3f(0.86, 1.47, -5.87),
			new Vector3f(0.86, 1.2, -5.87),
			new Vector3f(0.24, 1.2, -5.87)
		],
		middle: [
			new Vector3f(-0.24, 1.47, -5.87),
			new Vector3f(0.24, 1.47, -5.87),
			new Vector3f(0.24, 1.2, -5.87),
			new Vector3f(-0.24, 1.2, -5.87)
		],
		right: [
			new Vector3f(-0.86, 1.47, -5.87),
			new Vector3f(-0.24, 1.47, -5.87),
			new Vector3f(-0.24, 1.2, -5.87),
			new Vector3f(-0.86, 1.2, -5.87)
		]
	},
	side: [
		new Vector3f(-1.26, 0.42, 4.07),
		new Vector3f(-1.26, 0.42, 2.94),
		new Vector3f(-1.26, 0.08, 2.94),
		new Vector3f(-1.26, 0.08, 4.07)
	]
};
var BaseBoards = {};
var BaseGrid = {};
//---基础模型---//
/**
 * 基础模型，后期使用RawModel.copy()使用
 */
//---新建基础模型---//
var gridTexture = new GraphicsTexture(16, 16);
{
	let gridVertices = {
		front: [
			new Vector3f(0.86, 1.48, 6.0701),
			new Vector3f(-0.86, 1.48, 6.0701),
			new Vector3f(-0.86, 1.24, 6.0701),
			new Vector3f(0.86, 1.24, 6.0701)
		],
		back: [
			new Vector3f(-0.86, 1.47, -5.8701),
			new Vector3f(0.86, 1.47, -5.8701),
			new Vector3f(0.86, 1.2, -5.87),
			new Vector3f(-0.86, 1.2, -5.8701)
		],
		side: [
			new Vector3f(-1.2601, 0.42, 4.07),
			new Vector3f(-1.2601, 0.42, 2.94),
			new Vector3f(-1.2601, 0.08, 2.94),
			new Vector3f(-1.2601, 0.08, 4.07)
		]
	};
	let gridUV = {
		front: [
			[172, 0],
			[0, 0],
			[0, 24],
			[172, 24]
		],
		back: [
			[172, 0],
			[0, 0],
			[0, 24],
			[172, 24]
		],
		side: [
			[226, 0],
			[0, 0],
			[0, 68],
			[226, 68]
		]
	};
	{
		let g = gridTexture.graphics;
		g.setColor(Color.BLACK);
		g.fillRect(0, 0, 16, 16);
		g.setComposite(AlphaComposite.Clear);
		g.fill(new Ellipse2D.Double(2, 2, 12, 12));
		gridTexture.upload();
	}
	for (let board of boardNames) {
		if (board != "side") {
			BaseBoards[board] = [];
			for (let part of boardParts) {
				// prettier-ignore
				BaseBoards[board][part] = new RawFace("exterior",boardsVertices[board][part],baseUV,null);
				BaseBoards[board][part].createFace();
			}
		} else {		
			// prettier-ignore
			BaseBoards[board] = new RawFace("exterior",boardsVertices[board],baseUV,null);
			BaseBoards[board].createFace();
		}
		// prettier-ignore
		BaseGrid[board] = new RawFace("exterior", gridVertices[board], gridUV[board], null);
		BaseGrid[board].createFace();
		BaseGrid[board].replaceTexture(gridTexture.identifier, true);
		BaseGrid[board].uploadModelManager();
	}
	// prettier-ignore
}
//---新建基础模型---//
function create(ctx, state, train) {
	state.updateRate = new RateLimit(0.15);
	state.boardSidePage = new RateLimit(10);
	state.boardSideUpdate = new RateLimit(0.15);
	state.boards = {};
	for (let board of boardNames) {
		state.boards[board] = {};
		if (board != "side") {
			for (let part of boardParts) {
				state.boards[board][part] = BaseBoards[board][part].copy();
			}
		} else {
			state.boards[board] = BaseBoards[board].copy();
		}
	} //复制模型(RawModel)
}
function render(ctx, state, train) {
	if (state.updateRate.shouldUpdate()) {
		if (state.route == null || !isSameRoute(state.route, getRoute(train))) {
			print("TrainID: #" + ctx.hashCode().toString(16).toUpperCase());
			let FontTransform = new AffineTransform();
			FontTransform.scale(0.64, 1);
			state.route = getRoute(train);
			let HZK24S = font.get("HZK24S").deriveFont(Font.PLAIN, 12),
				MSYH = font
					.get("MSYH")
					.deriveFont(Font.PLAIN, 25)
					.deriveFont(FontTransform);
			state.stationInfo = new stationInfo(train, font.get("HZK24S"));
			let DESTWidth = textTools.getTextWidth(MSYH, state.route.destination);
			let ORIGWidth = textTools.getTextWidth(MSYH, state.route.origin);
			//print("TrainID: #" + ctx.hashCode().toString(16).toUpperCase());
			//print("DESTWidth:" + DESTWidth.toString());
			//print("ORIGWidth:" + ORIGWidth.toString());
			state.ORIGScroll = ORIGWidth > boardsPixel.front.left[0];
			state.DESTScroll = DESTWidth > boardsPixel.front.right[0];

			//Awt绘画
			state.Image = null;
			state.Image = new Map()
				.set("left", new GraphicsTexture(ORIGWidth + 20, 24))
				.set("middle", new GraphicsTexture(48, 24))
				.set("right", new GraphicsTexture(DESTWidth + 20, 24))
				.set("side", new GraphicsTexture(226, 68));
			{
				let text = state.route.origin;
				let g = state.Image.get("left").graphics;
				let Width = state.Image.get("left").bufferedImage.getWidth();
				g.setRenderingHint(
					RenderingHints.KEY_TEXT_ANTIALIASING,
					RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
				);
				g.setColor(Color.BLACK);
				g.fillRect(0, 0, Width, 24);
				g.setColor(color.get("Tongda yellow"));
				g.setFont(MSYH);
				let charPosition = textTools.justifiedText(
					MSYH,
					state.ORIGScroll ? ORIGWidth : boardsPixel.front.left[0],
					text
				).position;
				for (let i = 0; i < text.length; i++) {
					g.drawString(text[i], charPosition[i], 21);
				}
			}
			{
				let number = state.route.number;
				let g = state.Image.get("side").graphics;
				let Width = 50;
				let fontSize = textTools.getFontMaxSize(
					font.get("MSYH"),
					48,
					number,
					Width
				);
				g.setRenderingHint(
					RenderingHints.KEY_TEXT_ANTIALIASING,
					RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
				);
				g.setColor(Color.WHITE);
				g.fillRect(0, 0, 226, 68);
				g.setColor(color.get("Tongda red"));
				g.drawLine(70, 0, 70, 68);
				g.setFont(font.get("MSYH").deriveFont(fontSize));
				let charPosition = textTools.justifiedText(
					font.get("MSYH").deriveFont(fontSize),
					Width,
					number
				).position;
				let textWidth = textTools.justifiedText(
					font.get("MSYH").deriveFont(fontSize),
					Width,
					number
				).totalWidth;
				let yPosition = textTools.getFontCLtoBL(
					font.get("MSYH").deriveFont(fontSize)
				);
				if (number.length == 1) {
					g.setFont(font.get("MSYH").deriveFont(fontSize - 15));
					g.drawString(
						number[0],
						textTools.centerText(
							textTools.getTextWidth(
								font.get("MSYH").deriveFont(fontSize - 15),
								number[0]
							),
							70
						),
						32
					);
				} else {
					for (let i = 0; i < number.length; i++) {
						g.drawString(
							number[i],
							charPosition[i] + textTools.centerText(textWidth, 70),
							20 + yPosition
						);
					}
				}
				g.setFont(font.get("MSYH").deriveFont(17));
				g.drawString("欢迎乘坐", 1, 62);
			}
			{
				let text = state.route.number;
				let g = state.Image.get("middle").graphics;
				let Width = state.Image.get("middle").bufferedImage.getWidth();
				let fontSize = textTools.getFontMaxSize(
					font.get("MSYH"),
					24,
					text,
					Width - 6
				);
				g.setRenderingHint(
					RenderingHints.KEY_TEXT_ANTIALIASING,
					RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
				);
				g.setColor(Color.BLACK);
				g.fillRect(0, 0, Width, 24);
				g.setColor(color.get("Tongda red"));
				g.setFont(font.get("MSYH").deriveFont(fontSize));
				let charPosition = textTools.justifiedText(
					font.get("MSYH").deriveFont(fontSize),
					Width - 6,
					text
				).position;
				let textWidth = textTools.justifiedText(
					font.get("MSYH").deriveFont(fontSize),
					Width - 6,
					text
				).totalWidth;
				let yPosition = textTools.getFontCLtoBL(
					font.get("MSYH").deriveFont(fontSize)
				);
				if (text.length == 1) {
					g.drawString(
						text[0],
						textTools.centerText(
							textTools.getTextWidth(
								font.get("MSYH").deriveFont(fontSize),
								text[0]
							),
							Width
						),
						19
					);
				} else {
					for (let i = 0; i < text.length; i++) {
						g.drawString(
							text[i],
							charPosition[i] + textTools.centerText(textWidth, Width),
							9.5 + yPosition
						);
					}
				}
			}
			{
				let text = state.route.destination;
				let g = state.Image.get("right").graphics;
				let Width = state.Image.get("right").bufferedImage.getWidth();
				g.setRenderingHint(
					RenderingHints.KEY_TEXT_ANTIALIASING,
					RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
				);
				g.setColor(Color.BLACK);
				g.fillRect(0, 0, Width, 24);
				g.setColor(color.get("Tongda yellow"));
				g.setFont(MSYH);
				let charPosition = textTools.justifiedText(
					MSYH,
					state.DESTScroll ? DESTWidth : boardsPixel.front.right[0],
					text
				).position;
				for (let i = 0; i < text.length; i++) {
					g.drawString(text[i], charPosition[i], 21);
				}
			}
			state.Image.get("left").upload();
			state.Image.get("middle").upload();
			state.Image.get("right").upload();
			state.Image.get("side").upload();

			for (let board of boardNames) {
				// prettier-ignore
				if (board != "side") {
					state.boards[board].left.replaceTexture(state.Image.get("left").identifier, true);
					state.boards[board].middle.replaceTexture(state.Image.get("middle").identifier, true);
					state.boards[board].right.replaceTexture(state.Image.get("right").identifier, true);
					state.boards[board].left.changeUV([
						[boardsPixel[board].left[0] / (ORIGWidth + 20), 0], [0,0], [0,1], [boardsPixel[board].left[0] / (ORIGWidth + 20), 1]
					]);
					state.boards[board].right.changeUV([
						[boardsPixel[board].right[0] / (DESTWidth + 20), 0], [0,0], [0,1], [boardsPixel[board].right[0] / (DESTWidth + 20), 1]
					]);
					state.boards[board].left.uploadModel();
					state.boards[board].middle.uploadModel();
					state.boards[board].right.uploadModel();
				} else {
					// prettier-ignore
					state.boards[board].replaceTexture(state.Image.get(board).identifier, true);
					state.boards[board].uploadModel();
				}
			}
		}
		//print("TrainID: #" + ctx.hashCode().toString(16).toUpperCase());
		if (state.ORIGScroll) {
			let Width = state.Image.get("left").bufferedImage.getWidth();
			let u = 1 / Width;
			ctx.setDebugInfo("ORIGWidth", u);
			state.boards.front.left.incrementUV(u, 0);
			state.boards.front.left.uploadModel();
			state.boards.back.left.incrementUV(u, 0);
			state.boards.back.left.uploadModel(); //修改UV制作滚动屏幕
		}
		if (state.DESTScroll) {
			let Width = state.Image.get("right").bufferedImage.getWidth();
			let u = 1 / Width;
			ctx.setDebugInfo("DESTWidth", u);
			state.boards.front.right.incrementUV(u, 0);
			state.boards.front.right.uploadModel();
			state.boards.back.right.incrementUV(u, 0);
			state.boards.back.right.uploadModel(); //修改UV制作滚动屏幕
		}
	}

	{
		let boardMatrices = new Matrices();
		boardMatrices.translate(0, 0.5, 0);
		for (let i = 0; i < train.trainCars(); i++) {
			for (let board of boardNames) {
				if (board != "side") {
					for (let part of boardParts) {
						state.boards[board][part].drawDMHFace(ctx, i, boardMatrices);
					}
				} else {
					state.boards[board].drawDMHFace(ctx, i, boardMatrices);
				}
				let finalGrid = BaseGrid[board].getModelCluster();
				ctx.drawCarModel(finalGrid, i, boardMatrices);
			}
		}
	} //渲染部分
	//调试内容
	ctx.setDebugInfo("停靠站数", train.getAllPlatforms().size().toString());
	ctx.setDebugInfo("线路", state.route.number); //调试信息
	ctx.setDebugInfo("下一站", state.route.nextStation); //调试信息
	ctx.setDebugInfo("发车站", state.route.origin);
	ctx.setDebugInfo("终点站", state.route.destination);
	ctx.setDebugInfo("终点站滚动", state.DESTScroll);
	ctx.setDebugInfo("起点站滚动", state.ORIGScroll);
	//ctx.setDebugInfo("GT", state.Image.get("left"));
}
function dispose(ctx, state, train) {
	state.route = null;
}
