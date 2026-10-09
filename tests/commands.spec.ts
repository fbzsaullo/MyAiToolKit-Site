import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';

const kit: { commands: { name: string; codex: string }[] } = JSON.parse(readFileSync('src/data/kit.json', 'utf8'));
const kitNames = kit.commands.map((c) => c.name).sort();

// CA-28 (PRD-002) substitui o CA-14 do PRD-001: comandos do kit 0.3.1 em quatro grupos.
test('CA-28: comandos do kit 0.3.1 em quatro grupos', async ({ browser }) => {
  const page = await visit(browser);
  const section = page.locator('#comandos');
  const cards = section.locator('[data-command]');
  await expect(cards).toHaveCount(kitNames.length);
  expect(kitNames).toHaveLength(17);

  // Quatro grupos com título, na ordem Fases, Navegação, Mudança, Apoio.
  await expect(section.locator('.commands__group-title')).toHaveText(['Fases', 'Navegação', 'Mudança', 'Apoio']);
  const names = (group: string) => section.locator(`[data-group="${group}"] [data-command]`).evaluateAll((els) => els.map((el) => el.getAttribute('data-command')));
  expect(await names('fases')).toEqual(['sdd-architect', 'sdd-prd', 'sdd-prototype', 'sdd-plan', 'sdd-execute', 'sdd-review']);
  expect(await names('navegacao')).toEqual(['sdd-start', 'sdd-next', 'sdd-trace']);
  expect(await names('mudanca')).toEqual(['sdd-change', 'sdd-bug', 'sdd-adr']);
  expect(await names('apoio')).toEqual(['sdd-setup', 'spike', 'code-review', 'commit-message', 'pr-description']);

  // Cada chip diz quando usar, o que gera e a chamada no Codex.
  for (const card of await cards.all()) {
    const name = await card.getAttribute('data-command');
    await expect(card.locator('dt')).toHaveText(['Quando usar', 'O que gera', 'Codex']);
    for (const dd of await card.locator('dd').all()) await expect(dd).not.toBeEmpty();
    await expect(card.locator('[data-codex]')).toHaveText(`$${name}`);
  }

  // O code-review do kit aparece com o nome do plugin no Claude Code.
  await expect(section.locator('[data-command="code-review"] .chip')).toHaveText('/my-ai-toolkit:code-review');
  await expect(section.locator('[data-command="sdd-prd"] .chip')).toHaveText('/sdd-prd');

  // A lista é igual à do snapshot do kit.
  const shown = await cards.evaluateAll((els) => els.map((el) => el.getAttribute('data-command')!));
  expect([...shown].sort()).toEqual(kitNames);
});

test('CA-15: prévia da saída de um comando', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 1440, height: 900 } });
  const card = page.locator('[data-command="sdd-prd"]');
  const preview = card.locator('[data-preview]');
  await card.scrollIntoViewIfNeeded();

  // Telas de toque não têm hover: a prévia fica sempre visível (UI-07.celular).
  if (await page.evaluate(() => matchMedia('(hover: none)').matches)) {
    await expect(preview).toHaveCSS('opacity', '1');
    await expect(preview.locator('.cmd__preview-line').first()).toHaveText('docs/sdd/prds/PRD-007-recuperacao-de-senha.md');
    return;
  }

  // Fechada até haver hover ou foco.
  await expect(preview).toHaveCSS('opacity', '0');

  // Hover: a prévia aparece abaixo do chip, com 2 a 3 linhas.
  await card.hover();
  await expect(preview).toHaveCSS('opacity', '1');
  const lines = preview.locator('.cmd__preview-line');
  expect(await lines.count()).toBeGreaterThanOrEqual(2);
  expect(await lines.count()).toBeLessThanOrEqual(3);
  await expect(lines.first()).toHaveText('docs/sdd/prds/PRD-007-recuperacao-de-senha.md');
  const [cardBox, previewBox] = [await card.boundingBox(), await preview.boundingBox()];
  expect(previewBox!.y).toBeGreaterThanOrEqual(cardBox!.y + cardBox!.height - 2);

  // Foco pelo teclado: Tab a partir do card anterior abre a prévia do seguinte.
  await page.mouse.move(0, 0);
  await expect(preview).toHaveCSS('opacity', '0');
  await page.locator('[data-command="sdd-architect"]').focus();
  await page.keyboard.press('Tab');
  await expect(card).toBeFocused();
  await expect(preview).toHaveCSS('opacity', '1');

  // Esc dispensa a prévia sem tirar o foco (WCAG 1.4.13).
  await page.keyboard.press('Escape');
  await expect(preview).toHaveCSS('opacity', '0');
  await expect(card).toBeFocused();

  // O texto da prévia faz parte da descrição acessível do card.
  await expect(card).toHaveAccessibleDescription(/PRD-007-recuperacao-de-senha\.md/);
});

test('comandos no celular: lista com a prévia sempre visível', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 375, height: 800 } });
  const cards = page.locator('[data-command]');
  const widths = await cards.evaluateAll((els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().left))).size);
  expect(widths).toBe(1);
  for (const preview of await page.locator('[data-preview]').all()) await expect(preview).toHaveCSS('opacity', '1');
  expect(await axeViolations(page)).toEqual([]);
});

test('CA-07: nomes dos comandos iguais em pt-BR e en', async ({ browser }) => {
  const read = async (path: string, locale: string) => {
    const page = await visit(browser, { path, locale });
    return page.locator('[data-command]').evaluateAll((els) =>
      els.map((el) => [el.querySelector('.chip')!.textContent, el.querySelector('[data-codex]')!.textContent]),
    );
  };
  const pt = await read('/', 'pt-BR');
  const en = await read('/en/', 'en-US');
  expect(en).toEqual(pt);
  expect(pt).toHaveLength(kitNames.length);
});

test('CA-29: o kit nunca commita', async ({ browser }) => {
  for (const [path, locale, never, noCommit] of [
    ['/', 'pt-BR', /nunca commita nem abre PR/, /não commita/],
    ['/en/', 'en-US', /never commits or opens a PR/, /does not commit/],
  ] as const) {
    const page = await visit(browser, { path, locale });
    const section = page.locator('#comandos');
    // A introdução diz que o kit entrega texto e o commit é do usuário (RN-18).
    await expect(section.locator('.section__lead')).toContainText(never);
    // A prévia do /sdd-execute não sugere commit: a mensagem sai do review aprovado.
    const execute = await section.locator('[data-command="sdd-execute"] [data-preview]').innerText();
    expect(execute).not.toMatch(/commit/i);
    expect(execute).toContain('/sdd-review');
    // /commit-message e /pr-description entregam texto, sem commitar nem abrir PR.
    await expect(section.locator('[data-command="commit-message"] [data-preview]')).toContainText(noCommit);
    await expect(section.locator('[data-command="pr-description"] [data-preview] .cmd__preview-line')).toHaveCount(3);
  }
});

test('CA-32: revisão cruzada opcional nos reviews', async ({ browser }) => {
  for (const [path, locale, optional, done, off, onByDefault] of [
    ['/', 'pt-BR', 'revisão cruzada opcional', 'Revisão cruzada: feita', 'Revisão cruzada nos reviews: desligada (padrão)', /ligada por padrão|sempre ligada/i],
    ['/en/', 'en-US', 'optional cross-review', 'Cross-review: done', 'Cross-review in reviews: off (default)', /on by default|always on/i],
  ] as const) {
    const page = await visit(browser, { path, locale });
    const section = page.locator('#comandos');
    for (const name of ['sdd-review', 'code-review']) {
      const card = section.locator(`[data-command="${name}"]`);
      // "O que gera" cita a revisão cruzada como opcional (RN-21).
      await expect(card.locator('dd').nth(1)).toContainText(optional);
      // A prévia mostra o campo do relatório com uma verificação feita, em 2 a 3 linhas.
      const lines = card.locator('[data-preview] .cmd__preview-line');
      await expect(lines.filter({ hasText: done })).toHaveCount(1);
      expect(await lines.count()).toBeGreaterThanOrEqual(2);
      expect(await lines.count()).toBeLessThanOrEqual(3);
    }
    // O /sdd-setup mostra a pergunta respondida com o padrão do kit: desligada.
    await expect(section.locator('[data-command="sdd-setup"] [data-preview]')).toContainText(off);
    // Nenhum texto do site mostra a revisão cruzada ligada por padrão.
    expect(await page.locator('body').innerText()).not.toMatch(onByDefault);
  }
});
