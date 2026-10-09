export type SocialIcon =
	| 'github'
	| 'gitlab'
	| 'x'
	| 'twitter'
	| 'mastodon'
	| 'facebook'
	| 'google'
	| 'instagram'
	| 'wechat'
	| 'tiktok'
	| 'telegram'
	| 'threads'
	| 'youtube'
	| 'linkedin'
	| 'reddit'
	| 'discord'
	| 'whatsapp'
	| 'pinterest'
	| 'snapchat'
	| 'tumblr'
	| 'medium'
	| 'matrix'
	| 'fediverse'
	| 'email'
	| 'rss'
	| 'web'
	| 'planet';

export interface SocialLink {
	label: string;
	href: string;
	icon: SocialIcon;
}

export interface NavLink {
	label: string;
	href: string;
}

export interface CommentsConfig {
	/** 评论系统（自托管 ascs）的 embed 脚本地址。 */
	embedUrl: string;
	/** 评论系统分配的站点 ID。 */
	siteId: string;
	/** embed 脚本注入评论的容器 id。 */
	targetId: string;
}

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	author: string;
	url: string;
	language: string;
	postsPerPage: number;
	/** 文章没有 heroImage 时使用的默认社交分享图（相对 public/ 的绝对路径）。 */
	ogImage: string;
	comments: CommentsConfig;
	social: SocialLink[];
	nav: NavLink[];
}

export const siteConfig: SiteConfig = {
	name: '印象日志',
	title: '印象日志 — YJK 的个人博客',
	description: '一个菜鸟开发者',
	author: 'YJK',
	url: 'https://yxlog.com',
	language: 'zh-CN',
	postsPerPage: 7,
	ogImage: '/android-chrome-512x512.png',
	// 自托管评论系统 ascs：把 embedUrl 换成线上服务地址（如 https://comments.example.com/embed.js）。
	comments: {
		embedUrl: 'http://comments.im.sb/embed.js',
		siteId: '67e4bfe5-6e37-43ad-bce3-1c8cadcadd87',
		targetId: 'ascs-comments',
	},
	social: [
		{ label: 'GitHub', href: 'https://github.com/uvexz', icon: 'github' },
		{ label: 'im.sb', href: 'https://im.sb', icon: 'planet' },
		{ label: 'RSS', href: '/rss.xml', icon: 'rss' },
	],
	// 站内链接统一带尾部斜杠，与 trailingSlash: 'always' 保持一致。
	nav: [
		{ label: '首页', href: '/' },
		{ label: '标签', href: '/tags/' },
		{ label: '关于', href: '/about/' },
		{ label: '友链', href: '/links/' },
	],
};
