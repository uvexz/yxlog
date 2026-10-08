---
title: "🌠 搭建 Mastodon 实例 | How to install a Mastodon instance"
description: "💡 本文成文时间较早，较目前的情况可能发生变化，推荐查看 Mastodon 官方中文文档 进行研究部署。"
pubDate: 2022-09-14
updatedDate: 2025-12-15
tags: ["Mastodon"]
---

> 💡 本文成文时间较早，较目前的情况可能发生变化，推荐查看 [Mastodon 官方中文文档](https://docs.joinmastodon.org/zh-cn/admin/prerequisites/) 进行研究部署。

Mastodon 官方文档更新了 Mastodon 的安装说明，现将其翻译成中文，以便更多 Mastodon 爱好者自行搭建。

### 先决条件

- 运行 Ubuntu 18.10 的独立服务器或者内存大于 2G 基于 KVM/XEN 等的 VPS（若内存小于 2G，推荐设置个 [SWAP](__GHOST_URL__/vps-swap)），且具备 root 权限
- 一个域名（顶级或二级域名）
- 推荐使用 [Mailgun](https://mailgun.com/) 进行邮件的发送

### 安装系统程序

#### Nodejs 、 Yarn & System packages

```
apt update && apt install curl -y && curl -sL https://deb.nodesource.com/setup_10.x | bash - && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
```

```
apt update && apt install -y vim imagemagick ffmpeg libpq-dev libxml2-dev libxslt1-dev file git-core g++ libprotobuf-dev protobuf-compiler pkg-config nodejs gcc autoconf bison build-essential libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm5 libgdbm-dev nginx redis-server redis-tools postgresql postgresql-contrib certbot yarn libidn11-dev libicu-dev libjemalloc-dev
```

### 安装 Ruby

新建 Mastodon 用户

```
adduser --disabled-login mastodon
```

切换至 Mastodon 用户

```
su – mastodon

```

安装 rbenv & rbenv-build

```bash
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
exec bash
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

安装最新 Ruby 版本 （截至本文发布，最新版本为 2.7.7）

```bash
RUBY_CONFIGURE_OPTS=--with-jemalloc rbenv install 2.7.2
rbenv global 2.6.6
```

返回至 root 用户

```
exit
```

### 设置

#### 设置 PG 数据库

新建 Mastodon 数据库用户

```
sudo -u postgres psql
```

```
CREATE USER mastodon CREATEDB;
\q
```

#### 架设 Mastodon

切换至 Mastodon 用户

```
su - mastodon
```

克隆代码至本地

```
git clone https://github.com/tootsuite/mastodon.git live && cd live
git checkout $(git tag -l | grep -v 'rc[0-9]*$' | sort -V | tail -n 1)
```

安装 Bundler

```
gem install bundler --no-ri --no-rdoc
```

安装依赖

```
bundle install -j$(getconf _NPROCESSORS_ONLN) --deployment --without development test
yarn install --pure-lockfile
```

生成配置文件

```
RAILS_ENV=production bundle exec rake mastodon:setup
```

这句代码会执行:

- 创建一个配置文件，叫 .env.production
- 预生成静态文件
- 创建数据库并同步

退出至 root 用户

```
exit
```

#### 配置 Nginx

```
vim /etc/nginx/conf.d/mastodon.conf
```

复制下方内容进去

```
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=CACHE:10m inactive=7d max_size=1g;

server {
  listen 80;
  listen [::]:80;
  server_name example.com;
  root /home/mastodon/live/public;
  location /.well-known/acme-challenge/ { allow all; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name example.com;

  ssl_protocols TLSv1.2;
  ssl_ciphers HIGH:!MEDIUM:!LOW:!aNULL:!NULL:!SHA;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;

  # Uncomment these lines once you acquire a certificate:
  # ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  keepalive_timeout    70;
  sendfile             on;
  client_max_body_size 80m;

  root /home/mastodon/live/public;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  add_header Strict-Transport-Security "max-age=31536000";

  location / {
    try_files $uri @proxy;
  }

  location ~ ^/(emoji|packs|system/accounts/avatars|system/media_attachments/files) {
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Strict-Transport-Security "max-age=31536000";
    try_files $uri @proxy;
  }

  location /sw.js {
    add_header Cache-Control "public, max-age=0";
    add_header Strict-Transport-Security "max-age=31536000";
    try_files $uri @proxy;
  }

  location @proxy {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Proxy "";
    proxy_pass_header Server;

    proxy_pass http://127.0.0.1:3000;
    proxy_buffering on;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    proxy_cache CACHE;
    proxy_cache_valid 200 7d;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    add_header X-Cached $upstream_cache_status;
    add_header Strict-Transport-Security "max-age=31536000";

    tcp_nodelay on;
  }

  location /api/v1/streaming {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Proxy "";

    proxy_pass http://127.0.0.1:4000;
    proxy_buffering off;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    tcp_nodelay on;
  }

  error_page 500 501 502 503 504 /500.html;
}
```

替换其中的  example.com 为你自己的域名，然后重启 Nginx

```
systemctl reload nginx
```

使用 Let’s Encrypt 生成 SSL 证书（生成之前将域名指向你服务器/VPS 的 IP，能访问了后再执行下面的代码）

```
certbot certonly --webroot -d example.com -w /home/mastodon/live/public/
```

然后编辑Nginx 配置文件将 SSL 相关行的 # 给删除掉

```
vim /etc/nginx/conf.d/mastodon.conf
```

大约在第 28、29行，删除前面的 #

```
  # Uncomment these lines once you acquire a certificate:
  # ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

再次重启 Nginx

```
systemctl reload nginx
```

配置系统服务使 Mastodon 能自动运行

```
cd /etc/systemd/system/ && wget https://github.com/tootsuite/mastodon/raw/master/dist/mastodon-web.service && wget https://github.com/tootsuite/mastodon/raw/master/dist/mastodon-streaming.service && wget https://github.com/tootsuite/mastodon/raw/master/dist/mastodon-sidekiq.service
```

```
systemctl start mastodon-web mastodon-sidekiq mastodon-streaming
systemctl enable mastodon-*
```

Mastodon 即会自行启动，访问你的域名即可看到熟悉的 Mastodon 页面
