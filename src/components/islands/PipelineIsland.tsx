// UI-05 — Como funciona. A mesma marcação serve de camada estática (renderizada no servidor) e de ilha:
// sem JS, as duas demandas aparecem completas em sequência; com JS, uma por vez (seletor em abas),
// a fase ativa acompanha a rolagem e o documento de cada fase "se escreve" ao chegar nela.
import { useEffect, useRef, useState } from 'preact/hooks';
import { inView } from 'motion';
import { animate } from 'motion/mini';
import PhaseIcon from '../PhaseIcon';
import type { PipelineDemand } from '../../lib/pipeline';

export type PipelineLabels = {
  selectorLabel: string;
  phaseLabel: string;
  command: string;
  input: string;
  document: string;
  ids: string;
  parent: string;
  optional: string;
  notUsed: string;
  entry: string;
  trackLabel: string;
  phases: { name: string }[];
};

type Props = { demands: PipelineDemand[]; labels: PipelineLabels };

const pad = (n: number) => String(n).padStart(2, '0');
const EASE = [0.2, 0, 0, 1] as const;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Escreve o documento linha a linha e faz os IDs surgirem, ligados ao pai (400–700 ms por bloco).
function writePhase(phase: HTMLElement) {
  if (phase.dataset.pending !== 'true') return;
  phase.dataset.pending = 'false';
  const lines = [...phase.querySelectorAll<HTMLElement>('.phase__doc-line')];
  const ids = [...phase.querySelectorAll<HTMLElement>('.phase__id')];
  lines.forEach((line, i) => {
    animate(line, { opacity: [0, 1], clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 0.45, delay: i * 0.12, ease: EASE });
  });
  const after = lines.length * 0.12 + 0.2;
  ids.forEach((id, i) => {
    animate(id, { opacity: [0, 1], transform: ['translateY(4px)', 'none'] }, { duration: 0.4, delay: after + i * 0.1, ease: EASE });
  });
  phase.dataset.written = 'true';
}

export default function PipelineIsland({ demands, labels }: Props) {
  const [selected, setSelected] = useState(demands[0]?.slug);
  const entryOf = (slug?: string) => demands.find((d) => d.slug === slug)?.entryPhase ?? 1;
  const [active, setActive] = useState<number>(entryOf(demands[0]?.slug));
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (slug: string, focus = false) => {
    setSelected(slug);
    setActive(entryOf(slug));
    if (focus) tabs.current[demands.findIndex((d) => d.slug === slug)]?.focus();
  };

  // Teclado das abas (padrão ARIA, ativação automática).
  const onTabKey = (event: KeyboardEvent, index: number) => {
    const last = demands.length - 1;
    const next =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    select(demands[next].slug, true);
  };

  // Marca a hidratação (só no navegador) — útil para testes e para estilos que dependem da ilha.
  useEffect(() => {
    if (root.current) root.current.dataset.hydrated = "true";
  }, []);

  // Fase ativa e escrita conforme a rolagem — só na demanda visível.
  useEffect(() => {
    const panel = root.current?.querySelector<HTMLElement>(`[data-demand="${selected}"]`);
    if (!panel) return;
    const phases = [...panel.querySelectorAll<HTMLElement>('.phase')];
    const animated = !reducedMotion();

    if (animated) {
      // O que ainda está abaixo do meio da tela espera para "se escrever" (só opacidade: sem salto de layout).
      for (const phase of phases) {
        if (phase.dataset.written === 'true') continue;
        const pending = phase.getBoundingClientRect().top > window.innerHeight * 0.5;
        phase.dataset.pending = pending ? 'true' : 'false';
        if (!pending) phase.dataset.written = 'true';
      }
    }

    const stops = phases.map((phase) =>
      inView(
        phase,
        () => {
          // Fase não usada nesta demanda nunca vira a ativa (ex.: fase 1 da opção B).
          if (phase.dataset.used === "false") return;
          setActive(Number(phase.dataset.phase));
          if (animated) writePhase(phase);
        },
        { margin: '-45% 0px -45% 0px' },
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, [selected]);

  return (
    <div class="pipeline" data-pipeline ref={root}>
      <div class="pipeline__tabs" role="tablist" aria-label={labels.selectorLabel}>
        {demands.map((demand, index) => (
          <button
            type="button"
            role="tab"
            ref={(el) => (tabs.current[index] = el)}
            id={`pipeline-tab-${demand.slug}`}
            aria-controls={`pipeline-panel-${demand.slug}`}
            aria-selected={demand.slug === selected}
            tabIndex={demand.slug === selected ? 0 : -1}
            class="pipeline__tab"
            data-tab={demand.slug}
            onClick={() => select(demand.slug)}
            onKeyDown={(event) => onTabKey(event as unknown as KeyboardEvent, index)}
          >
            <span class="pipeline__tab-mark" aria-hidden="true" />
            {demand.tab}
          </button>
        ))}
      </div>

      {demands.map((demand) => {
        const isSelected = demand.slug === selected;
        return (
          <section
            class="pipeline__demand"
            id={`pipeline-panel-${demand.slug}`}
            role="tabpanel"
            aria-labelledby={`pipeline-tab-${demand.slug}`}
            data-demand={demand.slug}
            data-active={isSelected ? 'true' : undefined}
            hidden={typeof window !== 'undefined' && !isSelected ? true : undefined}
          >
            <header class="pipeline__demand-header">
              <h3 class="pipeline__demand-title">{demand.title}</h3>
              <p class="pipeline__demand-summary">{demand.summary}</p>
            </header>

            <div class="pipeline__layout">
              <ol class="pipeline__track" role="list" aria-label={labels.trackLabel}>
                {demand.phases.map((phase) => (
                  <li
                    class="pipeline__node"
                    data-node={phase.phase}
                    data-used={phase.used ? 'true' : 'false'}
                    data-optional={phase.phase === 3 ? 'true' : undefined}
                    data-active={isSelected && phase.phase === active ? 'true' : undefined}
                    aria-current={isSelected && phase.phase === active ? 'step' : undefined}
                  >
                    <span class="pipeline__node-box">
                      <PhaseIcon phase={phase.phase} size={20} />
                    </span>
                    <span class="pipeline__node-text">
                      <span class="label tabular">{pad(phase.phase)}</span>
                      <span class="pipeline__node-name">{labels.phases[phase.phase - 1].name}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <ol class="pipeline__phases" role="list">
                {demand.phases.map((phase) => {
                  const name = labels.phases[phase.phase - 1].name;
                  return (
                    <li
                      class="phase"
                      data-phase={phase.phase}
                      data-used={phase.used ? 'true' : 'false'}
                      data-optional={phase.phase === 3 ? 'true' : undefined}
                      data-active={isSelected && phase.phase === active ? 'true' : undefined}
                    >
                      <header class="phase__header">
                        <span class="phase__node" aria-hidden="true">
                          <PhaseIcon phase={phase.phase} size={20} />
                        </span>
                        <p class="label">
                          {labels.phaseLabel} <span class="tabular">{pad(phase.phase)}</span>
                        </p>
                        <h4 class="phase__name">{name}</h4>
                        {phase.phase === 3 && <span class="phase__tag">{labels.optional}</span>}
                        {!phase.used && <span class="phase__tag phase__tag--muted">{labels.notUsed}</span>}
                        {phase.phase === demand.entryPhase && (
                          <span class="phase__tag phase__tag--entry">
                            {labels.entry} · /sdd-start {demand.option}
                          </span>
                        )}
                      </header>

                      {phase.used && (
                        <dl class="phase__facts">
                          <div>
                            <dt class="label">{labels.command}</dt>
                            <dd>
                              <code class="chip chip--sdd">{phase.command}</code>
                            </dd>
                          </div>
                          <div>
                            <dt class="label">{labels.input}</dt>
                            <dd>{phase.input}</dd>
                          </div>
                        </dl>
                      )}

                      <figure class="phase__doc">
                        <figcaption class="phase__doc-path">
                          <span class="label">{labels.document}</span> <code>{phase.path}</code>
                        </figcaption>
                        <pre class="phase__doc-lines">
                          <code>
                            {phase.lines.map((line, index) => (
                              <span class="phase__doc-line" style={`--l: ${index}`}>
                                {line}
                                {'\n'}
                              </span>
                            ))}
                          </code>
                        </pre>
                      </figure>

                      {phase.ids.length > 0 && (
                        <div class="phase__ids">
                          <p class="label">{labels.ids}</p>
                          <ul class="phase__id-list" role="list">
                            {phase.ids.map((created, index) => (
                              <li class="phase__id" style={`--k: ${index}`} data-id={created.id} data-parent={created.parent ?? undefined}>
                                <span class="id-tag">{created.id}</span>
                                <span class="phase__id-label">{created.label}</span>
                                {created.parent && (
                                  <span class="phase__id-parent">
                                    <span class="phase__id-link" aria-hidden="true" />
                                    {labels.parent} <span class="id-tag id-tag--muted">{created.parent}</span>
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        );
      })}
    </div>
  );
}
