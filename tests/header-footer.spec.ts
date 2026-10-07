import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { visit } from './helpers';

const kit = JSON.parse(readFileSync('src/data/kit.json', 'utf8'));

test('CA-06: escolha manual de idioma vence a detecção', async ({ browser }) => {
  // Navegador em inglês: a detecção leva para /en/.
  const page = await visit(browser, { path: '/', locale: 'en-US' });
  await page.waitForURL('**/en/');

  // O visitante escolhe Português no cabeçalho (no celular, a troca também fica visível).
  await page.locator('.site-header [data-lang="pt-BR"]').click();
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

  // Ao voltar a abrir "/", continua em português.
  await page.goto('/');
  await page.waitForLoadState('load');
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('CA-08: tema segue o sistema e a escolha manual é lembrada', async ({ browser }) => {
  const page = await visit(browser, { colorScheme: 'dark' });
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await background()).toBe('rgb(10, 10, 10)');
  await expect(page.locator('.site-header .logo__dark')).toBeVisible();

  // system → light
  await page.locator('.site-header [data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  // Na recarga, o tema claro já está aplicado antes do <body> (sem mostrar o escuro antes).
  const themeAtParse = page.waitForEvent('domcontentloaded').then(() => null);
  await page.reload();
  await themeAtParse;
  const early = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(early).toBe('light');
  expect(await background()).toBe('rgb(255, 255, 255)');
  await expect(page.locator('.site-header .logo__light')).toBeVisible();
});

test('troca de tema cicla sistema → claro → escuro → sistema', async ({ browser }) => {
  const page = await visit(browser, { locale: 'pt-BR' });
  const toggle = page.locator('.site-header [data-theme-toggle]');
  await expect(toggle).toHaveAttribute('aria-label', /sistema/);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', /claro/);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', /escuro/);
  await toggle.click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});

test('rodapé mostra a versão do snapshot e os links', async ({ browser }) => {
  const page = await visit(browser, { locale: 'pt-BR' });
  await expect(page.locator('[data-kit-version]')).toContainText(kit.version);
  const footer = page.locator('.site-footer');
  await expect(footer.locator('a[href="https://github.com/fbzsaullo/MyAiToolKit"]')).toHaveCount(1);
  await expect(footer.locator('a[href$="/blob/main/LICENSE"]')).toHaveCount(1);
  await expect(footer.locator('a[href="https://github.com/fbzsaullo/MyAiToolKit-Site/tree/main/docs/sdd"]')).toHaveCount(1);
});

test('menu de seções no celular abre e fecha com Esc', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 375, height: 800 } });
  const menu = page.locator('[data-menu]');
  await expect(page.locator('.site-header__nav')).toBeHidden();
  await menu.locator('summary').click();
  await expect(menu.locator('.site-header__panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu.locator('.site-header__panel')).toBeHidden();
});
