importPackage(java.awt);
importPackage(java.awt.geom);
importPackage(java.awt.image);
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
function isBraking(state, train) {
	if (state.speed <= train.speed()) {
		state.speed = train.speed();
		return false;
	} else {
		state.speed = train.speed();
		return true;
	}
}
function isTurning(train) {
	let PathData = train.path();
	let railProgress = train.railProgress();
	let railIndex = train.getRailIndex(railProgress, false);
	let railType = PathData[railIndex].rail.getModelKey();
	return (
		railType == "turn_left" ||
		railType == "turn_right" ||
		railType == "double_flash"
	);
}
function turningDirection(train) {
	let PathData = train.path();
	let railProgress = train.railProgress();
	let railIndex = train.getRailIndex(railProgress, false);
	let railType = PathData[railIndex].rail.getModelKey();
	if (railType == "turn_left") return "left";
	if (railType == "turn_right") return "right";
	if (railType == "go_straight") return "straight";
	return "both";
}
/**
 * 与train对象合并线路信息
 * @param {train} 列车对象
 * @returns void
 */
function getRoute(train) {
	let index =
		train.getAllPlatformsNextIndex() == train.getAllPlatforms().size()
			? -1
			: train.getAllPlatformsNextIndex(); //判断是不是处于回库
	if (index == -1) {
		return {
			number: "273",
			destination: "晓港湾总站",
			origin: "迎宾馆",
			nextStation: "晓港新村",
			allStation: [
				"迎宾馆",
				"解放中路",
				"解放南路",
				"堑口",
				"宝岗大道北",
				"宝岗大道中",
				"海珠区妇幼",
				"江南新村",
				"江南新村（骨伤科医院）",
				"江南西路",
				"华海大厦",
				"广医二院",
				"晓港新村",
				"东晓南路",
				"五凤乡",
				"瑞南新村",
				"晓港湾",
				"晓港湾总站"
			]
		}; //如果不在正线上返回此值
	} else {
		let FP = train.getAllPlatforms()[0]; //First Plaform，获取首个站台信息
		let origin,
			destination,
			nextStation,
			allStation = []; //定义参数（线路号码，发车站，终点站，下一站）
		try {
			for (let i = 0; i < train.getAllPlatforms().size(); i++) {
				allStation[i] =
					TextUtil.getCjkParts(train.getThisRoutePlatforms()[i].station.name) +
					""; //循环获取从第一个站到最后一个站的站名，
			}
			nextStation =
				TextUtil.getCjkParts(train.getAllPlatforms()[index].station.name) + "";
			origin = TextUtil.getCjkParts(FP.station.name) + "";
			destination = TextUtil.getCjkParts(FP.destinationName) + ""; //尝试获取各种站名
		} catch (e) {
			//未能成功获取时执行此段(如无法获取所属站)
			nextStation = "未命名";
			origin = "未命名";
			destination = "未命名";
			allStation = [
				"广医二院",
				"晓港新村",
				"东晓南路",
				"五凤乡",
				"瑞南新村",
				"晓港湾",
				"晓港湾总站"
			]; //给与默认数据(数据来自于广州公交273路3-2-E042(3-59645)的定班车)
		}
		let number = "" + FP.route.name; //设置线路号码
		return { number, destination, origin, nextStation, allStation };
	}
}
//判断线路是否相同，若不相同，则刷新（参照"刷新线路部分")
function isSameRoute(r1, r2) {
	return (
		r1.origin == r2.origin &&
		r1.destination == r2.destination &&
		r1.number == r2.number
	); //判断线路上下行
	//origin相同即同出发站(调试用途较多后续可能删），destination相等即为同向，number相等即位同一线路，nextStation(可选)相等即为在同一站路程上(公交一般不需要)
}
/**
 * 自动化渲染文本，完成所有关于渲染的操作
 * @param {Graphics} g Graphics对象
 * @param {String} content 要使用drawString()方法输出的内容
 * @param {int} totalWidth 文本总宽度
 * @param {Font} Font 已deriveFont()的字体
 * @param {int} x X轴起始点
 * @param {int} y y轴起始点(为字体的基线)
 * @returns {void} 进行渲染文本的操作
 */
function drawText(g, content, totalWidth, Font, x, y) {
	let length = content.length; //获取字符串长度
	let MaxWidth = totalWidth / getLength(content); //每个字符的最大宽度
	let FontMetrics = g.getFontMetrics(Font); //获取字体Metrics
	let CharWidth = [];
	for (let i = 0; i < length; i++) {
		//获取字体宽，在后续中使x点在左
		CharWidth[i] = FontMetrics.stringWidth(content[i]) / 2;
	}
	for (let i = 0; i < length; i++) {
		let Char = content[i];
		let charPosition = MaxWidth * (i + 0.5) - CharWidth[i]; //i+0.5，使它刚好在中心位置
		g.drawString(Char, x + charPosition, y);
	}
}
