// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/lib/external-links.mjs';
import { internalLinks } from './src/lib/internal-links.mjs';

const site = 'https://yxlog.com';

// https://astro.build/config
export default defineConfig({
	site,
	// 站内链接统一带尾部斜杠，与 canonical、sitemap 保持一致。
	trailingSlash: 'always',
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: satteri({
			hastPlugins: [internalLinks(), externalLinks({ origin: site })],
		}),
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
