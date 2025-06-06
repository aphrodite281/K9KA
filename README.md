<div align="center"><img src=https://github.com/aphrodite281/K9KA/blob/inDevelop/K9KA-icon.png?raw=true width=50%></img>
</div>
<strong>

<strong><p align="center" style ="font-size:25px">广州公交
K9KA</p></strong></strong><div>

<img src=https://raw.githubusercontent.com/aphrodite281/K9KA/refs/heads/inDevelop/%E7%AC%AC%E4%B8%80%E5%B7%B4%E5%A3%AB.png width=50%/><img src=https://raw.githubusercontent.com/aphrodite281/K9KA/refs/heads/inDevelop/%E5%B9%BF%E5%B7%9E%E5%B7%B4%E5%A3%AB%E9%9B%86%E5%9B%A2.png width=50%/></div>

## 介绍

本追加包基于广州公交所拥有的 **广汽比亚迪 GZ6122LGEV(即 K9KA)** 制作，这也就是该
追加包名称的由来

该企划最早于**2024 年 7 月 15 日**提出，至今约 10 月，在此期间，开发的底层由最初
的 NTE0.5.1 到 NTE0.5.2 再到如今的 ANTE1.0.4，可谓是经历了十分之多的改变，在这
10 月之中，我与 Aphrodite28 陆陆续续的开发了许多功能(详见**实现功能**)，从无到有
，成为 MTR 公交新时代的开创者

## 使用方式

直接放入**资源包文件夹**即可

## 实现功能

1. 高精度车体模型
2. ~~真实的~~开门动画
3. 自动/自定义电牌功能
4. 与窗的交互效果

   <center><p style="font-size:25px;">还有更多功能等待你发现......</p></center>

## 环境要求

- [x] [Aphrodite's Nemo's Transit Expansion](https://modrinth.com/mod/mtr-ante)
      **1.0.4 hotfix-1 或更新**
- [x] [Minecraft Transit Railway](https://modrinth.com/mod/minecraft-transit-railway)
      **3.2.2 hotfix-1**
- [x] 以及以上模组的前置模组

## 特色功能

此处具有两种特色功能，你可在此处查看其使用方法

### 自定义电牌功能

此处提供了一个方式让您可以自己定义属于您自己的电牌新建一个 json，名称为您所想要
的线路号(注意此处只能使用**小写英文字母、数字、下划线**的组合) 您的线路 json 文
件内容结构应当如下

```
{
	"FrontDisplay": {
		"totalPage": 1,
		"pageClockReset": -1,//-1即为永远不进行换页以及重置页面计时操作
		"renderObject": {
			"ObjectA": {
				"require": true,
				"image": "mtr:k9ka/custom_route/80090/prsvg.png",
				"position": [0, 14]
			},
			"ObjectB": {
				"require": renderPage == 0,//当满足此条件时才会显示
				"image": "mtr:k9ka/custom_route/80090/Object.png",
				"position": ["1 - pageClock % 249", 14],
				"extra":"PageClock = 0"//此处可以填写JS代码，程序会直接调用运行
			}
		},//要显示的对象
		"renderList": [
			"ObjectA",
			"ObjectB"
		]//显示顺序，注意这里因为是按照顺序绘画，所以排在最后的图层最靠上
	},
	"SideDisplay": {
		"totalPage": 4,
		"pageClockReset": 100,
		"renderObject": {
		}
		"renderList": [
		]
	},
	"BackDisplay": {
		"totalPage": 1,
		"pageClockReset": 0,
		"renderObject": {
			"底图": {
				"require": true,
				"image": "mtr:k9ka/custom_route/80090/prsvg_b9_hnt.png",
				"position": [0, 0]
			}
		},
		"renderList": ["底图"]
	}
```

### 未完待续······

<br>

样例：包中附带一条基于广州快速公交 B9 线路制作的线路，您可通过在线路号码处键入
**80090** 使用并且该线路具有**特殊站点效果**，当站名为以下其一时便可触发
`体育中心|Tianhe Sports Center` `石牌桥|Shipai Qiao` `岗顶|Gangding`
`师大暨大|Normal University & Jinan University`

### 可互动的窗户

你可通过持续看着窗把手一秒来打开窗户关窗同理
