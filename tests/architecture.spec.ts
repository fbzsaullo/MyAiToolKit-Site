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

async function openArch(browser: import('@playwright/test').Browser, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') {
  const page = await visit(browser, { viewport: { width: 1440, height: 900 }, reducedMotion });
  const arch = page.locator('[data-arch]');
  await arch.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(arch).toHaveAttribute('data-hydrated', 'true');
  return { page, arch };
}

test('CA-16: diagrama da arquitetura interativo', async ({ browser }) => {
  const { page, arch } = await openArch(browser);
  const svg = arch.locator('svg[data-arch-svg]');
  const panel = arch.locator('[data-arch-panel]');

  // AGENTS.md aparece invertido mesmo sem seleção.
  await expect(svg.locator('[data-block="agents"] .arch__box')).toHaveCSS('fill', 'rgb(0, 0, 0)');

  // Clique: o bloco fica invertido e só as ligações dele acendem.
  const skills = svg.getByRole('button', { name: /^Skills/ });
  await skills.click();
  await expect(skills).toHaveAttribute('aria-pressed', 'true');
  await expect(skills.locator('.arch__box')).toHaveCSS('fill', 'rgb(0, 0, 0)');
  const linked = await svg.locator('.arch__edge[data-state="linked"]').evaluateAll((els) => els.map((el) => el.getAttribute('data-edge')).sort());
  expect(linked).toEqual(['skills-claude', 'skills-codex', 'skills-stacks', 'skills-templates']);
  await expect(svg.locator('[data-edge="claude-docs"]')).toHaveAttribute('data-state', 'dim');
  await expect(svg.locator('[data-block="docs"]')).toHaveAttribute('data-state', 'dim');

  // Painel: explicação, arquivos e comando do bloco.
  const detail = panel.locator('[data-detail="skills"]');
  await expect(detail.locator('.arch__detail-title')).toHaveText('Skills');
  await expect(detail).toContainText('Cada comando é uma skill');
  await expect(detail.locator('.arch__files')).toContainText('skills/sdd-prd/SKILL.md');
  await expect(detail.locator('.arch__command')).toHaveText('/sdd-prd');

  // Teclado: Tab até o Codex e Enter; Espaço também ativa.
  const codex = svg.getByRole('button', { name: /^Codex/ });
  await codex.focus();
  await page.keyboard.press('Enter');
  await expect(codex).toHaveAttribute('aria-pressed', 'true');
  await expect(skills).toHaveAttribute('aria-pressed', 'false');
  await expect(panel.locator('[data-detail="codex"]')).toContainText('.agents/skills/');
  const agents = svg.getByRole('button', { name: /^AGENTS\.md/ });
  await agents.focus();
  await page.keyboard.press(' ');
  await expect(agents).toHaveAttribute('aria-pressed', 'true');
  await expect(agents.locator('.arch__box')).toHaveCSS('fill', 'rgb(0, 0, 0)');

  // Esc limpa.
  await page.keyboard.press('Escape');
  await expect(arch).not.toHaveAttribute('data-selected', /.+/);
  await expect(panel.locator('.arch__hint')).toBeVisible();
  await expect.poll(() => arch.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await axeViolations(page)).toEqual([]);
});

test('CA-18: ver o fluxo com pausa', async ({ browser }) => {
  const { arch } = await openArch(browser);
  const svg = arch.locator('svg[data-arch-svg]');
  await arch.locator('[data-flow-start]').click();
  await expect(arch).toHaveAttribute('data-flow', 'running');

  // O fluxo de /sdd-prd percorre Skills → Templates → Stacks → IA → docs/sdd/prds/.
  const order: string[] = [];
  for (const block of ['skills', 'templates', 'stacks', 'claude', 'docs']) {
    await expect(svg.locator(`[data-block="${block}"]`)).toHaveAttribute('data-state', 'current', { timeout: 4000 });
    order.push(block);
  }
  expect(order).toEqual(['skills', 'templates', 'stacks', 'claude', 'docs']);
  await expect(arch.locator('[data-arch-panel] .arch__step').last()).toContainText('docs/sdd/prds/');
  await expect(arch).toHaveAttribute('data-flow', 'done');
  await expect(svg.locator('[data-block="templates"] .arch__badge')).toBeVisible();

  // Repetir recomeça; pausar congela o passo; continuar retoma.
  await arch.locator('[data-flow-replay]').click();
  await expect(svg.locator('[data-block="skills"]')).toHaveAttribute('data-state', 'current');
  await arch.locator('[data-flow-toggle]').click();
  await expect(arch).toHaveAttribute('data-flow', 'paused');
  await expect(arch.locator('[data-flow-toggle]')).toHaveAttribute('aria-label', 'Continuar animação');
  const frozen = await svg.locator('[data-state="current"]').getAttribute('data-block');
  await arch.page().waitForTimeout(1800);
  await expect(svg.locator('[data-state="current"]')).toHaveAttribute('data-block', frozen!);
  await arch.locator('[data-flow-toggle]').click();
  await expect(arch).toHaveAttribute('data-flow', 'done', { timeout: 8000 });
});

test('fluxo com movimento reduzido mostra os passos de uma vez', async ({ browser }) => {
  const { arch } = await openArch(browser, 'reduce');
  await arch.locator('[data-flow-start]').click();
  await expect(arch).toHaveAttribute('data-flow', 'done');
  for (const block of ['skills', 'templates', 'stacks', 'claude']) {
    await expect(arch.locator(`[data-block="${block}"]`)).toHaveAttribute('data-state', 'done');
  }
  await expect(arch.locator('[data-block="docs"]')).toHaveAttribute('data-state', 'current');
  await expect(arch.locator('.arch__badge:visible')).toHaveCount(5);
});
