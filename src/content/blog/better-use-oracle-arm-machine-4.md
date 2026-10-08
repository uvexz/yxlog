---
title: "榨干 ORACLE ARM 4/ 搭建远程桌面环境"
description: "Kasm 是一种基于浏览器的远程桌面环境，可以在 VPS（虚拟专用服务器）上进行安装和部署。安装 Kasm 远程桌面环境在以下几个方面带来了好处："
pubDate: 2025-01-19
updatedDate: 2026-05-12
tags: ["VPS", "Oracle"]
---

![](https://boost.jpgcdn.com/b2.jpgcdn.com/2023/10/27/2f91b55cb649738f0138b53cdc54d40d.png)

Kasm 是一种基于浏览器的远程桌面环境，可以在 VPS（虚拟专用服务器）上进行安装和部署。安装 Kasm 远程桌面环境在以下几个方面带来了好处：

1. 跨平台访问：Kasm 远程桌面环境可以通过浏览器访问，无论是使用 Windows、Mac 还是 Linux 操作系统，都可以轻松地远程访问 VPS。这使得用户可以在任何设备上访问和使用 VPS，提高了灵活性和便利性。
2. 安全性：Kasm 远程桌面环境提供了强大的安全性功能。它使用了多层身份验证和加密技术，确保用户的远程连接和数据传输的安全性。此外，Kasm 还提供了会话隔离和容器化技术，使得每个用户的会话都是独立的，防止恶意软件和攻击者对系统的入侵。
3. 资源优化：通过在 VPS 上安装 Kasm 远程桌面环境，可以实现资源的优化和共享。多个用户可以同时使用同一台 VPS，而不会因为资源的竞争而导致性能下降。这对于需要共享资源的团队和组织来说非常有用，可以提高工作效率和资源利用率。
4. 管理简化：Kasm 远程桌面环境提供了集中化的管理界面，管理员可以轻松地管理和监控用户的远程会话。管理员可以控制用户的访问权限、分配资源和监控系统性能，从而简化了系统管理和维护的工作。
5. 可扩展性：Kasm 远程桌面环境具有良好的可扩展性。它可以根据用户的需求进行灵活的扩展和定制，可以添加新的功能和插件，以满足不同用户的需求。这使得 Kasm 成为一个适用于各种场景和规模的远程桌面解决方案。

## 安装 Kasm Workspace

在 VPS 上安装 Kasm 的步骤如下：

### 1\. 检查系统要求：

- 操作系统：确保你的 Arm VPS 运行的是支持的操作系统，如 Ubuntu 18.04/20.04/22.04 (amd64/arm64)、Debian 10/11/12 (amd64/arm64)、CentOS 7/8/9 (amd64/arm64)、Oracle Linux 7/8/9 (amd64/arm64) 或 Raspberry Pi OS (Debian) 10/11/12 (arm64) \[2\]。
- 资源要求：确保你的 VPS 符合最低要求，包括至少 2 个核心、4GB 内存和 50GB SSD 存储空间。
- 交换分区：为了提高终端用户会话的稳定性，建议创建一个交换分区。你可以在安装过程中创建交换分区，或者如果已经有一个交换分区，则可以跳过此检查。
- 安装了 Docker & Compose，可通过 `curl -Ls get.docker.com | bash` 自动安装。

### 2\. 下载并安装 Kasm

下载 Kasm 的安装文件：

**ARM64**

```bash
cd /tmp
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_1.14.0.3a7abb.tar.gz
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_service_images_arm64_1.14.0.3a7abb.tar.gz
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_workspace_images_arm64_1.14.0.3a7abb.tar.gz
```

**AMD64**

```bash
cd /tmp
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_1.14.0.3a7abb.tar.gz
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_service_images_amd64_1.14.0.3a7abb.tar.gz
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_workspace_images_amd64_1.14.0.3a7abb.tar.gz
```

最新版本的下载链接及安装方式可在 [Kasm 官方文档](https://www.kasmweb.com/docs/latest/install/single_server_install.html) 查看。

解压下载的文件：

```bash
tar -xf kasm_release_1.14.0.3a7abb.tar.gz
```

运行安装脚本来安装 Kasm：

```
bash kasm_release/install.sh --offline-workspaces /tmp/kasm_release_workspace_images_arm64_1.14.0.3a7abb.tar.gz --offline-service /tmp/kasm_release_service_images_arm64_1.14.0.3a7abb.tar.gz
```

可选：默认端口为 `443`，可通过 `-L 8443` 来更换默认端口。

耐心等待 10~20 分钟即可安装完成，安装完毕后会显示后台登陆密码，访问 `https://ip:端口` 使用默认密码登录即可。

```bash
Kasm UI Login Credentials

------------------------------------
  username: admin@kasm.local
  password: [hidden]
------------------------------------
  username: user@kasm.local
  password: [hidden]
------------------------------------
```

### 3\. 安装可信 SSL 证书（可选）

Kasm 证书放在 `/opt/kasm/current/certs` 文件夹，把 `kasm_nginx.crt` & `kasm_nginx.key` 替换为您申请的证书即可，重启生效： `/opt/kasm/bin/start`

![](https://boost.jpgcdn.com/e4.jpgcdn.com/2023/10/27/e3843f33708fa6fa8af4c9d26b927cf3.png)

本文参考了 [1](https://hostloc.com/forum.php?mod=viewthread&tid=1218549&page=1#pid14625150)、 [2](https://community.hetzner.com/tutorials/install-kasm-workspaces)。
