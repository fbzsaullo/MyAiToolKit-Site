import { expect, test } from '@playwright/test';
import { visit } from './helpers';

const SITE = 'https://myaitoolkit.netlify.app';

test('CA-04: navegador em inglês vai para a versão em inglês', async ({ browser }) => {
  const page = await visit(browser, { path: '/', locale: 'en-US' });
  await page.waitForURL('**/en/');
  expect(new URL(page.url()).pathname).toBe('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('CA-05: navegador em português fica na versão em português', async ({ browser }) => {
  const page = await visit(browser, { path: '/', locale: 'pt-BR' });
  await page.waitForLoadState('load');
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('CA-07: as duas versões se declaram uma à outra', async ({ browser }) => {
  for (const [path, lang] of [['/', 'pt-BR'], ['/en/', 'en']] as const) {
    // Idioma do navegador igual ao da página, para não haver redirecionamento.
    const page = await visit(browser, { path, locale: lang === 'en' ? 'en-US' : 'pt-BR' });
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) => links.map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    expect(alternates).toEqual(
      expect.arrayContaining([
        ['pt-BR', `${SITE}/`],
        ['en', `${SITE}/en/`],
        ['x-default', `${SITE}/`],
      ]),
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', lang === 'en' ? `${SITE}/en/` : `${SITE}/`);
    // As duas versões explicam o idioma dos artefatos; a en destaca project.language: en.
    await expect(page.locator('[data-language-note] code')).toHaveText('project.language: en');
  }
  const en = await visit(browser, { path: '/en/', locale: 'en-US' });
  await expect(en.locator('[data-language-note]')).toContainText('Portuguese by default');
});

test('link direto para /en/ não é redirecionado sem escolha salva', async ({ browser }) => {
  const page = await visit(browser, { path: '/en/', locale: 'pt-BR' });
  await page.waitForLoadState('load');
  expect(new URL(page.url()).pathname).toBe('/en/');
});

test('preferência salva vence o idioma do navegador também em /en/', async ({ browser }) => {
  const page = await visit(browser, { path: '/en/', locale: 'en-US', storage: { 'matk-lang': 'pt-BR' } });
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('fonte do título é pré-carregada e usada', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="preload"][as="font"]').getAttribute('href');
  expect(href).toMatch(/geist-600-latin\.[\w-]+\.woff2$/);
});
