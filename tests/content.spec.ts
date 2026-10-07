import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { ID_PATTERN } from '../src/lib/ids';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

// Lista todas as chaves aninhadas de um objeto JSON ("meta.title", "a11y.skipToContent"...).
function keys(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => keys(item, `${prefix}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

test('idiomas com as mesmas chaves', () => {
  const pt = keys(read('src/content/ui/pt-BR.json')).sort();
  const en = keys(read('src/content/ui/en.json')).sort();
  expect(en).toEqual(pt);
});

test('exemplos têm texto nos dois idiomas', () => {
  for (const name of readdirSync('src/content/examples')) {
    const missing: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (Array.isArray(value)) return value.forEach((item, i) => walk(item, `${path}[${i}]`));
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if ('pt-BR' in record || 'en' in record) {
          if (!record['pt-BR'] || !record.en) missing.push(path);
          return;
        }
        for (const [key, child] of Object.entries(record)) walk(child, `${path}.${key}`);
      }
    };
    walk(read(join('src/content/examples', name)), name);
    expect(missing, name).toEqual([]);
  }
});

test('IDs no formato do kit', () => {
  const invalid: string[] = [];
  for (const name of readdirSync('src/content/examples')) {
    const data = read(join('src/content/examples', name));
    const ids: string[] = [];
    for (const phase of data.phases) {
      for (const created of phase.ids) {
        ids.push(created.id);
        if (created.parent) ids.push(created.parent);
      }
    }
    for (const task of data.loop.tasks) {
      ids.push(task.id);
      if (task.finding) ids.push(task.finding.id);
    }
    for (const row of data.trace?.matrix ?? []) ids.push(row.rn, ...row.ca, ...row.ui, ...row.tasks);
    for (const id of ids) if (!ID_PATTERN.test(id)) invalid.push(`${name}: ${id}`);
  }
  expect(invalid).toEqual([]);
});

test('cada ID-pai existe antes do filho na mesma demanda', () => {
  for (const name of readdirSync('src/content/examples')) {
    const data = read(join('src/content/examples', name));
    const seen = new Set<string>();
    const orphans: string[] = [];
    for (const phase of data.phases) {
      for (const created of phase.ids) {
        if (created.parent && !seen.has(created.parent)) orphans.push(`${created.id} → ${created.parent}`);
        seen.add(created.id);
      }
    }
    expect(orphans, name).toEqual([]);
  }
});

test('datas coerentes: as fases avançam no tempo', () => {
  for (const name of readdirSync('src/content/examples')) {
    const dates = read(join('src/content/examples', name)).phases.map((p: { date: string }) => p.date);
    expect([...dates].sort(), name).toEqual(dates);
  }
});
