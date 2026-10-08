---
title: " AssppWeb： iOS 多区玩家神器，跨区应用无缝下载"
description: "对于拥有多个 Apple ID（中区、美区、日区等）的 iOS 玩家来说，频繁在 App Store 切换账号是一个极其痛苦的过程。AssppWeb 是一款开源的 Web 工具，允许你云端托管多个 Apple 账号，通过网页直接获取、下载并…"
pubDate: 2026-02-24
updatedDate: 2026-02-25
tags: ["Docker", "iOS"]
---

对于拥有多个 Apple ID（中区、美区、日区等）的 iOS 玩家来说，频繁在 App Store 切换账号是一个极其痛苦的过程。[**AssppWeb**](https://github.com/lakr233/assppweb) 是一款开源的 Web 工具，允许你云端托管多个 Apple 账号，通过网页直接获取、下载并一键安装全球 App，甚至支持下载历史版本。

本教程将带你从零开始，利用 Docker 和 Nginx 搭建一个私有的、安全的跨区应用管理中心。

---

> **安全预警**
> 
> 在开始之前，请务必阅读以下声明：严禁盲目信任任何网络上的公共服务器。虽然技术上后端无法读取你的加密流量，但恶意主机可以通过修改前端代码，在数据加密前拦截你的 Apple ID 凭据。

> **为了您的账号安全，强烈建议：**
> 1. **必须自建**：仅使用自己托管的实例。
> 2. **必须使用 HTTPS**：保护传输过程中的账号隐私。

---

## 一、 使用 Docker-Compose 极速部署

自建服务是保障安全的唯一途径。通过 Docker，你可以实现一键环境隔离部署。

### 1. 创建部署目录

在服务器上创建文件夹并进入：

```bash
mkdir asspp && cd asspp
```

### 2. 编写 `compose.yml`

创建配置文件：

```yaml
services:
  asspp:
    image: ghcr.io/lakr233/assppweb:latest
    ports:
      - "58080:8080"
    volumes:
      - ./data:/data
    environment:
      - DATA_DIR=/data
      - PORT=8080
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "128m"
        max-file: "5"
```

### 3. 启动容器

```bash
docker compose up -d
```

此时，服务已在 `58080` 端口运行。

---

## 二、 配置 Nginx 反向代理与 HTTPS

为了确保安全和 iOS PWA 特性的正常运行，**HTTPS 是必选项**。

### Nginx 配置示例 (`asspp.conf`)

将以下配置添加至你的 Nginx 站点配置中，并将 `yourdomain.com` 替换为你的实际域名：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri; # 强制跳转 HTTPS
}

server {
    listen 443 ssl;
    http2 on;
    server_name yourdomain.com;

    # SSL 证书路径
    ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;

    location / {
        proxy_pass http://127.0.0.1:58080;
        proxy_http_version 1.1;
        
        # 必须：支持 WebSocket (用于实时下载进度显示)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        client_max_body_size 200m; # 允许上传大文件
    }
}
```

---

## 三、 iOS 进阶体验：安装为“网页 App”

AssppWeb 完美支持 PWA。将其安装到桌面后，你将获得原生 App 般的丝滑体验：

1. **Safari 访问**：在 iPhone 的 Safari 浏览器打开你的域名。
2. **添加到主屏幕**：点击底部的 **“分享”** 按钮（方框向上箭头），选择 **“添加到主屏幕”**。
3. **独立运行**：现在你可以点击桌面的 Asspp 图标。它没有浏览器地址栏，支持独立缓存，是你真正的“私人 App Store”。

---

## 四、 核心功能玩法：告别切号

### 1. 托管多区账号

在 **“账号 (Accounts)”** 页面，把你的中、美、日等各区账号全部添加进去。AssppWeb 会安全地管理这些 Session。

### 2. 跨区域无感下载

* **随意切区**：在搜索栏直接选择目标市场（如 Japan），搜索 App。
* **一键获取**：选择相应账号进行购买、下载。
* **安装 App**：下载完成后点击 **“安装 (Install)”**。你的 iPhone 会直接弹出原生安装确认框，点击确定即可。

**最强大的地方在于：** 你的系统 App Store 可以一直挂着你的主账号，而下载其他区的 App 全程在 Asspp 网页端完成。
