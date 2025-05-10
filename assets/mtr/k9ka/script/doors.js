let rawDoorModels = ModelManager.loadPartedRawModel(
	Resources.manager(),
	Resources.id("mtr:k9ka/model/doors.obj"),
	null
);
var doorModels = uploadPartedModels(rawDoorModels);
const doorFZ = 0.668227,
	rodFZ = [0.32725, 0.326959];
const doorRZ = 0.64895,
	rodRZ = [0.317611, 0.32];
var doorPosition = [
	{ x: -1.25166, y: -0.0699, z: 5.08988 },
	{ x: -1.25967, y: -0.0699, z: -1.04042 }
];
const doorOpenSound = Resources.id("mtr:k9ka.door.open");
const doorCloseSound = Resources.id("mtr:k9ka.door.close");
const doorTime = 0.3;

//----------

function create(ctx, state, train) {
	state.Status = new Array(train.trainCars()).fill(new StateTracker());
	for (let i of state.Status) i.setState("Close");
}

//----------

function render(ctx, state, train) {
	let doorValue = Math.min(
		1,
		0.5 *
			Math.sin(((10 / 3) * Math.min(0.3, train.doorValue()) - 0.5) * Math.PI) +
			0.5
	);
	for (let i = 0; i < train.trainCars(); i++) {
		if (
			state.Status[i].stateNow() == "Close" &&
			train.doorRightOpen[i] &&
			train.isDoorOpening()
		) {
			state.Status[i].setState("Open");
			ctx.playCarSound(
				doorOpenSound,
				i,
				0,
				0,
				0,
				1,
				1 + Math.random() * 0.2 - 0.1
			);
		} else if (
			state.Status[i].stateNow() == "Open" &&
			train.doorValue() <= doorTime + 0.1 &&
			train.doorRightOpen[i] &&
			!train.isDoorOpening()
		) {
			state.Status[i].setState("Close");
				ctx.playCarSound(
					doorCloseSound,
					i,
					0,
					0,
					0,
					1,
					1 + Math.random() * 0.2 - 0.1
				);
		}
	} // prettier-ignore
	let matrices = state.matrices;

	for (let i = 0; i < 2; i++) {
		matrices.pushPose();
		matrices.translate(doorPosition[i].x, doorPosition[i].y, doorPosition[i].z);
		for (let j = 0; j < 2; j++) {
			for (let k = 0; k < train.trainCars(); k++) {
				let rotateY = train.doorRightOpen[k] ? 0.5 * doorValue * Math.PI : 0;
				let translateFZ = SmoothValue(rodFZ[0], rodFZ[1], 0, 1, doorValue),
					translateRZ = SmoothValue(rodRZ[0], rodRZ[1], 0, 1, doorValue);
				matrices.pushPose();
				matrices.translate(0, 0, (i ? doorRZ : doorFZ) * (j ? -1 : 1));
				matrices.rotateY(rotateY * (j ? 1 : -1));
				matrices.translate(0, 0, (i ? translateRZ : translateFZ) * (j ? 1 : -1)); //prettier-ignore
				matrices.rotateY(rotateY * (j ? -2 : 2));
				ctx.drawCarModel(
					doorModels[(i ? "rear" : "front") + (j ? "Right" : "Left")],
					k,
					matrices
				);

				matrices.popPose();
			}
		}
		matrices.popPose();
	}
}

//----------

function SmoothValue(startValue, endValue, startTime, endTime, time) {
	let time_mod = Math.max(startTime, time);
	time_mod = Math.min(endTime, time_mod);
	let timeChange = endTime - startTime;
	let valueChange = endValue - startValue;
	return time * (valueChange / timeChange) + startValue;
}
function uploadPartedModels(rawModels) {
	let result = {};
	for (it = rawModels.entrySet().iterator(); it.hasNext(); ) {
		entry = it.next();
		entry.getValue().applyUVMirror(false, true);
		result[entry.getKey()] = ModelManager.uploadVertArrays(entry.getValue());
	}
	return result;
}
