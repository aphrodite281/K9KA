/**
 * 新建四边面
 * @param {String} renderType
 * @param{{position:Vector3f,rotation:Vector3f,scale:Vector3f,isReverse:boolean}} translate
 * @param {ResourceLocation} texture 贴图,可留空
 * @param translate.rotation 使用角度制
 * @param translate.scale 输入x,y z为0即可
 */
function RawFace(renderType, translate, texture, uv) {
	try {
		this.uv = uv;
		this.renderType = renderType;
		this.translate = translate;
		this.position = translate.position;
		this.rotation = translate.rotation;
		this.scale = translate.scale;
		this.texture = texture;
	} catch (e) {
		throw new Error("新建RawFace失败:数据不完整");
	}
	this.matrix = new Matrix4f();
	this.matrix.translate(
		this.position.x(),
		this.position.y(),
		this.position.z()
	);
	this.matrix.rotateX(this.rotation.x() * (Math.PI / 180));
	this.matrix.rotateY(this.rotation.y() * (Math.PI / 180));
	this.matrix.rotateZ(this.rotation.z() * (Math.PI / 180));
	/**
	 * 以当前数据新建面
	 * @returns RawFace
	 */
	this.buildFace = () => {
		// prettier-ignore
		this.uv != null
			? null
			: uv = [[1, 0],[0, 0],[0, 1],[1, 1]];
		let x1 = -(this.scale.x() / 2),
			x2 = this.scale.x() / 2;
		let y1 = -(this.scale.y() / 2);
		let y2 = this.scale.y() / 2;
		let vertices = [
			new Vector3f(x2, y2, 0),
			new Vector3f(x1, y2, 0),
			new Vector3f(x1, y1, 0),
			new Vector3f(x2, y1, 0)
		];
		let rawMesh = new RawMeshBuilder(4, this.renderType, this.texture);
		for (let i = 0; i < vertices.length; i++) {
			rawMesh
				.vertex(this.matrix.transform(vertices[i]))
				.normal(0, 0, 0)
				.uv(uv[i][0], uv[i][1])
				.endVertex();
		}
		this.rawModel = new RawModel();
		this.rawModel.append(rawMesh.getMesh());
		return this;
	};
	/**
	 * 将模型上传为ModelCluster，可后续调用
	 */
	this.uploadModelCluster = () => {
		try {
			this.ModelCluster = ModelManager.uploadVertArrays(this.rawModel);
		} catch (e) {
			throw new Error("上传失败:rawModel为空或在create/render/dispose中调用");
		}
		return this;
	};
	/**
	 * 将模型上传为ModelHolder，可后续调用
	 */
	this.uploadModelHolder = () => {
		this.modelHolder = new DynamicModelHolder();
		if (this.rawModel != null) this.modelHolder.uploadLater(this.rawModel);
		else throw new Error("上传失败:rawModel为空");
		return this;
	};
	this.drawFace = (ctx, trainCars, matrices) => {
		if (this.modelHolder != null) {
			ctx.drawCarModel(this.modelHolder, trainCars, matrices);
		} else if (this.ModelCluster != null) {
			ctx.drawCarModel(this.ModelCluster, trainCars, matrices);
		}
		return this;
	};
	/**
	 * 更改该RawFace对象的贴图
	 * @param {ResourceLocation} texture 要更换为的贴图
	 * @param {boolean} isModelCluster 更改ModelCluster|RawModel
	 * @param {boolean} upload 是否上传rawModel
	 * @returns
	 */
	this.replaceTexture = (texture, isModelCluster, upload) => {
		if (isModelCluster) {
			this.ModelCluster.replaceAllTexture(texture);
		} else {
			this.rawModel.replaceAllTexture(texture);
			upload
				? ((this.modelHolder = new DynamicModelHolder()),
				  this.modelHolder.uploadLater(this.rawModel))
				: null;
		}
		return this;
	};
	/**
	 * 复制此对象的RawModel以及所有方法
	 * @returns 新的RawFace对象
	 */
	this.copy = () => {
		let newRawFace = new RawFace(
			this.renderType,
			this.translate,
			this.texture
		).buildFace();
		return newRawFace;
	};
	return this;
}
