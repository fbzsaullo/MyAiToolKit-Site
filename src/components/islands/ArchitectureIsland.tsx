// UI-09 — Arquitetura do kit. SVG com texto real em três colunas (kit, IAs, projeto), ligações rotuladas
// e a faixa das fases; abaixo, a mesma informação em lista (leitores de tela; acordeão no celular).
// O HTML do servidor é o diagrama estático (UI-09.default/semJs). Hidratada, a ilha deixa ativar um bloco
// — clique, toque, Enter ou Espaço — e mostra o caminho de /sdd-prd em "Ver o fluxo" (UI-09.fluxo).
import { useEffect, useRef, useState } from 'preact/hooks';
import {
  BOXES, BOX_H, COLUMNS, EDGES, EDGE_TAGS, FLOW, PHASES_Y, PHASE_GAP, PHASE_W, VIEW_H, VIEW_W,
  edgePath, linkedBlocks, linkedEdges, type BlockId, type ColumnId, type EdgeLabel,
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
export type MotionLabels = { pause: string; resume: string; replay: string };

type Props = { labels: ArchLabels; phases: { name: string }[]; motion: MotionLabels };
type Flow = { step: number; running: boolean; paused: boolean } | null;

const pad = (n: number) => String(n).padStart(2, '0');
const DOC_FOLDERS = ['architecture/', 'prds/', 'prototype/', 'plans/', 'reviews/', 'traceability/'];
const FLOW_STEP_MS = 1200; // 5 passos ≈ 6 s
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ArchitectureIsland({ labels, phases, motion }: Props) {
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<BlockId | null>(null);
  const [flow, setFlow] = useState<Flow>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => setReady(true), []);

  // Avança o fluxo um passo por vez enquanto não estiver pausado.
  useEffect(() => {
    if (!flow?.running || flow.paused) return;
    if (flow.step >= FLOW.length - 1) {
      setFlow({ ...flow, running: false });
      return;
    }
    const timer = window.setTimeout(() => setFlow({ ...flow, step: flow.step + 1 }), FLOW_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [flow]);

  const select = (id: BlockId) => {
    setFlow(null);
    setSelected((current) => (current === id ? null : id));
  };
  const startFlow = () => {
    setSelected(null);
    // Movimento reduzido: todos os passos numerados de uma vez (UI-09.reduzido).
    setFlow(reducedMotion() ? { step: FLOW.length - 1, running: false, paused: false } : { step: 0, running: true, paused: false });
  };
  const togglePause = () => flow && setFlow({ ...flow, paused: !flow.paused });

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setSelected(null);
      setFlow(null);
    }
  };

  // Estado de cada bloco e ligação: selecionado/ligado/esmaecido, ou o passo do fluxo.
  const flowBlocks = flow ? FLOW.slice(0, flow.step + 1).map((s) => s.block) : [];
  const flowEdges = flow ? FLOW.slice(0, flow.step + 1).flatMap((s) => (s.edge ? [s.edge] : [])) : [];
  const near = selected ? linkedBlocks(selected) : null;
  const nearEdges = selected ? linkedEdges(selected) : null;

  const blockState = (id: BlockId) => {
    if (flow) return flowBlocks.includes(id) ? (FLOW[flow.step].block === id ? 'current' : 'done') : 'dim';
    if (!selected) return undefined;
    return id === selected ? 'selected' : near!.has(id) ? 'linked' : 'dim';
  };
  const edgeState = (id: string) => {
    if (flow) return flowEdges.includes(id) ? 'linked' : 'dim';
    if (!nearEdges) return undefined;
    return nearEdges.includes(id) ? 'linked' : 'dim';
  };
  const tagState = (edges: string[]) => {
    const states = edges.map(edgeState);
    if (!states[0]) return undefined;
    return states.includes('linked') ? 'linked' : 'dim';
  };
  const flowIndex = (id: BlockId) => FLOW.findIndex((s) => s.block === id);

  const current = selected ? labels.blocks[selected] : null;
  const flowState = !flow ? 'idle' : flow.paused ? 'paused' : flow.running ? 'running' : 'done';

  return (
    <div class="arch" data-arch data-hydrated={ready ? 'true' : undefined} data-selected={selected ?? undefined} data-flow={flowState} ref={root} onKeyDown={onKey}>
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
              <path class="arch__edge" d={edgePath(edge)} data-edge={edge.id} data-state={edgeState(edge.id)} />
            ))}
            {EDGE_TAGS.map((tag) => (
              <text
                class="arch__edge-tag"
                x={tag.x}
                y={tag.y}
                text-anchor={tag.anchor}
                transform={tag.rotate ? `rotate(-90 ${tag.x} ${tag.y})` : undefined}
                data-edges={tag.edges.join(' ')}
                data-state={tagState(tag.edges)}
              >
                {labels.edges[tag.label]}
              </text>
            ))}
          </g>

          {BOXES.map((b) => {
            const block = labels.blocks[b.id];
            const mono = b.column === 'project';
            const step = flowIndex(b.id);
            const state = blockState(b.id);
            return (
              <g
                class="arch__block"
                data-block={b.id}
                data-inverted={b.id === 'agents' ? 'true' : undefined}
                data-state={state}
                role={ready ? 'button' : undefined}
                tabindex={ready ? 0 : undefined}
                aria-pressed={ready ? selected === b.id : undefined}
                aria-label={ready ? `${block.title} — ${block.sub}` : undefined}
                onClick={ready ? () => select(b.id) : undefined}
                onKeyDown={
                  ready
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          select(b.id);
                        }
                      }
                    : undefined
                }
              >
                <rect class="arch__ring" x={b.x - 5} y={b.y - 5} width={b.w + 10} height={b.h + 10} />
                <rect class="arch__box" x={b.x} y={b.y} width={b.w} height={b.h} />
                <text class={`arch__title${mono ? ' arch__title--mono' : ''}`} x={b.x + 16} y={b.y + 27}>
                  {block.title}
                </text>
                <text class="arch__sub" x={b.x + 16} y={b.y + 48}>
                  {block.sub}
                </text>
                {b.id === 'docs' &&
                  DOC_FOLDERS.map((folder, i) => (
                    <text class="arch__folder" data-folder={folder} x={b.x + 16 + (i % 2) * 112} y={b.y + 72 + Math.floor(i / 2) * 16}>
                      {folder}
                    </text>
                  ))}
                {step >= 0 && (
                  <g class="arch__badge" aria-hidden="true">
                    <rect x={b.x + b.w - 30} y={b.y + 8} width={22} height={22} />
                    <text x={b.x + b.w - 19} y={b.y + 24} text-anchor="middle">
                      {step + 1}
                    </text>
                  </g>
                )}
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

        <aside class="arch__panel" data-arch-panel>
          <div class="arch__controls">
            <button type="button" class="arch__flow-button" data-flow-start disabled={!ready} onClick={startFlow}>
              <span class="arch__flow-mark" aria-hidden="true" />
              {labels.flow.button}
            </button>
            <div class="motion-controls" hidden={!flow || flowState === 'idle'}>
              <button
                type="button"
                class="icon-button"
                data-flow-toggle
                aria-label={flow?.paused ? motion.resume : motion.pause}
                disabled={!flow?.running}
                onClick={togglePause}
              >
                {flow?.paused ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M6 3l14 9-14 9z" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M7 4h3v16H7zM14 4h3v16h-3z" /></svg>
                )}
              </button>
              <button type="button" class="icon-button" data-flow-replay aria-label={motion.replay} onClick={startFlow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /></svg>
              </button>
            </div>
          </div>

          {flow ? (
            <div class="arch__detail" data-detail="flow">
              <h3 class="arch__detail-title">{labels.flow.title}</h3>
              <ol class="arch__steps" role="list">
                {labels.flow.steps.map((text, i) => (
                  <li class="arch__step" data-step-state={i < flow.step ? 'done' : i === flow.step ? 'current' : 'pending'}>
                    <span class="arch__step-num tabular">{i + 1}</span>
                    {text}
                  </li>
                ))}
              </ol>
            </div>
          ) : current ? (
            <div class="arch__detail" data-detail={selected}>
              <h3 class="arch__detail-title">{current.title}</h3>
              <p class="arch__detail-sub">{current.sub}</p>
              <p class="arch__detail-text">{current.text}</p>
              <p class="label">{labels.panel.files}</p>
              <ul class="arch__files" role="list">
                {current.files.map((file) => (
                  <li>
                    <code>{file}</code>
                  </li>
                ))}
              </ul>
              <p class="label">{labels.panel.command}</p>
              {current.command ? <code class="chip arch__command">{current.command}</code> : <p class="arch__detail-sub">{labels.panel.noCommand}</p>}
            </div>
          ) : (
            <p class="arch__hint">{labels.panel.hint}</p>
          )}
          <p class="visually-hidden" aria-live="polite" data-arch-live>
            {flow ? `${flow.step + 1}. ${labels.flow.steps[flow.step]}` : current ? `${current.title}: ${current.text}` : ''}
          </p>
        </aside>
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
