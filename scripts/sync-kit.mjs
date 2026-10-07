// Sincroniza a lista de comandos e a versão do MyAiToolKit num snapshot versionado (ADR-007).
//
//   npm run sync:kit                         # lê ../MyAiToolKit
//   KIT_PATH=/caminho/do/kit npm run sync:kit
//   KIT_REPO=https://github.com/fbzsaullo/MyAiToolKit npm run sync:kit   # clone raso temporário
//
// O build do site lê apenas src/data/kit.json; ele não depende do kit nem de rede.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const OUTPUT = 'src/data/kit.json';
const REPOSITORY = 'https://github.com/fbzsaullo/MyAiToolKit';

let kitPath = resolve(process.env.KIT_PATH ?? '../MyAiToolKit');
let tempDir = null;

if (process.env.KIT_REPO) {
  tempDir = mkdtempSync(join(tmpdir(), 'matk-kit-'));
  execFileSync('git', ['clone', '--depth', '1', process.env.KIT_REPO, tempDir], { stdio: 'inherit' });
  kitPath = tempDir;
}

if (!existsSync(join(kitPath, '.claude-plugin', 'plugin.json'))) {
  console.error(`sync-kit: kit não encontrado em ${kitPath} (defina KIT_PATH ou KIT_REPO)`);
  process.exit(1);
}

// Lê só as chaves de topo `name` e `description` do frontmatter (sem biblioteca YAML).
function frontmatter(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`frontmatter ausente em ${file}`);
  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^(name|description):\s*(.*)$/);
    if (field) data[field[1]] = field[2].replace(/^["']|["']$/g, '').trim();
  }
  return data;
}

const plugin = JSON.parse(readFileSync(join(kitPath, '.claude-plugin', 'plugin.json'), 'utf8'));
const skillsDir = join(kitPath, 'skills');
const commands = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(skillsDir, entry.name, 'SKILL.md')))
  .map((entry) => {
    const { name, description } = frontmatter(join(skillsDir, entry.name, 'SKILL.md'));
    if (name !== entry.name) throw new Error(`name "${name}" diferente da pasta "${entry.name}"`);
    return { name, claude: `/${name}`, codex: `$${name}`, description };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

let commit = null;
try {
  commit = execFileSync('git', ['-C', kitPath, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  commit = null;
}

const snapshot = {
  repository: REPOSITORY,
  version: plugin.version,
  commit,
  commands,
};

writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2) + '\n');
if (tempDir) rmSync(tempDir, { recursive: true, force: true });

console.log(`sync-kit: ${commands.length} comandos, versão ${plugin.version}${commit ? ` (${commit})` : ''} → ${OUTPUT}`);
