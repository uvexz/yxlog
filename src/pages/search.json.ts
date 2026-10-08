import type { APIRoute } from 'astro';
import { getPublishedPosts, toSearchIndex } from '../lib/posts';

/**
 * 站内搜索索引。构建期生成一次，浏览器在首次打开搜索框时才按需拉取，
 * 因此不用把全站文章列表内联进每个页面的 HTML。
 */
export const GET: APIRoute = async () => {
	const posts = await getPublishedPosts();
	return new Response(JSON.stringify(toSearchIndex(posts)), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
