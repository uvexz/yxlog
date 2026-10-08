---
title: "使 Windows Terminal 变得更易用（好看）"
description: "准备工作"
pubDate: 2025-03-13
updatedDate: 2026-01-19
tags: ["Windows"]
---

## 准备工作

右键开始菜单，选择 `终端管理员`，运行

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

开启执行远程命令的权限。

## 个性化

在 wt(Windows Terminal) 设置面板中左下角 `打开 JSON 文件`，然后找到 defaults 关键字并在后面花括号里追加以下代码：

```
//亚克力毛玻璃效果
"useAcrylic": true,
//亚克力毛玻璃效果透明度
"acrylicOpacity": 0.2,
//背景壁纸
"backgroundImage": "C:/Users/XXX/Pictures/Saved Pictures/wt.jpeg",
//背景壁纸透明度
"backgroundImageOpacity": 0.4,
"fontFace": "JetBrainsMono Nerd Font Mono",
"fontSize": 14
```

## oh-my-posh

微软商店下载 oh-my-posh，下载安装完成后会自动配置；

此时在 wt 里输入 `notepad $PROFILE` 用记事本打开该配置文件，打开后添加以下代码：

```
oh-my-posh init pwsh --config $env:POSH_THEMES_PATH\montys.omp.json | Invoke-Expression

cls
```

若提示文件不存在，则执行 `echo $PROFILE` 查看文件位置，并新建。

安装 Nerd 字体解决 oh-my-posh 字体图标不显示，推荐安装 JetBrainsMono：

- [https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/JetBrainsMono.zip](https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/JetBrainsMono.zip)

![](https://boost.jpgcdn.com/b2.jpgcdn.com/2025/03/13/ivfl.png)

本文转载自 [1](https://www.barryi.me/posts/wt.html)
