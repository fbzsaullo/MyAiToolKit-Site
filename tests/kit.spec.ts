import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { visit } from './helpers';

type Snapshot = {
  repository: string;
  version: string;
  commit: string | null;
  commands: { name: string; claude: string; codex: string; description: string }[];
};

const snapshot: Snapshot = JSON.parse(readFileSync('src/data/kit.json', 'utf8'));
const KIT = resolve(process.env.KIT_PATH ?? '../MyAiToolKit');

// CA-34 (PRD-004) substitui o CA-31 do PRD-003 e fixa o kit 0.5.0 (17 comandos): se o kit mudar, este teste lembra de abrir um PRD novo.
test('CA-34: site no kit 0.5.0', async ({ browser }) => {
  expect(snapshot.repository).toBe('https://github.com/fbzsaullo/MyAiToolKit');
  expect(snapshot.version).toBe('0.5.0');
  expect(snapshot.commands).toHaveLength(17);
  for (const command of snapshot.commands) {
    expect(command.claude).toBe(`/${command.name}`);
    expect(command.codex).toBe(`$${command.name}`);
    expect(command.description.length).toBeGreaterThan(20);
  }
  // O verificador da revisão cruzada é um agente do plugin, não um comando (RN-23).
  expect(snapshot.commands.map((c) => c.name)).not.toContain('review-verifier');

  for (const [path, locale] of [
    ['/', 'pt-BR'],
    ['/en/', 'en-US'],
  ] as const) {
    const page = await visit(browser, { path, locale });
    // Rodapé com a versão do snapshot.
    await expect(page.getByRole('contentinfo').locator('[data-kit-version] code')).toHaveText('0.5.0');
    // Um chip por comando do snapshot, nenhum para o verificador.
    await expect(page.locator('#comandos [data-command]')).toHaveCount(17);
    await expect(page.locator('#comandos')).not.toContainText('review-verifier');
  }
});

test('snapshot sincronizado com o kit (quando o kit está disponível)', () => {
  test.skip(!existsSync(join(KIT, '.claude-plugin', 'plugin.json')), `kit não encontrado em ${KIT}`);

  const plugin = JSON.parse(readFileSync(join(KIT, '.claude-plugin', 'plugin.json'), 'utf8'));
  const names = readdirSync(join(KIT, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const message = 'snapshot desatualizado: rode `npm run sync:kit`';
  expect(snapshot.version, message).toBe(plugin.version);
  expect(snapshot.commands.map((c) => c.name), message).toEqual(names);
});

test('CA-30: textos do kit acompanham o snapshot', async ({ browser }) => {
  const count = String(snapshot.commands.length);
  // Nenhum texto de interface escreve a contagem à mão: usa o marcador {kit.commands} (RN-19).
  for (const locale of ['pt-BR', 'en']) {
    const ui = readFileSync(`src/content/ui/${locale}.json`, 'utf8');
    expect(ui, locale).not.toMatch(/\b\d+ (comandos|commands|skills|SKILL\.md)\b/);
    expect(ui, locale).toContain('{kit.commands}');
  }
  for (const [path, locale, start] of [
    ['/', 'pt-BR', 'Esta demanda é: A · B · C · D · E · F'],
    ['/en/', 'en-US', 'This request is: A · B · C · D · E · F'],
  ] as const) {
    const page = await visit(browser, { path, locale, viewport: { width: 1440, height: 900 } });
    // Terminal do hero com as opções A–F do /sdd-start.
    await expect(page.locator('.hero__terminal')).toContainText(start);
    // Contagens lidas do snapshot: bloco Skills da arquitetura, /plugin na instalação, skills/ na árvore.
    await expect(page.locator('svg[data-arch-svg] [data-block="skills"] .arch__sub')).toContainText(count);
    await expect(page.locator('#instalar-painel-claude .install__note')).toContainText(`${count} skills`);
    await expect(page.locator('#contribuir .file-tree')).toContainText(`${count} SKILL.md`);
    // Nenhum marcador sobrou sem preencher.
    expect(await page.locator('body').innerText()).not.toContain('{kit.commands}');
  }
});
