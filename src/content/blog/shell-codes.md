---
title: "一些强大的 Shell 命令"
description: "在阅读以下部分前，强烈建议读者打开一个 shell 实验，这些都不是 shell 教科书里的大路货哦：）"
pubDate: 2022-09-16
updatedDate: 2025-12-16
tags: ["Notes"]
---

![](https://raw.sevencdn.com/imagehosted/images/master/2019/07/20190731113653.png)

在阅读以下部分前，强烈建议读者打开一个 shell 实验，这些都不是 shell 教科书里的大路货哦：）

### !$

`!$` 是一个特殊的环境变量，它代表了上一个命令的最后一个字符串。如：你可能会这样：

```
$mkdir mydir
$mv mydir yourdir
$cd yourdir

```

可以改成：

```
$mkdir mydir
$mv !$ yourdir
$cd !$

```

### sudo !!

以 root 的身份执行上一条命令 。

场景举例：比如 Ubuntu 里用 `apt-get` 安装软件包的时候是需要 root 身份的，我们经常会忘记在 `apt-get` 前加 `sudo`。每次不得不加上 `sudo` 再重新键入这行命令，这时可以很方便的用 `sudo !!` 完事。

（注：在 shell 下，有时候你会输入很长的命令，你可以使用 `!xxx` 来重复最近的一次命令，比如，你以前输入过 `vi /where/the/file/is` 下次你可以使用 `!vi` 重得上次最近一次的 vi 命令。）

### cd –

回到上一次的目录 。

场景举例：当前目录为 `/home/a`，用 `cd ../b` 切换到 `/home/b`。这时可以通过反复执行 `cd –` 命令在 `/home/a` 和 `/home/b` 之间来回方便的切换。

（注： `cd ~` 是回到自己的 Home 目录， `cd ~user`，是进入某个用户的 Home 目录）

### `ALT+.` or `<ESC> .`

热建 `alt+.` 或 `esc+.` 可以把上次命令行的参数给重复出来。

### oldnew

替换前一条命令里的部分字符串。

场景： `echo "wanderful"`，其实是想输出 `echo "wonderful"`。只需要 `^a^o` 就行了，对很长的命令的错误拼写有很大的帮助。（注：也可以使用 `!!:gs/old/new`）

### du -s \* \| sort -n \| tail

列出当前目录里最大的10个文件。

### :w !sudo tee %

在 vi 中保存一个只有 root 可以写的文件

### date -d@1234567890

时间截转时间

### \> file.txt

创建一个空文件，比 touch 短。

### mtr coolshell.cn

`mtr` 命令比 `traceroute` 要好。

### 在命令行前加空格，该命令不会进入 history 里。

### echo "ls -l" \| at midnight

在某个时间运行某个命令。

### ps aux \| sort -nk +4 \| tail

列出头十个最耗内存的进程

### man ascii

显示 ascii 码表。

场景：忘记 ascii 码表的时候还需要 Google 么？尤其在天朝网络如此“顺畅”的情况下，就更麻烦在GWF多应用一次规则了，直接用本地的 `man ascii` 吧。

### ctrl-x e

快速启动你的默认编辑器（由变量 $EDITOR 设置）。

### netstat –tlnp

列出本机进程监听的端口号。

（注：netstat -anop 可以显示侦听在这个端口号的进程）

### ssh user@server bash < /path/to/local/script.sh

在远程机器上运行一段脚本。这条命令最大的好处就是不用把脚本拷到远程机器上。

### ssh user@host cat /path/to/remotefile \| diff /path/to/localfile -

比较一个远程文件和一个本地文件

### curl ifconfig.me

当你的机器在内网的时候，可以通过这个命令查看外网的IP。

### lsof –i

实时查看本机网络服务的活动状态。

### vim scp://username@host//path/to/somefile

Vim 一个远程文件

全文转载自 [1](https://coolshell.cn/articles/8619.html)
