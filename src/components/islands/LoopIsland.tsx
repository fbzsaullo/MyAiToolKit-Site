// UI-05.laco — Execução ⇄ Review. Cada tarefa passa por execução → review → ■; a que recebeu um
// apontamento volta uma vez antes de fechar. O HTML do servidor já é o estado final (sem JS e com
// movimento reduzido); com JS, a sequência roda uma vez ao entrar na tela, com pausar e repetir.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { inView } from 'motion';
import type { LoopTask } from '../../lib/pipeline';

export type LoopLabels = {
  title: string;
  intro: string;
  exec: string;
  review: string;
  done: string;
  pending: string;
  returned: string;
  label: string;
  summary: string;
};
export type MotionLabels = { pause: string; resume: string; replay: string };

type Stage = 'exec' | 'review' | 'finding' | 'done';
type Step = { task: number; stage: Stage };

const STEP_MS = 600;
const SEVERITY: Record<string, string> = { Bloqueante: '■■■', Importante: '■■□', Sugestão: '■□□' };

function buildTimeline(tasks: LoopTask[]): Step[] {
  const steps: Step[] = [];
  tasks.forEach((task, i) => {
    steps.push({ task: i, stage: 'exec' }, { task: i, stage: 'review' });
    if (task.finding) steps.push({ task: i, stage: 'finding' }, { task: i, stage: 'exec' }, { task: i, stage: 'review' });
    steps.push({ task: i, stage: 'done' });
  });
  return steps;
}

function stateAt(timeline: Step[], step: number, task: number) {
  let stage: Stage | 'pending' = 'pending';
  let returned = false;
  for (let s = 0; s <= step && s < timeline.length; s++) {
    if (timeline[s].task !== task) continue;
    stage = timeline[s].stage;
    if (stage === 'finding') returned = true;
  }
  return { stage, returned };
}

export function Loop({ tasks, labels, motion }: { tasks: LoopTask[]; labels: LoopLabels; motion: MotionLabels }) {
  const timeline = useMemo(() => buildTimeline(tasks), [tasks]);
  const last = timeline.length - 1;
  const [step, setStep] = useState(last);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [controls, setControls] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const play = () => {
    setStep(0);
    setPaused(false);
    setRunning(true);
  };

  useEffect(() => {
    if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return inView(root.current, () => {
      setControls(true);
      play();
      return undefined;
    }, { amount: 0.4 });
  }, []);

  useEffect(() => {
    if (!running || paused) return;
    if (step >= last) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, paused, step, last]);

  const state = running ? 'running' : paused ? 'paused' : step >= last ? 'done' : 'idle';
  const stageLabel = (stage: Stage | 'pending') =>
    stage === 'exec' ? labels.exec : stage === 'review' || stage === 'finding' ? labels.review : stage === 'done' ? labels.done : labels.pending;

  return (
    <div class="loop" ref={root} data-loop data-state={paused ? 'paused' : state}>
      <div class="loop__header">
        <div>
          <h4 class="loop__title">{labels.title}</h4>
          <p class="loop__intro">{labels.intro}</p>
        </div>
        <div class="motion-controls" hidden={!controls}>
          <button
            type="button"
            class="icon-button"
            data-loop-toggle
            aria-label={paused ? motion.resume : motion.pause}
            disabled={!running && !paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M6 3l14 9-14 9z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M7 4h3v16H7zM14 4h3v16h-3z" /></svg>
            )}
          </button>
          <button type="button" class="icon-button" data-loop-replay aria-label={motion.replay} onClick={play}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
        </div>
      </div>

      <ol class="loop__tasks" role="list" aria-hidden="true">
        {tasks.map((task, i) => {
          const { stage, returned } = stateAt(timeline, step, i);
          return (
            <li class="loop__task" data-task={task.id} data-stage={stage} data-returned={returned ? 'true' : undefined}>
              <span class="loop__box" />
              <span class="loop__id">{task.id}</span>
              <span class="loop__stage">{stageLabel(stage)}</span>
              {task.finding && (
                <span class="loop__finding" data-finding data-visible={returned ? 'true' : 'false'}>
                  <span class="loop__severity">{SEVERITY[task.finding.severity] ?? ''}</span> {task.finding.id}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div class="visually-hidden">
        <p>{labels.summary}</p>
        <ul>
          {tasks.map((task) => (
            <li>
              {task.id} — {task.title}: {labels.done}
              {task.finding ? `; ${labels.returned} ${task.finding.id} (${task.finding.severity}): ${task.finding.text}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
