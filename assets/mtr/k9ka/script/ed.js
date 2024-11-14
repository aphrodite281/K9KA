/*const boardNames = ["Front","Side","Back"];
const boardPosition = [{x:0,y:1.35963,z:6.05834},{x:-1.25383,y:0.247415,z:3.50512},{x:0,y:1.3345,z:-5.86401}];//电显位置，来自Blender
//模型导出后位置 z=-x,y=z,x=-y
const boardRotation = [{x:0,y:0,z:0},{x:0,y:-Math.PI/2,z:0},{x:0,y:Math.PI,z:0}];//显示屏的旋转(弧度制)
const boardSize = [{x:1.71,y:0.23,z:0},{x:0,y:0.33,z:1.12},{x:1.53,y:1.53,z:0}]//显示屏的字体*/

//导入库
include("mtr:library/codes/base.js");//功能性代码库（由Aphrodite28开发）
importPackage(java.awt);
importPackage(java.awt.geom);//导入Java.awt库

const boardFront ={
    /*Position:{x:0,y:1.35963,z:6.05834},
    Rotation:{x:0,y:0,z:0},
    Size:{x:1.71,y:0.24,z:0},均为参考数值(也许后续有需要)*/
    
    vertexL:[new Vector3f(-0.24,1.48,6.07),new Vector3f(-0.24,1.24,6.07),new Vector3f(-0.86,1.24,6.07),new Vector3f(-0.86,1.48,6.07)],//Blender计算，最小单位最好为0.01（向上取整）,从左上逆时针转一圈
    vertexM:[],
    pixelLR:[62,24],PixelM:[48,24]
    //62，48，62
    //172,24
    //180,28尝试x2看看效果
}
const boardSide ={
    /*Position:{x:-1.25383,y:0.247415,z:3.50512},
    Rotation:{x:0,y:-Math.PI/2,z:0},
    Size:{x:0,y:0.33,z:1.12}*/
}
//const numberWidth = [15,7,13,14,15,14,13,13,14,13];
const half_numberWidth = [7.5,3.5,6.5,7,7.5,7,6.5,6.5,7,6.5];
const HZK12 = Resources.readFont(Resources.id("mtr:k9ka/font/ipix_12px.ttf"));//读取字体HZK12
const HZK24S = Resources.readFont(Resources.id("mtr:k9ka/font/hzk24s.ttf"));//读取字体HZK24S
const MSYH = Resources.readFont(Resources.id("mtr:k9ka/font/microsoftyahei.ttf"))
const Tongda_red = new Color(0xda2d33),Tongda_yellow = new Color(0xf8cf8b);//#da2d33,#f8cf8b
//上为定义部分，下位程序部分
function create(ctx, state, train){
    let parts = ["left","middle","right"]
    state.ModelHolder = {front:{},back:{}};
    for(let part of parts){
        state.ModelHolder.front[part] = new DynamicModelHolder();
        state.ModelHolder.back[part] = new DynamicModelHolder();
    }
    delete parts;
    boardFront.leftImage = new GraphicsTexture(boardFront.pixelLR[0],boardFront.pixelLR[1]);
    //新建GraphicsTexture用于java.awt绘画
    //F = Front,S = Side,B = Back
    state.route = getRoute(train);//获取路线

    {
        let vertexs =boardFront.vertexL;
        let BoardBuilder = new RawMeshBuilder(4,"exterior",null);
        var rawBoardModel = new RawModel();
        BoardBuilder
            .vertex(vertexs[0]).normal(0, 0, 0).uv(1,0).endVertex()
            .vertex(vertexs[1]).normal(0, 0, 0).uv(1,1).endVertex()
            .vertex(vertexs[2]).normal(0, 0, 0).uv(0,1).endVertex()
            .vertex(vertexs[3]).normal(0, 0, 0).uv(0,0).endVertex();//使用上面传入的Board对象所给出的数据进行建面(使用顶点数据)
    rawBoardModel.append(BoardBuilder.getMesh());//添加至RawModel
    rawBoardModel.generateNormals();//生成法线
    state.ModelHolder.front.left.uploadLater(rawBoardModel);
    
    }
    
    //state.boardFrontHolder.uploadLater(createBoard(boardFront.vertexL));//上传新建的电显牌
    //drawBoard(state);//绘制电显
    state.FrefreshRate = new RateLimit(0.1);//限制屏幕更新频率
    
}

function render(ctx,state,train){
    let boardFrontLeft = state.ModelHolder.front.left.getUploadedModel()
    boardFrontLeft.replaceAllTexture(Resources.id("mtr:k9ka/model/ed.png"));
    //前期准备工作(获取模型，替换贴图，设置补偿)
    let boardMatrices = new Matrices();//新建矩阵保存补偿参数
    //boardMatrices.translate(0,0.5,0);//设置补偿（因为本车原点下降了0.5m所以向上补偿0.5m,可参见mtr_custom_resources.json#10
    if(!isSameRoute(state.route, getRoute(train))) {
        state.route = getRoute(train);
        //刷新线路信息
    }
    if(state.FrefreshRate.shouldUpdate()){
        //drawBoard(state);//绘制电显
        //state.boardFrontModel.replaceAllTexture(state.awtImageF.identifier)//用AWT所画贴图替换
        //print("shouldUpdate() = true")
    }
    for(let l = 0;l <train.trainCars();l++){//分列车渲染（虽然一般用不上）
            ctx.drawCarModel(boardFrontLeft,l,boardMatrices);//加载上传模型，
            boardFrontLeft.close();
            //渲染部分 
            }  
    /*else{
        throw new Error("任意一个ModelHolder为空")
        }*/
        debugInfo(ctx,state,train);
}

function drawRoute(GraphicsTexture,content,size,type){
    let g = GraphicsTexture.graphics;
    g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);
    g.setColor(Color.WHITE);
    g.fillRect(0,0,size[0],size[1]);   
/*
    //字体宽度计算
    let numberWidth = [];
    let width = size[0];
    HZK24Metrics = g.getFontMetrics(HZK24S);

    //初步等分每个字体最大空间
    let numberMaxSize = width / content.length;

    //使用Metrics计算每个字半宽度为多少（用以补偿Java.awt drawString()原点在左下角）
    //字体中心点-半个字宽即为drawString()的x坐标
    for(let i = 0;i<state.route.number.length;i++){
       numberWidth[i] = HZK24Metrics.stringWidth(state.route.number[i])/2;
    }

    //绘画部分
    {//始发站
        let Text = state.route.origin
        let Font = ScaledXFont(MSYH,Text.length,26);//自动计算字体大小
        g.setColor(Tongda_yellow);//设置颜色
        g.setFont(Font);
        drawText(g,Text,55,Font,0,22);//普通文本渲染
    }
    {
        let Text = state.route.destination
        let Font = ScaledXFont(MSYH,Text.length,26);//自动计算字体大小
        //字体缩放计算与设置
        g.setColor(Tongda_yellow);//设置颜色
        g.setFont(Font);
        //文本渲染
        if(Text.length<=4) drawText(g,Text,55,Font,110,22);//普通文本渲染
        else drawScrollText(state.destinationTime,g,Text,110,180,Font,22);print("ScrollTextDrawed")//滚动文本渲染
    }
    {
        g.setFont(HZK24S.deriveFont(Font.PLAIN , 26))
        g.setColor(Color.BLACK);
        g.fillRect(65,0,45,28);
        g.setColor(Tongda_red);
        for(let i=0;i<state.route.number.length;i++){
        let number = state.route.number[i];
            let numberPosition = numberMaxSize * (i+0.5) -numberWidth[i];
            g.drawString(number,60 + numberPosition,24);
    }
}
    
    */
    //上传绘画图像
    GraphicsTexture.upload();
}
/*function drawBoard(state){//绘画电牌,后应合并至refreshBoard
        //前期准备（新建GraohicsTexture,关闭抗锯齿，涂黑)
        state.awtImageF = new GraphicsTexture(boardFront.pixel[0],boardFront.pixel[1]),
        state.awtImageS = new GraphicsTexture(10,10),
        state.awtImageB = new GraphicsTexture(10,10);
        let g = state.awtImageF.graphics;
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);
        g.setColor(Color.BLACK);
        g.fillRect(0,0,342,46);   

        //字体宽度计算
        let numberWidth = [];

        HZK24Metrics = g.getFontMetrics(HZK24S);

        //初步等分每个字体最大空间
        let numberMaxSize = 45 / state.route.number.length;

        //使用Metrics计算每个字半宽度为多少（用以补偿Java.awt drawString()原点在左下角）
        //字体中心点-半个字宽即为drawString()的x坐标
        for(let i = 0;i<state.route.number.length;i++){
           numberWidth[i] = HZK24Metrics.stringWidth(state.route.number[i])/2;
        }

        //绘画部分
        {//始发站
            let Text = state.route.origin
            let Font = ScaledXFont(MSYH,Text.length,26);//自动计算字体大小
            g.setColor(Tongda_yellow);//设置颜色
            g.setFont(Font);
            if(Text.length<=4) drawText(g,Text,55,Font,10,22);//普通文本渲染
            else drawScrollText(state.originTime,g,Text,0,65,Font,22);print("ScrollTextDrawed")//滚动文本渲染
        }
        {
            let Text = state.route.destination
            let Font = ScaledXFont(MSYH,Text.length,26);//自动计算字体大小
            //字体缩放计算与设置
            g.setColor(Tongda_yellow);//设置颜色
            g.setFont(Font);
            //文本渲染
            if(Text.length<=4) drawText(g,Text,55,Font,110,22);//普通文本渲染
            else drawScrollText(state.destinationTime,g,Text,110,180,Font,22);print("ScrollTextDrawed")//滚动文本渲染
        }
        {
            g.setFont(HZK24S.deriveFont(Font.PLAIN , 26))
            g.setColor(Color.BLACK);
            g.fillRect(65,0,45,28);
            g.setColor(Tongda_red);
            for(let i=0;i<state.route.number.length;i++){
            let number = state.route.number[i];
                let numberPosition = numberMaxSize * (i+0.5) -numberWidth[i];
                g.drawString(number,60 + numberPosition,24);
        }
    }
        
        
        //上传绘画图像
        state.awtImageF.upload();
}*/
/**
 * 备注:顶点顺序为由左上顺时针旋转
 * @param {Vector3f[]} vertexs
 * @param {int[][]} UV 数组,格式为UV = [[x,y],[x,y],[x,y],[x,y]],不使用用可填null
 * @returns rawModel
 */
function createBoard(vertexs){
    let rawBoardModel = new RawModel();//新建Rawmodel
    let BoardBuilder = new RawMeshBuilder(4,"exterior",Resources.id("mtr:k9ka/model/ed.png"))//RawMeshBuilder新建四边形
    /*for(i=0;i<4;i++){
        let autoX = isReverse ? (i == 0||i == 1 ? 1:0) : (i == 2||i == 3?1:0);
        let autoY = i == 2||i ==3 ? 1:0;
        let[x,y] = UV != null?UV[i]:[autoX,autoY];
        BoardBuilder.vertex(vertexs[i]).normal(0,0,1).uv(x,y).endVertex();
    }*/
            BoardBuilder
            .vertex(vertexs[0]).normal(0, 0, 0).uv(1,0).endVertex()
            .vertex(vertexs[1]).normal(0, 0, 0).uv(1,1).endVertex()
            .vertex(vertexs[2]).normal(0, 0, 0).uv(0,1).endVertex()
            .vertex(vertexs[3]).normal(0, 0, 0).uv(0,0).endVertex();//使用上面传入的Board对象所给出的数据进行建面(使用顶点数据)
    rawBoardModel.append(BoardBuilder.getMesh());//添加至RawModel
    rawBoardModel.generateNormals();//生成法线
    return rawBoardModel;
}
function debugInfo(ctx,state,train){
    for(let i=0;i<train.getAllPlatforms().size();i++){
        try{ctx.setDebugInfo("停靠站" + (i+1),state.route.allStation[i]);}
        catch(e){}
        }
        ctx.setDebugInfo("停靠站数",train.getAllPlatforms().size().toString())
    ctx.setDebugInfo("线路",state.route.number);//调试信息
    ctx.setDebugInfo("下一站",state.route.nextStation);//调试信息
    ctx.setDebugInfo("发车站",state.route.origin);
    ctx.setDebugInfo("终点站",state.route.destination);
    //ctx.setDebugInfo("起点滚动次数1",state.originTime.times1);
    //ctx.setDebugInfo("终点滚动次数1",state.destinationTime.times1);
    //ctx.setDebugInfo("起点滚动次数2",state.originTime.times2);
    //ctx.setDebugInfo("终点滚动次数2",state.destinationTime.times2);
    //ctx.setDebugInfo("BoardFront",state.awtImageF);
    //print(typeof state.route.number)
}

/**
 * 
 * @param {Font} Font 字体
 * @param {int} length 字符串的长度
 * @param {int} Size 字体的字号大小
 * @returns {derivedFont} 可直接使用的字体
 */
function ScaledXFont(Font,length,Size){//字体X轴缩放计算
    let fontTransform = new AffineTransform();//新建AffineTransform
    if(length==2) fontTransform.scale(0.75,1);//但是站名为两个字时使用scale(1,1)的观感不好，所以手动使用scale(0.75,1)
    else if(length>=5)fontTransform.scale(0.5,1);
    else fontTransform.scale(2/length,1);//试验得知4个字时为0.5刚刚好，所以为2/4,即2/length
    return Font.deriveFont(Font.PLAIN , Size).deriveFont(fontTransform);//返回修改过的字体
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
function drawText(g,content,totalWidth,Font,x,y){
    
    let length = content.length;//获取字符串长度
    let MaxWidth = totalWidth / getLength(content);//每个字符的最大宽度
    let FontMetrics = g.getFontMetrics(Font);//获取字体Metrics
    let CharWidth = [];
    for(let i = 0;i<length;i++){//获取字体宽，在后续中使x点在左 
        CharWidth[i] = FontMetrics.stringWidth(content[i])/2;
    }
    for(let i = 0;i<length;i++){
        let Char = content[i];
        let charPosition = MaxWidth * (i+0.5) - CharWidth[i];//i+0.5，使它刚好在中心位置
        g.drawString(Char,x + charPosition,y)
    }
    
}

/**
 * @param {state.time} time state.Ftimes或其他
 * @param {Graphics} g Graphics对象
 * @param {String} content 要使用drawString()方法输出的内容
 * @param {int} x1 x轴渲染起点
 * @param {int} x2 x轴渲染终点
 * @param {Font} Font 已deriveFont()的字体
 * @param {int} y y轴起始点(为字体的基线)
 * @returns {void} 渲染滚动文本
 */
function drawScrollText(time,g,content,x1,x2,Font,y){
    //print("DrawingScrollText")
    let times1 = time.times1;
    let length = content.length;//获取字符串长度
    let FontMetrics = g.getFontMetrics(Font);//获取字体Metrics
    let totalWidth = FontMetrics.stringWidth(content);
    let MaxWidth = totalWidth / getLength(content);//每个字符的最大宽度
    let CharWidth = [];
    for(let i = 0;i < length;i++){//获取字体宽，在后续中使x点在左 
        CharWidth[i] = FontMetrics.stringWidth(content[i])/2;
    }
    for(let i = 0;i < length;i++){
        let Char = content[i];//获取单个字符
        let charPosition = MaxWidth * (i+0.5) - CharWidth[i];//计算每个字的理论偏移
        //print("Content[i]" + i.toString());
        //print(charPosition );
        if(x1 + charPosition + times1 > x2||x1 + charPosition + 2 * CharWidth[i] + times1 < x1) continue;//检测该字符是否需要渲染
        else g.drawString(Char,times1 + x1 + charPosition,y);//滚动的路程加上起始点再加计算所得位置
    }
    time.times1--;
    print(time.times1)
    //print("Done");
    //滚动重置部分
}
