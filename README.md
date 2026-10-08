# 印象日志

一个极简、单栏、内容优先的个人博客。基于 [Astro](https://astro.build) 静态构建，支持 Markdown 写作、标签、分页、RSS 与站内搜索。

## 技术栈

- **Astro**（静态输出）+ 原生路由 + Content Collections
- **TypeScript**
- **Tailwind CSS v4**

站内搜索是原生实现的（`src/components/Search.astro`），页面不加载任何框架运行时；搜索索引在构建期生成到 `/search.json`，首次打开搜索框时才按需拉取。

## 快速开始

使用 **bun**：

```bash
bun install       # 安装依赖
bun dev           # 本地开发，http://localhost:4321
bun run build     # 构建到 ./dist
bun run preview   # 预览生产构建
bunx astro check  # 类型检查
```

## 配置

**站点信息**在 `src/config/site.ts`，改这里即可：

```ts
export const siteConfig = {
  name: '印象日志',
  title: '印象日志 — YJK 的个人博客',
  description: '一个菜鸟开发者',
  author: 'YJK',
  url: 'https://yxlog.com',
  language: 'zh-CN',
  postsPerPage: 7,        // 首页每页文章数
  ogImage: '/android-chrome-512x512.png',  // 文章没有 heroImage 时的分享图
  social: [ /* 社交链接 */ ],
  nav: [ /* 顶部导航 */ ],
};
```

**站点域名**同时需要改 `astro.config.mjs` 里的 `site`（用于 canonical、og:url、RSS 绝对地址、sitemap）与 `public/robots.txt` 里的 Sitemap 地址：

```js
export default defineConfig({
  site: 'https://yxlog.com',
  // 站内链接统一带尾部斜杠；Markdown 里手写的站内链接会在构建时自动补齐
  trailingSlash: 'always',
  // ...
});
```

**主题色与字体**在 `src/styles/global.css` 顶部的 `@theme` 中调整（`--color-paper`、`--color-ink`、`--color-accent`、字体回退等）。

## 写作

文章放在 `src/content/blog/`，**文件名即 URL slug**：

```md
---
title: '文章标题'
description: '用于 SEO 与 RSS 的摘要'
pubDate: 2025-09-10
updatedDate: 2025-09-12   # 可选
tags: [astro, blog]
heroImage: ../../assets/cover.jpg  # 可选
draft: false              # 可选，draft 仅开发环境可见
---

正文……
```

- **标签**：直接写在 frontmatter 的 `tags` 里，标签页、数量、链接自动生成，无需额外配置。标签名会转成 URL slug（小写、空白转连字符），例如 `Open Source` → `/tags/open-source/`；改标签名等于改 URL。
- **独立页面**：放在 `src/content/pages/`，访问路径为 `/文件名/`（如 `about.md` → `/about/`）。
- **站内链接**：正文里手写的 `/some-post` 会在构建时自动补上尾部斜杠，与 `trailingSlash: 'always'` 保持一致。
- 文章按 `pubDate` 倒序排列，列表、标签、分页、RSS、sitemap 会在下次构建时自动更新。

## 路由

```text
/               首页（文章列表 + 分页）
/[slug]/        文章详情
/tags/          全部标签
/tags/[tag]/    单个标签的文章（tag 为 slug）
/[page]/        内容页面（about、links …）
/page/[n]/      首页分页
/rss.xml        订阅源
/feed.xml       订阅源
/search.json    站内搜索索引
/sitemap-index.xml
/robots.txt
/404.html
```

## 部署

本项目是**纯静态站点**，`bun run build` 后把 `dist/` 目录部署到任意静态托管即可，无需 Node 运行时。

通用设置：

| 项 | 值 |
| :-- | :-- |
| 构建命令 | `bun run build` |
| 输出目录 | `dist` |
| Node 版本 | `>=22.12.0` |

**Cloudflare Pages**：连接 Git 仓库，填上表设置即可；或本地 `bunx wrangler pages deploy dist`。

**Vercel**：Framework 选 Astro 自动识别；或 `bunx vercel --prod`。

**Netlify**：`bunx netlify deploy --prod --dir=dist`。

**GitHub Pages**：把 `astro.config.mjs` 的 `site` 改为 `https://<用户名>.github.io/<仓库名>`，构建后用 `dist/` 发布到 `gh-pages`。

**自建服务器（Nginx）**：构建后把 `dist/` 传到服务器。注意 `404.html` 要真的返回 404 状态码，否则未知路径会被兜成「软 404」，对 SEO 不利：

```nginx
server {
    listen 80;
    server_name yxlog.com;
    root /var/www/yxlog/dist;
    index index.html;

    location / { try_files $uri $uri/ $uri.html =404; }
    error_page 404 /404.html;
}
```

> 部署前记得改 `site`（`astro.config.mjs`）和 `url`（`src/config/site.ts`）为你自己的域名。
