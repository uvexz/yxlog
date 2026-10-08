import type { Post } from './posts';

/**
 * 把标签名转成 URL 安全的 slug：
 * - 转小写，空白与 URL 保留字符统一折叠成连字符
 * - 保留 Unicode 字母/数字，中日韩标签仍然保持可读
 * - 纯符号标签（例如 emoji）退化成稳定的短哈希，避免生成空 slug
 */
export function tagSlug(tag: string): string {
	const slug = tag
		.normalize('NFC')
		.trim()
		.toLowerCase()
		.replace(/[\s/\\?#%&+]+/g, '-')
		.replace(/[^\p{L}\p{N}-]+/gu, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-+|-+$/g, '');

	if (slug) return slug;

	let hash = 5381;
	for (const char of tag) hash = ((hash << 5) + hash + char.codePointAt(0)!) >>> 0;
	return `t-${hash.toString(36)}`;
}

/** 标签页链接统一走这里，保证 HTML、canonical 与 sitemap 使用同一套编码。 */
export function tagHref(tag: string): string {
	return `/tags/${encodeURIComponent(tagSlug(tag))}/`;
}

export interface TagPage {
	/** 原始标签名，用于展示。 */
	tag: string;
	slug: string;
	posts: Post[];
}

/**
 * 按标签聚合文章。slug 必须唯一，否则两个标签会写到同一个路由上并被静默覆盖，
 * 这里直接抛错让构建失败，问题在构建日志里就看得见。
 */
export function buildTagPages(posts: Post[]): TagPage[] {
	const pages = new Map<string, TagPage>();

	for (const post of posts) {
		for (const tag of post.data.tags) {
			const slug = tagSlug(tag);
			const existing = pages.get(slug);

			if (!existing) {
				pages.set(slug, { tag, slug, posts: [post] });
				continue;
			}

			if (existing.tag !== tag) {
				throw new Error(
					`标签 slug 冲突：「${existing.tag}」与「${tag}」都会生成 /tags/${slug}/，请修改其中一个标签。`
				);
			}

			if (!existing.posts.includes(post)) existing.posts.push(post);
		}
	}

	return [...pages.values()].sort(
		(a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag)
	);
}
