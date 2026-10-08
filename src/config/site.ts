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

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	author: string;
	url: string;
	language: string;
	postsPerPage: number;
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
	social: [
    { label: 'GitHub', href: 'https://github.com/uvexz', icon: 'github' },
    { label: 'im.sb', href: 'https://im.sb', icon: 'planet' },
		{ label: 'RSS', href: '/rss.xml', icon: 'rss' },
	],
	nav: [
		{ label: '首页', href: '/' },
		{ label: '标签', href: '/tags' },
    { label: '关于', href: '/about' },
		{ label: '友链', href: '/links' },
	],
};
