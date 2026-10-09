import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';

const kit: { version: string } = JSON.parse(readFileSync('src/data/kit.json', 'utf8'));
const SITE_DOCS = 'https://github.com/fbzsaullo/MyAiToolKit-Site/tree/main/docs/sdd';

test('CA-25: rodapé, versão e prova de conceito', async ({ browser }) => {
  const page = await visit(browser);

  // Rodapé: versão do snapshot e links para GitHub, licença e docs/sdd do site.
  const footer = page.getByRole('contentinfo');
  await expect(footer.locator('[data-kit-version] code')).toHaveText(kit.version);
  await expect(footer.getByRole('link', { name: 'GitHub do kit' })).toHaveAttribute('href', 'https://github.com/fbzsaullo/MyAiToolKit');
  await expect(footer.getByRole('link', { name: 'Licença MIT' })).toHaveAttribute('href', /\/LICENSE$/);
  await expect(footer.getByRole('link', { name: 'docs/sdd deste site' })).toHaveAttribute('href', SITE_DOCS);

  // Seção Open source com o bloco invertido "Este site foi feito com o MyAiToolKit".
  const oss = page.locator('#contribuir');
  const made = oss.locator('[data-made-with]');
  await expect(made).toContainText('Este site foi feito com o MyAiToolKit');
  await expect(made.getByRole('link')).toHaveAttribute('href', SITE_DOCS);
  await expect(made).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(oss.getByRole('link', { name: 'CONTRIBUTING.md' })).toHaveAttribute('href', /CONTRIBUTING\.md$/);
  await expect(oss.locator('.file-tree')).toContainText('scripts/check.sh');

  expect(await axeViolations(page)).toEqual([]);
});

test('Cursor e outras IAs nunca aparecem como suportados', async ({ browser }) => {
  for (const [path, locale, supported] of [
    ['/', 'pt-BR', 'suportado'],
    ['/en/', 'en-US', 'supported'],
  ] as const) {
    const page = await visit(browser, { path, locale });
    const hub = page.locator('[data-hub]');
    const notes = await hub.locator('.hub__ai').evaluateAll((els) =>
      els.map((el) => [el.getAttribute('data-ai'), el.getAttribute('data-supported'), el.querySelector('[data-ai-note]')!.textContent]),
    );
    expect(notes.map(([name]) => name)).toEqual(path === '/' ? ['Claude Code', 'Codex', 'Cursor', 'Outras IAs'] : ['Claude Code', 'Codex', 'Cursor', 'Other AIs']);
    for (const [name, isSupported, note] of notes) {
      if (name === 'Claude Code' || name === 'Codex') {
        expect(isSupported).toBe('true');
        expect(note).toContain(supported);
      } else {
        expect(isSupported).toBe('false');
        expect(note).not.toContain(supported);
        expect(note).toContain('AGENTS.md');
      }
    }
  }
});

test('stacks e IAs: selos e ligações', async ({ browser }) => {
  const page = await visit(browser);
  const section = page.locator('#stacks');
  await expect(section.locator('[data-stack]')).toHaveCount(8);
  await expect(section.locator('[data-stack="Ruby on Rails"]')).toContainText('referência');
  await expect(section.locator('[data-stack="generic"]')).toContainText('genérico');
  await expect(section.locator('.hub__center')).toHaveCSS('background-color', 'rgb(0, 0, 0)');

  // A seção começa apagada fora da tela e acende ao entrar.
  const hub = section.locator('[data-hub]');
  await expect(hub).toHaveAttribute('data-state', 'pending');
  await hub.scrollIntoViewIfNeeded();
  await expect(hub).toHaveAttribute('data-state', 'lit');
});

test('stacks e IAs com movimento reduzido e sem JS já aparecem acesas', async ({ browser }) => {
  for (const options of [{ reducedMotion: 'reduce' as const }, { javaScriptEnabled: false }]) {
    const page = await visit(browser, options);
    const hub = page.locator('[data-hub]');
    await expect(hub).not.toHaveAttribute('data-state', 'pending');
    await expect(hub.locator('.hub__link').first()).toHaveCSS('transform', 'none');
  }
});

test('CA-27: crédito ao pipeline de origem no rodapé', async ({ browser }) => {
  for (const [path, locale, text] of [
    ['/', 'pt-BR', 'Pipeline SDD baseado no leanwork-sdd'],
    ['/en/', 'en-US', 'SDD pipeline based on leanwork-sdd'],
  ] as const) {
    const page = await visit(browser, { path, locale });
    const links = page.getByRole('contentinfo').locator('.site-footer__links li a');
    const labels = await links.allTextContents();
    // Logo depois do link da licença (RN-16).
    const license = labels.findIndex((label) => /MIT/.test(label));
    expect(license).toBeGreaterThanOrEqual(0);
    expect(labels[license + 1]).toBe(text);
    const credit = links.nth(license + 1);
    await expect(credit).toHaveAttribute('href', 'https://github.com/leanwork/leanwork-sdd');
    await expect(credit).toHaveAttribute('rel', 'noopener');
  }
});

test('CA-33: pasta agents/ na árvore do kit', async ({ browser }) => {
  for (const [path, locale] of [
    ['/', 'pt-BR'],
    ['/en/', 'en-US'],
  ] as const) {
    const page = await visit(browser, { path, locale });
    const tree = page.locator('#contribuir .file-tree');
    // Pastas de primeiro nível, na ordem do README do kit: agents/ logo depois de skills/ (RN-22).
    const names = await tree.locator(':scope > .file-tree__item > .file-tree__row .file-tree__name').allInnerTexts();
    expect(names.indexOf('agents/')).toBe(names.indexOf('skills/') + 1);
    // Com o verificador da revisão cruzada como nota.
    const agents = tree.locator(':scope > .file-tree__item', { has: page.locator('.file-tree__name', { hasText: /^agents\/$/ }) });
    await expect(agents.locator('.file-tree__note')).toHaveText('review-verifier.md');
  }
});
