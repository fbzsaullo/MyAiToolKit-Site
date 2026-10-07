// Geometria do diagrama da arquitetura (UI-09). Os textos vêm de src/content/ui; aqui ficam só a
// posição dos blocos, as ligações e o caminho do "Ver o fluxo" — iguais nos dois idiomas.

export type ColumnId = 'kit' | 'ais' | 'project';
export type BlockId =
  | 'skills' | 'templates' | 'stacks' | 'adapters'
  | 'claude' | 'codex' | 'others'
  | 'agents' | 'claudemd' | 'config' | 'docs';
export type EdgeLabel = 'usam' | 'instalam' | 'leem' | 'geram';

export type Box = { id: BlockId; column: ColumnId; x: number; y: number; w: number; h: number };
export type Edge = { id: string; from: BlockId; to: BlockId; label: EdgeLabel };
// Rótulo de um grupo de ligações, escrito uma vez junto ao bloco onde elas se juntam.
export type EdgeTag = { label: EdgeLabel; x: number; y: number; anchor: 'start' | 'end' | 'middle'; edges: string[]; rotate?: boolean };

export const COLUMNS: { id: ColumnId; x: number; blocks: BlockId[] }[] = [
  { id: 'kit', x: 40, blocks: ['skills', 'templates', 'stacks', 'adapters'] },
  { id: 'ais', x: 370, blocks: ['claude', 'codex', 'others'] },
  { id: 'project', x: 700, blocks: ['agents', 'claudemd', 'config', 'docs'] },
];

export const BOX_W = 240;
export const BOX_H = 64;
const TOP = 52;
const STEP = 84;
const DOCS_H = 118;

export const BOXES: Box[] = COLUMNS.flatMap((column) =>
  column.blocks.map((id, row) => ({
    id,
    column: column.id,
    x: column.x,
    y: TOP + row * STEP,
    w: BOX_W,
    h: id === 'docs' ? DOCS_H : BOX_H,
  })),
);

export const box = (id: BlockId) => BOXES.find((b) => b.id === id)!;

export const EDGES: Edge[] = [
  { id: 'skills-templates', from: 'skills', to: 'templates', label: 'leem' },
  { id: 'skills-stacks', from: 'skills', to: 'stacks', label: 'leem' },
  { id: 'skills-claude', from: 'skills', to: 'claude', label: 'usam' },
  { id: 'skills-codex', from: 'skills', to: 'codex', label: 'usam' },
  { id: 'adapters-claude', from: 'adapters', to: 'claude', label: 'instalam' },
  { id: 'adapters-codex', from: 'adapters', to: 'codex', label: 'instalam' },
  { id: 'claude-agents', from: 'claude', to: 'agents', label: 'leem' },
  { id: 'codex-agents', from: 'codex', to: 'agents', label: 'leem' },
  { id: 'claude-claudemd', from: 'claude', to: 'claudemd', label: 'leem' },
  { id: 'claude-config', from: 'claude', to: 'config', label: 'leem' },
  { id: 'codex-config', from: 'codex', to: 'config', label: 'leem' },
  { id: 'claude-docs', from: 'claude', to: 'docs', label: 'geram' },
  { id: 'codex-docs', from: 'codex', to: 'docs', label: 'geram' },
];

// Caminho das ligações. Dentro da coluna do kit, a linha contorna os blocos pela esquerda.
export function edgePath(edge: Edge): string {
  const a = box(edge.from);
  const b = box(edge.to);
  if (a.column === b.column) {
    const y1 = a.y + a.h / 2;
    const y2 = b.y + b.h / 2;
    const x = a.x - 22;
    return `M ${a.x} ${y1} H ${x} V ${y2} H ${b.x}`;
  }
  const x1 = a.x + a.w;
  const y1 = a.y + a.h / 2;
  const x2 = b.x;
  const y2 = b.y + Math.min(b.h, BOX_H) / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

const edgesOf = (predicate: (e: Edge) => boolean) => EDGES.filter(predicate).map((e) => e.id);

export const EDGE_TAGS: EdgeTag[] = [
  { label: 'leem', x: 10, y: (box('templates').y + box('skills').y + BOX_H) / 2, anchor: 'middle', rotate: true, edges: ['skills-templates', 'skills-stacks'] },
  { label: 'usam', x: box('skills').x + BOX_W + 8, y: box('skills').y + BOX_H / 2 - 8, anchor: 'start', edges: edgesOf((e) => e.label === 'usam') },
  { label: 'instalam', x: box('adapters').x + BOX_W + 8, y: box('adapters').y + BOX_H / 2 - 8, anchor: 'start', edges: edgesOf((e) => e.label === 'instalam') },
  ...(['agents', 'claudemd', 'config', 'docs'] as BlockId[]).map((id) => {
    const target = box(id);
    const edges = edgesOf((e) => e.to === id);
    const label = EDGES.find((e) => e.to === id)!.label;
    return { label, x: target.x - 8, y: target.y + BOX_H / 2 - 8, anchor: 'end' as const, edges };
  }),
];

export const linkedEdges = (id: BlockId) => EDGES.filter((e) => e.from === id || e.to === id).map((e) => e.id);
export const linkedBlocks = (id: BlockId) =>
  new Set<BlockId>(EDGES.filter((e) => e.from === id || e.to === id).flatMap((e) => [e.from, e.to]));

// "Ver o fluxo" de /sdd-prd: Skills → Templates → Stacks → IA → docs/sdd/prds/ (UI-09.fluxo).
export const FLOW: { block: BlockId; edge?: string }[] = [
  { block: 'skills' },
  { block: 'templates', edge: 'skills-templates' },
  { block: 'stacks', edge: 'skills-stacks' },
  { block: 'claude', edge: 'skills-claude' },
  { block: 'docs', edge: 'claude-docs' },
];

// Faixa das fases, embaixo do diagrama.
export const PHASES_Y = 476;
export const PHASE_W = 138;
export const PHASE_GAP = 18;
export const VIEW_W = 980;
export const VIEW_H = 560;
