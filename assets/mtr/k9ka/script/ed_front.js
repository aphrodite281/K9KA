//导入库
include("mtr:library/codes/base.js"); //功能性代码库（由Aphrodite28开发）
include("mtr:library/codes/rawface.js");
importPackage(java.awt);
importPackage(java.awt.geom); //导入Java.awt库
/*boardFront = {
    vertexL:[new Vector3f(-0.24,1.48,6.07),new Vector3f(-0.24,1.24,6.07),new Vector3f(-0.86,1.24,6.07),new Vector3f(-0.86,1.48,6.07)],//Blender计算，最小单位最好为0.01（向上取整）,从左上逆时针转一圈
    vertexM:[],
    pixelLR:[62,24],PixelM:[48,24]
}*/

const half_numberWidth = [7.5, 3.5, 6.5, 7, 7.5, 7, 6.5, 6.5, 7, 6.5];
const HZK12 = Resources.readFont(Resources.id("mtr:k9ka/font/ipix_12px.ttf")); //读取字体HZK12
const HZK24S = Resources.readFont(Resources.id("mtr:k9ka/font/hzk24s.ttf")); //读取字体HZK24S
const MSYH = Resources.readFont(
	Resources.id("mtr:k9ka/font/microsoftyahei.ttf")
);
const Tongda_red = new Color(0xda2d33),
	Tongda_yellow = new Color(0xf8cf8b); //#da2d33,#f8cf8b

//显示屏信息
const boardNames = ["front", "side", "back"];
const boardParts = ["left", "middle", "right"];

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
		left: [53, 24],
		middle: [48, 24],
		right: [53, 24]
	},
	side: [113, 34]
};
const boardsVertexs = {
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
			new Vector3f(0.77, 1.47, -5.87),
			new Vector3f(0.77, 1.2, -5.87),
			new Vector3f(0.24, 1.2, -5.87)
		],
		middle: [
			new Vector3f(-0.24, 1.47, -5.87),
			new Vector3f(0.24, 1.47, -5.87),
			new Vector3f(0.24, 1.2, -5.87),
			new Vector3f(-0.24, 1.2, -5.87)
		],
		right: [
			new Vector3f(-0.77, 1.47, -5.87),
			new Vector3f(-0.24, 1.47, -5.87),
			new Vector3f(-0.24, 1.2, -5.87),
			new Vector3f(-0.77, 1.2, -5.87)
		]
	},
	side: [
		new Vector3f(-1.26, 0.42, 4.07),
		new Vector3f(-1.26, 0.42, 2.94),
		new Vector3f(-1.26, 0.08, 2.94),
		new Vector3f(-1.26, 0.08, 4.07)
	]
};
//------RawFace类型定义------//

//------Face类型定义------//
//---工具类---//
/**
 * 自动缩放字体
 * @param {Font} Font 字体
 * @param {int} length 字符串的长度
 * @param {int} Size 字体的字号大小
 * @returns {derivedFont} 可直接使用的字体
 */
function ScaledXFont(Font, length, Size) {
	//字体X轴缩放计算
	print("length" + length.toString());
	let FontTransform = new AffineTransform(); //新建AffineTransform
	if (length == 2) FontTransform.scale(0.75, 1);
	//但是站名为两个字时使用scale(1,1)的观感不好，所以手动使用scale(0.75,1)
	FontTransform.scale(2 / length, 1);
	//试验得知4个字时为0.5刚刚好，所以为2/4,即2/length
	return Font.deriveFont(Font.PLAIN, Size).deriveFont(FontTransform); //返回修改过的字体
}
//---工具类---//
//以
//下
//为
//主
//程
//序
function create(ctx, state, train) {
	state.firstCreateGraphics = true;
	state.fisrtGetRoute = true;
	state.firstTexture = true;
	state.routeWidth = {
		origin: null,
		destination: null
	};
	state.textureMap = new Map();
	state.route = getRoute(train); //首次获取路线
	state.rateLimit = new RateLimit(0.2);
	state.AWTrateLimit = new RateLimit(10);
	//---新建更新频率限制器---//
	//---显示屏顶点数据---//

	//---显示屏顶点数据---//
	//---点阵网格顶点数据---//
	let gridsVertexs = {
		front: [
			new Vector3f(0.86, 1.48, 6.0701),
			new Vector3f(-0.86, 1.48, 6.0701),
			new Vector3f(-0.86, 1.24, 6.0701),
			new Vector3f(0.86, 1.24, 6.0701)
		],
		back: [
			new Vector3f(-0.77, 1.47, -5.8701),
			new Vector3f(0.77, 1.47, -5.8701),
			new Vector3f(0.77, 1.2, -5.87),
			new Vector3f(-0.77, 1.2, -5.8701)
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
			[113, 0],
			[0, 0],
			[0, 34],
			[113, 34]
		]
	};
	//---点阵网格顶点数据---//
	//---新建显示屏和网格---//
	//(最终获得已上传的DynamicModelHolder)//
	state.grids = [];
	state.boards = [];
	for (let board of boardNames) {
		if (board != "side") {
			state.boards[board] = [];
			for (let part of boardParts) {
				state.boards[board][part] = new RawFace(
					4,
					"exterior",
					boardsVertexs[board][part],
					baseUV,
					null
				);
				state.boards[board][part].createFace();
				state.boards[board][part].uploadModel();
			}
		} else {
			state.boards[board] = new RawFace(
				4,
				"exterior",
				boardsVertexs[board],
				baseUV,
				null
			);
			state.boards[board].createFace();
			state.boards[board].uploadModel();
		}
		state.grids[board] = new RawFace(
			4,
			"exterior",
			gridsVertexs[board],
			gridUV[board],
			null
		);
		state.grids[board].createFace();
		state.grids[board].uploadModel();
	}
	//---新建显示屏---//
	//---创建网格---//
	state.grids.image = new GraphicsTexture(16, 16);
	let g = state.grids.image.graphics;
	g.setColor(Color.BLACK);
	g.fillRect(0, 0, 16, 16);
	g.setComposite(AlphaComposite.Clear);
	g.fill(new Ellipse2D.Double(2, 2, 12, 12));
	state.grids.image.upload();
	//---创建网格---//
}
function render(ctx, state, train) {
	//---线路更新---//
	if (state.rateLimit.shouldUpdate()) {
		if (!isSameRoute(state.route, getRoute(train)) || state.fisrtGetRoute) {
			state.fisrtGetRoute = false;
			state.route = getRoute(train);
			//---线路更新---//
			//---计算长度---//
			state.textureMap.set("FontWidth", new GraphicsTexture(1, 1));
			let g = state.textureMap.get("FontWidth").graphics;
			let FontTransform = new AffineTransform();
			FontTransform.scale(0.5, 1);
			let font = MSYH.deriveFont(Font.PLAIN, 24).deriveFont(FontTransform);
			let FontMetrics = g.getFontMetrics(font);
			state.DESTShouldScroll =
				FontMetrics.stringWidth(state.route.destination) >=
				boardsPixel.back.right[0];
			print(FontMetrics.stringWidth(state.route.destination));
			state.ORIGShouldScroll =
				FontMetrics.stringWidth(state.route.origin) >= boardsPixel.back.left[0];
			print(
				"ORIGShouldScroll" +
					FontMetrics.stringWidth(state.route.destination).toString()
			);
			if (state.DESTShouldScroll) {
				FontTransform.scale(1, 1);
				let font = MSYH.deriveFont(Font.PLAIN, 24).deriveFont(FontTransform);
				let FontMetrics = g.getFontMetrics(font);
				state.routeWidth.destination =
					FontMetrics.stringWidth(state.route.destination) + 20;
			} else {
				state.routeWidth.destination = FontMetrics.stringWidth(
					state.route.destination
				);
			}
			//同理可得Origin
			if (state.ORIGShouldScroll) {
				FontTransform.scale(1, 1);
				let font = MSYH.deriveFont(Font.PLAIN, 24).deriveFont(FontTransform);
				let FontMetrics = g.getFontMetrics(font);
				state.routeWidth.origin =
					FontMetrics.stringWidth(state.route.origin) + 20;
			} else {
				state.routeWidth.origin = FontMetrics.stringWidth(state.route.origin);
			}
			if (state.firstCreateGraphics) {
				state.firstCreateGraphics = false;
				state.textureMap.set(
					"left",
					new GraphicsTexture(state.routeWidth.origin, 24)
				);
				state.textureMap.set(
					"right",
					new GraphicsTexture(state.routeWidth.destination, 24)
				);
				state.textureMap.set(
					"middle",
					new GraphicsTexture(boardsPixel.front.middle[0], 24)
				);
				state.textureMap.set(
					"side",
					new GraphicsTexture(boardsPixel.side[0], boardsPixel.side[1])
				);
			} else {
				state.textureMap.get("left").close();
				state.textureMap.get("right").close();
				state.textureMap.get("middle").close();
				state.textureMap.get("side").close();
				//先删除后新建
				state.textureMap.set(
					"left",
					new GraphicsTexture(state.routeWidth.origin, 24)
				);
				state.textureMap.set(
					"right",
					new GraphicsTexture(state.routeWidth.destination, 24)
				);
				state.textureMap.set(
					"middle",
					new GraphicsTexture(boardsPixel.front.middle[0], 24)
				);
				state.textureMap.set(
					"side",
					new GraphicsTexture(boardsPixel.side[0], boardsPixel.side[1])
				);
				//Map新建GraphicsTexture
			}
			//---计算长度---//
			//---修改基础UV---//

			//---线路更新后AWT作画---//
			{
				//Origin部分
				let width = state.routeWidth.origin;
				let texture = state.textureMap.get("left");
				let g = texture.graphics;
				g.setRenderingHint(
					RenderingHints.KEY_TEXT_ANTIALIASING,
					RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
				);
				g.setColor(Color.BLACK);
				g.fillRect(0, 0, width, 24);
				g.setColor(Tongda_yellow);
				if (state.ORIGShouldScroll) {
					let font = MSYH.deriveFont(Font.PLAIN, 24);
					g.setFont(font);
					g.drawString(state.route.origin, 0, 20);
				} else {
					let font = ScaledXFont(MSYH, state.route.origin.length, 24);
					g.setFont(font);
					g.drawString(state.route.origin, 0, 20);
				}
				texture.upload();
				state.boards.front.left.replaceTexture(
					state.textureMap.get("left").identifier,
					false
				);
				state.boards.front.left.uploadModel;
			}
			for (let board of boardNames) {
				if (board != "side") {
					for (let part of boardParts) {
						part == "left" && state.ORIGShouldScroll
							? state.boards[board][part].changeUV_Upload([
									boardsPixel.front.left[0] / state.routeWidth.origin,
									null
							  ])
							: null;
						part == "right" && state.DESTShouldScroll
							? state.boards[board][part].changeUV_Upload([
									boardsPixel.front.right[0] / state.routeWidth.destination,
									null
							  ])
							: null;
						//ctx.setDebugInfo("U", newUV[board][part][0][0]);
						//ctx.setDebugInfo("V", newUV[board][part][0][1]);
					}
				}
			}
		}
		if (state.DESTShouldScroll || state.ORIGShouldScroll) {
			for (let board of boardNames) {
				if (board != "side") {
					for (let part of boardParts) {
						state.DESTShouldScroll && part == "right"
							? state.boards[board][part].scrollUV_Upload(1, 0)
							: null;
						state.ORIGShouldScroll && part == "left"
							? state.boards[board][part].scrollUV_Upload(1, 0)
							: null;
					}
				}
			}
			//---修改基础UV---//
		}
	}
	ctx.setDebugInfo("发车站滚动", state.ORIGShouldScroll);
	ctx.setDebugInfo("终点站滚动", state.DESTShouldScroll);
	ctx.setDebugInfo("停靠站数", train.getAllPlatforms().size().toString());
	ctx.setDebugInfo("线路", state.route.number); //调试信息
	ctx.setDebugInfo("下一站", state.route.nextStation); //调试信息
	ctx.setDebugInfo("发车站", state.route.origin);
	ctx.setDebugInfo("终点站", state.route.destination);

	//---开始施法---//
	//---awt绘画部分---//
	//---作法完成---//
	let matrices = new Matrices();
	matrices.translate(0, 0.5, 0);
	for (let board of boardNames) {
		if (board != "side") {
			for (let part of boardParts) {
				state.boards[board][part].getUploadModel();
			}
		} else {
			state.boards[board].getUploadModel();
		}
		state.grids[board].getUploadModel();
	}

	for (let i = 0; i < train.trainCars(); i++) {
		for (let board of boardNames) {
			if (board != "side") {
				for (let part of boardParts) {
					state.boards[board][part].drawFace(ctx, i, matrices);
				}
			} else {
				state.boards[board].drawFace(ctx, i, matrices);
			}
			state.grids[board].replaceTexture(state.grids.image.identifier);
			state.grids[board].drawFace(ctx, i, matrices);
		}
	}
}

function dispose(ctx, state, train) {
	state.grids.image.close();
	state.textureMap.get("left").close();
	state.textureMap.get("right").close();
	state.textureMap.get("middle").close();
	state.textureMap.get("side").close();
	for (let board of boardNames) {
		if (board != "side") {
			for (let part of boardParts) {
				state.boards[board][part].modelClusterClose();
			}
		} else {
			state.boards[board].modelClusterClose();
		}
	}
}
