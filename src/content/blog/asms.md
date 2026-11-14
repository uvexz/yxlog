---
title: "ASMS：用 Resend 搭一个自己的邮箱服务"
description: "Cloudflare Email Routing 收信免费，但域名得托管在 Cloudflare，发信还需要 Workers 付费套餐。ASMS 换了个思路：域名放在哪都行，收发都交给 Resend，发件每月还有 3,000 封免费额度。"
pubDate: 2026-11-14
tags: ["Open Source", "Email"]
---

ASMS 全称 A Simple Mail Server，是我继 ASCS 之后写的另一个小东西。

它干的事很简单：给你一个自己的域名邮箱。可以开长期地址，也可以开一次性临时地址；收到的邮件进你自己的数据库，发信走 Resend。整个服务自己部署，收件箱不在别人手里。

代码在 [github.com/uvexz/asms](https://github.com/uvexz/asms)。

## 为什么不直接用 Cloudflare

如果你只是想把 `hi@example.com` 转发到 Gmail，Cloudflare Email Routing 挺好用，免费，配置也简单。

但它有两个前提：

- 域名必须托管在 Cloudflare。域名在 Namecheap、阿里云或者别的 DNS 服务商，就用不了。
- 发信要写 Email Worker、用 `send_email` binding，这属于 Workers 付费套餐的能力。免费版只能收，不能发。

我的域名不在 Cloudflare，所以第一条就卡住了。后来看到 Resend 的 Receiving API，发现这条路更顺：

| | Cloudflare Email Routing | Resend |
| --- | --- | --- |
| 域名要求 | 必须托管在 Cloudflare | 任意 DNS 服务商 |
| 收件 | 免费，转发或交给 Email Worker | Webhook + Receiving API |
| 发件 | Email Workers，需要 Workers 付费套餐 | API 直接发，每月 3,000 封免费额度 |
| 适合 | 域名已在 CF，只需要转发 | 想自己管理收件箱，同时需要发件 |

对个人项目来说，3,000 封/月基本用不完。具体额度以 Resend 官网为准，反正比为了发几封验证码邮件去开 Workers 付费要省事。

## 它到底能干什么

ASMS 现在是一个多用户邮箱服务，不是只能给自己用的玩具。

- **长期邮箱**：地址一直归你，来信进收件箱。普通用户默认最多 5 个，前缀最短 3 位，都能在后台改。
- **临时邮箱**：固定 1 小时有效。有效期内收到邮件就永久保留，没收到就自动作废。适合注册一些只发一次验证码的站点。
- **收件箱**：列表、正文、附件。HTML 邮件放在 sandbox iframe 里渲染，默认拦截远程图片，避免一打开就被追踪。
- **写邮件**：纯文本编辑，自动生成 HTML。默认每个用户每天 5 封，管理员可以在后台调整。
- **已发送**：能看到 Resend 的投递状态，送达、退信、投诉都会通过 Webhook 回写。
- **注册验证**：配置好 Resend 和系统发件地址后，邮箱密码注册会发验证链接。
- **管理面板**：站点信息、邮件策略、Resend 配置、域名、用户、审计日志、收件日志都在这里。
- **Telegram Bot**：可选。在 Telegram 私聊的 Widget 卡片里创建临时邮箱、切邮箱、读信、删信。

技术上它是 TanStack Start + React 19 + Drizzle + libSQL，认证用 Better Auth，部署到 Node、Docker 或 Vercel 都行。这些不是重点，重点是邮件到底怎么跑通的。

## 收件是怎么跑通的

Resend 的收件不是“把 SMTP 连到你的服务器”，而是一套 Webhook + API 的组合。

1. 在 Resend 添加域名，开启 receiving capability，按提示把 MX 记录指过去。
2. 邮件到达 Resend 后，它会向 `/api/webhooks/resend` 发一个 `email.received` 事件。
3. Webhook 里只有元数据：`email_id`、发件人、收件人、主题，没有正文。
4. ASMS 先用 svix 签名校验请求，再用 Receiving API 按 `email_id` 把完整正文和附件列表拉回来。
5. 按收件人地址匹配邮箱。支持 `hi+tag@example.com` 这种 plus 地址，会归到 `hi@example.com`。
6. 匹配到邮箱后，按 `(resend_email_id, mailbox_id)` 唯一索引幂等入库。Webhook 重试不会重复下载正文，也不会重复插入。
7. 附件默认只存文件名、类型、大小，下载时再向 Resend 要签名 URL；配置了 S3/R2 才会在收件时自动落盘。

每一步都会写收件日志。没收到信的时候，去管理后台看一眼，是地址不存在、邮箱过期，还是 Resend 拉取失败，一目了然。

这里有个细节挺重要：Resend 的 Webhook 只负责通知，真正的邮件内容要再调一次 API。所以超时、重试、幂等这三件事必须做，不然网络抖一下就可能丢信或者重复入库。

## 发件

发件反而简单，调 Resend 的 `emails.send` 就行，但坑也不少：

- 每次发送带一个 idempotency key，用户连点两次不会发出两封。
- Resend 每个团队大概每秒只能打 2 个请求，所以出站调用在进程内排队，串行发送，避免一拥而上吃 429。
- 每个请求有 15 秒超时，卡住的请求不能把后面的发送全堵死。
- 发送前先占每日额度，失败再把额度还回去。
- `replyTo` 是邮箱本身的地址，对方直接回信还会回到收件箱。
- `email.sent`、`email.delivered`、`email.bounced` 这些事件会更新已发送列表里的状态。

管理员的发件不受额度和邮箱数量限制，普通用户则按后台配置来。

## 部署

本地跑起来只要几步：

```bash
bun install
cp .env.example .env.local
# 填 BETTER_AUTH_SECRET、ASMS_ENCRYPTION_KEY
bun run db:push
bun run dev
```

打开 `http://localhost:3000` 注册账号，访问 `/setup` 领取管理员，然后去 `/admin/settings` 填 Resend API Key，去 `/admin/domains` 添加域名。

线上三种方式：

- **Vercel**：数据库换成 Turso，附件用 S3/R2，`vercel.json` 里已经配好每天清理的 Cron。
- **Docker**：挂一个卷持久化 SQLite，`docker run --env-file .env.local -p 3000:3000`。
- **VPS**：`bun run build` 后用 `node .output/server/index.mjs`，前面套 Nginx 或 Caddy。

不管哪种方式，`BETTER_AUTH_URL` 必须是外部能访问的 HTTPS 地址，否则 OAuth 回调和 Cookie 都会出问题。定时清理接口 `/api/cron/cleanup` 要配 `CRON_SECRET`，不配就一律拒绝。

## Resend 那边要配什么

1. **API Key**：创建 Full access 的 key。只有发件权限的 key 读不了域名和收件内容。
2. **域名**：建议用子域，比如 `mail.example.com`。如果根域已经有 Google Workspace 或 Microsoft 365，直接改根域的 MX 会把所有邮件都转到 Resend。
3. **DNS**：MX 负责收件，SPF 和 DKIM 负责发件，DMARC 建议一起配上。
4. **Webhook**：地址填 `https://你的域名/api/webhooks/resend`，至少勾 `email.received`，发件状态事件按需勾。
5. **系统发件地址**：验证过的域名下开一个地址，比如 `no-reply@mail.example.com`，用于注册验证和找回密码。
6. **附件存储（可选）**：Cloudflare R2、AWS S3、MinIO 都行，不配就只保留附件元数据。

本地开发时 Webhook 需要一个公网 HTTPS 地址，可以用 Cloudflare Tunnel 或者 ngrok 临时把本地端口暴露出去。

## 几个已知边界

- 临时邮箱默认只收不发，后台可以打开，但不建议。
- 发件暂不支持附件。
- 收件箱是 15 秒轮询，不是 WebSocket 推送。
- 不做转发、自动回复、别名和全文搜索。
- 域名可以分别开关收件、发件和临时邮箱，一个域名挂了不影响其他域名。

这些限制不是做不了，而是暂时不想把系统搞复杂。邮箱这个领域功能一多就容易失控，先把收、发、管这三件事做稳。

## 最后

如果你只是想收几封验证码邮件，Cloudflare 的免费转发确实够了。但如果你想要一个真正能发信、能管理多个地址、数据还在自己手里的邮箱服务，Resend 这条路由值得试试。

ASMS 的代码在 [github.com/uvexz/asms](https://github.com/uvexz/asms)，文档里把 Resend 配置、DNS、Webhook、部署和定时清理都写清楚了。有问题欢迎提 Issue。
