// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/lib/external-links.mjs';

const site = 'https://yxlog.com';

// https://astro.build/config
export default defineConfig({
	site,
	integrations: [mdx(), sitemap(), react()],
	markdown: {
		processor: satteri({ hastPlugins: [externalLinks({ origin: site })] }),
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
