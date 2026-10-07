// UI-05 — Como funciona. A mesma marcação serve de camada estática (renderizada no servidor) e de ilha:
// sem JS, as duas demandas aparecem completas em sequência; com JS, uma por vez (seletor em abas).
import { useState } from 'preact/hooks';
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

export default function PipelineIsland({ demands, labels }: Props) {
  const [selected, setSelected] = useState(demands[0]?.slug);

  return (
    <div class="pipeline" data-pipeline>
      <div class="pipeline__tabs" role="tablist" aria-label={labels.selectorLabel}>
        {demands.map((demand) => (
          <button
            type="button"
            role="tab"
            id={`pipeline-tab-${demand.slug}`}
            aria-controls={`pipeline-panel-${demand.slug}`}
            aria-selected={demand.slug === selected}
            tabIndex={demand.slug === selected ? 0 : -1}
            class="pipeline__tab"
            data-tab={demand.slug}
            onClick={() => setSelected(demand.slug)}
          >
            <span class="pipeline__tab-mark" aria-hidden="true" />
            {demand.tab}
          </button>
        ))}
      </div>

      {demands.map((demand) => (
        <section
          class="pipeline__demand"
          id={`pipeline-panel-${demand.slug}`}
          role="tabpanel"
          aria-labelledby={`pipeline-tab-${demand.slug}`}
          data-demand={demand.slug}
          data-active={demand.slug === selected ? 'true' : undefined}
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
                                  ← {labels.parent} <span class="id-tag id-tag--muted">{created.parent}</span>
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
      ))}
    </div>
  );
}
