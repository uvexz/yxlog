---
title: "单 PHP 文件获取 Bing 每日图片"
description: "代码如下："
pubDate: 2023-11-10
updatedDate: 2025-12-16
tags: ["Notes"]
---

![](https://7ed.net/bing/api)

代码如下：

```
<?php
// 判断是否随机调用
$gettimebase = isset($_GET['day']) ? $_GET['day'] : '';
if (isset($_GET['rand']) && $_GET['rand'] === 'false') {
    $gettime = empty($gettimebase) ? 0 : $gettimebase;
} else {
    // 若不为随机调用则判断是否指定日期
    $gettime = empty($gettimebase) ? rand(-1, 7) : $gettimebase;
}

// 获取 Bing Json 信息
$mkt = isset($_GET['cn']) && $_GET['cn'] === 'true' ? 'zh-CN' : 'en-US';
$json_string = file_get_contents("https://www.bing.com/HPImageArchive.aspx?format=js&idx=$gettime&n=1&mkt=$mkt");

// 转换为 PHP 数组
$data = json_decode($json_string);

// 提取基础 URL
$imgurlbase = "https://www4.bing.com{$data->images[0]->urlbase}";

// 判断是否指定图片大小
$imgsizebase = isset($_GET['size']) ? $_GET['size'] : '';
$imgsize = empty($imgsizebase) ? "1920x1080" : $imgsizebase;

// 建立完整 URL
$imgurl = "{$imgurlbase}_{$imgsize}.jpg";

// 获取其他信息
$imgtime = $data->images[0]->startdate;
$imgtitle = $data->images[0]->title;
$imglink = $data->images[0]->copyrightlink;

// 判断是否只获取图片信息
if (isset($_GET['info']) && $_GET['info'] === 'true') {
    echo "{title:$imgtitle,url:$imgurl,link:$imglink,time:$imgtime}";
} else {
    // 若不是则跳转 URL
    ob_start();
    header("Location: $imgurl");
    ob_end_flush();
}
?>

```

将代码保存为 `bing.php` 并上传至您的主机，访问 `yourdomain.com/bing.php` 即可。

默认的参数为： `rand=true`，`day=0`，`size=1920x1080`，`info=false`，`cn=false`

例如，随机获取大小 320x240 的图片则可以引用：

```html
yourdomain.com/bing.php?rand=true&size=320x240
```

* * *

部署至 Vercel：

将 bing.php 存入 api 文件夹，并新建 `vercel.json`

```json
{
  "functions": {
    "api/*.php": {
      "runtime": "vercel-php@0.6.0"
    }
  },
  "routes": [
  	{ "src": "/bing/api(.*)","dest": "api/bing.php", "headers": { "Access-Control-Allow-Origin": "*" }}
  ]
}
```

整体目录如下：

```
- 项目文件夹
  - api
    - bing.php
  - vercel.json
  - index.html //可选
```

在项目文件夹内部署 `vc --prod`

访问 `random.vercel.app/bing/api` 即可
