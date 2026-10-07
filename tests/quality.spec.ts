import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { axeViolations, visit } from './helpers';

// Percorre a página de cima a baixo, parando em cada seção (dispara as animações de entrada).
async function scrollThrough(page: Page) {
  const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((el) => el.id));
  for (const id of ids) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(150);
  }
  return ids;
}

const runningAnimations = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running' && Number(a.effect?.getComputedTiming().duration) > 1)
      .map((a) => (a.effect as KeyframeEffect | null)?.target?.className?.toString() ?? '?'),
  );

test('CA-03: movimento reduzido mostra tudo pronto', async ({ browser }) => {
  const page = await visit(browser, { reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const moving: string[] = [];
  const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((el) => el.id));
  for (const id of ids) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(150);
    moving.push(...(await runningAnimations(page)));
  }
  // Nenhum elemento se move (RN-08).
  expect(moving).toEqual([]);

  // Terminal completo, sem controles de animação.
  const terminal = page.locator('.hero__terminal');
  for (const line of await terminal.locator('.terminal__line').all()) await expect(line).toBeVisible();
  await expect(terminal.locator('.terminal__line').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-motion-controls]').first()).toBeHidden();

  // Árvore completa.
  for (const item of await page.locator('#o-que-e .file-tree__item').all()) await expect(item).toHaveCSS('opacity', '1');

  // Pipeline em lista, com todos os documentos visíveis.
  const panel = page.locator('[data-demand][data-active]');
  await expect(panel.locator('.phase[data-pending="true"]')).toHaveCount(0);
  for (const doc of await panel.locator('.phase__doc').all()) await expect(doc).toBeVisible();
  for (const line of await panel.locator('.phase__doc-line').all()) await expect(line).toHaveCSS('opacity', '1');
  await expect(panel.locator('[data-loop]')).toHaveAttribute('data-state', 'done');

  // Diagrama completo, sem nada esmaecido; Stacks e IAs já acesas.
  const svg = page.locator('svg[data-arch-svg]');
  await expect(svg.locator('.arch__block')).toHaveCount(11);
  await expect(svg.locator('[data-state="dim"]')).toHaveCount(0);
  await expect(page.locator('[data-hub]')).not.toHaveAttribute('data-state', 'pending');
});

test('CA-21: uso no celular', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 375, height: 812 } });
  await scrollThrough(page);

  // Sem rolagem horizontal (RN-12).
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  // Alvos de toque com pelo menos 44 × 44 px (links dentro de texto corrido ficam fora, como na WCAG 2.5.8).
  const small = await page.evaluate(() => {
    const targets = document.querySelectorAll<HTMLElement>('button, summary, [role="tab"], [role="button"], .site-header a, .site-footer a, .hero a, .not-found a');
    return [...targets]
      .filter((el) => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden')
      .map((el) => ({ el: `${el.tagName.toLowerCase()}.${el.className}`, ...el.getBoundingClientRect().toJSON() }))
      .filter((r) => r.width > 0 && (r.width < 44 || r.height < 44))
      .map((r) => `${r.el} ${Math.round(r.width)}×${Math.round(r.height)}`);
  });
  expect(small).toEqual([]);

  // Menu de seções recolhido.
  await expect(page.locator('details[data-menu]')).not.toHaveAttribute('open', '');
  await expect(page.locator('.site-header__links')).toBeHidden();

  // Pipeline em trilha vertical, sem rolagem presa (nada sticky).
  await expect(page.locator('[data-demand][data-active] .pipeline__track')).toBeHidden();
  const sticky = await page.locator('[data-pipeline] *').evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetParent !== null && getComputedStyle(el).position === 'sticky').length);
  expect(sticky).toBe(0);

  // Arquitetura em acordeão Kit, IAs e Projeto.
  await expect(page.locator('svg[data-arch-svg]')).toBeHidden();
  await expect(page.locator('details.arch__group summary')).toHaveText(['Kit my-ai-toolkit', 'IAs de programação', 'Projeto do usuário', 'Fluxo das fases']);
});

for (const [path, locale] of [['/', 'pt-BR'], ['/en/', 'en-US']] as const) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`CA-22: acessibilidade sem violações — ${path} ${colorScheme}`, async ({ browser }) => {
      const page = await visit(browser, { path, locale, colorScheme });
      // "Pular para o conteúdo" é o primeiro item focável.
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/skip-link/);
      await scrollThrough(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await axeViolations(page)).toEqual([]);
    });
  }
}

test('CA-23: nada de terceiros nem cookies', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://localhost:4321', locale: 'pt-BR', viewport: { width: 1440, height: 900 } });
  const origins = new Set<string>();
  context.on('request', (request) => origins.add(new URL(request.url()).origin));
  const page = await context.newPage();
  for (const path of ['/', '/en/']) {
    await page.goto(path);
    await scrollThrough(page);
    // Interage: troca de tema, abas, seletor do pipeline, diagrama e cópia.
    await page.locator('[data-theme-toggle]').first().click();
    await page.locator('#instalar [role="tab"]').nth(1).click();
    await page.locator('[data-pipeline] [role="tab"]').nth(1).click();
    await page.locator('[data-block="skills"]').click();
    await page.locator('#instalar-painel-codex [data-copy]').first().click().catch(() => undefined);
    await page.waitForLoadState('networkidle');
  }
  // Nenhuma requisição sai para outro domínio (RN-09).
  expect([...origins]).toEqual(['http://localhost:4321']);
  // Nenhum cookie.
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe('');
  // Nenhum número de estrelas, downloads ou contribuidores.
  for (const path of ['/', '/en/']) {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\d[\d.,k]*\s*(stars?|estrelas?|downloads?|contribuidor(es)?|contributors?|forks?)\b/i);
    await expect(page.locator('img[src*="shields.io"], img[src*="badge"]')).toHaveCount(0);
  }
  await context.close();
});

test('CA-24: orçamento de desempenho', async ({ browser }) => {
  // JS do carregamento inicial < 50 KB comprimido (RN-11), medido sobre dist/.
  const report = execFileSync(process.execPath, ['scripts/check-budget.mjs'], { encoding: 'utf8' });
  expect(report).toContain('dentro do orçamento');
  for (const [, kb] of report.matchAll(/inicial ([\d.]+) KB/g)) expect(Number(kb)).toBeLessThan(50);

  // Sem deslocamento de layout perceptível ao carregar.
  for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
    const page = await visit(browser, { viewport });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(total), 200);
        }),
    );
    expect(cls).toBeLessThan(0.05);
  }
});

test('CA-26: links e âncoras íntegros', async ({ browser }) => {
  // Todas as âncoras internas e links do site construído existem (linkinator, sem rede).
  const report = execFileSync(process.execPath, ['scripts/check-links.mjs'], { encoding: 'utf8' });
  expect(report).toContain('externos dentro da lista permitida');

  // Os links do GitHub apontam para os repositórios do projeto.
  const page = await visit(browser);
  const github = await page.locator('a[href*="github.com"]').evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
  expect(github.length).toBeGreaterThan(0);
  for (const href of github) expect(href).toMatch(/^https:\/\/github\.com\/fbzsaullo\/MyAiToolKit(-Site)?(\/|$)/);
  expect(github).toContain('https://github.com/fbzsaullo/MyAiToolKit');
});

test('seção ativa marcada no cabeçalho', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 1440, height: 900 } });
  const nav = page.locator('.site-header__links');
  for (const id of ['pipeline', 'comandos', 'instalar']) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect(nav.locator(`[data-nav="${id}"]`)).toHaveAttribute('aria-current', 'true');
    await expect(nav.locator('[aria-current="true"]')).toHaveCount(1);
  }
});
