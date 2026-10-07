import { expect, test } from '@playwright/test';
import { visit } from './helpers';

test('problema alterna os resultados uma vez e termina com os três listados', async ({ browser }) => {
  const page = await visit(browser, { reducedMotion: 'no-preference' });
  const list = page.locator('[data-problem-results]');
  await list.scrollIntoViewIfNeeded();
  await expect(list).toHaveAttribute('data-state', 'running');
  await expect(list).toHaveAttribute('data-state', 'done', { timeout: 8000 });
  for (const item of await list.locator('li').all()) await expect(item).toBeVisible();
  await expect(page.locator('.problem__decided')).toContainText('30 minutos');
});

test('problema vira lista com movimento reduzido', async ({ browser }) => {
  const page = await visit(browser, { reducedMotion: 'reduce' });
  const list = page.locator('[data-problem-results]');
  await list.scrollIntoViewIfNeeded();
  await expect(list).not.toHaveClass(/is-cycling/);
  await expect(list.locator('li')).toHaveCount(3);
  for (const item of await list.locator('li').all()) await expect(item).toBeVisible();
});

test('o que é: três ideias e nota de projeto de faculdade', async ({ browser }) => {
  const page = await visit(browser);
  const section = page.locator('#o-que-e');
  await expect(section.locator('.what-is__card h3')).toHaveCount(3);
  await expect(section).toContainText('Projeto de faculdade, open source, com licença MIT.');
});

test('por que assim: oito motivos em três grupos', async ({ browser }) => {
  const page = await visit(browser);
  const section = page.locator('#por-que');
  await expect(section.locator('.why__title')).toHaveText(['Qualidade', 'Controle', 'Portabilidade']);
  await expect(section.locator('.why__list li')).toHaveCount(8);
});
