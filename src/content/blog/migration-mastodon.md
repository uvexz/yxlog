---
title: "迁移 Mastodon 实例 | How to migration Mastodon instance"
description: "💡 本文成文时间较早，较目前的情况可能发生变化，推荐查看 Mastodon 官方中文文档 进行迁移。"
pubDate: 2022-09-14
updatedDate: 2025-12-15
tags: ["Mastodon"]
---

> 💡 本文成文时间较早，较目前的情况可能发生变化，推荐查看 [Mastodon 官方中文文档](https://docs.joinmastodon.org/zh-cn/admin/migrating/) 进行迁移。


1. 按照 [《搭建 Mastodon 实例》](/how-to-install-a-mastodon-instance) 在新服务器上搭建 Mastodon（但是不要运行同步数据库 `db:setup`）
2. 停止旧服务器上的 Mastodon ( `systemctl stop 'mastodon-*.service'`)
3. 按照下方的步骤 **备份并恢复数据库**
4. 按照下方的步骤 **复制 system 的内容至新服务器**
5. 重建用户首页数据 ( `RAILS_ENV=production bundle exec rails mastodon:feeds:build`)
6. 在新服务器上开启 Mastodon 的服务
7. 更新 DNS 至新服务器 IP
8. 在新服务器上设置 Nginx 配置文件并重签 Let’s Encrypt 证书
9. All Down!

## 备份并恢复数据库

在旧服务器上导出数据库（使用 mastodon 用户）

```
su - mastodon // 切换至 mastodon 用户
pg_dump mastodon_production > dump.sql
```

下载 `dump.sql` 文件至本地并上传至新服务器，记得赋予 `dump.sql` 文件的读取权限给 `mastodon` 用户

在新服务器上创建一个空白数据库（使用 mastodon 用户）

```
su - mastodon // 切换至 mastodon 用户
createdb -T template0 mastodon_production
```

导入 `dump.sql` 至数据库（还是使用 mastodon 用户）

```
psql mastodon_production < dump.sql
```

会出现一些 `no privileges could be revoked for “public”` 的错误提升，可以忽略

## 复制 system 的内容至新服务器

复制旧服务器的 `~/live/.env.production` 文件至服务器

复制旧服务器的 `~/live/public/system` 文件夹至服务器

因为 `~/live/public/system` 文件夹的内容很多，推荐使用 `rsync` 来传输，在旧服务器上运行（使用 mastodon 用户）

```
su - mastodon // 切换至 mastodon 用户
rsync -avz ~/live/public/system/ -e "SSH -p 22 -i ~/.ssh/id_rsa" root@example.com:/home/mastodon/live/public/system/
```

其中 `-p 22` 为新服务器的端口，若使用密码登陆，去掉其中的 `-i ~/.ssh/id_rsa`。

* * *

全文翻译自 [官方文档](https://github.com/tootsuite/documentation/blob/master/Running-Mastodon/Migration-guide.md)
