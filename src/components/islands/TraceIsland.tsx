// UI-06 — Rastreabilidade. A cadeia de um requisito e a mini matriz no estilo /sdd-trace.
// O HTML do servidor já traz tudo (sem JS: cadeia e matriz completas, sem destaque). Com JS, focar ou
// clicar um ID da cadeia ou uma regra da matriz destaca o que se liga a ele e esmaece o resto (CA-12).
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { linkGroups, linkedKeys, type TraceData, type TraceNode } from '../../lib/trace';

export type TraceLabels = {
  chainLabel: string;
  matrixLabel: string;
  matrixCaption: string;
  columns: { rn: string; rule: string; ca: string; ui: string; t: string; test: string };
  kinds: Record<TraceNode['kind'], string>;
  none: string;
  brokenLabel: string;
  status: string;
  cleared: string;
};

type Props = { data: TraceData; labels: TraceLabels };

export default function TraceIsland({ data, labels }: Props) {
  const groups = useMemo(() => linkGroups(data), [data]);
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const linked = useMemo(() => (selected ? linkedKeys(groups, selected) : null), [groups, selected]);

  // Os botões só respondem depois da hidratação; antes disso (ou sem JS) ficam inertes.
  useEffect(() => setReady(true), []);

  const state = (key: string) => (!linked ? undefined : key === selected ? 'selected' : linked.has(key) ? 'linked' : 'dim');

  const onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !root.current?.contains(next)) setSelected(null);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setSelected(null);
  };

  const toggle = (item: TraceNode, extra = '') => (
    <button
      type="button"
      class={`id-tag trace__id ${extra}`.trim()}
      data-key={item.key}
      data-state={state(item.key)}
      aria-pressed={ready ? selected === item.key : undefined}
      disabled={!ready}
      onFocus={() => setSelected(item.key)}
      onClick={() => setSelected(item.key)}
    >
      {item.id}
    </button>
  );

  const tag = (item: TraceNode) => (
    <span class="id-tag trace__tag" data-key={item.key} data-state={state(item.key)}>
      {item.id}
    </span>
  );

  const cell = (items: TraceNode[]) =>
    items.length ? <span class="trace__cell-ids">{items.map(tag)}</span> : <span class="trace__none">{labels.none}</span>;

  const selectedId = selected ? [...data.chain, ...data.matrix.map((r) => r.rn)].find((n) => n.key === selected)?.id : null;
  const status = selected && linked ? labels.status.replace('{id}', selectedId ?? selected).replace('{n}', String(linked.size - 1)) : '';

  return (
    <div class="trace" data-trace data-hydrated={ready ? 'true' : undefined} data-selected={selected ?? undefined} ref={root} onFocusOut={onBlur} onKeyDown={onKey}>
      <figure class="trace__chain-figure">
        <figcaption class="label">{labels.chainLabel}</figcaption>
        <ol class="trace__chain" role="list">
          {data.chain.map((item, index) => (
            <li class="trace__step" data-kind={item.kind} data-state={state(item.key)}>
              {index > 0 && <span class="trace__link" aria-hidden="true" data-state={state(item.key)} />}
              <span class="trace__step-body">
                <span class="label trace__kind">{labels.kinds[item.kind]}</span>
                {toggle(item)}
                <span class="trace__step-label">{item.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </figure>

      <figure class="trace__matrix-figure">
        <figcaption class="label">{labels.matrixLabel}</figcaption>
        <div class="trace__scroll" tabIndex={0} role="region" aria-label={labels.matrixLabel}>
          <table class="trace__matrix">
            <caption class="visually-hidden">{labels.matrixCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{labels.columns.rn}</th>
                <th scope="col">{labels.columns.rule}</th>
                <th scope="col">{labels.columns.ca}</th>
                <th scope="col">{labels.columns.ui}</th>
                <th scope="col">{labels.columns.t}</th>
                <th scope="col">{labels.columns.test}</th>
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr data-row={row.rn.id} data-broken={row.broken ? 'true' : undefined}>
                  <th scope="row">{toggle(row.rn)}</th>
                  <td>{row.rule}</td>
                  <td>{cell(row.ca)}</td>
                  <td>{cell(row.ui)}</td>
                  <td>{cell(row.tasks)}</td>
                  <td>
                    {row.broken ? (
                      <span class="trace__broken" data-broken-link>
                        <span class="trace__broken-line" aria-hidden="true" />
                        <span class="trace__none">—</span>
                        <span class="trace__broken-label">
                          <span class="visually-hidden">{labels.brokenLabel}: </span>
                          {row.broken}
                        </span>
                      </span>
                    ) : (
                      cell(row.tests)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>

      <p class="visually-hidden" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
