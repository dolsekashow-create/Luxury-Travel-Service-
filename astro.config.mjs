import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.luxurytravelandvacation.online',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  build: { inlineStylesheets: 'auto' },
});
