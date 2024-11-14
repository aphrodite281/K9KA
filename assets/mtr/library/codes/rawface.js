/**
 *面对象，避免一大堆参数怼在程序里面
 * @param {String} renderType 渲染类型
 * @param {Vector3f[]} vertexs 每个顶点（右上角开始逆时针方向）
 * @param {int[][]} UV 每个顶点的UV
 * @param {ResourceLocation} texture 面贴图
 */
function RawFace(renderType, vertexs, UV, texture) {
	if (vertexs != null) {
		this.sides = vertexs.length;
		this.vertexs = vertexs;
		this.texture = texture;
		this.renderType = renderType;
		this.UV = UV;
	} else {
		// prettier-ignore
		throw new Error("New RawFace failed:Vertexs is null");
	}
	/**
	 * 新建面并添加进RawModel内
	 */
	this.createFace = () => {
		this.RawModel = new RawModel();
		// prettier-ignore
		let MeshBuilder = new RawMeshBuilder(this.sides, this.renderType, this.texture);
		for (let i = 0; i < this.sides; i++) {
			// prettier-ignore
			MeshBuilder.vertex(this.vertexs[i]).normal(0, 0, 0).uv(this.UV[i][0], this.UV[i][1]).endVertex();
		}
		this.RawModel.append(MeshBuilder.getMesh());
	};
	/**
	 * 上传当前RawModel至DynamicModelHolder
	 */
	this.uploadModel = () => {
		this.DynamicModelHolder =
			this.DynamicModelHolder == null
				? new DynamicModelHolder()
				: this.DynamicModelHolder;
		this.RawModel != null
			? this.DynamicModelHolder.uploadLater(this.RawModel)
			: print("uploadModel failed: RawModel is null");
	};
	/**
	 * 使用ModelManager上传ModelCluster
	 */
	this.uploadModelManager = () => {
		this.RawModel != null
			? (this.ModelCluster = ModelManager.uploadVertArrays(this.RawModel))
			: print("uploadModelManager failed: RawModel is null");
	};
	/**
	 *下载模型至ModelCluster
	 */
	this.downloadModel = () => {
		this.DynamicModelHolder.getUploadedModel() != null
			? (this.ModelCluster = this.DynamicModelHolder.getUploadedModel())
			: (this.ModelCluster = this.ModelCluster);
		//print("downloadModel failed: RawModel unupload");
	};
	/**
	 *  替换面贴图(不包含上传)
	 * @param {ResourceLocation} texture 替换为的贴图
	 * @param {boolean} isRawModel 替换RawModel||ModelCluster贴图
	 */
	this.replaceTexture = (texture, isRawModel) => {
		if (texture != null) {
			isRawModel
				? this.RawModel != null
					? this.RawModel.replaceAllTexture(texture)
					: print("replaceTexture failed: RawModel is null")
				: this.ModelCluster != null
				? this.ModelCluster.replaceAllTexture(texture)
				: print("replaceTexture failed: ModelCluster is null");
		} else {
			print("replaceTexture failed: texture is null");
		}
	};
	this.drawFace = (ctx, trainCar, matrices) => {
		if (this.ModelCluster != null) {
			try {
				ctx.drawCarModel(this.ModelCluster, trainCar, matrices);
			} catch (error) {
				throw new Error("囸");
			}
		} else {
			print("drawFace failed: ModelCluster is null");
		}
	};
	this.drawDMHFace = (ctx, trainCar, matrices) => {
		if (this.DynamicModelHolder != null) {
			try {
				ctx.drawCarModel(this.DynamicModelHolder, trainCar, matrices);
			} catch (error) {
				throw new Error("囸");
			}
		} else {
			print("drawDMHFace failed: DynamicModelHolder is null");
		}
	};
	/**
	 *（高级功能)更改RawModel中每个顶点的UV坐标
	 * @param {int[][]} NewUV 新的UV坐标
	 */
	this.changeUV = (NewUV) => {
		for (let [materialProp, rawMesh] of this.RawModel.meshList) {
			let times = 0;
			for (let vertex of rawMesh.vertices) {
				NewUV[times] != null && vertex.u != NewUV[times][0]
					? (vertex.u = NewUV[times][0])
					: null;
				NewUV[times] != null && vertex.v != NewUV[times][1]
					? (vertex.v = NewUV[times][1])
					: null;
				times++;
			}
		}
	};
	/**
	 * 复制函数（仅能复制RawModel与方法)
	 * @returns 返回该物体复制过的RawModel对象
	 */
	this.copy = () => {
		let newRawFace = new RawFace(
			this.renderType,
			this.vertexs,
			this.UV,
			this.texture
		);
		newRawFace.createFace();
		return newRawFace;
	};
	/**
	 *（高级功能)更改RawModel为每个坐标添加UV增量（可用于制作滚动屏幕）
	 * @param {int} u 每次u方向的增量
	 * @param {int} v 每次v方向的增量
	 */
	this.incrementUV = (U, V) => {
		for (let [materialProp, rawMesh] of this.RawModel.meshList) {
			for (let vertex of rawMesh.vertices) {
				vertex.u += U;
				vertex.v += V;
			}
		}
	};
	/**
	 *	从另一个RawFace对象上复制UV到本RawFace上
	 * @param {RawFace} RawFace UV源的RawFace
	 */
	this.copyUVfromRawface = (RawFace) => {
		for (let [materialProp, rawMesh] of this.RawModel.meshList) {
			for (let vertex of rawMesh.vertices) {
				vertex.u += U;
				vertex.v += V;
			}
		}
	};
	/**
	 * (高级功能) 获取此对象的RawModel
	 * @returns {RawModel} 返回该对象的RawModel||Void
	 */
	this.getRawModel = () => {
		if (this.RawModel != null) return this.RawModel;
		print("getRawModel failed: RawModel == null");
	};
	/**
	 * (高级功能) 获取此对象的ModelCluster
	 * @returns {RawModel} 返回该对象的ModelCluster||Void
	 */
	this.getModelCluster = () => {
		if (this.ModelCluster != null) return this.ModelCluster;
		//print("getModelCluster failed: ModelCluster == null");
	};
}
/**
 * 等效于ctx.drawCarModel()
 * @param {ctx} ctx
 * @param {int} trainCar
 * @param {Matrices} matrices
 */
RawFace.prototype.drawFace = function (ctx, trainCar, matrices) {
	if (this.ModelCluster != null)
		ctx.drawCarModel(this.ModelCluster, trainCar, matrices);
};
// prettier-ignore
