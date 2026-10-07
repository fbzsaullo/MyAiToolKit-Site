// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// URL provisória enquanto não há domínio próprio (ver proposta de arquitetura, seção 10).
export default defineConfig({
  site: 'https://myaitoolkit.netlify.app',
  output: 'static',
  // Uma forma única de URL (/en/) para canonical e hreflang (R-01 do REVIEW-T-01).
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    locales: ['pt-BR', 'en'],
    defaultLocale: 'pt-BR',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [preact()],
});
