import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';

async function openLoop(browser: import('@playwright/test').Browser, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') {
  const page = await visit(browser, { reducedMotion });
  const pipeline = page.locator('[data-pipeline]');
  await pipeline.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(pipeline).toHaveAttribute('data-hydrated', 'true');
  return { page, pipeline };
}

test('CA-11: laço execução e review', async ({ browser }) => {
  const { page, pipeline } = await openLoop(browser);
  await pipeline.getByRole('tab', { name: 'Recuperação de senha' }).click();
  const loop = pipeline.locator('[data-demand="recuperacao-de-senha"] [data-loop]');
  await loop.evaluate((el) => el.scrollIntoView({ block: 'center' }));

  // As tarefas aparecem como quadrados e o laço começa pela primeira.
  const tasks = loop.locator('.loop__task');
  await expect(tasks).toHaveCount(5);
  await expect(loop).toHaveAttribute('data-state', 'running');
  await expect(loop.locator('[data-loop-toggle]')).toBeVisible();

  // Cada tarefa passa por execução e review; a T-03 recebe o R-01 e volta uma vez.
  const t03 = loop.locator('[data-task="T-03"]');
  await expect(t03).toHaveAttribute('data-stage', 'finding', { timeout: 10_000 });
  await expect(t03.locator('[data-finding]')).toContainText('R-01 (REVIEW-T-03-2026-09-18)');
  await expect(t03).toHaveAttribute('data-stage', 'exec');

  // Pausar congela o passo atual; continuar retoma.
  await loop.locator('[data-loop-toggle]').click();
  await expect(loop).toHaveAttribute('data-state', 'paused');
  await expect(loop.locator('[data-loop-toggle]')).toHaveAttribute('aria-label', 'Continuar animação');
  const frozen = await t03.getAttribute('data-stage');
  await page.waitForTimeout(1500);
  await expect(t03).toHaveAttribute('data-stage', frozen!);
  await loop.locator('[data-loop-toggle]').click();

  // No fim, todas fecham com ■ e a T-03 guarda o registro da volta.
  await expect(loop).toHaveAttribute('data-state', 'done', { timeout: 15_000 });
  for (const task of await tasks.all()) await expect(task).toHaveAttribute('data-stage', 'done');
  await expect(t03).toHaveAttribute('data-returned', 'true');
  await expect(loop.locator('[data-returned="true"]')).toHaveCount(1);
  await expect(loop.locator('.loop__task[data-stage="done"] .loop__box').first()).toHaveCSS('background-color', 'rgb(0, 0, 0)');

  // Repetir recomeça do início.
  await loop.locator('[data-loop-replay]').click();
  await expect(loop).toHaveAttribute('data-state', 'running');
  await expect(loop.locator('[data-task="T-05"]')).toHaveAttribute('data-stage', 'pending');

  expect(await axeViolations(page)).toEqual([]);
});

test('laço sem JavaScript mostra o estado final das duas demandas', async ({ browser }) => {
  const page = await visit(browser, { javaScriptEnabled: false });
  const loops = page.locator('[data-loop]');
  await expect(loops).toHaveCount(2);
  for (const loop of await loops.all()) {
    await expect(loop.locator('.motion-controls')).toBeHidden();
    for (const task of await loop.locator('.loop__task').all()) await expect(task).toHaveAttribute('data-stage', 'done');
    await expect(loop.locator('[data-returned="true"]')).toHaveCount(1);
  }
  // O resumo para leitores de tela traz o apontamento e a severidade.
  await expect(page.locator('[data-demand="recuperacao-de-senha"] [data-loop] .visually-hidden')).toContainText('voltou 1× por R-01 (REVIEW-T-03-2026-09-18) (Bloqueante)');
});

test('laço com movimento reduzido não anima', async ({ browser }) => {
  const { pipeline } = await openLoop(browser, 'reduce');
  const loop = pipeline.locator('[data-demand="novo-projeto"] [data-loop]');
  await loop.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect(loop).toHaveAttribute('data-state', 'done');
  await expect(loop.locator('.motion-controls')).toBeHidden();
  for (const task of await loop.locator('.loop__task').all()) await expect(task).toHaveAttribute('data-stage', 'done');
});
