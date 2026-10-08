---
title: "榨干 Oracle ARM 1/ 安装 Gitlab"
description: "本文成文时间较久，内容与现行版本可能出现差异，请谨慎参考"
pubDate: 2022-10-15
updatedDate: 2025-12-16
tags: ["VPS", "Oracle"]
---

> 本文成文时间较久，内容与现行版本可能出现差异，请谨慎参考

骨文免费的 ARM 4C24G 的机器只用来搭梯子就大材小用了，这里结合博主自身的体验，说说如何榨干它。

以下均基于 Debian 11 root 用户 。

## 安装 Docker 及 Compose

第一步，先安装 Docker 及 Docker-Compose

安装依赖

```bash
apt-get update && apt-get install ca-certificates curl wget vim gnupg lsb-release -y
```

下载 GPG Key

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

```

更新 apt source

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
```

安装 Docker Engine

```bash
apt-get update && apt-get install docker-ce docker-ce-cli containerd.io -y

## 可选，用 d 代替 docker 命令
ln -s /usr/bin/docker /usr/bin/d
```

安装 Docker Compose

```bash
wget -O /usr/local/bin/docker-compose "https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-aarch64"

chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

## 可选，可用 dc 代替 docker-compose 命令
ln -s /usr/local/bin/docker-compose /usr/bin/dc
```

查看是否安装成功

```bash
d -v
# Docker version 20.10.13, build a224086
dc -v
# Docker Compose version v2.3.3
```

> 💡 以下我均用 dc 代替 docker-compose 命令。

## 安装 Nginx 及 acme.sh

安装 GPG Key

```bash
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
```

更新 apt source

```bash
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/debian `lsb_release -cs` nginx" | tee /etc/apt/sources.list.d/nginx.list

# 提权
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | tee /etc/apt/preferences.d/99nginx
```

安装 Nginx

```bash
apt update && apt install nginx -y
```

安装 acme.sh

```bash
curl -L get.acme.sh | bash

# 重启终端，重新登录 SSH
```

## 安装 Gitlab

新建文件夹

```bash
mkdir -p /var/www/gitlab && cd /var/www/gitlab
```

编辑 docker-compose.yml

```bash
vim docker-compose.yml
```

将下方代码粘贴进去，按 Esc，输入 :wq 保存退出

```yaml
version: '3.6'
services:
  web:
    image: 'yrzr/gitlab-ce-arm64v8:latest'
    hostname: 'git.im.sb'
    restart: unless-stopped
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://git.im.sb'
        gitlab_rails['gitlab_shell_ssh_port'] = 3022
        gitlab_rails['time_zone'] = 'Asia/Shanghai'
        gitlab_rails['gitlab_ssh_host'] = 'git.im.sb'
    ports:
      - '3080:80'
      - '3022:22'
    volumes:
      - './config:/etc/gitlab'
      - './logs:/var/log/gitlab'
      - './data:/var/opt/gitlab'
  runner:
    restart: always
    volumes:
      - './runner-config:/etc/gitlab-runner'
      - '/var/run/docker.sock:/var/run/docker.sock'
    image: 'gitlab/gitlab-runner:latest'

# 以上所有 git.im.sb 均修改为您自己的域名
```

运行

```bash
dc up -d

# 查看运行详情
dc ps

NAME                COMMAND                  SERVICE             STATUS              PORTS
gitlab-runner-1     "/usr/bin/dumb-init …"   runner              running
gitlab-web-1        "/assets/wrapper"        web                 running (healthy)   0.0.0.0:3022->22/tcp, 0.0.0.0:3080->80/tcp, :::3022->22/tcp, :::3080->80/tcp

# 当 gitlab-web-1 状态为 healthy 的时候即代表成功运行，访问 ip:3080 即可进入 Gitlab 首页
```

查看默认 root 密码

```bash
cat config/initial_root_password

# WARNING: This value is valid only in the following conditions
#          1. If provided manually (either via `GITLAB_ROOT_PASSWORD` environment variable or via `gitlab_rails['initial_root_password']` setting in `gitlab.rb`, it was provided before database was seeded for the first time (usually, the first reconfigure run).
#          2. Password hasn't been changed manually, either via UI or via command line.
#
#          If the password shown here doesn't work, you must reset the admin password following https://docs.gitlab.com/ee/security/reset_user_password.html#reset-your-root-password.

Password: [Hidden]

# NOTE: This file will be automatically deleted in the first reconfigure run after 24 hours.
```

以用户名 root 及上方 Password 密码即可登陆 Gitlab。

> 配置 Runner、HTTPS 待更......

* * *

安装 Mastodon 可查看系列 2

[榨干 Orcale ARM 2/ Mastodon](/better-use-oracle-arm-machine-2)
