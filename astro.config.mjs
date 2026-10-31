// @ts-check
import { defineConfig } from 'astro/config';

// Served from the custom domain via GitHub Pages (see public/CNAME).
export default defineConfig({
  site: 'https://oldmamain.co.uk',
  base: '/',
  trailingSlash: 'ignore',
});
