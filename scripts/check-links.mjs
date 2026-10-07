// Verifica links do site construído (ADR-012), sem depender de rede:
// 1. links internos e âncoras (#secao) de dist/ com o linkinator;
// 2. links externos só para destinos permitidos (verificação de formato).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { check, LinkState } from 'linkinator';

const DIST = 'dist';
const ALLOWED_EXTERNAL = [
  /^https:\/\/github\.com\/fbzsaullo\/MyAiToolKit(\/.*)?$/,
  /^https:\/\/github\.com\/fbzsaullo\/MyAiToolKit-Site(\/.*)?$/,
  /^https:\/\/myaitoolkit\.netlify\.app(\/.*)?$/,
  // Crédito ao pipeline de origem no rodapé (RN-16) — só o endereço exato do repositório.
  /^https:\/\/github\.com\/leanwork\/leanwork-sdd$/,
];

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

let problems = 0;

// 1. Internos e âncoras.
// As páginas 404 não são linkadas por nenhuma outra; entram como pontos de partida.
const result = await check({
  serverRoot: DIST,
  path: ['index.html', '404.html', 'en/404/index.html'],
  recurse: true,
  checkFragments: true,
  linksToSkip: [String.raw`^https?://(?!localhost|127\.0\.0\.1)`],
});
for (const link of result.links) {
  if (link.state === LinkState.BROKEN) {
    console.error(`quebrado: ${link.url} (em ${link.parent ?? '?'}) status ${link.status}`);
    problems++;
  }
}

// 2. Externos: só os destinos permitidos.
const externalAttr = /\b(?:href|src)="(https?:\/\/[^"]+)"/g;
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(externalAttr)) {
    if (!ALLOWED_EXTERNAL.some((re) => re.test(url))) {
      console.error(`externo não permitido: ${url} (em ${file})`);
      problems++;
    }
  }
}

const checked = result.links.filter((l) => l.state !== LinkState.SKIPPED).length;
if (problems) {
  console.error(`check-links: ${problems} problema(s)`);
  process.exit(1);
}
console.log(`check-links: ${checked} links internos verificados, externos dentro da lista permitida`);
