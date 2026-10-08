---
title: "Mastodon 数据库升级实战：从 PostgreSQL 12 到 14 全记录"
description: "在今日拉取 glitch-soc/mastodon:edge 时，发现 Mastodon 最新版本对数据库的要求提升至至少 PostgreSQL 13，而我的部署环境中一直依赖 Docker Compose ，使用的是 PostgreSQL…"
pubDate: 2025-06-01
updatedDate: 2025-12-16
tags: ["Mastodon"]
---

在今日拉取 `glitch-soc/mastodon:edge` 时，发现 Mastodon 最新版本对数据库的要求提升至至少 PostgreSQL 13，而我的部署环境中一直依赖 Docker Compose ，使用的是 PostgreSQL 12。为了保证后续更新不出问题，冲了一波版本升级。

下面是数据库升级的详细过程：

> 以下 `dc` 均为 `docker compse` 的简写

## 修改 docker-compose 配置

首先，给 `db` 服务添加 volume：

```yaml
db:
  volumes:
    - ./postgres:/var/lib/postgresql/data
    - ./dumps:/dumps
```

## 单独重启数据库

```bash
dc down
dc up -d db
```

## 进入数据库导出

```bash
docker exec -it mastodon-db-1 bash
pg_dump -U mastodon -F c -Z 5 mastodon > /dumps/mastodon.dump
```

## 启动 PostgreSQL 14 并创建用户

```bash
docker run --name postgres14 \
  -v /var/www/mastodon/postgres14:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=your_admin_password \
  --rm -d postgres:14-alpine

docker exec -it postgres14 psql -U postgres

CREATE USER mastodon WITH PASSWORD 'your_mastodon_password' CREATEDB;

\q

docker stop postgres14
```

## 处理旧数据库

```bash
mv postgres postgres12
```

## 修改 docker-compose 为 pg14 配置

```yaml
db:
  image: postgres:14-alpine
  volumes:
    - ./postgres14:/var/lib/postgresql/data
    - ./dumps:/dumps
```

## 重启 db 并导入数据

```bash
dc up -d db

docker exec -it mastodon-db-1 bash

createdb -U mastodon -T template0 mastodon

pg_restore -U mastodon -d mastodon < /dumps/mastodon.dump

exit
```

## 重启 Mastodon 应用

```bash
dc down && dc up -d

dc run --rm web bundle exec rails db:migrate

dc down && dc up -d
```

至此，PostgreSQL 升级完成， Mastodon 已可正常运行。

* * *

总结：

- 升级前务必须做好数据备份
- 数据库升级可借助 `pg_dump` -> `pg_restore` 完成
- 这种操作对于使用 Docker 部署的项目非常方便

如果你的 Mastodon 环境还使用旧版 PostgreSQL，进行升级是很有必要的。
