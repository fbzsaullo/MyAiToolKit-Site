// UI-09 — Arquitetura do kit. SVG com texto real em três colunas (kit, IAs, projeto), ligações rotuladas
// e a faixa das fases; abaixo, a mesma informação em lista (leitores de tela; acordeão no celular).
import {
  BOXES, BOX_H, COLUMNS, EDGES, EDGE_TAGS, PHASES_Y, PHASE_GAP, PHASE_W, VIEW_H, VIEW_W,
  edgePath, type BlockId, type ColumnId, type EdgeLabel,
} from '../../lib/architecture';

export type ArchBlock = { title: string; sub: string; text: string; files: string[]; command: string | null };
export type ArchLabels = {
  diagramLabel: string;
  columns: Record<ColumnId, string>;
  edges: Record<EdgeLabel, string>;
  phasesLabel: string;
  loop: string;
  listLabel: string;
  panel: { hint: string; files: string; command: string; noCommand: string };
  flow: { button: string; title: string; steps: string[] };
  blocks: Record<BlockId, ArchBlock>;
};

type Props = { labels: ArchLabels; phases: { name: string }[] };

const pad = (n: number) => String(n).padStart(2, '0');
const DOC_FOLDERS = ['architecture/', 'prds/', 'prototype/', 'plans/', 'reviews/', 'traceability/'];

export default function ArchitectureIsland({ labels, phases }: Props) {
  return (
    <div class="arch" data-arch>
      <div class="arch__stage">
        <svg class="arch__svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="group" aria-labelledby="arch-title" data-arch-svg>
          <title id="arch-title">{labels.diagramLabel}</title>

          {COLUMNS.map((column) => (
            <text class="arch__col" x={column.x} y={30}>
              {labels.columns[column.id]}
            </text>
          ))}

          <g class="arch__edges" aria-hidden="true">
            {EDGES.map((edge) => (
              <path class="arch__edge" d={edgePath(edge)} data-edge={edge.id} />
            ))}
            {EDGE_TAGS.map((tag) => (
              <text
                class="arch__edge-tag"
                x={tag.x}
                y={tag.y}
                text-anchor={tag.anchor}
                transform={tag.rotate ? `rotate(-90 ${tag.x} ${tag.y})` : undefined}
                data-edges={tag.edges.join(' ')}
              >
                {labels.edges[tag.label]}
              </text>
            ))}
          </g>

          {BOXES.map((b) => {
            const block = labels.blocks[b.id];
            const mono = b.column === 'project';
            return (
              <g class="arch__block" data-block={b.id} data-inverted={b.id === 'agents' ? 'true' : undefined}>
                <rect class="arch__box" x={b.x} y={b.y} width={b.w} height={b.h} />
                <text class={`arch__title${mono ? ' arch__title--mono' : ''}`} x={b.x + 16} y={b.y + 27}>
                  {block.title}
                </text>
                <text class="arch__sub" x={b.x + 16} y={b.y + 48}>
                  {block.sub}
                </text>
                {b.id === 'docs' &&
                  DOC_FOLDERS.map((folder, i) => (
                    <text class="arch__folder" x={b.x + 16 + (i % 2) * 112} y={b.y + 72 + Math.floor(i / 2) * 16}>
                      {folder}
                    </text>
                  ))}
              </g>
            );
          })}

          <g class="arch__phases">
            <text class="arch__col" x={40} y={PHASES_Y - 14}>
              {labels.phasesLabel}
            </text>
            {phases.map((phase, i) => {
              const x = 40 + i * (PHASE_W + PHASE_GAP);
              return (
                <g class="arch__phase" data-phase={i + 1}>
                  <rect class="arch__box" x={x} y={PHASES_Y} width={PHASE_W} height={BOX_H - 16} />
                  <text class="arch__phase-num" x={x + 12} y={PHASES_Y + 20}>
                    {pad(i + 1)}
                  </text>
                  <text class="arch__phase-name" x={x + 12} y={PHASES_Y + 37}>
                    {phase.name}
                  </text>
                  {i < phases.length - 1 && (
                    <text class="arch__arrow" x={x + PHASE_W + PHASE_GAP / 2} y={PHASES_Y + 29} text-anchor="middle" aria-hidden="true">
                      {i === 4 ? '⇄' : '→'}
                    </text>
                  )}
                </g>
              );
            })}
            <text class="arch__edge-tag" x={40 + 4 * (PHASE_W + PHASE_GAP) + PHASE_W + PHASE_GAP / 2} y={PHASES_Y + BOX_H + 6} text-anchor="middle">
              {labels.loop}
            </text>
          </g>
        </svg>
      </div>

      <div class="arch__list" data-arch-list>
        <h3 class="visually-hidden">{labels.listLabel}</h3>
        {COLUMNS.map((column, index) => (
          <details class="arch__group" open={index === 0} data-group={column.id}>
            <summary class="arch__summary">
              <span class="arch__summary-mark" aria-hidden="true" />
              {labels.columns[column.id]}
            </summary>
            <ul class="arch__items" role="list">
              {column.blocks.map((id) => {
                const block = labels.blocks[id];
                return (
                  <li class="arch__item" data-item={id} data-inverted={id === 'agents' ? 'true' : undefined}>
                    <p class="arch__item-title">
                      <strong>{block.title}</strong> — {block.sub}
                    </p>
                    <p class="arch__item-text">{block.text}</p>
                    <p class="arch__item-meta">
                      <span class="label">{labels.panel.files}</span>{' '}
                      {block.files.map((file, i) => (
                        <>
                          {i > 0 && ' · '}
                          <code>{file}</code>
                        </>
                      ))}
                    </p>
                    {block.command && (
                      <p class="arch__item-meta">
                        <span class="label">{labels.panel.command}</span> <code>{block.command}</code>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
        <details class="arch__group" data-group="phases">
          <summary class="arch__summary">
            <span class="arch__summary-mark" aria-hidden="true" />
            {labels.phasesLabel}
          </summary>
          <ol class="arch__phase-list">
            {phases.map((phase, i) => (
              <li>
                <span class="tabular">{pad(i + 1)}</span> {phase.name}
                {i === 4 && ` (${labels.loop} ⇄ 06)`}
              </li>
            ))}
          </ol>
        </details>
      </div>
    </div>
  );
}
