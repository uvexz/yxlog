---
title: "自建 Gotosocial | 一个 ActivityPub 联邦社交网络程序"
description: "GoToSocial 是一个十分轻量（轻量到甚至没有用户界面，需要使用第三方程序登录、兼容 Mastodon 应用进行使用）的 ActivityPub 联邦社交网络程序，自建 GoToSocial 可以避免您的信息因为所在实例倒闭、不可抗力…"
pubDate: 2023-09-21
updatedDate: 2025-12-15
tags: ["Mastodon"]
---

[GoToSocial](https://github.com/superseriousbusiness/gotosocial) 是一个十分轻量（轻量到甚至没有用户界面，需要使用第三方程序登录、兼容 Mastodon 应用进行使用）的 ActivityPub 联邦社交网络程序，自建 GoToSocial 可以避免您的信息因为所在实例倒闭、不可抗力等原因化为乌有。

---

## 一、使用：

### 修改个人信息

访问 `https://social.example.com/settings` 使用账号密码登录即可进行修改

### 发布推文

通过第三方 APP 进行发布、浏览、关注等操作，可以使用 Mastodon 的客户端进行：

- Phanpy推荐: [https://phanpy.social/](https://phanpy.social/)
- ELK: [https://elk.zone/](https://elk.zone/)
- 更多推荐 APP： [https://joinmastodon.org/apps](https://joinmastodon.org/apps)

## 二、搭建教程：

- 1/ 自有 VPS 安装
- 2/ Fly.io 免费安装（推荐）

### 1/ 自有 VPS 安装

安装 Docker

```
curl -L get.docker.com | bash
```

创建安装目录

```bash
mkdir -p /var/www/gotosocial/data && cd /var/www/gotosocial
```

配置 `docker-compose.yaml` 文件

```
nano docker-compose.yaml
```

修改下方 `social.example.com` 为您自己的域名，并粘贴进去

```
version: "3.3"

services:
  gotosocial:
    image: superseriousbusiness/gotosocial:latest
    container_name: gotosocial
    user: 1000:1000
    networks:
      - gotosocial
    environment:
      GTS_HOST: social.example.com
      GTS_DB_TYPE: sqlite
      GTS_DB_ADDRESS: /gotosocial/storage/sqlite.db
      GTS_LETSENCRYPT_ENABLED: "false"
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - ./data:/gotosocial/storage
    restart: "always"

networks:
  gotosocial:
    ipam:
      driver: default
```

运行

```
docker compose up -d
```

创建用户

```
docker exec -it gotosocial /gotosocial/gotosocial admin account create --username YOUR_USERNAME --email YOUR@EMAIL.COM --password 'SOME_VERY_GOOD_PASSWD'
```

设置管理员

```
docker exec -it gotosocial /gotosocial/gotosocial admin account promote --username YOUR_USERNAME
```

安装 Nginx

```
# 以 Debian/Ubuntu 为例

apt install -y lsb-release ca-certificates apt-transport-https curl gnupg dpkg

curl -sS https://n.wtf/public.key | gpg --dearmor > /usr/share/keyrings/n.wtf.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/n.wtf.gpg] https://mirror-cdn.xtom.com/sb/nginx/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/n.wtf.list

apt update

apt install nginx-extras -y
```

安装 ACME.SH

```
curl -L get.acme.sh | bash
```

**重启终端**，创建 Nginx 配置文件

```
nano /etc/nginx/conf.d/gotosocial.conf
```

粘贴下方内容

```
server {
  listen 80;
  listen [::]:80;
  server_name social.example.com;
  root /var/www/gotosocial;
  location /.well-known/acme-challenge/ { allow all; }
  location / { return 301 https://$host$request_uri; }
}
```

重启 Nginx `nginx -s reload`，将域名指向 VPS 的 IP 地址，生成 SSL 证书
```
acme.sh --issue -d social.example.com -w /var/www/gotosocial --server letsencrypt
```

生成的证书大致如下

```
[Thu 12 Nov 2020 07:16:28 AM EST] Your cert is in  /root/.acme.sh/social.example.com/social.example.com.cer
[Thu 12 Nov 2020 07:16:28 AM EST] Your cert key is in  /root/.acme.sh/social.example.com/social.example.com.key
[Thu 12 Nov 2020 07:16:30 AM EST] The intermediate CA cert is in  /root/.acme.sh/social.example.com/ca.cer
[Thu 12 Nov 2020 07:16:30 AM EST] And the full chain certs is there:  /root/.acme.sh/social.example.com/fullchain.cer
```

我们需要其中的

```
/root/.acme.sh/social.example.com/fullchain.cer
/root/.acme.sh/social.example.com/social.example.com.key
```

再次编辑 Nginx 配置文件

```
nano /etc/nginx/conf.d/gotosocial.conf
```

按下方内容粘贴

```
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  listen [::]:80;
  server_name social.example.com;
  root /var/www/gotosocial;
  location /.well-known/acme-challenge/ { allow all; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name social.example.com;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+ECDSA+AES128:EECDH+aRSA+AES128:RSA+AES128:EECDH+ECDSA+AES256:EECDH+aRSA+AES256:RSA+AES256:EECDH+ECDSA+3DES:EECDH+aRSA+3DES:RSA+3DES:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;
  ssl_session_tickets off;

  ssl_certificate /root/.acme.sh/social.example.com/fullchain.cer;
  ssl_certificate_key /root/.acme.sh/social.example.com/social.example.com.key;

  keepalive_timeout    70;
  sendfile             on;
  client_max_body_size 80m;

  root /var/www/gotosocial;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml image/x-icon;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
```

重启 Nginx `nginx -s reload`，现在即可访问您的 Gotosocial 了。

### 2/ 在 Fly.io 免费安装

准备：

- [注册 Fly.io 账号](https://fly.io/app/sign-up)，并绑卡（避免滥用）；
- [注册 Cloudflare 并启用 R2](https://dash.cloudflare.com/sign-up/r2)，启用 R2 需要绑卡。新建一个储存桶并创建一个 API 令牌。
- [注册 Yugabyte 账号](https://cloud.yugabyte.com/signup)，并创建数据库，地区选择 `tokyo`，创建过程记得保存用户名及密码，等创建成功后点右上角 `connect` 按钮选择 `Connect to your Application` \- `Parameters` 获取连接信息，我们需要其中的 `Host` `Port` `Database`。

安装 flyctl

```
# Linux
curl -L https://fly.io/install.sh | sh

# macOS
curl -L https://fly.io/install.sh | sh

# Windows，需要开启 RemoteSigned: 管理员运行 Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

登录

```
flyctl auth login

# 若登录失败使用
# flyctl auth login -i
# 输入账号密码进行登录
```

创建安装目录

```
mkdir ~/gotosocial && cd gotosocial
```

创建 APP

```
flyctl launch --name YOURAPPNAME --image=superseriousbusiness/gotosocial:latest --region nrt --no-deploy
```

创建储存卷，1G 足矣
```
flyctl volumes create social_data --region nrt --size 1
```

编辑当前目录下的 `fly.toml` 配置文件，按下方配置（下方配置文件内容已按照 fly.io v2 部署平台进行相应的修订）

```
app = "yjksocial"
primary_region = "nrt"

[build]
  image = "superseriousbusiness/gotosocial:latest"

[env]
  GTS_HOST = "social.example.com"
  GTS_DB_TYPE = "postgres"
  GTS_DB_PORT = 5433
  GTS_DB_ADDRESS = "之前记录的数据库 Host"
  GTS_DB_USER = "admin"
  GTS_DB_PASSWORD = "之前记录的数据库用户密码"
  GTS_DB_DATABASE = "yugabyte"
  GTS_DB_TLS_MODE = "enable"
  GTS_LETSENCRYPT_ENABLED = "false"
  GTS_STORAGE_BACKEND = "s3"
  GTS_STORAGE_S3_ENDPOINT = "Cloudflare R2 API 地址，记得去掉 “/仓库名”"
  GTS_STORAGE_S3_ACCESS_KEY = "Cloudflare R2 API ACCESS KEY"
  GTS_STORAGE_S3_SECRET_KEY = "Cloudflare R2 API SECRET KEY"
  GTS_STORAGE_S3_BUCKET = "Cloudflare R2 仓库名"
  GTS_STORAGE_S3_PROXY = true

[mounts]
  source="social_data"
  destination="/gotosocial/storage"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]
```

启动 APP

```
flyctl deploy
```

能成功访问 `https://YOURAPPNAME.fly.dev` 则代表部署成功。

绑定域名，将您的域名 `CNMAE` 至 `YOURAPPNAME.fly.dev`，然后运行

```
flyctl certs add social.example.com
```

等待几分钟即可。

创建用户及设置管理员

```
# 在 fly.toml 文件目录执行
flyctl ssh console
```

```
# 创建用户
/gotosocial/gotosocial admin account create --username YOUR_USERNAME --email YOUR@EMAIL.COM --password 'SOME_VERY_GOOD_PASSWD'

# 设置管理员
/gotosocial/gotosocial admin account promote --username YOUR_USERNAME
```
