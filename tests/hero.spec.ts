import { expect, test } from '@playwright/test';
import { visit } from './helpers';

test('CA-01: hero apresenta o kit e leva à instalação', async ({ browser }) => {
  const page = await visit(browser);
  const hero = page.locator('#inicio');

  const logo = hero.locator('.logo__light');
  await expect(logo).toBeVisible();
  const height = await logo.evaluate((img) => img.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(48);
  expect(height).toBeLessThanOrEqual(72);

  await expect(hero.locator('h1')).toHaveText('Especifique antes. A IA implementa o que foi decidido.');
  await expect(hero.locator('.hero__subtitle')).toContainText('SDD');
  await expect(hero.locator('.hero__badges li')).toHaveText(['Open source', 'Claude Code', 'Codex', 'MIT']);

  await expect(hero.getByRole('link', { name: 'Ver no GitHub' })).toHaveAttribute('href', 'https://github.com/fbzsaullo/MyAiToolKit');
  await hero.getByRole('link', { name: 'Instalar' }).click();
  await expect(page).toHaveURL(/#instalar$/);
  await expect(page.locator('#instalar')).toBeInViewport();
});

test('CA-02: terminal do hero mostra um comando virando documentação', async ({ browser }) => {
  const page = await visit(browser, { reducedMotion: 'no-preference' });
  const demo = page.locator('[data-hero-demo]');

  // A animação começa ao entrar na tela.
  await expect(demo).toHaveAttribute('data-state', 'running');
  await expect(demo.locator('.terminal__line--cmd .terminal__text')).toHaveText('/sdd-start');
  await expect(demo.locator('[data-motion-controls]')).toBeVisible();

  // Ao terminar, todas as pastas estão lá e cada arquivo novo está marcado com ■ (preenchido).
  await expect(demo).toHaveAttribute('data-state', 'done', { timeout: 10_000 });
  const marks = demo.locator('.file-tree__item--new > .file-tree__row .file-tree__mark');
  await expect(marks).toHaveCount(7);
  for (const mark of await marks.all()) {
    expect(await mark.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  }
  for (const folder of ['architecture', 'adrs', 'prds', 'prototype', 'plans', 'reviews']) {
    await expect(demo.locator('.file-tree__name', { hasText: `${folder}/` })).toHaveCount(1);
  }

  // Leitores de tela recebem o comando e a saída completos, sem a digitação.
  await expect(demo.locator('.terminal__lines')).toHaveAttribute('aria-hidden', 'true');
  const spoken = await demo.locator('.terminal__body > .visually-hidden').textContent();
  expect(spoken).toContain('/sdd-start');
  expect(spoken).toContain('Fase 1 → /sdd-architect');
  expect(spoken).toContain('A — sistema novo');
});

test('pausar e repetir a animação do hero', async ({ browser }) => {
  const page = await visit(browser, { reducedMotion: 'no-preference' });
  const demo = page.locator('[data-hero-demo]');
  await expect(demo).toHaveAttribute('data-state', 'running');
  await demo.getByRole('button', { name: 'Pausar animação' }).click();
  await expect(demo).toHaveAttribute('data-state', 'paused');
  await expect(demo.getByRole('button', { name: 'Continuar animação' })).toBeVisible();
  await demo.getByRole('button', { name: 'Repetir animação' }).click();
  await expect(demo).toHaveAttribute('data-state', 'running');
});

test('hero com movimento reduzido já aparece completo', async ({ browser }) => {
  const page = await visit(browser, { reducedMotion: 'reduce' });
  const demo = page.locator('[data-hero-demo]');
  await expect(demo).not.toHaveClass(/is-animating/);
  await expect(demo.locator('[data-motion-controls]')).toBeHidden();
  await expect(demo.locator('.file-tree__item').last()).toBeVisible();
});
