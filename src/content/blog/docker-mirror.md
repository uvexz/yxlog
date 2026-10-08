---
title: "自建 Docker Hub 镜像"
description: "仅提供思路"
pubDate: 2024-07-23
updatedDate: 2026-03-20
tags: ["Notes"]
---

仅提供思路

## 使用第三方程序

* GHProxy: https://github.com/WJQSERVER-STUDIO/ghproxy
* Docker-Proxy: https://github.com/dqzboy/Docker-Proxy

## 使用 Nginx

```json
server {
    listen 443 ssl;
    server_name 域名;

    ssl_certificate 证书地址;
    ssl_certificate_key 密钥地址;

    ssl_session_timeout 24h;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;

    location / {
        proxy_pass https://registry-1.docker.io;  # Docker Hub 的官方镜像仓库
        proxy_set_header Host registry-1.docker.io;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 关闭缓存
        proxy_buffering off;

        # 转发认证相关的头部
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header  Authorization;

        # 对 upstream 状态码检查，实现 error_page 错误重定向
        proxy_intercept_errors on;
        # error_page 指令默认只检查了第一次后端返回的状态码，开启后可以跟随多次重定向。
        recursive_error_pages on;
        # 根据状态码执行对应操作，以下为301、302、307状态码都会触发
        error_page 301 302 307 = @handle_redirect;

    }
    location @handle_redirect {
        resolver 1.1.1.1;
        set $saved_redirect_location '$upstream_http_location';
        proxy_pass $saved_redirect_location;
    }
}
```

## 使用 Cloudflare Worker

```js
import HTML from './docker.html';

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        const originalHost = request.headers.get("host");
        const registryHost = "registry-1.docker.io";

        if (path.startsWith("/v2/")) {
        const headers = new Headers(request.headers);
        headers.set("host", registryHost);

        const registryUrl = `https://${registryHost}${path}`;
        const registryRequest = new Request(registryUrl, {
            method: request.method,
            headers: headers,
            body: request.body,
            // redirect: "manual",
            redirect: "follow",
        });

        const registryResponse = await fetch(registryRequest);

        console.log(registryResponse.status);

        const responseHeaders = new Headers(registryResponse.headers);
        responseHeaders.set("access-control-allow-origin", originalHost);
        responseHeaders.set("access-control-allow-headers", "Authorization");
        return new Response(registryResponse.body, {
            status: registryResponse.status,
            statusText: registryResponse.statusText,
            headers: responseHeaders,
        });
        } else {
        return new Response(HTML.replace(/{{host}}/g, originalHost), {
            status: 200,
            headers: {
            "content-type": "text/html"
            }
        });
        }
    }
}
```

另新建一个名为 docker.html 的文件，内容如下

```js
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mirror Usage</title>
        <style>
        html {
        height: 100%;
        }
        body {
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-size: 16px;
        color: #333;
        margin: 0;
        padding: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        }
        .container {
            margin: 0 auto;
            max-width: 600px;
        }

        .header {
            background-color: #438cf8;
            color: white;
            padding: 10px;
            display: flex;
            align-items: center;
        }

        h1 {
            font-size: 24px;
            margin: 0;
            padding: 0;
        }

        .content {
            padding: 32px;
        }

        .footer {
            background-color: #f2f2f2;
            padding: 10px;
            text-align: center;
            font-size: 14px;
        }
        </style>
    </head>
    <body>
        <div class="header">
        <h1>Mirror Usage</h1>
        </div>
        <div class="container">
        <div class="content">
            <p>镜像加速说明</p>
            <p>
            为了加速镜像拉取,你可以使用以下命令设置registery mirror:
            </p>
            <pre>
            sudo tee /etc/docker/daemon.json &lt;&lt;EOF
            {
                "registry-mirrors": ["https://{{host}}"]
            }
            EOF
            </pre>
            </br>
            <p>
            为了避免 Worker 用量耗尽,你可以手动 pull 镜像然后 re-tag 之后 push 至本地镜像仓库:
            </p>
            <pre>
            docker pull {{host}}/library/alpine:latest # 拉取 library 镜像
            docker pull {{host}}/coredns/coredns:latest # 拉取 library 镜像
            </pre>
        </div>
        </div>
        <div class="footer">
        <p>Powered by Cloudflare Workers</p>
        </div>
    </body>
</html>
```

## 使用其他爱好者提供的镜像

网络搜集（谨慎使用）

- docker.1panel.live
- hub.rat.dev
- dockerhub.icu
- docker.m.daocloud.io
