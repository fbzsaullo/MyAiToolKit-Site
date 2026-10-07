import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';

const BLOCKS = ['Skills', 'Templates', 'Stacks', 'Adapters', 'Claude Code', 'Codex', 'Outras IAs', 'AGENTS.md', 'CLAUDE.md', 'docs/sdd/config.yml', 'docs/sdd/'];

test('CA-17: diagrama sem JavaScript', async ({ browser }) => {
  const page = await visit(browser, { javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const arch = page.locator('[data-arch]');

  // Diagrama completo em SVG, com texto real (elementos <text>, não imagem).
  const svg = arch.locator('svg[data-arch-svg]');
  await expect(svg).toBeVisible();
  await expect(svg.locator('title')).toHaveText('Diagrama da arquitetura do MyAiToolKit');
  const titles = await svg.locator('.arch__title').allTextContents();
  expect(titles).toEqual(BLOCKS);
  await expect(svg.locator('.arch__col')).toContainText(['Kit my-ai-toolkit', 'IAs de programação', 'Projeto do usuário', 'Fluxo das fases']);
  // Ligações rotuladas com usam, instalam, leem e geram.
  const tags = new Set(await svg.locator('.arch__edge-tag').allTextContents());
  for (const label of ['usam', 'instalam', 'leem', 'geram']) expect(tags.has(label)).toBe(true);
  // AGENTS.md invertido.
  await expect(svg.locator('[data-block="agents"] .arch__box')).toHaveCSS('fill', 'rgb(0, 0, 0)');

  // Lista equivalente para leitores de tela: os mesmos blocos, com explicação, arquivos e comando.
  const list = arch.locator('[data-arch-list]');
  await expect(list.locator('[data-item]')).toHaveCount(11);
  const listTitles = await list.locator('.arch__item-title strong').allTextContents();
  expect(listTitles).toEqual(BLOCKS);
  await expect(list.locator('[data-item="skills"]')).toContainText('skills/sdd-prd/SKILL.md');
  await expect(list.locator('[data-item="claude"]')).toContainText('claude plugin install my-ai-toolkit@my-ai-toolkit');
  // Presente na árvore de acessibilidade (escondida só visualmente no desktop).
  const snapshot = await list.ariaSnapshot();
  expect(snapshot).toContain('Kit my-ai-toolkit');
});

test('arquitetura no celular vira acordeão', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 375, height: 800 } });
  const arch = page.locator('[data-arch]');
  await expect(arch.locator('svg[data-arch-svg]')).toBeHidden();
  const groups = arch.locator('details.arch__group');
  await expect(groups).toHaveCount(4);
  await expect(groups.locator('summary')).toHaveText(['Kit my-ai-toolkit', 'IAs de programação', 'Projeto do usuário', 'Fluxo das fases']);
  // Kit aberto; os outros abrem pelo toque.
  await expect(groups.nth(0)).toHaveAttribute('open', '');
  await expect(arch.locator('[data-item="claude"]')).toBeHidden();
  await groups.nth(1).locator('summary').click();
  await expect(arch.locator('[data-item="claude"]')).toBeVisible();
  // Fases em lista vertical.
  await groups.nth(3).locator('summary').click();
  await expect(groups.nth(3).locator('li')).toHaveCount(6);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(await axeViolations(page)).toEqual([]);
});

test('arquitetura em inglês', async ({ browser }) => {
  const page = await visit(browser, { path: '/en/', locale: 'en-US', viewport: { width: 1440, height: 900 } });
  const svg = page.locator('svg[data-arch-svg]');
  await expect(svg.locator('title')).toHaveText('MyAiToolKit architecture diagram');
  await expect(svg.locator('[data-block="others"] .arch__title')).toHaveText('Other AIs');
  // Nomes de arquivo não se traduzem.
  await expect(svg.locator('[data-block="agents"] .arch__title')).toHaveText('AGENTS.md');
});
