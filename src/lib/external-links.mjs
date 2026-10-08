import { defineHastPlugin } from 'satteri';

const ABSOLUTE_URL = /^(https?:)?\/\//i;

export function externalLinks({ origin = 'https://example.com' } = {}) {
	const siteHost = new URL(origin).hostname;

	return defineHastPlugin({
		name: 'external-links',
		element: {
			filter: ['a'],
			visit(node, ctx) {
				const href = node.properties?.href;
				if (typeof href !== 'string' || !ABSOLUTE_URL.test(href)) return;

				let host;
				try {
					host = new URL(href, origin).hostname;
				} catch {
					return;
				}
				if (host === siteHost || host === `www.${siteHost}`) return;

				ctx.setProperty(node, 'target', '_blank');
				ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
			},
		},
	});
}
