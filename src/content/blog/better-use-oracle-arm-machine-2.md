---
title: "榨干 Oracle ARM 2/ 安装 Mastodon"
description: "本文成文时间较久，内容与现行版本可能出现差异，请谨慎参考"
pubDate: 2022-10-15
updatedDate: 2025-12-16
tags: ["Mastodon", "Oracle"]
---

> 本文成文时间较久，内容与现行版本可能出现差异，请谨慎参考

甲骨文免费的 ARM 4C24G 的机器只用来搭梯子就大材小用了，这里结合博主自身的体验，说说如何榨干它。

以下均基于 Debian 11 root 用户 。

## Pre-install

安装 Docker、Nginx 请查看系列 1

[榨干 Orcale ARM 1/ Gitlab](/better-use-oracle-arm-machine-1)

## 安装 Mastodon

新建文件夹

```bash
mkdir -p /var/www/mastodon && cd /var/www/mastodon
```

编辑 docker-compose.yml

```bash
vim docker-compose.yml
```

将下方代码粘贴进去，按 Esc，输入 :wq 保存退出

```yaml
version: '3'
services:
  db:
    restart: always
    image: postgres:12.5-alpine
    shm_size: 256mb
    networks:
      - internal_network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
    volumes:
      - ./postgres:/var/lib/postgresql/data

  redis:
    restart: always
    image: redis:6-alpine
    networks:
      - internal_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
    volumes:
      - ./redis:/data

#  es:
#    image: kubesphere/elasticsearch-oss:6.7.0-1-arm64
#    environment:
#      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
#      - "cluster.name=es-mastodon"
#      - "discovery.type=single-node"
#      - "bootstrap.memory_lock=true"
#    networks:
#      - internal_network
#    healthcheck:
#      test: ["CMD-SHELL", "curl --silent --fail localhost:9200/_cluster/health || exit 1"]
#    volumes:
#      - ./elasticsearch:/usr/share/elasticsearch/data
#    ulimits:
#      memlock:
#        soft: -1
#        hard: -1
#    restart: unless-stopped

  web:
    image: plusminusio/mastodon:latest-arm64
    restart: always
    env_file: .env.production
    command: bash -c "rm -f /mastodon/tmp/pids/server.pid; bundle exec rails s -p 3000"
    networks:
      - external_network
      - internal_network
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider --proxy=off localhost:3000/health || exit 1"]
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - db
      - redis
#      - es
    volumes:
      - ./public/system:/mastodon/public/system

  streaming:
    image: plusminusio/mastodon:latest-arm64
    restart: always
    env_file: .env.production
    command: node ./streaming
    networks:
      - external_network
      - internal_network
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider --proxy=off localhost:4000/api/v1/streaming/health || exit 1"]
    ports:
      - "127.0.0.1:4000:4000"
    depends_on:
      - db
      - redis

  sidekiq:
    image: plusminusio/mastodon:latest-arm64
    restart: always
    env_file: .env.production
    command: bundle exec sidekiq
    depends_on:
      - db
      - redis
    networks:
      - external_network
      - internal_network
    volumes:
      - ./public/system:/mastodon/public/system

networks:
  external_network:
  internal_network:
    internal: true
```

配置数据库

```bash
docker run --name postgres12 -v /var/www/mastodon/postgres:/var/lib/postgresql/data -e   POSTGRES_PASSWORD=设置数据库管理员密码 --rm -d postgres:12.5-alpine
```

检查 postgres 文件夹，应该出现 postgres 相关的多个文件，不是空文件夹。

然后执行

```bash
docker exec -it postgres12 psql -U postgres
```

输入

```bash
CREATE USER mastodon WITH PASSWORD '数据库密码（最好和数据库管理员密码不一样）' CREATEDB;
```

创建 mastodon 用户，然后停止 docker

```bash
docker stop postgres12
```

配置 .env.production

```bash
# 回到 mastodon 文件夹
cd /var/www/mastodon

# 生成文件
touch .env.production

# 配置文件
dc run --rm web bundle exec rake mastodon:setup
```

01. 输入域名
02. Enable single user mode? 否
03. Using Docker to run Mastodon? 是
04. postsql 用户名、数据库名填 mastodon ，密码部分填刚刚设置的数据库密码
05. redis 部分都直接回车
06. Store uploaded files on the cloud? 这个可填否，如有需要可配置 S3。
07. Send e-mails from localhost? 否。然后填入邮件服务设置，推荐使用 [Mailazy](https://mailazy.com/)， **具体配置可参照下方**。
08. This configuration will be written to .env.production Save configuration? 是
09. 然后会出现 .env.production 配置， **复制下来，先存到电脑里，等会用**。
10. 然后会要你建立数据库和编译，都选是。最后建立管理员账号。

成功之后，编辑 .env.production 文件，复制上方保存的配置信息，按 Esc，输入 :wq 保存退出

```bash
vim .env.production
```

S3 及 SMTP 信息大致如下

```bash
S3_ENABLED=true
S3_PROTOCOL=https
S3_REGION=fr-par
S3_ENDPOINT=https://s3.fr-par.scw.cloud
S3_HOSTNAME=[hidden].s3.fr-par.scw.cloud
S3_BUCKET=[hidden]
AWS_ACCESS_KEY_ID=[hidden]
AWS_SECRET_ACCESS_KEY=[hidden]
S3_ALIAS_HOST=[hidden]
SMTP_SERVER=smtp.mailazy.com
SMTP_PORT=587
SMTP_LOGIN=[hidden]
SMTP_PASSWORD=[hidden]
SMTP_AUTH_METHOD=plain # 该配置仅代表可用于 mailazy，若为其他服务商请做相应更改
SMTP_OPENSSL_VERIFY_MODE=none # 该配置仅代表可用于 mailazy，若为其他服务商请做相应更改
SMTP_FROM_ADDRESS=mastodon@[hidden]
```

运行

```bash
dc up -d
```

为相应文件夹赋权

```bash
chown 991:991 -R ./public
chown -R 70:70 ./postgres

# 关闭
dc down

# 再次启动
dc up -d
```

查看运行详情

```bash
dc ps

NAME                   COMMAND                  SERVICE             STATUS              PORTS
mastodon-db-1          "docker-entrypoint.s…"   db                  running (healthy)
mastodon-redis-1       "docker-entrypoint.s…"   redis               running (healthy)
mastodon-sidekiq-1     "/usr/bin/tini -- bu…"   sidekiq             running             4000/tcp
mastodon-streaming-1   "/usr/bin/tini -- no…"   streaming           running (healthy)   127.0.0.1:4000->4000/tcp
mastodon-web-1         "/usr/bin/tini -- ba…"   web                 running (healthy)   127.0.0.1:3000->3000/tcp

# 当状态均为 healthy 的时候即代表成功运行
```

配置 Nginx

创建配置文件

```bash
vim /etc/nginx/conf.d/mastodon.conf
```

复制下方 http 配置信息以申请 SSL 证书，按 Esc，输入 :wq 保存退出

```bash
server {
  listen 80;
  # 若配置了 IPV6，删除下方的井号
  # listen [::]:80;
  server_name mastodon.im.sb;
  root /var/www/mastodon/public;
  location /.well-known/acme-challenge/ { allow all; }
  location / { return 301 https://$host$request_uri; }
}

# 将 mastodon.im.sb 替换成您自己的域名
```

重载 Nginx

```bash
nginx -t
# 确保配置文件无异常
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重载
nginx -s reload
```

**将您的域名 A 记录及 AAAA 记录（若有）指向服务器 IP**，然后申请域名证书

```bash
acme.sh --issue -d mastodon.im.sb -w /var/www/mastodon/public --server letsencrypt

# 可选，申请 ECC 证书
acme.sh --issue -d mastodon.im.sb -w /var/www/mastodon/public -k ec-256 --server letsencrypt

# 将 mastodon.im.sb 替换成您自己的域名
```

再次编辑配置文件

```bash
vim /etc/nginx/conf.d/mastodon.conf
```

复制下方完整配置信息，按 Esc，输入 :wq 保存退出

```bash
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

upstream backend {
    server 127.0.0.1:3000 fail_timeout=0;
}

upstream streaming {
    server 127.0.0.1:4000 fail_timeout=0;
}

server {
  listen 80;
  # 若配置了 IPV6，删除下方的井号
  # listen [::]:80;
  server_name mastodon.im.sb;
  root /var/www/html;
  location /.well-known/acme-challenge/ { allow all; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  # 若配置了 IPV6，删除下方的井号
  # listen [::]:443 ssl http2;
  server_name mastodon.im.sb;

  ssl_certificate  /root/.acme.sh/mastodon.im.sb/fullchain.cer;
  ssl_certificate_key /root/.acme.sh/mastodon.im.sb/mastodon.im.sb.key;
  # 如果申请的有 ECC 证书，删除下方两行的井号
  # ssl_certificate  /root/.acme.sh/mastodon.im.sb_ecc/fullchain.cer;
  # ssl_certificate_key /root/.acme.sh/mastodon.im.sb_ecc/mastodon.im.sb.key;

  ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
  ssl_ciphers TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+ECDSA+AES128:EECDH+aRSA+AES128:RSA+AES128:EECDH+ECDSA+AES256:EECDH+aRSA+AES256:RSA+AES256:EECDH+ECDSA+3DES:EECDH+aRSA+3DES:RSA+3DES:!MD5;
  ssl_prefer_server_ciphers off;
  ssl_ecdh_curve X25519:secp384r1;

  ssl_session_cache shared:MASTODON:10m;
  ssl_session_timeout 1d;
  ssl_session_tickets off;

  ssl_stapling on;
  ssl_stapling_verify on;
  resolver 1.1.1.1 8.8.8.8 119.29.29.29 valid=300s;
  resolver_timeout 5s;

  root /var/www/mastodon/public;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  add_header Strict-Transport-Security "max-age=31536000" always;

  keepalive_timeout    70;
  sendfile             on;
  client_max_body_size 80m;

  location / {
    try_files $uri @proxy;
  }

  location ~ ^/(emoji|packs|system/accounts/avatars|system/media_attachments/files) {
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Strict-Transport-Security "max-age=31536000" always;
    try_files $uri @proxy;
  }

  location /sw.js {
    add_header Cache-Control "public, max-age=0";
    add_header Strict-Transport-Security "max-age=31536000" always;
    try_files $uri @proxy;
  }

  location @proxy {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Proxy "";
    proxy_pass_header Server;

    proxy_pass http://backend;
    proxy_buffering on;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    add_header X-Cached $upstream_cache_status;
    add_header Strict-Transport-Security "max-age=31536000" always;

    tcp_nodelay on;
  }

  location /api/v1/streaming {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Proxy "";

    proxy_pass http://streaming;
    proxy_buffering off;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    tcp_nodelay on;
  }

  error_page 403 404 500 501 502 503 504 /500.html;
}

# 将 mastodon.im.sb 替换成您自己的域名
```

重载 Nginx

```bash
nginx -t
# 确保配置文件无异常
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重载
nginx -s reload
```

现在访问您的域名即可访问 Mastodon。

> 👉 参考了 [此篇文章](https://pullopen.github.io/%E5%9F%BA%E7%A1%80%E6%90%AD%E5%BB%BA/2020/10/19/Mastodon-on-Docker.html)。
