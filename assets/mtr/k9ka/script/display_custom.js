importPackage(java.awt);
importPackage(java.awt.geom);
importPackage(java.awt.image);
include("mtr:library/codes/rawface.js");
/* 常量定义 */

const boardNames = ["front", "side", "back"];
const font = new Map()
    .set("MSYH", Resources.readFont(Resources.id("mtr:k9ka/font/microsoftyahei.ttf"))); // prettier-ignore

const color = new Map()
	.set("Red", new Color(0xda2d33))
	.set("Yellow", new Color(0xf8cf8b));
var FontTransform = new AffineTransform();
FontTransform.scale(0.63, 1);
/* 常量定义 */

/* 贴图定义 */
var RouteTexture = new BufferedImage(48, 24, 4);
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
		translate: {
			position: new Vector3f(-1.2601, 0.25, 3.51),
			rotation: new Vector3f(0, -90, 0),
			scale: new Vector3f(1.13, 0.36, 0)
		},
		uv: [
			[226, 0],
			[0, 0],
			[0, 72],
			[226, 72]
		]
	},
	{
		//back
		translate: {
			position: new Vector3f(0, 1.35764, -5.8601),
			rotation: new Vector3f(2, 180, 0),
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
for (let grid of gridlist) {
	grid.rawface = new RawFace(
			"exterior",grid.translate,gridTexture.identifier,grid.uv)
			.buildFace()
			.uploadModelCluster(); // prettier-ignore
}
//绘画路线
function drawRoute(font, routeName) {
	let image = RouteTexture;
	let g = image.getGraphics();
	g.setColor(color.get("Red"));
}
function create(ctx, state, train) {
	state.refresh = new RateLimit(0.1); //每0.2秒刷新一次
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
				general: new GraphicsTexture(208, 24)
			},
			drawing: function () {
				let texture = this.displayImage.general;
				let g = texture.graphics;
				g.setColor(new Color(0x0c0c0c));
				g.fillRect(0, 0, 208, 24);
				if (state.route == null || !state.route.FrontDisplay) {
					texture.upload();
					return 0;
				}
				let display = state.route.FrontDisplay;
				let renderPage = display.currentPage;
				let pageClock = display.pageClock;
				if (
					train.getAllPlatformsNextIndex() != train.getAllPlatforms().size()
				) {
					let index;
					train.getThisRoutePlatformsNextIndex() + 1 ==
					train.getThisRoutePlatforms().size()
						? (index = 0)
						: (index = 1);
					var nextStation = train.getThisRoutePlatforms()[train.getThisRoutePlatformsNextIndex() + index].station || { name: "未命名" };
					var destination = train.getThisRoutePlatforms()[0].destinationName;
					var origin = train.getThisRoutePlatforms()[0].station || {
						name: "未命名"
					};
					var thisStation = train.getThisRoutePlatforms()[train.getThisRoutePlatformsNextIndex()].station || { name: "未命名" };
					nextStation = nextStation.name;
					origin = origin.name;
					thisStation = thisStation.name;
				} //prettier-ignore

				for (let order of display.renderList) {
					let currentObject = display.renderObject[order];
					if (eval(currentObject.require)) {
						let positionX = eval(currentObject.position[0]);
						let positionY = eval(currentObject.position[1]);
						g.drawImage(currentObject.image, positionX, positionY, null);
						if (currentObject.extra != null && !currentObject.extraRan)
							eval(currentObject.extra), (currentObject.extraRan = true);
					}
				}
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
				general: new GraphicsTexture(226, 72)
			},
			drawing: function () {
				let texture = this.displayImage.general;
				let g = texture.graphics;
				g.setColor(new Color(0x0c0c0c));
				g.fillRect(0, 0, 226, 72);
				if (state.route == null || !state.route.SideDisplay) {
					texture.upload();
					return 0;
				}
				let display = state.route.SideDisplay;
				let renderPage = display.currentPage;
				let pageClock = display.pageClock;
				if (
					train.getAllPlatformsNextIndex() != train.getAllPlatforms().size()
				) {
					let index;
					train.getThisRoutePlatformsNextIndex() + 1 ==
					train.getThisRoutePlatforms().size()
						? (index = 0)
						: (index = 1);
					var nextStation = train.getThisRoutePlatforms()[train.getThisRoutePlatformsNextIndex() + index].station || { name: "未命名" };
					var destination = train.getThisRoutePlatforms()[0].destinationName;
					var origin = train.getThisRoutePlatforms()[0].station || {
						name: "未命名"
					};
					var thisStation = train.getThisRoutePlatforms()[train.getThisRoutePlatformsNextIndex()].station || { name: "未命名" };
					nextStation = nextStation.name;
					origin = origin.name;
					thisStation = thisStation.name;
				} //prettier-ignore

				for (let order of display.renderList) {
					let currentObject = display.renderObject[order];
					if (eval(currentObject.require)) {
						let positionX = eval(currentObject.position[0]);
						let positionY = eval(currentObject.position[1]);
						g.drawImage(currentObject.image, positionX, positionY, null);
						if (currentObject.extra != null && !currentObject.extraRan)
							eval(currentObject.extra), (currentObject.extraRan = true);
					}
				}
				texture.upload();
			}
		},
		back: {
			translate: {
				position: new Vector3f(0, 1.35764, -5.86),
				rotation: new Vector3f(2, 180, 0),
				scale: new Vector3f(1.84296, 0.212649, 0)
			},
			displayImage: {
				general: new GraphicsTexture(208, 24)
			},
			drawing: function () {
				let texture = this.displayImage.general;
				let g = texture.graphics;
				g.setColor(new Color(0x0c0c0c));
				g.fillRect(0, 0, 208, 24);
				if (state.route == null || !state.route.BackDisplay) {
					texture.upload();
					return 0;
				}
				let display = state.route.BackDisplay;
				let renderPage = display.currentPage;
				let pageClock = display.pageClock;
				if (
					train.getAllPlatformsNextIndex() != train.getAllPlatforms().size()
				) {
					let index;
					train.getThisRoutePlatformsNextIndex() + 1 ==
					train.getThisRoutePlatforms().size()
						? (index = 0)
						: (index = 1);
					var nextStation = train.getThisRoutePlatforms()[train.getThisRoutePlatformsNextIndex() + index].station || { name: "未命名" };
					var destination = train.getThisRoutePlatforms()[0].destinationName;
					var origin = train.getThisRoutePlatforms()[0].station || {
						name: "未命名"
					};
					var thisStation = train.getThisRoutePlatforms()[train.getThisRoutePlatformsNextIndex()].station || { name: "未命名" };
					nextStation = nextStation.name;
					origin = origin.name;
					thisStation = thisStation.name;
				} //prettier-ignore

				for (let order of display.renderList) {
					let currentObject = display.renderObject[order];
					if (eval(currentObject.require)) {
						let positionX = eval(currentObject.position[0]);
						let positionY = eval(currentObject.position[1]);
						g.drawImage(currentObject.image, positionX, positionY, null);
						if (currentObject.extra != null && !currentObject.extraRan)
							eval(currentObject.extra), (currentObject.extraRan = true);
					}
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
	let matrices = state.matrices;
	if (state.refresh.shouldUpdate()) {
		if (
			!train.isOnRoute() ||
			train.getAllPlatformsNextIndex() == train.getAllPlatforms().size()
		) {
			state.route = null;
		}
		if (
			train.isOnRoute() &&
			train.getAllPlatformsNextIndex() != train.getAllPlatforms().size() &&
			(state.route == null ||
				state.route.code !=
					train.getAllPlatforms()[0].route.lightRailRouteNumber)
		) {
			state.route = {};
			let routeCode = train.getAllPlatforms()[0].route.lightRailRouteNumber;
			let routeID = Resources.id(
				"mtr:k9ka/custom_route/" + routeCode + ".json"
			);
			if (Resources.readString(routeID) == null) {
				print("加载" + routeCode + "线路失败，线路库中不存在此线路!");
				throw new Error("线路库不存在" + routeCode + "线路!");
			}
			//进行一次线路获取
			let RouteFile = Resources.readString(routeID);
			let RouteInfo = JSON.parse(RouteFile);
			for (let display in RouteInfo) {
				state.route[display] = RouteInfo[display];
				state.route[display].pageClock = 0;
				state.route[display].currentPage = 0;
			}
			//读取资源
			for (let display in RouteInfo) {
				if (RouteInfo[display].renderList) {
					for (let resource of RouteInfo[display].renderList) {
						let currentResource = state.route[display].renderObject[resource];
						currentResource.extraRan = false;
						let tempImage = Resources.readBufferedImage(
							Resources.id(currentResource.image)
						);
						currentResource.image = tempImage;
					}
				}
			}

			//所有设置完成，设置当前线路号码

			state.route.info = RouteInfo;
			state.route.code = routeCode;
			print("成功加载线路" + state.route.code + "!");
		}
		state.inBrake = inBrake(state, train);
		let railType = train
			.path()
			[train.getRailIndex(train.railProgress(), false)].rail.getModelKey();
		if (railType == "turn_left") state.turningState.setState("left");
		if (railType == "turn_right") state.turningState.setState("right");
		if (railType == "double_flash") state.turningState.setState("double");
		if (!railType || railType == "go_straight")
			state.turningState.setState("null");
		if (state.route) {
			for (let display in state.route.info) {
				let currentDisplay = state.route[display];
				currentDisplay.pageClock++;
				if (currentDisplay.renderList) {
					for (let resource of currentDisplay.renderList) {
						let currentResource = currentDisplay.renderObject[resource];
						currentResource.extraRan = false;
					}
				}
				if (
					currentDisplay.pageClock >= currentDisplay.pageClockReset &&
					currentDisplay.pageClockReset != -1
				) {
					currentDisplay.pageClock = 0;
					currentDisplay.currentPage < currentDisplay.totalPage - 1
						? currentDisplay.currentPage++
						: (currentDisplay.currentPage = 0);
				}
			}
		}
	}
	for (let board in state.boardlist) {
		state.boardlist[board].drawing();
	}

	for (let i = 0; i < train.trainCars(); i++) {
		for (let board in state.boardlist) {
			state.boardlist[board].rawface.drawFace(ctx, i, matrices);
		}
		if (MinecraftClient.getCameraDistance(train.lastCarPosition[i]) < 30)
			for (let grid of gridlist) {
				grid.rawface.drawFace(ctx, i, matrices);
			}
	}
	//线路更新检测
}
