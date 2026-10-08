import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../config/site';

export type Post = CollectionEntry<'blog'>;

export interface TagCount {
	tag: string;
	count: number;
}

export interface SearchItem {
	title: string;
	href: string;
	date: string;
	tags: string[];
}

export interface Pagination<T> {
	items: T[];
	currentPage: number;
	totalPages: number;
	total: number;
}

/**
 * Published posts, newest first. Drafts are hidden in production builds but
 * remain visible during development so they can be previewed.
 */
export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft || !import.meta.env.PROD);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

const CJK_PATTERN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]/g;

export function readingTime(body: string | undefined): number {
	const text = (body ?? '').trim();
	if (!text) return 1;
	// Count CJK characters and Latin words separately, since CJK text has no
	// spaces. Roughly 400 CJK characters or 200 Latin words per minute.
	const cjk = (text.match(CJK_PATTERN) ?? []).length;
	const latin = (text.replace(CJK_PATTERN, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
	return Math.max(1, Math.round(cjk / 400 + latin / 200));
}

export function getAllTags(posts: Post[]): TagCount[] {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function paginate<T>(items: T[], page: number, perPage: number): Pagination<T> {
	const totalPages = Math.max(1, Math.ceil(items.length / perPage));
	const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
	const start = (currentPage - 1) * perPage;
	return {
		items: items.slice(start, start + perPage),
		currentPage,
		totalPages,
		total: items.length,
	};
}

export function postHref(post: Post): string {
	return `/${post.id}/`;
}

export function toSearchItems(posts: Post[]): SearchItem[] {
	return posts.map((post) => ({
		title: post.data.title,
		href: postHref(post),
		date: formatDate(post.data.pubDate),
		tags: post.data.tags,
	}));
}

export function postsPerPage(): number {
	return siteConfig.postsPerPage;
}
