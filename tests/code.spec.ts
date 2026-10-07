import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

test('realce monocromático: nenhuma cor literal no código gerado', () => {
  const offenders: string[] = [];
  for (const file of htmlFiles('dist')) {
    const html = readFileSync(file, 'utf8');
    for (const [pre] of html.matchAll(/<pre[\s\S]*?<\/pre>/g)) {
      const colors = pre.match(/#[0-9a-fA-F]{3,8}\b|rgb\(/g);
      if (colors) offenders.push(`${file}: ${colors.join(', ')}`);
    }
  }
  expect(offenders).toEqual([]);
});

test('comandos do kit sublinhados e linha destacada', async ({ page }) => {
  await page.goto('/');
  const block = page.locator('[data-code-block]').first();
  await expect(block.locator('.tk-cmd', { hasText: '/sdd-start' })).toHaveCount(1);
  await expect(block.locator('.line.is-highlighted')).toHaveCount(1);
  const decoration = await block.locator('.tk-cmd').first().evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(decoration).toContain('underline');
});
