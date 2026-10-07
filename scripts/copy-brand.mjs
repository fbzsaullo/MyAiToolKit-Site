// Copia os ícones da marca (brand/icons) para public/, sem alterar nenhum byte.
// O site.webmanifest e o <head> apontam para a raiz (/favicon.ico, /icon-192.png...),
// por isso os arquivos precisam estar em public/ no dev e no build.
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = 'brand/icons';
const target = 'public';
// O head-snippet.html é um trecho de <head>, incorporado ao layout; não é um arquivo público.
const skip = new Set(['head-snippet.html']);

mkdirSync(target, { recursive: true });

const copied = [];
for (const name of readdirSync(source)) {
  if (skip.has(name)) continue;
  const from = join(source, name);
  const to = join(target, name);
  copyFileSync(from, to);
  if (!readFileSync(from).equals(readFileSync(to))) {
    console.error(`copy-brand: ${name} ficou diferente do original`);
    process.exit(1);
  }
  copied.push(name);
}

console.log(`copy-brand: ${copied.length} ícones copiados para public/ (idênticos ao original)`);
