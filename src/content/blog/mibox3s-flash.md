---
title: "小米盒子3S 刷国际版系统及刷回原版系统"
description: "需要工具"
pubDate: 2022-09-09
updatedDate: 2025-12-15
tags: ["硬件"]
---

需要工具

- 双公头 USB 数据线（可以废弃 USB 对接）
- 不大于 32GB 的 U盘
- 电脑、MIBOX3S、电视
- 所有刷机工具和固件：链接: [https://pan.baidu.com/s/1bqimRUn](https://pan.baidu.com/s/1bqimRUn) 密码: qqgx
- 常用盒子软件打包： [https://pan.baidu.com/s/1pMKxKT1](https://pan.baidu.com/s/1pMKxKT1) 或 [https://cloud.189.cn/t/eU7B3iBnYvie](https://cloud.189.cn/t/eU7B3iBnYvie)（先下载方便刷完后直接安装）

## 小米盒子3S 刷国际版

先降级

- `MiBOX3S\_queenchristina\_r145.rar` 解压到 U盘根目录
- 盒子插入 U盘 – 断电 – 上电时按住选择键和主页键不放 – 自动开始降级
- 等待开机

再开刷

- 进入小米盒子 – 设置 – 账户于安全-打开 USB 调试
- 打开刷机大师 – 连上小米盒子 – 等待驱动装完正常识别到盒子
- 把下好的 dump\_16AB.img 文件复制到盒子根目录
- 打开刷机大师 – 工具 – ADB 控制台 – 然后依次输入

```
adb root
adb remount
adb shell dd if=/sdcard/dump_16AB.img of=/dev/block/mmcblk0 // 第三条较久（3-30分钟）- 请等待直到跳出新索引箭头
```

- 断电 – 上电时按住选择键和主页键不放 – 直到进入恢复模式 – 双清
- 格式化 U盘 – 解压 `MiBOX3\_userdebug\_once\_r454.rar` 放 U盘根目录
- 插入U盘 – 选择 `Choose Apply update from EXT` > `Update from udisk` > 选择固件 确定
- 刷好后再次双清，就可以开机了

使用提示：

- 进系统后建议先在商店下载个 ES 文件管理器
- 可在线更新最新系统 目前最新版 `Android 6.0.1` Android 安全程序补丁级别 2017.7.1
- 桌面长按图标可以编辑
- 如果出现 USB 设备无法使用请关闭 USB 调试
- 部分软件不会显示在桌面 请用百度盘里的抽屉工具
- 主界面的两个无用图标可以关闭 进入设置 -> 应用程序 -> 系统应用 -> `XiaomiLeanbackCustomizer` -> 强制停止 ->禁用

## 如何刷回原版

步骤和刷国际差不多

- 盒子降级到 MiBOX3\_userdebug\_once\_r454.rar
- 复制 dump\_19AA.img 到盒子根目录
- ADB 输入以下

```
adb root
adb remount
adb shell dd if=/sdcard/dump_19AA.img of=/dev/block/mmcblk0
```

- 进恢复模式 全清后刷入 `MiBOX3S\_queenchristina\_r145.rar` 完成后再全清一次开机

参考自 [1](http://zndstec.cn/thread-2382-1-1.html)
