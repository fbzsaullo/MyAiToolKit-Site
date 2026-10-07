import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test('fontes servidas localmente em woff2', async ({ page, baseURL }) => {
  const fonts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fonts.push(request.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(fonts.length).toBeGreaterThan(0);
  for (const url of fonts) {
    expect(url.startsWith(baseURL!), url).toBe(true);
    expect(url.endsWith('.woff2'), url).toBe(true);
  }
  // Português fica todo no subconjunto latin: o latin-ext não precisa ser baixado.
  expect(fonts.some((url) => url.includes('latin-ext'))).toBe(false);

  const families = await page.evaluate(() => [...document.fonts].map((f) => `${f.family} ${f.weight}`));
  expect(families).toEqual(expect.arrayContaining(['Geist 600', 'Geist 400', 'Geist Mono 400']));
});

test('nenhuma cor fora dos tokens', () => {
  const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|lab)\(/g;
  const offenders: string[] = [];
  for (const file of files('src')) {
    if (!/\.(css|astro|tsx?|jsx?)$/.test(file)) continue;
    if (file.endsWith(join('styles', 'tokens.css'))) continue;
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(colorLiteral)) offenders.push(`${file}: ${match[0]}`);
  }
  expect(offenders).toEqual([]);
});
