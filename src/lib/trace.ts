// Dados da seção Rastreabilidade (UI-06): a cadeia de um requisito e a mini matriz da demanda B.
// Cada ID ganha uma chave; um teste é chaveado pelo CA que traz no nome, para que o teste da cadeia
// (`it "CA-03: …"`) e a coluna de testes da matriz (`CA-03`) se reconheçam como o mesmo elo.
import type { Example } from './examples';
import type { Locale } from '../i18n';

export type TraceKind = 'rn' | 'ca' | 'ui' | 't' | 'r' | 'test';
export type TraceNode = { id: string; key: string; kind: TraceKind; label: string };
export type TraceRow = {
  rn: TraceNode;
  rule: string;
  ca: TraceNode[];
  ui: TraceNode[];
  tasks: TraceNode[];
  tests: TraceNode[];
  broken: string | null;
};
export type TraceData = { chain: TraceNode[]; matrix: TraceRow[] };

export const testKey = (name: string) => `test:${name.match(/CA-\d+/)?.[0] ?? name}`;
const keyOf = (id: string, kind: TraceKind) => (kind === 'test' ? testKey(id) : id);
const node = (id: string, kind: TraceKind, label = ''): TraceNode => ({ id, key: keyOf(id, kind), kind, label });

export function toTrace(examples: Example[], locale: Locale): TraceData {
  const source = examples.find((example) => example.trace)?.trace;
  if (!source) throw new Error('Nenhuma demanda de exemplo traz a rastreabilidade.');
  return {
    chain: source.chain.map((item) => node(item.id, item.kind, item.label[locale])),
    matrix: source.matrix.map((row) => ({
      rn: node(row.rn, 'rn'),
      rule: row.rule[locale],
      ca: row.ca.map((id) => node(id, 'ca')),
      ui: row.ui.map((id) => node(id, 'ui')),
      tasks: row.tasks.map((id) => node(id, 't')),
      tests: row.tests.map((id) => node(id, 'test')),
      broken: row.broken ? row.broken[locale] : null,
    })),
  };
}

// Grupos de ligação: a cadeia inteira é um grupo; cada linha da matriz é outro.
// Os IDs ligados a uma chave são a união dos grupos que a contêm.
export function linkGroups(data: TraceData): string[][] {
  const rows = data.matrix.map((row) => [row.rn, ...row.ca, ...row.ui, ...row.tasks, ...row.tests].map((n) => n.key));
  return [data.chain.map((n) => n.key), ...rows];
}

export function linkedKeys(groups: string[][], key: string): Set<string> {
  const linked = new Set<string>();
  for (const group of groups) if (group.includes(key)) group.forEach((k) => linked.add(k));
  return linked;
}
