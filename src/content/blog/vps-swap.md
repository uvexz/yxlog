---
title: "给小内存 VPS 设置 Swap"
description: "前提条件：基于 KVM/XEN/HyperV 虚化的 VPS，OpenVZ 不行。"
pubDate: 2022-09-13
updatedDate: 2025-12-16
tags: ["Notes"]
---

> 前提条件：基于 KVM/XEN/HyperV 虚化的 VPS，OpenVZ 不行。

假如你有一枚 128M / 256M 内存的 VPS，闲着没事，想装个 Disourse / NodeBB / Mastodon / Ghost 之类的程序，可以试试以下的方法。

**1、 生成文件**

生成 1G 的 Swap

```
dd if=/dev/zero of=/var/swap bs=1k count=1024k
```

或者生成 2G 的 Swap

```
# 上面的和这个，二选一
dd if=/dev/zero of=/var/swap bs=1k count=2048k
```

**2、设置交换区：**

```
mkswap /var/swap
```

**3、启动交换器：**

```
swapon /var/swap
```

**4、开机自动挂载：**

```
echo '/var/swap   swap   swap   default 0 0' >> /etc/fstab
```

**查看是否成功**

执行 `free -m` 看下是否有 `Swap`

![](https://i.loli.net/2017/06/14/5940fc3a951c7.png)
