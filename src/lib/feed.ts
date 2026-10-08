import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '../config/site';
import { getPublishedPosts, postHref } from './posts';

export async function buildFeed(context: APIContext) {
	const posts = await getPublishedPosts();
	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: context.site ?? siteConfig.url,
		customData: `<language>${siteConfig.language}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postHref(post),
			categories: post.data.tags,
		})),
	});
}
