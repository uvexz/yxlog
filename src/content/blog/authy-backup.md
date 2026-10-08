---
title: "导出 Authy 储存的 TOTP tokens | 备份 Authy"
description: "准备"
pubDate: 2023-07-12
updatedDate: 2026-03-26
tags: ["Notes"]
---

## 准备

1. Linux/MacOS(intel)/Windows WSL 机器一台
2. Authy 应用处于登录状态

## 下载

访问以下连接，下载 `authy-export`

- [https://github.com/alexzorin/authy/releases](https://github.com/alexzorin/authy/releases)

大陆地区加速下载：

- MacOS(intel): [https://gh.sevencdn.com/https://github.com/alexzorin/authy/releases/download/v0.3.1/authy-export-darwin-amd64](https://gh.sevencdn.com/https://github.com/alexzorin/authy/releases/download/v0.3.1/authy-export-darwin-amd64)
- Linux/Windows WSL: [https://gh.sevencdn.com/https://github.com/alexzorin/authy/releases/download/v0.3.1/authy-export-linux-amd64](https://gh.sevencdn.com/https://github.com/alexzorin/authy/releases/download/v0.3.1/authy-export-linux-amd64)

## 使用

打开终端，运行 `./authy-export-linux-amd64` 或 `./authy-export-darwin-amd64`

1. 输入 Authy 注册电话国家区号，不加 `+`，例如 `1`, `86`
2. 输入 Authy 注册电话号码， 例如 `8008208820`
3. 打开现有 Authy 应用，授权登录
4. 输入备份密码

即可得到您现有的 TOTP code：

```
otpauth://totp/Google:xxxxxx@gmail.com?digits=6&secret=xxxxxx
......
```

[![](https://boost.jpgcdn.com/bs3.jpgcom.com/2023/06/28/1f924a1c6204b58c25c6a6bb23d39a9c.png)](https://boost.jpgcdn.com/bs3.jpgcom.com/2023/06/28/1f924a1c6204b58c25c6a6bb23d39a9c.png)

备份成功后记得删除 `~/authy-go.json` 文件。
