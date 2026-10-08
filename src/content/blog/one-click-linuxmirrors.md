---
title: "一键更换 Linux 软件源"
description: "LinuxMirrors 是一个完全开源的非盈利项目，它能一键更换 Linux 系统软件源，支持基于 Debian、 RedHat、 OpenCloudOS、 openEuler、 openSUSE、 Arch Linux 的发行版和及其部…"
pubDate: 2023-11-05
updatedDate: 2025-12-15
tags: ["VPS"]
---

LinuxMirrors 是一个完全开源的非盈利项目，它能一键更换 Linux 系统软件源，支持基于 `Debian`、 `RedHat`、 `OpenCloudOS`、 `openEuler`、 `openSUSE`、 `Arch Linux` 的发行版和及其部分衍生版本，理论支持所有架构的环境。

## 使用方法

先使用 `sudo -i` 或 `su root` 切换为 `root` 用户权限。

**国内使用**

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

或使用 Gitee 源

```bash
bash <(curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/ChangeMirrors.sh)
```

**国内教育网使用**

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh) --edu
```

**海外使用**

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh) --abroad
```

或使用 Github 源

```bash
bash <(curl -sSL https://raw.githubusercontent.com/SuperManito/LinuxMirrors/main/ChangeMirrors.sh) --abroad
```

**其他**

若显示 Curl Command not found，可复制 `https://linuxmirrors.cn/main.sh` 源码，保存为本地文件 `main.sh`，再执行 `bash main.sh`。

本文参考至 [LinuxMirrors 官网](https://linuxmirrors.cn/use/)。
