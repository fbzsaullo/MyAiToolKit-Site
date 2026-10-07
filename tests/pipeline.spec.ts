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
