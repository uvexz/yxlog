---
title: "在 PaaS 平台持久化地部署您的 Ghost 博客"
description: "本文仅提供思路，具体实现建议自行研究"
pubDate: 2023-10-08
updatedDate: 2025-12-16
tags: ["Notes"]
---

> 本文仅提供思路，具体实现建议自行研究

在 Zeabur、Northflank、Fly.io 等支持 Docker 部署的 PaaS 平台部署的 Ghost 博客，在重启时总是会丢失您上传的内容，可通过部署 S3 储存插件、使用第三方数据库规避。

## 0/ 准备工作

1. 注册 Docker Hub： [https://hub.docker.com/signup](https://hub.docker.com/signup)
2. 注册 Cloudflare R2 作为储存： [https://www.cloudflare.com/zh-cn/developer-platform/r2/](https://www.cloudflare.com/zh-cn/developer-platform/r2/)
3. 注册 TiDB Cloud 作为数据库： [https://www.pingcap.com/tidb-serverless/](https://www.pingcap.com/tidb-serverless/)

## 1/ 自定义 Dockerfile

在本地文件夹中新建 `Dockerfile`：

```
FROM node:20-alpine as build
RUN apk add git
RUN git clone https://github.com/laosb/ghos3.git s3
RUN git clone https://github.com/uvexz/ghost-theme-lite lite
RUN cd s3 && npm install && npm run build

FROM ghost:5-alpine
COPY --from=build s3 content/adapters/storage/s3
COPY --from=build lite content/themes/lite
RUN chown -R node:node content \
    && chmod 1777 -R content

EXPOSE 2368
CMD ["node", "current/index.js"]
```

您可以把 `lite` 主题换成您喜欢的主题。

本地安装 Docker 并登录

- [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

```
docker login -u 用户名 -p 密码
```

本地编译

```
docker build -t 用户名/ghost:5 .
```

推送

```
docker push 用户名/ghost:5
```

## 在 PaaS 平台上使用

在支持 Docker 的 PaaS 上使用您自定义的库 `用户名/ghost:5`

`ENV` 按如下填入

```
[env]
  url="https://[YOURS]"
  database__client="mysql"
  database__connection__password="[YOURS]"
  database__connection__host="[YOURS].prod.aws.tidbcloud.com"
  database__connection__user="[YOURS].root"
  database__connection__port="4000"
  database__connection__database="ghost"
  database__connection__ssl__rejectUnauthorized=true
  database__connection__ssl__secureProtocol="TLSv1_2_method"
  storage__active="s3"
  storage__s3__assetHost="https://[YOURS].r2.dev"
  storage__s3__acl="private"
  storage__s3__endpoint="https://[YOURS].r2.cloudflarestorage.com"
  storage__s3__region="auto"
  storage__s3__bucket="[YOURS]"
  storage__s3__accessKeyId="[YOURS]"
  storage__s3__secretAccessKey="[YOURS]"
```

部署即可。
