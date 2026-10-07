// Pós-build (ADR-011): calcula o SHA-256 de cada script inline das páginas geradas — o de idioma e
// tema (boot) e os pequenos scripts que o Astro embute — e escreve a CSP em dist/_headers.
// Assim `script-src` fica sem 'unsafe-inline' e o hash nunca fica desatualizado.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = 'dist';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

// Scripts sem `src`: o conteúdo entre as tags, byte a byte, é o que o navegador confere.
export function inlineScripts(html) {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((code) => code.length > 0);
}

export const sha256 = (code) => `'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`;

export function buildCsp(hashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ');
}

export function collectHashes(dist = DIST) {
  const hashes = new Set();
  for (const file of htmlFiles(dist)) for (const code of inlineScripts(readFileSync(file, 'utf8'))) hashes.add(sha256(code));
  return [...hashes].sort();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hashes = collectHashes();
  const headers = `# Gerado por scripts/csp-hash.mjs no pós-build — não editar à mão.\n/*\n  Content-Security-Policy: ${buildCsp(hashes)}\n`;
  writeFileSync(join(DIST, '_headers'), headers);
  console.log(`csp-hash: ${hashes.length} script(s) inline com hash em dist/_headers`);
}
