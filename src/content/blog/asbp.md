---
title: "ASBP： 回归博客的初衷，专注写作，简单分享"
description: "你是否也在寻找一个简单、纯粹的博客程序？不想要复杂的功能，但又需要完整的内容管理和后台控制？今天，我来向大家介绍我新开发的开源博客平台——ASBP（A Simple Blogging Platform）。"
pubDate: 2025-12-16
tags: ["Open Source"]
---

你是否也在寻找一个**简单、纯粹**的博客程序？不想要复杂的功能，但又需要完整的内容管理和后台控制？今天，我来向大家介绍我新开发的开源博客平台——**ASBP**（A Simple Blogging Platform）。

## 🎯 为什么需要又一个博客平台？

现有的博客平台要么功能过于臃肿，要么定制性不足。作为内容创作者，我们真正需要的是：
- 一个干净、专注的写作环境
- 完整的后台管理功能
- 现代化的技术栈
- 简单的部署流程

ASBP 正是为此而生。

## ✨ 核心特性

### 📝 完整的内容管理
- **公开博客**：支持文章、评论、标签系统
- **管理后台**：文章、评论、媒体、标签、站点设置一站式管理
- **Markdown 支持**：完整的 GFM 语法，写作体验流畅

### 🚀 现代化技术栈
- **Next.js 16**：使用最新的 App Router 和 RSC
- **React 19 + TypeScript**：类型安全，开发高效
- **PostgreSQL + Drizzle ORM**：强大的数据库支持
- **Tailwind CSS v4**：简洁美观的界面设计

## 💻 快速上手

只需几步，你就可以拥有自己的博客：

```bash
# 1. 克隆项目
git clone https://github.com/uvexz/asbp.git

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local

# 4. 初始化数据库
npm run db:push

# 5. 启动！
npm run dev
```

访问 `http://localhost:3000` 即可看到你的博客，访问 `/admin` 进入管理后台。

## 🌐 轻松部署

ASBP 支持多种部署方式：
- **Vercel**（推荐，一键部署）
- **Deno Deploy**
- **Render** 或其他 PaaS 平台

只需配置几个环境变量，你的博客就准备就绪了！

## 🔧 可扩展性

虽然追求简单，但 ASBP 也提供了必要的扩展性：
- **S3 兼容存储**：支持 AWS S3、Cloudflare R2、MinIO 等
- **邮件服务**：集成 Resend 发送通知邮件
- **完全开源**：基于 WTFPL 协议，自由修改和分发

## 🎨 界面预览

简洁的管理后台，直观的操作界面：

![](https://boost.jpgcdn.com/c2.jpgcdn.com/2025/12/16/eN49.png)

## 📈 适合谁使用？

- **个人博主**：想要一个干净、专注的写作平台
- **技术爱好者**：喜欢现代化的技术栈，易于定制
- **内容创作者**：需要完整的评论管理和审核功能
- **开源贡献者**：希望参与到一个活跃的开源项目中

## 🚀 立即尝试

如果你厌倦了臃肿的 CMS，或者想要一个可以完全控制的博客平台，ASBP 可能正是你需要的。

**项目地址**：[https://github.com/uvexz/asbp](https://github.com/uvexz/asbp)

欢迎大家 Star、Fork 和贡献代码！如果你在使用的过程中遇到任何问题，或者有新的功能建议，欢迎在 GitHub 上提交 Issue。

让我们一起打造更好的博客体验！✨

---

**ASBP** — 回归博客的初衷：专注写作，简单分享。

*注：ASBP 使用 WTFPL 协议，你可以自由地做任何你想做的事情。*
