include("mtr:library/codes/base.js"); //功能性代码库（由Aphrodite28 Maxwenyan23开发）
include("mtr:library/codes/rawface_copy.js");
include("mtr:library/codes/awt_text_tool.js");
importPackage(java.awt);
importPackage(java.lang);
importPackage(java.awt.geom); //导入Java.awt库

const boardNames = ["front", "side", "back"];
//prettier-ignore
const font = new Map()
	.set("HZK12", Resources.readFont(Resources.id("mtr:k9ka/font/ipix_12px.ttf")))
	.set("HZK24S", Resources.readFont(Resources.id("mtr:k9ka/font/hzk24s.ttf")))
	.set("MSYH",Resources.readFont(Resources.id("mtr:k9ka/font/microsoftyahei.ttf")));
const color = new Map()
	.set("Tongda red", new Color(0xda2d33))
	.set("Tongda yellow", new Color(0xf8cf8b));
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
var gridTexture = new GraphicsTexture(16, 16);
{
	let g = gridTexture.graphics;
	g.setColor(Color.BLACK);
	g.fillRect(0, 0, 16, 16);
	g.setComposite(AlphaComposite.Clear);
	g.fill(new Ellipse2D.Double(2, 2, 12, 12));
	gridTexture.upload();
}
const boardTranslate = {
	front: {
		position: new Vector3f(0, 1.36, 6.07),
		rotation: new Vector3f(0, 0, 0),
		scale: new Vector3f(1.72, 0.24, 0)
	},
	side: {
		position: new Vector3f(-1.26, 0.25, 3.505),
		rotation: new Vector3f(0, -90, 0),
		scale: new Vector3f(1.13, 0.34, 0)
	},
	back: {
		position: new Vector3f(0, 1.36, -5.86),
		rotation: new Vector3f(0, 180, 0),
		scale: new Vector3f(1.72, 0.24, 0)
	}
};
const baseBoard = {
	front: new RawFace("exterior", boardTranslate.front, null).buildFace(),
	side: new RawFace("exterior", boardTranslate.side, null).buildFace(),
	back: new RawFace("exterior", boardTranslate.back, null).buildFace()
};
// prettier-ignore
const grid = {
	front: new RawFace("exterior", boardTranslate.front, gridTexture.identifier,
		[[172, 0],[0, 0],[0, 24],[172, 24]]).buildFace().uploadModelCluster(),
	side: new RawFace("exterior", boardTranslate.side, gridTexture.identifier,
		[[226, 0], [0, 0], [0, 68], [226, 68]]).buildFace().uploadModelCluster(),
	back: new RawFace("exterior", boardTranslate.back, gridTexture.identifier,
		[[172, 0], [0, 0], [0, 24], [172, 24]]).buildFace().uploadModelCluster()
};
var ArrowRight = new BufferedImage(28, 24, 1);
var ArrowLeft = new BufferedImage(28, 24, 1);
{
	let g = ArrowRight.getGraphics();
	g.setColor(color.get("Tongda yellow"));
	g.fillRect(0, 6, 12, 12);
	g.fillPolygon([12, 28, 12], [2, 12, 22], 3);
}
{
	let g = ArrowLeft.getGraphics();
	g.setColor(color.get("Tongda yellow"));
	g.fillRect(16, 6, 12, 12);
	g.fillPolygon([16, 0, 16], [2, 12, 22], 3);
}
function create(ctx, state, train) {
	//复制面
	state.rateLimit = new RateLimit(0.2);
	state.scrollClock = 60;
	state.arrowScrollClock = 28;
	state.board = {};
	state.speed = train.speed();
	for (let board of boardNames) {
		state[board] = baseBoard[board].copy();
		state[board].uploadModelHolder();
	}
}
function render(ctx, state, train) {
	if (state.rateLimit.shouldUpdate()) {
		if (state.route == null || !isSameRoute(state.route, getRoute(train))) {
			state.scrollClock = 60;
			let routeDisplayWidth = 62;
			state.route = getRoute(train);
			let FontTransform = new AffineTransform();
			FontTransform.scale(0.63, 1);
			let MSYH = font
				.get("MSYH")
				.deriveFont(Font.PLAIN, 25)
				.deriveFont(FontTransform);
			state.ORIGScroll =
				textTools.getTextWidth(MSYH, state.route.origin) > routeDisplayWidth;
			state.DESTScroll =
				textTools.getTextWidth(MSYH, state.route.destination) >
				routeDisplayWidth;
			state.image = new Map()
				.set("front", new GraphicsTexture(172, 24))
				.set("back", new GraphicsTexture(172, 24))
				.set("side", new GraphicsTexture(226, 68));
			for (let i = 0; i < train.trainCars(); i++) {
				for (let board of boardNames) {
					state[board].replaceTexture(
						state.image.get(board).identifier,
						false,
						true
					);
				}
			}
		}
		var drawRoute = (image) => {
			let FontTransform = new AffineTransform();
			FontTransform.scale(0.63, 1);
			let number = state.route.number;
			let destination = state.route.destination;
			let origin = state.route.origin;
			let texture = image;
			let g = texture.graphics;
			let numberWidth = 48;
			let routeWidth = 62;
			let routeSize = 26;
			let space = 16;
			let DESTWidth = textTools.getTextWidth(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				destination
			);
			let ORIGWidth = textTools.getTextWidth(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				origin
			);
			let numberSize = textTools.getFontMaxSize(
				font.get("MSYH"),
				24,
				number,
				numberWidth - 6
			);
			let DESTPostition = textTools.justifiedText(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				state.DESTScroll
					? textTools.getTextWidth(
							font
								.get("MSYH")
								.deriveFont(Font.PLAIN, routeSize)
								.deriveFont(FontTransform),
							destination
					  )
					: routeWidth - 2,
				destination
			);
			let ORIGPostition = textTools.justifiedText(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				state.ORIGScroll
					? textTools.getTextWidth(
							font
								.get("MSYH")
								.deriveFont(Font.PLAIN, routeSize)
								.deriveFont(FontTransform),
							origin
					  )
					: routeWidth - 2,
				origin
			);
			let numberPosition = textTools.justifiedText(
				font.get("MSYH").deriveFont(numberSize),
				numberWidth - 2,
				number
			);
			// prettier-ignore
			let numberCompensationX = textTools.centerTextHorizon(
			number.length != 1
				? numberWidth - 2
				: textTools.getTextWidth(font.get("MSYH").deriveFont(numberSize), number),
			numberWidth
			);
			let numberCompensationY = textTools.centerTextVetrical(
				font.get("MSYH").deriveFont(numberSize),
				24
			);
			g.setRenderingHint(
				RenderingHints.KEY_TEXT_ANTIALIASING,
				RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
			);
			g.setColor(Color.BLACK);
			g.fillRect(0, 0, numberWidth + 2 * routeWidth, 24);
			g.setColor(color.get("Tongda yellow"));
			g.setFont(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform)
			);
			//终点站绘画
			for (let i = 0; i < destination.length; i++) {
				if (state.DESTScroll) {
					let char = destination[i];
					let charPosition =
						2 * routeWidth +
						numberWidth +
						((DESTPostition[i] - state.scrollClock) % (DESTWidth + space));
					if (
						charPosition < routeWidth + numberWidth - 16 ||
						charPosition > 2 * routeWidth + numberWidth
					) {
						continue;
					}
					g.drawString(char, charPosition, 22);
				} else
					g.drawString(
						destination[i],
						DESTPostition[i] + routeWidth + numberWidth + 1,
						22
					);
			}
			//起点站绘画
			for (let i = 0; i < origin.length; i++) {
				if (state.ORIGScroll) {
					let char = origin[i];
					let charPosition =
						routeWidth +
						((ORIGPostition[i] - state.scrollClock) % (ORIGWidth + space));
					if (charPosition < -16 || charPosition > routeWidth) {
						continue;
					}
					g.drawString(char, charPosition, 22);
				} else g.drawString(origin[i], ORIGPostition[i] + 1, 22);
			}
			g.setColor(Color.BLACK);
			g.fillRect(routeWidth, 0, numberWidth, 24);
			g.setColor(color.get("Tongda red"));
			g.setFont(font.get("MSYH").deriveFont(numberSize));
			for (let i = 0; i < number.length; i++) {
				g.drawString(
					number[i],

					numberPosition[i] + routeWidth + numberCompensationX,
					numberCompensationY - 3
				);
			}
			texture.upload();
		};
		var drawBreaking = (image) => {
			let FontTransform = new AffineTransform();
			FontTransform.scale(0.63, 1);
			let number = state.route.number;
			let destination = "请注意";
			let origin = "刹车";
			let texture = image;
			let g = texture.graphics;
			let numberWidth = 48;
			let routeWidth = 62;
			let routeSize = 26;
			let numberSize = textTools.getFontMaxSize(
				font.get("MSYH"),
				24,
				number,
				numberWidth - 6
			);
			let DESTPostition = textTools.justifiedText(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				routeWidth - 10,
				destination
			);
			let ORIGPostition = textTools.justifiedText(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				routeWidth - 20,
				origin
			);
			let numberPosition = textTools.justifiedText(
				font.get("MSYH").deriveFont(numberSize),
				numberWidth - 2,
				number
			);
			// prettier-ignore
			let numberCompensationX = textTools.centerTextHorizon(
			number.length != 1
				? numberWidth - 2
				: textTools.getTextWidth(font.get("MSYH").deriveFont(numberSize), number),
			numberWidth
			);
			let numberCompensationY = textTools.centerTextVetrical(
				font.get("MSYH").deriveFont(numberSize),
				24
			);
			g.setRenderingHint(
				RenderingHints.KEY_TEXT_ANTIALIASING,
				RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
			);
			g.setColor(Color.BLACK);
			g.fillRect(0, 0, numberWidth + 2 * routeWidth, 24);
			g.setColor(color.get("Tongda yellow"));
			g.setFont(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform)
			);
			//终点站绘画
			for (let i = 0; i < destination.length; i++) {
				g.drawString(
					destination[i],
					DESTPostition[i] + routeWidth + numberWidth + 5,
					22
				);
			}
			//起点站绘画
			for (let i = 0; i < origin.length; i++) {
				g.drawString(origin[i], ORIGPostition[i] + 10, 22);
			}
			g.setColor(Color.BLACK);
			g.fillRect(routeWidth, 0, numberWidth, 24);
			g.setColor(color.get("Tongda red"));
			g.setFont(font.get("MSYH").deriveFont(numberSize));
			for (let i = 0; i < number.length; i++) {
				g.drawString(
					number[i],
					numberPosition[i] + routeWidth + numberCompensationX,
					numberCompensationY - 3
				);
			}
			texture.upload();
		};
		var drawTurning = (image) => {
			let FontTransform = new AffineTransform();
			FontTransform.scale(0.63, 1);
			let number = state.route.number;
			let destination = "左转弯";
			let origin = "右转弯";
			let texture = image;
			let g = texture.graphics;
			let numberWidth = 48;
			let routeWidth = 62;
			let routeSize = 26;
			let numberSize = textTools.getFontMaxSize(
				font.get("MSYH"),
				24,
				number,
				numberWidth - 6
			);
			let DESTPostition = textTools.justifiedText(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				routeWidth - 10,
				destination
			);
			let ORIGPostition = textTools.justifiedText(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform),
				routeWidth - 10,
				origin
			);
			let numberPosition = textTools.justifiedText(
				font.get("MSYH").deriveFont(numberSize),
				numberWidth - 2,
				number
			);
			// prettier-ignore
			let numberCompensationX = textTools.centerTextHorizon(
			number.length != 1
				? numberWidth - 2
				: textTools.getTextWidth(font.get("MSYH").deriveFont(numberSize), number),
			numberWidth
			);
			let numberCompensationY = textTools.centerTextVetrical(
				font.get("MSYH").deriveFont(numberSize),
				24
			);
			g.setRenderingHint(
				RenderingHints.KEY_TEXT_ANTIALIASING,
				RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
			);
			g.setColor(Color.BLACK);
			g.fillRect(0, 0, numberWidth + 2 * routeWidth, 24);
			g.setColor(color.get("Tongda yellow"));
			g.setFont(
				font
					.get("MSYH")
					.deriveFont(Font.PLAIN, routeSize)
					.deriveFont(FontTransform)
			);
			//左转弯、右转弯文字
			for (let i = 0; i < destination.length; i++) {
				g.drawString(
					destination[i],
					DESTPostition[i] + routeWidth + numberWidth + 5,
					22
				);
			}
			for (let i = 0; i < origin.length; i++) {
				g.drawString(origin[i], ORIGPostition[i] + 5, 22);
			}
			//起点站绘画
			g.setColor(Color.BLACK);
			if (turningDirection(train) == "left") {
				g.fillRect(0, 0, routeWidth, 24);
				g.drawImage(
					ArrowLeft,
					routeWidth - state.arrowScrollClock - 28,
					0,
					null
				);
			}
			if (turningDirection(train) == "right") {
				g.fillRect(routeWidth + numberWidth, 0, routeWidth, 24);
				g.drawImage(
					ArrowRight,
					routeWidth + numberWidth + state.arrowScrollClock,
					0,
					null
				);
			}
			if (turningDirection(train) == "both") {
				g.fillRect(0, 0, routeWidth, 24);
				g.fillRect(routeWidth + numberWidth, 0, routeWidth, 24);
				g.drawImage(
					ArrowLeft,
					routeWidth - state.arrowScrollClock - 28,
					0,
					null
				);
				g.drawImage(
					ArrowRight,
					routeWidth + numberWidth + state.arrowScrollClock,
					0,
					null
				);
			}
			g.setColor(Color.BLACK);
			g.fillRect(routeWidth, 0, numberWidth, 24);
			g.setColor(color.get("Tongda red"));
			g.setFont(font.get("MSYH").deriveFont(numberSize));
			for (let i = 0; i < number.length; i++) {
				g.drawString(
					number[i],
					numberPosition[i] + routeWidth + numberCompensationX,
					numberCompensationY - 3
				);
			}
			state.arrowScrollClock =
				state.arrowScrollClock == 0
					? 16
					: state.arrowScrollClock == 16
					? 32
					: 0;
			texture.upload();
		};
		//var drawSide = () => {
		let number = state.route.number;
		let texture = state.image.get("side");
		let g = texture.graphics;
		let numberWidth = 70;
		let routeSize = 16;
		let lengthCompensation = 70 - number.length * 18;
		lengthCompensation = lengthCompensation < 6 ? 6 : lengthCompensation;
		let routeWidth = 226 - numberWidth;
		let numberSize = textTools.getFontMaxSize(
			font.get("MSYH"),
			24,
			number,
			numberWidth - 10
		);
		let numberPosition = textTools.justifiedText(
			font.get("MSYH").deriveFont(numberSize),
			numberWidth - lengthCompensation,
			number
		);
		let numberCompensationX = textTools.centerTextHorizon(
			number.length != 1
				? numberWidth - lengthCompensation
				: textTools.getTextWidth(
						font.get("MSYH").deriveFont(numberSize),
						number
				  ),
			numberWidth
		);
		let numberCompensationY = textTools.centerTextVetrical(
			font.get("MSYH").deriveFont(numberSize),
			45
		);
		let stationPosition = textTools.verticalText(
			font.get("HZK12").deriveFont(routeSize),
			68,
			state.route.allStation[0]
		);
		g.setRenderingHint(
			RenderingHints.KEY_TEXT_ANTIALIASING,
			RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
		);
		g.setColor(Color.GREEN);
		g.fillRect(0, 0, numberWidth, 68);
		g.setColor(Color.BLUE);
		g.fillRect(numberWidth, 0, routeWidth, 68);
		g.setColor(color.get("Tongda red"));
		g.setFont(font.get("MSYH").deriveFont(numberSize));
		for (let i = 0; i < number.length; i++) {
			g.drawString(
				number[i],
				numberPosition[i] + numberCompensationX,
				numberCompensationY
			);
		}
		g.setFont(font.get("MSYH").deriveFont(17));
		g.drawString("欢迎乘坐", 1, 65);
		g.setFont(font.get("HZK12").deriveFont(routeSize));
		for (let i = 0; i < state.route.allStation[0].length; i++) {
			ctx.setDebugInfo("XYZ", stationPosition[0][0]);
			g.drawString(
				state.route.allStation[0][i],
				stationPosition[0][i] + 80,
				stationPosition[1][i]
			);
		}
		texture.upload();
		//};
		ctx.setDebugInfo("Station", state.route.allStation[0]);
		let threadFront = new Thread(
			() => drawRoute(state.image.get("front")),
			"Front"
		);
		//let threadSide = new Thread(drawSide, "Side");
		let threadBack = new Thread();
		if (isBraking(state, train)) {
			threadBack = new Thread(
				() => drawBreaking(state.image.get("back")),
				"Back"
			);
		} else if (isTurning(train)) {
			threadBack = new Thread(
				() => drawTurning(state.image.get("back")),
				"Back"
			);
		} else {
			threadBack = new Thread(() => drawRoute(state.image.get("back")), "Back");
		}
		ctx.setDebugInfo("isturning", isTurning(train));
		ctx.setDebugInfo("Direction", turningDirection(train));
		threadFront.start();
		//threadSide.start();
		threadBack.start();
		state.scrollClock++;
	}
	//渲染部分
	let matrices = new Matrices();
	matrices.translate(0, 0.5, 0);
	for (let i = 0; i < train.trainCars(); i++) {
		for (let board of boardNames) {
			grid[board].drawFace(ctx, i, matrices);
			state[board].drawFace(ctx, i, matrices);
		}
	}
}
function dispose(ctx, state, train) {}

function stationInfo(route) {
	this.font = font.get("MSYH").deriveFont(16);
	this.stationMap = new Map();
	for (let i = 0; i < route.allStation.length; i++) {
		let station = route.allStation[i];
		let height = this.stationMap.set(station, {
			name: station,
			length: station.length,
			page,
			position
		});
	}
}
