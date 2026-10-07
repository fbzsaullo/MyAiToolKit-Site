import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { visit } from './helpers';

test('logo troca com o tema', async ({ browser }) => {
  const light = await visit(browser, { colorScheme: 'light' });
  await expect(light.locator('.logo__light').first()).toBeVisible();
  await expect(light.locator('.logo__dark').first()).toBeHidden();

  const dark = await visit(browser, { colorScheme: 'dark' });
  await expect(dark.locator('.logo__dark').first()).toBeVisible();
  await expect(dark.locator('.logo__light').first()).toBeHidden();

  // Escolha manual vence o sistema.
  const forced = await visit(browser, { colorScheme: 'dark', storage: { 'matk-theme': 'light' } });
  await expect(forced.locator('.logo__light').first()).toBeVisible();
});

test('logo servido idêntico aos arquivos de brand/', async ({ page, request }) => {
  await page.goto('/');
  for (const [selector, file] of [
    ['.logo__light', 'brand/myaitoolkit-wordmark-black.svg'],
    ['.logo__dark', 'brand/myaitoolkit-wordmark-white.svg'],
  ]) {
    const src = await page.locator(selector).first().getAttribute('src');
    const served = await (await request.get(src!)).body();
    expect(served.equals(readFileSync(file)), file).toBe(true);
  }
});
