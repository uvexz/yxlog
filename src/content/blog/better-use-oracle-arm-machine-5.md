---
title: "榨干 ORACLE ARM 5/ 安装 Windows"
description: "不建议，具有删号的风险、具有变砖的风险。不适合不会救砖的同学。"
pubDate: 2025-01-30
updatedDate: 2026-05-12
tags: ["Windows", "Oracle"]
---

> 不建议，具有删号的风险、具有变砖的风险。不适合不会救砖的同学。

![](https://boost.jpgcdn.com/e4.jpgcdn.com/2024/11/28/iYoj.png)

## 准备工作

登录 OCI 后台，设置一下实例【传输中加密】为【已禁用】

![](https://boost.jpgcdn.com/b2.jpgcdn.com/2024/11/28/ipnZ.png)

安装依赖

```
apt install curl wget -y
```

## 安装 Windows

1、DD 的方式，大概历时 15 分钟

```
curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh && bash reinstall.sh dd --img https://r2.hotdog.eu.org/win11-arm-with-pagefile-15g.xz
```

默认用户名：administrator 密码：123@@@

2、ISO 方式，大概历时30+ 分钟

```
curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh

bash reinstall.sh windows \
  --image-name='Windows 11 enterprise ltsc 2024' \
  --iso 'https://drive.massgrave.dev/en-us_windows_11_iot_enterprise_ltsc_2024_arm64_dvd_ec517836.iso'
```

过程可以自定义密码（推荐），否则默认密码 123@@@

3、开始运行脚本解包

- 这个过程，大概是 5-6 分钟
- 这个过程，还是可以 ping 通机器的，在 cloudshell 里是可以看见过程的
- 装载 Windows（iso或者是dd包）及驱动等
- 后会自动重启

4、开始配置 Windows

- 这个过程 iso 方式是 10-25 分钟，dd 方式是 2-5 分钟；
- 这个过程，是 ping 不通机器的
- 这个过程在控制台（cloudshell）界面，会提示 `ConvertPages：failed to find range xxxxx` 无需理会，静静等待
- 等待（iso方式是10-25分钟，dd方式是2-5分钟）的过程中，可以尝试去 [https://tcp.ping.pe](https://tcp.ping.pe) 测试服务器的 `ip:3389`，能 tcping 通，代表安装成功
- 如果 iso 方式超过 50 分钟，dd 方式超过 20 分钟还不通，可以准备救砖了。

5、使用 RDP 连接

6、激活 Windows，自行操作

* * *

如何救砖： [甲骨文云Cloud Shell ARM 救砖](https://godess.us.kg/index.php/2024/11/12/%e7%94%b2%e9%aa%a8%e6%96%87%e4%ba%91cloud-shell-arm-%e6%95%91%e7%a0%96/)

本文参考了： [1](https://www.nodeseek.com/post-168004-1) [2](https://telegra.ph/OracleArmWindows-10-02) [3](https://t.me/reinstall_os) 等
