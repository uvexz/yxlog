import { defineHastPlugin } from 'satteri';

/** 以单个 `/` 开头的站内链接（排除 `//example.com` 这类协议相对地址）。 */
const INTERNAL_LINK = /^\/(?!\/)/;

/** 带扩展名的路径视为文件（`/rss.xml`、`/favicon.svg`），不加尾斜杠。 */
const HAS_EXTENSION = /\.[a-zA-Z0-9]+$/;

/**
 * 给正文里的站内链接补上尾部斜杠，对齐 `trailingSlash: 'always'`。
 * 不这样做的话，Markdown 里手写的 `/some-post` 会在静态托管上多一次 301 跳转。
 */
function withTrailingSlash(href) {
	const match = /^([^?#]*)([?#].*)?$/.exec(href);
	if (!match) return href;

	const [, pathname, suffix = ''] = match;
	if (!pathname || pathname.endsWith('/') || HAS_EXTENSION.test(pathname)) return href;

	return `${pathname}/${suffix}`;
}

export function internalLinks() {
	return defineHastPlugin({
		name: 'internal-links',
		element: {
			filter: ['a'],
			visit(node, ctx) {
				const href = node.properties?.href;
				if (typeof href !== 'string' || !INTERNAL_LINK.test(href)) return;

				const normalized = withTrailingSlash(href);
				if (normalized !== href) ctx.setProperty(node, 'href', normalized);
			},
		},
	});
}
