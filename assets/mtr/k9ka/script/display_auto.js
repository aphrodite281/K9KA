importPackage(java.awt);
importPackage(java.lang);
importPackage(java.awt.geom);
importPackage(java.awt.image);
include("mtr:library/codes/rawface.js");
/* 常量定义 */

const boardNames = ["front", "side", "back"];
const font = new Map()
	.set("MSYH",Resources.readFont(Resources.id("mtr:k9ka/font/microsoftyahei.ttf")))
	.set("SourceHanSans", Resources.readFont(Resources.id("mtr:k9ka/font/sourcehans/sourcehansanscn_medium.ttf")))
	.set("SourceHanSerif", Resources.readFont(Resources.id("mtr:k9ka/font/sourcehans/sourcehanserifcn_semibold.ttf"))); // prettier-ignore

const color = new Map()
	.set("Red", new Color(0xda2d33))
	.set("Yellow", new Color(0xffbb28))
	.set("Green", new Color(0xc5d863));
var FontTransform = new AffineTransform();
FontTransform.scale(0.8, 1);
var displayMatrices = new Matrices();
displayMatrices.translate(0, 0.5, 0);
/* 常量定义 */

/* 贴图定义 */
var grid = Resources.readBufferedImage(Resources.id("mtr:k9ka/image/grid.png"));
var gridTexture = new GraphicsTexture(16, 16);
{
	let g = gridTexture.graphics;
	g.drawImage(grid, 0, 0, null);
	gridTexture.upload();
}
var ArrowLeft = Resources.readBufferedImage(
	Resources.id("mtr:k9ka/image/arrowleft.png")
);
var ArrowRight = Resources.readBufferedImage(
	Resources.id("mtr:k9ka/image/arrowright.png")
);
var BombaxLogo = Resources.readBufferedImage(
	Resources.id("mtr:k9ka/image/bombaxlogo.png")
);
var testTexture = new GraphicsTexture(48, 24);
{
	let g = testTexture.graphics;
	g.drawImage(grid, 0, 0, null);
	testTexture.upload();
}
/* 贴图定义 */

/* 类定义 */

/* 类定义 */

var gridlist = [
	{
		//front
		translate: {
			position: new Vector3f(0, 1.36, 6.0601),
			rotation: new Vector3f(0, 0, 0),
			scale: new Vector3f(1.84296, 0.212649, 0)
		},
		uv: [
			[208, 0],
			[0, 0],
			[0, 24],
			[208, 24]
		]
	},
	{
		//back
		translate: {
			position: new Vector3f(0, 1.35764, -5.8601),
			rotation: new Vector3f(0, 180, 0),
			scale: new Vector3f(1.84296, 0.212649, 0)
		},
		uv: [
			[208, 0],
			[0, 0],
			[0, 24],
			[208, 24]
		]
	}
];
function trapezoidal_wave(A, t, Tr, Ttop, k) {
	let Tbot = Ttop,
		Tf = Tr;
	t += Tbot + Ttop + Tf + Tr + k;
	t %= Tr + Ttop + Tf + Tbot;

	if (t < Tr) return t * (A / Tr);
	if (t < Tr + Ttop) return A;
	if (t < Tr + Ttop + Tf) return A - (t - Tr - Ttop) * (A / Tf);
	else return 0;
}
for (let grid of gridlist) {
	grid.rawface = new RawFace(
		"exterior",
		grid.translate,
		gridTexture.identifier,
		grid.uv
	).buildFace().uploadModelCluster(); // prettier-ignore
}
function drawCenterText(image, font, text, color) {
	let g = image.getGraphics();
	let width = image.getWidth();
	let height = image.getHeight();
	let englishChars = text.match(/\w/g) ? text.match(/\w/g).length : 0;
	let chineseChars = text.length() - englishChars;
	let displayChars = 1.3 * chineseChars + 0.7 * englishChars;
	g.setFont(
		font.deriveFont(
			Font.PLAIN,
			width / displayChars >= 24 ? 24 : width / displayChars
		)
	);
	let Metrics = g.getFontMetrics();
	let displayXPosition = 0,
		displayYPosition = Metrics.getAscent();
	displayChars <= 2
		? (displayYPosition -= 8)
		: displayChars <= 5
		? (displayYPosition -= 4)
		: null;
	g.setComposite(AlphaComposite.Clear);
	g.fillRect(0, 0, width, height);
	g.setComposite(AlphaComposite.SrcOver);
	g.setColor(color);
	//初始化部分
	displayXPosition = (width - Metrics.stringWidth(text)) / 2 - 0.5;
	displayYPosition =
		(height - Metrics.getHeight()) / 2 + Metrics.getAscent() - 3;
	g.drawString(text, displayXPosition, displayYPosition);
}
function autoScrollText(
	scrollClock,
	image,
	font,
	text,
	color,
	textHandle,
	space
) {
	g = image.getGraphics();
	width = image.getWidth();
	height = image.getHeight();
	text = eval("text." + textHandle);
	g.setFont(font);
	Metrics = g.getFontMetrics();
	g.setComposite(AlphaComposite.Clear);
	g.setColor(Color.BLACK);
	g.fillRect(0, 0, width, height);
	g.setComposite(AlphaComposite.SrcOver);
	g.setColor(color);
	//初始化部分
	displayXPosition = (width - Metrics.stringWidth(text)) / 2;
	displayYPosition =
		(height - Metrics.getHeight()) / 2 + Metrics.getAscent() - 2;
	if (displayXPosition < 0) {
		text += space;
		displayXPosition = scrollClock % Metrics.stringWidth(text);
		text += text;
	}
	g.drawString(text, displayXPosition, displayYPosition);
}
//绘画路线
function create(ctx, state, train) {
	state.scrollClock = 0;
	state.scrollClock1 = 0;
	state.stationsScrollClock = [];
	state.MainClockTime = 0;
	state.MainClock = new RateLimit(1); //计时器
	state.scrollRefresh = new RateLimit(0);
	state.scrollRefresh1 = new RateLimit(0.1);
	state.stations = [];
	state.route = {
		name: null,
		displayName: null,
		stationHelper: null,
		destination: null,
		origin: null
	};
	state.boardlist = {
		front: {
			translate: {
				position: new Vector3f(0, 1.36, 6.06),
				rotation: new Vector3f(0, 0, 0),
				scale: new Vector3f(1.84296, 0.212649, 0)
			},
			displayImage: {
				general: new GraphicsTexture(208, 24),
				routeNumber: new BufferedImage(48, 24, 2),
				origin: new BufferedImage(64, 24, 2),
				destination: new BufferedImage(64, 24, 2)
			},
			usedFont: {
				MicrosoftYahei: font.get("MSYH").deriveFont(Font.PLAIN, 24) // prettier-ignore
			},
			drawRoute: function () {
				//线路数字
				//初始化部分
				drawCenterText(
					this.displayImage.routeNumber,
					this.usedFont.MicrosoftYahei,
					TextUtil.getNonExtraParts(train.getAllPlatforms()[0].route.name),
					color.get("Red")
				);
				//分割

				//起点站
				//初始化部分
				autoScrollText(
					-state.scrollClock1,
					this.displayImage.origin,
					this.usedFont.MicrosoftYahei.deriveFont(Font.PLAIN, 26).deriveFont(
						FontTransform
					),
					TextUtil.getCjkParts(
						train.getAllPlatforms()[0].station
							? train.getAllPlatforms()[0].station.name
							: "未命名"
					) + "",
					color.get("Yellow"),
					"replace(/[!-~]/gi, '')",
					"   "
				);
				autoScrollText(
					-state.scrollClock1,
					this.displayImage.destination,
					this.usedFont.MicrosoftYahei.deriveFont(Font.PLAIN, 26).deriveFont(
						FontTransform
					),
					TextUtil.getCjkParts(
						train.getAllPlatforms()[0].destinationName
							? train.getAllPlatforms()[0].destinationName
							: "未命名"
					) + "",
					color.get("Yellow"),
					"replace(/[!-~]/gi, '')",
					"   "
				);
			},
			drawing: function () {
				if (train.isOnRoute()) this.drawRoute();
				let texture = this.displayImage.general;
				let g = texture.graphics;
				g.setColor(Color.BLACK);
				g.setFont(
					this.usedFont.MicrosoftYahei.deriveFont(Font.PLAIN, 26).deriveFont(
						FontTransform
					)
				);
				g.fillRect(0, 0, 208, 24);
				g.setColor(color.get("Red"));
				train.isOnRoute()
					? (g.drawImage(BombaxLogo, 0, 0, null),
					  g.drawImage(BombaxLogo, 208 - 15, 0, null))
					: null;
				g.drawImage(
					this.displayImage.routeNumber,
					208 / 2 - this.displayImage.routeNumber.getWidth() / 2,
					0,
					null
				);
				g.drawImage(this.displayImage.origin, 16, 0, null);
				g.drawImage(this.displayImage.destination, 128, 0, null);
				texture.upload();
			}
		},
		side: {
			translate: {
				position: new Vector3f(-1.26, 0.25, 3.51),
				rotation: new Vector3f(0, -90, 0),
				scale: new Vector3f(1.13, 0.36, 0)
			},
			displayImage: {
				general: new GraphicsTexture(2260, 720),
				destination: new BufferedImage(660, 120, 2),
				number: new BufferedImage(740, 400, 2)
			},
			usedFont: {
				MicrosoftYahei: font.get("MSYH").deriveFont(Font.PLAIN, 26).deriveFont(FontTransform), // prettier-ignore
				Serif: font.get("SourceHanSerif").deriveFont(Font.PLAIN, 100),
				Sans: font.get("SourceHanSans").deriveFont(Font.PLAIN, 100)
			},
			drawRoute: function () {
				//终点站
				//初始化部分
				let texture = this.displayImage.destination,
					fontSize;
				let g = texture.getGraphics();
				let width = texture.getWidth();
				let height = texture.getHeight();
				g.setFont(this.usedFont.Sans);
				let Metrics = g.getFontMetrics();
				let displayContent = TextUtil.getCjkParts(
					train.getAllPlatforms()[0].destinationName
				);
				englishChars = displayContent.match(/\w/g)
					? displayContent.match(/\w/g).length
					: 0;
				let chineseChars = displayContent.length() - englishChars;
				let displayChars = 1.1 * chineseChars + 0.6 * englishChars;
				let displayXPosition = 0,
					displayYPosition = 0;
				g.setComposite(AlphaComposite.Clear);
				g.fillRect(0, 0, width, height);
				g.setComposite(AlphaComposite.SrcOver);
				//初始化部分
				displayXPosition = (width - Metrics.stringWidth(displayContent)) / 2;
				g.setColor(color.get("Red"));
				if (displayXPosition < 0) {
					let displayXPositionA =
						(-state.scrollClock * 2.5) %
						(Metrics.stringWidth(displayContent) + 100);
					let displayXPositionB =
						((-state.scrollClock * 2.5) %
							(Metrics.stringWidth(displayContent) + 100)) +
						Metrics.stringWidth(displayContent) +
						100;
					g.drawString(displayContent, displayXPositionA, 100);
					g.drawString(displayContent, displayXPositionB, 100);
				} else {
					g.drawString(displayContent, displayXPosition, 100);
				}

				//分割

				//线路号码
				//初始化部分
				texture = this.displayImage.number;
				g = texture.getGraphics();
				width = texture.getWidth();
				height = texture.getHeight();
				g.setFont(this.usedFont.Sans);
				displayContent = TextUtil.getNonExtraParts(
					train.getAllPlatforms()[0].route.name
				);
				englishChars = displayContent.match(/\w/g)
					? displayContent.match(/\w/g).length
					: 0;
				chineseChars = displayContent.length() - englishChars;
				displayChars = 1.1 * chineseChars + 0.6 * englishChars;

				displayXPosition = 0;
				displayYPosition = 0;
				g.setComposite(AlphaComposite.Clear);
				g.fillRect(0, 0, width, height);
				g.setComposite(AlphaComposite.SrcOver);
				//初始化部分

				fontSize = width / displayChars;
				fontSize > 400 ? (fontSize = height) : null;
				g.setFont(this.usedFont.Sans.deriveFont(Font.PLAIN, fontSize));
				Metrics = g.getFontMetrics();
				displayXPosition = (width - Metrics.stringWidth(displayContent)) / 2;
				displayYPosition =
					(height - (Metrics.getAscent() + Metrics.getDescent())) / 2 +
					Metrics.getAscent() -
					fontSize / 14;
				g.setColor(color.get("Red"));
				g.drawString(displayContent, displayXPosition, displayYPosition);
				//分割

				for (let i = 0; i < train.getAllPlatforms().size(); i++) {
					state.stations[i] = new BufferedImage(100, 720, 2);
					texture = state.stations[i];
					g = texture.getGraphics();
					g.setColor(Color.BLACK);
					width = texture.getWidth();
					height = texture.getHeight();
					g.fillRect(0, 0, width, height);
					g.setColor(color.get("Green"));
					g.setFont(this.usedFont.Sans);
					Metrics = g.getFontMetrics();
					displayContent =
						TextUtil.getCjkParts(
							train.getAllPlatforms()[i].station
								? train.getAllPlatforms()[i].station.name
								: "未命名"
						) + "";

					displayContent = displayContent.replace(/[)）]/g, "︶");
					displayContent = displayContent.replace(/[(（)]/g, "︵");
					totalChars = displayContent.length;
					totalHeight = (Metrics.getAscent() - 10) * totalChars;
					displayYPosition = Metrics.getAscent() - 20;
					if (!state.stationsScrollClock[i]) state.stationsScrollClock[i] = 0;
					if (totalHeight > height) {
						displayYPosition = trapezoidal_wave(
							height - totalHeight,
							state.stationsScrollClock[i],
							(totalHeight - height) / 3,
							100,
							-100
						);
						displayYPosition += Metrics.getAscent() - 20;
					}
					for (let char of displayContent) {
						displayXPosition = (width - Metrics.stringWidth(char)) / 2;
						g.drawString(char, displayXPosition, displayYPosition);
						displayYPosition += Metrics.getAscent() - 10;
					}
				}
			},
			drawing: function () {
				if (train.isOnRoute()) this.drawRoute();
				let texture = this.displayImage.general;
				let g = texture.graphics;
				g.setColor(Color.BLACK);
				g.fillRect(0, 0, 2260, 720);
				g.setColor(Color.BLACK);
				g.setColor(color.get("Red"));
				g.setFont(this.usedFont.Sans);
				train.isOnRoute() ? g.drawString("开 往", 255, 560) : null;
				g.drawImage(this.displayImage.destination, 50, 590, null);
				g.drawImage(this.displayImage.number, 10, 50, null);
				let MaxX = state.stations.length * 100 - 100;
				this.totalPage = Math.ceil(MaxX / 1500);
				for (let i = 0; i < state.stations.length; i++) {
					let X =
						i * 100 +
						760 -
						(Math.floor(state.MainClockTime / 10) % this.totalPage) * 1500;
					X >= 760 && X < 2260
						? g.drawImage(state.stations[i], X, 0, null)
						: null;
				}
				texture.upload();
			}
		},
		back: {
			translate: {
				position: new Vector3f(0, 1.35764, -5.86),
				rotation: new Vector3f(0, 180, 0),
				scale: new Vector3f(1.84296, 0.212649, 0)
			},
			displayContent: {
				destination: new String(),
				routeNumber: new String(),
				origin: new String()
			},
			displayImage: {
				general: new GraphicsTexture(208, 24),
				routeNumber: new BufferedImage(48, 24, 2),
				origin: new BufferedImage(80, 24, 2),
				destination: new BufferedImage(80, 24, 2)
			},
			usedFont: {
				MicrosoftYahei: font.get("MSYH").deriveFont(Font.PLAIN, 24) // prettier-ignore
			},
			drawRoute: function () {
				//线路数字
				//初始化部分
				drawCenterText(
					this.displayImage.routeNumber,
					this.usedFont.MicrosoftYahei,
					TextUtil.getNonExtraParts(train.getAllPlatforms()[0].route.name),
					color.get("Red")
				);
				//分割

				//起点站
				//初始化部分
				autoScrollText(
					-state.scrollClock1,
					this.displayImage.origin,
					this.usedFont.MicrosoftYahei.deriveFont(Font.PLAIN, 26).deriveFont(
						FontTransform
					),
					TextUtil.getCjkParts(
						train.getAllPlatforms()[0].station
							? train.getAllPlatforms()[0].station.name
							: "未命名"
					) + "",
					color.get("Yellow"),
					"replace(/[!-~]/gi, '')",
					"   "
				);
				autoScrollText(
					-state.scrollClock1,
					this.displayImage.destination,
					this.usedFont.MicrosoftYahei.deriveFont(Font.PLAIN, 26).deriveFont(
						FontTransform
					),
					TextUtil.getCjkParts(
						train.getAllPlatforms()[0].destinationName
							? train.getAllPlatforms()[0].destinationName
							: "未命名"
					) + "",
					color.get("Yellow"),
					"replace(/[!-~]/gi, '')",
					"   "
				);
			},
			drawing: function () {
				if (train.isOnRoute()) this.drawRoute();
				let texture = this.displayImage.general;
				let g = texture.graphics;
				g.setRenderingHint(
					RenderingHints.KEY_TEXT_ANTIALIASING,
					RenderingHints.VALUE_TEXT_ANTIALIAS_OFF
				);
				g.setColor(Color.BLACK);
				g.setFont(
					this.usedFont.MicrosoftYahei.deriveFont(Font.PLAIN, 26).deriveFont(
						FontTransform
					)
				);
				g.fillRect(0, 0, 208, 24);
				g.setColor(color.get("Yellow"));
				g.drawImage(
					this.displayImage.routeNumber,
					208 / 2 - this.displayImage.routeNumber.getWidth() / 2,
					0,
					null
				);
				if (inBrake(state, train)) {
					g.drawString("刹 车", 20, 21);
					g.drawString("请注意", 133, 21);
					texture.upload();
					return 0;
				}
				switch (state.turningState.stateNow() + "") {
					case "left":
						g.drawString("左转弯", 133, 21);
						g.drawImage(
							ArrowLeft,
							52 -
								Math.floor((state.turningState.stateNowDuration() * 3) % 3) *
									25,
							0,
							null
						);
						break;
					case "right":
						g.drawString("右转弯", 13, 21);
						g.drawImage(
							ArrowRight,
							128 +
								Math.floor((state.turningState.stateNowDuration() * 3) % 3) *
									25,
							0,
							null
						);
						break;
					case "double":
						g.drawImage(
							ArrowLeft,
							52 -
								Math.floor((state.turningState.stateNowDuration() * 3) % 3) *
									25,
							0,
							null
						);
						g.drawImage(
							ArrowRight,
							128 +
								Math.floor((state.turningState.stateNowDuration() * 3) % 3) *
									25,
							0,
							null
						);
						break;
					default:
						g.drawImage(this.displayImage.origin, 0, 0, null);
						g.drawImage(this.displayImage.destination, 128, 0, null);
						break;
				}
				texture.upload();
			}
		}
	}; //创建电牌对象(因为每台车都不同所以需要放进state)
	for (let board in state.boardlist) {
		state.boardlist[board].rawface =
		new RawFace("light", state.boardlist[board].translate, state.boardlist[board].displayImage.general.identifier)
				.buildFace()
				.uploadModelHolder(); // prettier-ignore
	}
	state.turningState = new StateTracker();
}

function render(ctx, state, train) {
	if (state.scrollRefresh.shouldUpdate()) {
		state.scrollClock++;
		for (let a in state.stationsScrollClock) {
			state.stationsScrollClock[a] += 1;
		}
	}
	let railType = train
		.path()
		[train.getRailIndex(train.railProgress(), false)].rail.getModelKey();
	if (railType == "turn_left") state.turningState.setState("left");
	if (railType == "turn_right") state.turningState.setState("right");
	if (railType == "double_flash") state.turningState.setState("double");
	if (!railType || railType == "go_straight")
		state.turningState.setState("null");
	state.scrollRefresh1.shouldUpdate() ? state.scrollClock1++ : null;
	if (state.MainClock.shouldUpdate()) state.MainClockTime++;
	if (state.MainClockTime % 10 == 0 && state.boardlist.side.totalPage > 1) {
		state.stationsScrollClock.fill(0);
	}
	for (let board in state.boardlist) {
		state.boardlist[board].drawing();
	}
	for (let i = 0; i < train.trainCars(); i++) {
		for (let board in state.boardlist) {
			state.boardlist[board].rawface.drawFace(ctx, i, displayMatrices);
		}
		if (MinecraftClient.getCameraDistance(train.lastCarPosition[i]) < 30) {
			gridlist[0].rawface.drawFace(ctx, i, displayMatrices);
			gridlist[1].rawface.drawFace(ctx, i, displayMatrices);
		}
	}
}

function isBraking(state, train) {
	if (state.speed <= train.speed()) {
		state.speed = train.speed();
		return false;
	} else {
		state.speed = train.speed();
		return true;
	}
}
function inBrake(state, train) {
	if (isBraking(state, train)) {
		state.brakeTime = Timing.elapsed() + 0.2;
	}
	if (state.brakeTime > Timing.elapsed()) {
		return true;
	} else {
		return false;
	}
}
