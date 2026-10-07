import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';
// @ts-expect-error — módulo .mjs sem tipos
import { inlineScripts, sha256 } from '../scripts/csp-hash.mjs';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

const headersFile = () => readFileSync('dist/_headers', 'utf8');
const csp = () => headersFile().match(/Content-Security-Policy: (.+)/)![1];

test('CSP contém o hash do script inline', () => {
  const policy = csp();
  const scriptSrc = policy.split('; ').find((d) => d.startsWith('script-src'))!;
  expect(scriptSrc).not.toContain("'unsafe-inline'");
  // Todo script inline de toda página gerada — o boot de idioma e tema incluído — tem o hash na CSP.
  const boot = readFileSync('src/scripts/boot.inline.js', 'utf8');
  let count = 0;
  for (const file of htmlFiles('dist')) {
    for (const code of inlineScripts(readFileSync(file, 'utf8')) as string[]) {
      expect(scriptSrc, `${file}: script inline sem hash`).toContain(sha256(code));
      count++;
    }
  }
  expect(count).toBeGreaterThan(0);
  expect(inlineScripts(readFileSync('dist/index.html', 'utf8'))[0].trim()).toBe(boot.trim());
  // Nenhum terceiro: só 'self' (e data: para imagens).
  expect(policy).not.toMatch(/https?:/);
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"]) {
    expect(policy).toContain(directive);
  }
});

test('cabeçalhos de cache e segurança da Netlify', () => {
  const toml = readFileSync('netlify.toml', 'utf8');
  expect(toml).toMatch(/for = "\/_astro\/\*"\s+\[headers\.values\]\s+Cache-Control = "public, max-age=31536000, immutable"/);
  expect(toml).toContain('X-Content-Type-Options = "nosniff"');
  expect(toml).toContain('Referrer-Policy = "strict-origin-when-cross-origin"');
  expect(toml).toContain('Permissions-Policy');
  expect(toml).toMatch(/publish = "dist"/);
  expect(toml).toMatch(/NODE_VERSION = "24"/);
  // Só um Cache-Control por rota: o HTML fica com o padrão da Netlify.
  expect(toml.match(/Cache-Control = /g)).toHaveLength(1);
});

test('o site funciona sob a CSP gerada, sem violações', async ({ browser }) => {
  const policy = csp();
  const context = await browser.newContext({ baseURL: 'http://localhost:4321', locale: 'pt-BR' });
  await context.addInitScript(() => {
    const w = window as unknown as { __violations: string[] };
    w.__violations = [];
    document.addEventListener('securitypolicyviolation', (e) => w.__violations.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  // O preview do Astro não lê dist/_headers: o teste aplica a CSP em cada documento.
  await context.route('**/*', async (route) => {
    const response = await route.fetch();
    const isDocument = route.request().resourceType() === 'document';
    await route.fulfill({ response, headers: isDocument ? { ...response.headers(), 'content-security-policy': policy } : response.headers() });
  });
  for (const path of ['/', '/en/']) {
    const page = await context.newPage();
    await page.goto(path);
    for (const selector of ['[data-pipeline]', '[data-trace]', '[data-arch]']) {
      await page.locator(selector).evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await expect(page.locator(selector)).toHaveAttribute('data-hydrated', 'true');
    }
    await expect(page.locator('html')).toHaveClass(/\bjs\b/);
    expect(await page.evaluate(() => (window as unknown as { __violations: string[] }).__violations)).toEqual([]);
  }
  await context.close();
});

test('páginas 404 nos dois idiomas', async ({ browser }) => {
  for (const [path, locale, title, back, home] of [
    ['/404.html', 'pt-BR', 'Esta página não existe', 'Voltar para o início', '/'],
    ['/en/404/', 'en-US', 'This page does not exist', 'Back to the start', '/en/'],
  ] as const) {
    const page = await visit(browser, { path, locale });
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('link', { name: back })).toHaveAttribute('href', home);
    // As âncoras do cabeçalho levam de volta à página inicial.
    await expect(page.locator('.site-header__links a[data-nav="instalar"]')).toHaveAttribute('href', `${home}#instalar`);
    expect(await axeViolations(page)).toEqual([]);
  }
});
