include("mtr:library/codes/base.js"); //功能性代码库（由Aphrodite28 Maxwenyan23开发）
include("mtr:library/codes/rawface.js");
include("mtr:library/codes/awt_text_tool.js");
importPackage(java.awt);
importPackage(java.lang);
importPackage(java.awt.geom); //导入Java.awt库
importPackage(java.io);

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
	side: [226, 72]
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
		scale: new Vector3f(1.13, 0.36, 0)
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
		[[226, 0], [0, 0], [0, 72], [226, 72]]).buildFace().uploadModelCluster(),
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
	state.PageClock = 0;
	state.page = 0;
}
function render(ctx, state, train) {
	if (state.rateLimit.shouldUpdate()) {
		if (state.route == null || !isSameRoute(state.route, getRoute(train))) {
			state.scrollClock = 60;
			let routeDisplayWidth = 62;
			state.route = getRoute(train);
			let FontTransform = new AffineTransform();
			state.stationHelper = new stationInfo(
				state.route,
				72,
				156,
				font.get("HZK12").deriveFont(16)
			);
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
				.set("side", new GraphicsTexture(226, 72));
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
					? 8
					: state.arrowScrollClock == 8
					? 16
					: state.arrowScrollClock == 16
					? 24
					: state.arrowScrollClock == 24
					? 32
					: 0;
			texture.upload();
		};
		var drawSide = () => {
			state.stationHelper.drawAllStation(color.get("Tongda yellow"));
			let number = state.route.number;
			let texture = state.image.get("side");
			let g = texture.graphics;
			let numberWidth = 70;
			let routeSize = 12;
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
			g.setRenderingHint(
				RenderingHints.KEY_TEXT_ANTIALIASING,
				RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
			);
			g.setColor(Color.BLACK);
			g.fillRect(0, 0, numberWidth, 72);
			g.fillRect(numberWidth, 0, routeWidth, 72);
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
			g.drawString("欢迎乘坐", 1, 64);
			g.setFont(font.get("HZK12").deriveFont(routeSize));
			g.setColor(color.get("Tongda yellow"));
			for (let index in state.stationHelper.getPageStation(state.page)) {
				let stationInfo = state.stationHelper.getPageStation(state.page)[index];
				g.drawImage(
					stationInfo.BufferedImage,
					stationInfo.imagePosition + numberWidth,
					0,
					null
				);
			}
			state.stationHelper.scrollAllStation(2);
			texture.upload();
		};
		//ctx.setDebugInfo("Station", state.stationHelper.toString(9));
		let threadFront = new Thread(
			() => drawRoute(state.image.get("front")),
			"Front"
		);
		let threadSide = new Thread(drawSide, "Side");
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
		threadFront.start();
		threadSide.start();
		threadBack.start();
		state.PageClock++;
		state.scrollClock++;
		if (state.PageClock >= 50) {
			state.page++;
			state.PageClock = 0;
			state.stationHelper.resetAllScrollClock();
		}
		if (state.page > state.stationHelper.getTotalPage()) state.page = 0;
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
	ctx.setDebugInfo("PageClock", state.PageClock);
	ctx.setDebugInfo("totalPage", state.stationHelper.getTotalPage());
	ctx.setDebugInfo("CurretPage", state.page);
}
function dispose(ctx, state, train) {}

function stationInfo(route, boardHeight, boardWidth, Font) {
	this.routeInfo = route.allStation;
	this.route = route;
	this.boardHeight = boardHeight;
	this.boardWidth = boardWidth;
	this.type = "stationInfo";
	this.font = Font;
	this.stationMap = new Map();
	this.stationList = new Array();
	let totalWidth = 0;
	let curretPage = 0;
	//各种方法
	this.toString = (minRange, maxRange) => {
		minRange == null ? (minRange = 0) : null;
		maxRange == null ? (maxRange = this.stationList.length) : null;
		let AllInfo = new String("\n");
		let Info = [];
		for (let i = minRange; i < maxRange; i++) {
			let station = this.stationList[i];
			// prettier-ignore
			let Index = Info.push
				(this.route.allStation[i] + ":{\n   name: "
				+ station.name + "\n   textheight: "
				+ station.textHeight + "\n   length: "
				+ station.length + "\n   shouldScroll: "
				+ station.shouldScroll + "\n   page: "
				+ station.page + "\n   textXPostion: "
				+ station.textXPosition + "\n   imagePosition: "
				+ station.imagePosition +"\n   textYPostion: "
				+ station.textYPosition + "\n   scrollWatingTime:"
				+ station.scrollWatingTime + "\n   scrollClock:"
				+ station.scrollClock + "\n}\n");
			// prettier-ignore
			AllInfo +=
				(this.route.allStation[i] + ":{\n   name: "
				+ station.name + "\n   textheight: "
				+ station.textHeight + "\n   length: "
				+ station.length + "\n   shouldScroll: "
				+ station.shouldScroll + "\n   page: "
				+ station.page + "\n   textXPostion: "
				+ station.textXPosition + "\n   imagePosition: "
				+ station.imagePosition +"\n   textYPostion: "
				+ station.textYPosition + "\n   scrollWatingTime:"
				+ station.scrollWatingTime + "\n   scrollClock:"
				+ station.scrollClock + "\n}\n");
		}
		return AllInfo;
	};
	this.getTotalPage = () => {
		let maxIndex = this.stationList.length - 1;
		let lastStation = this.stationList[maxIndex];
		return lastStation.page;
	};
	this.drawAllStation = (color) => {
		for (let i in this.stationList) {
			this.stationList[i].drawStation(color);
		}
	};
	this.getPageStation = (targetPage) => {
		let targetPageStation = [];
		for (let index in this.stationList) {
			if (this.stationList[index].page == targetPage)
				targetPageStation.push(this.stationList[index]);
		}
		return targetPageStation;
	};
	this.scrollAllStation = (pixel) => {
		for (let i in this.stationList) {
			let station = this.stationList[i];
			let scrollEnd = station.textHeight - this.boardHeight;
			if (
				station.scrollWatingTime == -1 &&
				station.scrollClock < scrollEnd &&
				station.scrollClock > 0
			) {
				station.scrollReverse
					? (station.scrollClock -= pixel)
					: (station.scrollClock += pixel);
				continue;
			}
			if (station.shouldScroll) {
				if (
					(station.scrollClock == 0 ||
						station.scrollClock >= station.textHeight - this.boardHeight) &&
					station.scrollWatingTime == -1
				) {
					station.scrollReverse = !station.scrollReverse;
					station.scrollWatingTime = 0;
				}
				station.scrollWatingTime++;
				station.scrollWatingTime == 10
					? ((station.scrollWatingTime = -1),
					  station.scrollReverse
							? (station.scrollClock -= pixel)
							: (station.scrollClock += pixel))
					: null;
			}
		}
	};
	this.resetPageImagePosition = (page) => {
		let pageStationList = [];
		let nameTotalWidth = 0;
		for (let i in this.stationList) {
			if (this.stationList[i].page == page) {
				pageStationList.push(this.stationList[i]);
				nameTotalWidth += this.stationList[i].BufferedImage.getWidth();
			}
			if (this.stationList[i].page > page) break;
		}
		let spaceAmount = pageStationList.length - 1;
		let space = (this.boardWidth - nameTotalWidth) / spaceAmount;
		let curretWidth = 0;
		for (let i in pageStationList) {
			pageStationList[i].imagePosition = curretWidth;
			curretWidth += pageStationList[i].BufferedImage.getWidth() + space;
		}
	};
	this.resetAllScrollClock = () => {
		for (let i in this.stationList) {
			this.stationList[i].scrollClock = 0;
			this.stationList[i].scrollWatingTime = 0;
		}
	};
	//创建函数
	for (let i in this.routeInfo) {
		let stationName = this.routeInfo[i];
		let textHeight = textTools.getTextHeight(this.font, stationName);
		let textMaxWidth = textTools.getCharMaxWidth(this.font, stationName);
		if (totalWidth + textMaxWidth > this.boardWidth) {
			this.resetPageImagePosition(curretPage);
			curretPage++;
			totalWidth = 0;
		}
		this.stationList[i] = {
			name: stationName,
			textHeight: textHeight,
			length: stationName.length,
			shouldScroll: textHeight > this.boardHeight,
			page: curretPage,
			textXPosition: [],
			textYPosition: [],
			imagePosition: totalWidth,
			scrollClock: 0,
			BufferedImage: new BufferedImage(textMaxWidth + 2, this.boardHeight, 1),
			scrollReverse: false,
			scrollWatingTime: 0
		};
		/*this.stationMap.set(stationName, {
			name: stationName,
			textHeight: textHeight,
			length: stationName.length,
			shouldScroll: textHeight > this.boardHeight,
			page: curretPage,
			textXPosition: [],
			textYPosition: [],
			imagePosition: totalWidth,
			scrollClock: 0,
			BufferedImage: new BufferedImage(textMaxWidth + 2, this.boardHeight, 1),
			scrollReverse: false,
			scrollWatingTime: 0
		});*/
		let station = this.stationList[i];
		let position = textTools.verticalText(
			this.font,
			textHeight > this.boardHeight ? textHeight : this.boardHeight,
			stationName
		);
		for (let i = 0; i < position[0].length; i++) {
			station.textXPosition[i] = (textMaxWidth + 2) / 2 + position[0][i];
		}
		totalWidth += textMaxWidth + 2;
		station.textYPosition = position[1];
		//方法
		station.drawStation = (color) => {
			let g = station.BufferedImage.getGraphics();
			g.setColor(Color.BLACK);
			g.fillRect(
				0,
				0,
				station.BufferedImage.getWidth(),
				station.BufferedImage.getHeight()
			);
			g.setColor(color);
			g.setFont(this.font);
			for (let i = 0; i < station.name.length; i++) {
				g.drawString(
					station.name[i],
					station.textXPosition[i],
					station.textYPosition[i] - station.scrollClock
				);
			}
		};
	}
}
