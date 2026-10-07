import { expect, test } from '@playwright/test';
import { visit } from './helpers';

test('pipeline completo sem JavaScript', async ({ browser }) => {
  const page = await visit(browser, { javaScriptEnabled: false });
  const pipeline = page.locator('[data-pipeline]');

  // O seletor some e as duas demandas aparecem completas, em sequência.
  await expect(pipeline.locator('[role="tablist"]')).toBeHidden();
  const demands = pipeline.locator('[data-demand]');
  await expect(demands).toHaveCount(2);
  for (const demand of await demands.all()) {
    await expect(demand).toBeVisible();
    await expect(demand.locator('.phase')).toHaveCount(6);
  }

  const novo = pipeline.locator('[data-demand="novo-projeto"]');
  await expect(novo.locator('.phase[data-phase="1"] .phase__id .id-tag').first()).toHaveText('ADR-001');
  await expect(novo.locator('.phase[data-phase="3"]')).toContainText('opcional');

  const recuperacao = pipeline.locator('[data-demand="recuperacao-de-senha"]');
  await expect(recuperacao.locator('.phase[data-phase="1"]')).toContainText('não usada nesta demanda');
  await expect(recuperacao.locator('.phase[data-phase="2"]')).toContainText('docs/sdd/prds/PRD-007-recuperacao-de-senha.md');
  await expect(recuperacao.locator('.phase[data-phase="2"] .phase__tag--entry')).toContainText('/sdd-start B');
});

test('com JavaScript, uma demanda por vez desde a primeira pintura', async ({ browser }) => {
  const page = await visit(browser);
  const pipeline = page.locator('[data-pipeline]');
  await expect(pipeline.locator('[role="tablist"]')).toBeVisible();
  await expect(pipeline.locator('[data-demand="novo-projeto"]')).toBeVisible();
  await expect(pipeline.locator('[data-demand="recuperacao-de-senha"]')).toBeHidden();
});

async function openPipeline(browser: import('@playwright/test').Browser, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') {
  const page = await visit(browser, { reducedMotion });
  const pipeline = page.locator('[data-pipeline]');
  await pipeline.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(pipeline).toHaveAttribute('data-hydrated', 'true');
  return { page, pipeline };
}

test('CA-09: pipeline com a demanda de sistema novo', async ({ browser }) => {
  const { pipeline } = await openPipeline(browser);
  await pipeline.getByRole('tab', { name: 'Novo projeto' }).click();
  const panel = pipeline.locator('[data-demand="novo-projeto"]');
  await expect(panel).toBeVisible();
  // A trilha começa pela fase 1 (Arquitetura).
  await expect(panel.locator('.pipeline__node[data-active="true"]')).toHaveAttribute('data-node', '1');
  await expect(panel.locator('.phase[data-phase="1"] .phase__tag--entry')).toBeVisible();
  // Cada fase mostra comando, entrada, documento gerado e IDs criados.
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const phase = panel.locator(`.phase[data-phase="${n}"]`);
    await expect(phase.locator('.chip')).toHaveText(/^\/sdd-/);
    await expect(phase.locator('.phase__facts dd').nth(1)).not.toBeEmpty();
    await expect(phase.locator('.phase__doc-path code')).toContainText(/\.(md|rb)$/);
    expect(await phase.locator('.phase__id').count()).toBeGreaterThan(0);
  }
  // A fase 3 aparece marcada como opcional.
  await expect(panel.locator('.phase[data-phase="3"] .phase__tag').first()).toContainText('opcional');
});

test('CA-10: pipeline com a demanda de funcionalidade existente', async ({ browser }) => {
  const { pipeline } = await openPipeline(browser);
  await pipeline.getByRole('tab', { name: 'Recuperação de senha' }).click();
  const panel = pipeline.locator('[data-demand="recuperacao-de-senha"]');
  await expect(panel).toBeVisible();
  await expect(pipeline.locator('[data-demand="novo-projeto"]')).toBeHidden();
  // Começa pela fase 2; a fase 1 aparece como não usada.
  await expect(panel.locator('.phase[data-phase="1"]')).toContainText('não usada nesta demanda');
  await expect(panel.locator('.phase[data-phase="1"]')).toHaveAttribute('data-used', 'false');
  // A fase ativa é um bloco invertido com quadrado preenchido (ícone sobre fundo ink).
  const active = panel.locator('.pipeline__node[data-active="true"], .phase[data-active="true"]');
  await expect(active.first()).toBeAttached();
  const isDesktop = await panel.locator('.pipeline__track').isVisible();
  const box = isDesktop
    ? panel.locator('.pipeline__node[data-active="true"] .pipeline__node-box')
    : panel.locator('.phase[data-active="true"] .phase__node');
  await expect(box).toBeVisible();
  const [bg, fg] = await box.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  expect(bg).toBe('rgb(0, 0, 0)');
  expect(fg).toBe('rgb(255, 255, 255)');
  await expect(panel.locator('.pipeline__node[data-active="true"]')).toHaveAttribute('data-node', '2');
  await expect(panel.locator('.pipeline__node[data-node="1"]')).not.toHaveAttribute('data-active', 'true');
});

test('abas do pipeline pelo teclado', async ({ browser }) => {
  const { page, pipeline } = await openPipeline(browser);
  await pipeline.getByRole('tab', { name: 'Novo projeto' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(pipeline.getByRole('tab', { name: 'Recuperação de senha' })).toBeFocused();
  await expect(pipeline.getByRole('tab', { name: 'Recuperação de senha' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(pipeline.getByRole('tab', { name: 'Novo projeto' })).toHaveAttribute('aria-selected', 'true');
});

test('fase ativa acompanha a rolagem e o documento se escreve', async ({ browser }) => {
  const { page, pipeline } = await openPipeline(browser);
  const panel = pipeline.locator('[data-demand="novo-projeto"]');
  const phase5 = panel.locator('.phase[data-phase="5"]');
  await phase5.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect(phase5).toHaveAttribute('data-active', 'true');
  await expect(phase5).toHaveAttribute('data-written', 'true');
  await expect(phase5.locator('.phase__doc-line').last()).toHaveCSS('opacity', '1', { timeout: 3000 });
});

test('hidratação do pipeline sem salto de layout', async ({ browser }) => {
  const page = await visit(browser);
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.locator('[data-pipeline]').evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(page.locator('[data-pipeline]')).toHaveAttribute('data-hydrated', 'true');
  await page.waitForTimeout(500);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.02);
});

test('pipeline com movimento reduzido mostra tudo pronto', async ({ browser }) => {
  const { pipeline } = await openPipeline(browser, 'reduce');
  const panel = pipeline.locator('[data-demand="novo-projeto"]');
  await expect(panel.locator('.phase[data-pending="true"]')).toHaveCount(0);
  for (const line of await panel.locator('.phase__doc-line').all()) await expect(line).toHaveCSS('opacity', '1');
});
