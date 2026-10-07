import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

type Snapshot = {
  repository: string;
  version: string;
  commit: string | null;
  commands: { name: string; claude: string; codex: string; description: string }[];
};

const snapshot: Snapshot = JSON.parse(readFileSync('src/data/kit.json', 'utf8'));
const KIT = resolve(process.env.KIT_PATH ?? '../MyAiToolKit');

// RN-04 fixa o kit 0.3.1 (17 comandos): se o kit crescer, este teste lembra de revisar o PRD.
test('snapshot do kit 0.3.1 com 17 comandos', () => {
  expect(snapshot.repository).toBe('https://github.com/fbzsaullo/MyAiToolKit');
  expect(snapshot.version).toMatch(/^\d+\.\d+\.\d+$/);
  expect(snapshot.version).toBe('0.3.1');
  expect(snapshot.commands).toHaveLength(17);
  for (const command of snapshot.commands) {
    expect(command.claude).toBe(`/${command.name}`);
    expect(command.codex).toBe(`$${command.name}`);
    expect(command.description.length).toBeGreaterThan(20);
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
