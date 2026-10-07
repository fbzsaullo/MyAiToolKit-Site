// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// URL provisória enquanto não há domínio próprio (ver proposta de arquitetura, seção 10).
export default defineConfig({
  site: 'https://myaitoolkit.netlify.app',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [preact()],
});
