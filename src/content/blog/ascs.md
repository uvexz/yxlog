---
title: "ASCS：一个简单的评论系统"
description: "从第一版到现在，ASCS 已经重构成了一个多站点评论服务：TanStack Start、Better Auth、Drizzle，加上可选的 AI 反垃圾。嵌入依然只需要一个 div 和一段 script。"
pubDate: 2025-12-15
updatedDate: 2026-10-19
tags: ["Open Source"]
---

ASCS 全称 A Simple Comment System，是一个简单的评论系统，是我跟 AI 边聊边写出来的。

第一版发出去以后我一直在改，改到现在，它跟最初那版基本已经不是同一个东西了。最早只能给一个站点用，现在能同时接好几个博客。这篇文章按仓库里最新的代码重写一遍。

## 为啥要做这玩意儿

原因特别简单：我想要一个自己的评论系统，能完全掌控。市面上的要么太重，要么要钱，要么界面我看着别扭。

所以一开始也没做啥规划，就是跟着感觉让 AI 写。第一版是 Next.js 15 + Prisma + shadcn/ui，能跑，也能用，但是太重了。后来功能越加越多，我干脆整个重构了一遍。

## 现在它是个啥

现在 ASCS 是给多站点博客用的评论服务。一个实例能同时服务好几个站点，每个站点有自己的所有者、审核员、主题、审核策略和域名验证。评论是通过 sandbox iframe 嵌进去的，所以你博客的 CSS 不会把评论区搞乱。

技术栈：

- TanStack Start / Router / Query
- React 19 + TypeScript strict
- Tailwind CSS v4 + Cloudflare Kumo
- Drizzle ORM + libSQL（本地 SQLite 或者远程 Turso）
- Better Auth（邮箱密码 + 可选 OAuth）
- Nitro（Node / Docker / Vercel）

## 主要功能

### 嵌入就两段代码

```html
<div id="ascs-comments"></div>
<script
  src="https://comments.example.com/embed.js"
  data-site="站点 ID"
  data-target="ascs-comments"
  data-theme="auto"
  defer
></script>
```

`embed.js` 没有任何第三方依赖，gzip 完不到 2 KB。挂载点、文章 URL、稳定的 pageKey、标题和摘要都能用 data 属性覆盖。主题支持 auto / light / dark，还能传品牌色、边框和背景图。它只干两件事：创建 iframe、转发高度消息，所有校验都在服务端做。

第一次嵌入之前，你得先去后台「集成」页拿一条 `_ascs.<你的域名>` 的 TXT 记录，把 DNS 验证做了。公开接口只认验证过的站点，文章 URL 的 origin 也必须跟站点保存的 origin 完全一致。

### 两级后台

实例管理员管整个服务：用户、所有站点、注册开关、默认站点额度、SMTP、邮件队列、操作日志。

站点所有者 / 审核员只管自己被授权的站点：评论审核、最近 7 天统计、成员邀请、域名验证和嵌入代码、站点主题和审核策略。所有者能管配置和成员，审核员只能做被授权的审核操作。站点之间不光前端过滤，服务端查询条件里也带着站点归属。

### 登录、匿名评论和个人资料

登录用 Better Auth：邮箱密码，另外可选 GitHub、Google、Microsoft OAuth。注册要邮箱验证，OAuth 新用户也受注册开关限制。

站点可以允许匿名评论。登录用户有个人资料页，能改昵称、头像、个人网站和简介，默认头像用 Blobatar 按名字生成。

评论支持 Markdown（含 GFM 表格和任务列表）、实时预览、最多五层嵌套回复和点赞。删除评论会清掉正文和身份摘要；只有下面还有可见回复时，才留一个「评论已删除」的占位节点，否则整条不展示。

跨站嵌入的时候，第三方 iframe 拿不到 ASCS 的会话 cookie。所以点登录会在服务域名的顶层窗口打开 `/widget-login`，验证完 session 后签发一个 12 小时、可撤销的短期凭据，通过 `postMessage` 回传给 iframe。Cookie 的 SameSite 和 CSRF 保护没为此放宽。

### 邮件通知

新评论和回复会进邮件队列。邮件先写进数据库 outbox，再尝试立即投递；失败的由 cron 兜底重试，每批最多 20 封，最多试 5 次。

后台能配 SMTP，密码用 `BETTER_AUTH_SECRET` 派生的密钥做 AES-256-GCM 加密，接口不会回传明文。后台没启用 SMTP 时，会回退到 `SMTP_URL` 和 `MAIL_FROM` 环境变量。

### AI 反垃圾评论

这功能是可选的，设了 `DECISION_API_KEY` 就启用。

它没用生成式大模型，走的是 System One 决策 API：一次请求对同一条评论返回多组带校准概率的答案——分类、垃圾、推广、相关性、风险，以及是不是在试图操纵审核系统。默认模型是 `vllm-sr/d3`，也能按需要换成同系列的 flash、mini、nano。

决策分四档：`approved` 直接发布，`review` 进待审，`quarantined` 隔离为垃圾，`unavailable` 按失败模式处理。本地规则（屏蔽词、链接数量、蜜罐、challenge、限流、重复提交）永远先跑，AI 只做语义补充；任何单一分数都不会直接永久删评论。检测只发评论正文和公开上下文，不发邮箱、IP 或它们的 HMAC 摘要。

为啥这么选、怎么接，我单独写过一篇：[评论反垃圾别用大模型了，试试决策模型](/decision-model-comment-spam/)。

### 默认就是安全的

- 所有外部输入用 Zod 校验；评论正文最多 5,000 字符，请求体最多 24,000 字节。
- 评论者邮箱和 IP 只存带服务端密钥的 HMAC 摘要，公开响应不返回。
- 限流存在数据库里，用原子计数，不是进程内 Map。
- Markdown 不渲染 raw HTML；链接带 `nofollow noopener noreferrer ugc`，图片默认不加载。
- 管理页面禁止 iframe 嵌入，widget 的 CSP `frame-ancestors` 只放行对应已验证站点和 ASCS 自身。
- `postMessage` 校验 origin、source、消息类型、站点 ID 和高度范围。
- 可选 Cap 人机验证，覆盖注册、登录、重置密码和发评论。

## 快速上手

需要 Node.js 22.12+（推荐 24）或 Bun。

```bash
bun install

cp .env.example .env.local
# 至少填 BETTER_AUTH_URL、BETTER_AUTH_SECRET、CRON_SECRET

bun run db:migrate
ADMIN_EMAIL=you@example.com \
ADMIN_PASSWORD='<10–128 位密码>' \
bun run admin:init
bun run dev
```

打开 <http://localhost:3000>，登录后创建站点，复制嵌入代码就能用。本地开发可以设 `ALLOW_LOCALHOST_SITE=true` 跳过 DNS 验证；生产环境必须用 HTTPS，并且完成 TXT 记录验证。

部署支持 Docker / VPS 和 Vercel。Docker 镜像以非 root 用户运行，迁移在容器启动时执行；Vercel 建议配 Turso。完整步骤在仓库的 `docs/` 里。

## 最后

源码在 [uvexz/ascs](https://github.com/uvexz/ascs)。项目还在持续改，文档和代码都以仓库为准。

有啥想法或者建议，欢迎提 Issue 或 PR。
