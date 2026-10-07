// Orçamento de JavaScript (ADR-012, RN-11).
// - Inicial: scripts inline + módulos referenciados direto pelo HTML (e seus imports estáticos),
//   ou seja, tudo o que roda antes de qualquer rolagem ou interação.
// - Ilhas: cada <astro-island> (component-url + renderer-url e imports) medida à parte, porque
//   só é baixada quando fica visível (client:visible).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const INITIAL_LIMIT = 50 * 1024;
const ISLAND_LIMIT = 45 * 1024;

const gz = (text) => gzipSync(Buffer.from(text)).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

// Resolve um módulo publicado e todos os seus imports estáticos (sem repetir).
function collectModule(url, seen) {
  if (!url.startsWith('/') || seen.has(url)) return 0;
  seen.add(url);
  const file = join(DIST, url);
  if (!existsSync(file)) return 0;
  const code = readFileSync(file, 'utf8');
  let total = gz(code);
  const staticImport = /\bimport\s*(?:[^'"()]*?\bfrom\s*)?["']([^"']+)["']/g;
  for (const [, spec] of code.matchAll(staticImport)) {
    const resolved = spec.startsWith('.') ? posix.join(posix.dirname(url), spec) : spec;
    total += collectModule(resolved, seen);
  }
  return total;
}

let failed = false;
const report = [];

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + file.slice(DIST.length + 1).replaceAll('\\', '/');
  const seen = new Set();
  let initial = 0;

  // Scripts inline (incluindo o runtime das ilhas do Astro e o boot de idioma/tema).
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs)) continue;
    if (/type="(application\/(ld\+)?json|text\/template)"/.test(attrs)) continue;
    initial += gz(body);
  }
  // Scripts e módulos referenciados diretamente.
  for (const [, src] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) initial += collectModule(src, seen);
  for (const [, href] of html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)) initial += collectModule(href, seen);

  report.push(`${page}: inicial ${kb(initial)} (limite ${kb(INITIAL_LIMIT)})`);
  if (initial > INITIAL_LIMIT) failed = true;

  // Ilhas, medidas individualmente.
  for (const [tag] of html.matchAll(/<astro-island\b[^>]*>/g)) {
    const component = tag.match(/component-url="([^"]+)"/)?.[1];
    const renderer = tag.match(/renderer-url="([^"]+)"/)?.[1];
    const name = tag.match(/component-export="([^"]+)"/)?.[1] ?? component;
    const islandSeen = new Set(seen);
    const size = (component ? collectModule(component, islandSeen) : 0) + (renderer ? collectModule(renderer, islandSeen) : 0);
    report.push(`  ilha ${posix.basename(component ?? '?')} (${name}): ${kb(size)} (limite ${kb(ISLAND_LIMIT)})`);
    if (size > ISLAND_LIMIT) failed = true;
  }
}

console.log(report.join('\n'));
if (failed) {
  console.error('check-budget: orçamento de JavaScript estourado');
  process.exit(1);
}
console.log('check-budget: dentro do orçamento');
