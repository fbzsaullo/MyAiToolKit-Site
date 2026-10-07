// Converte as demandas de exemplo (texto nos dois idiomas) para as props das ilhas, num idioma só.
// As ilhas recebem tudo pronto por props: nada de buscar conteúdo no cliente (ADR-003).
import type { Locale } from '../i18n';
import type { Example } from './examples';

export type PipelineId = { id: string; label: string; parent: string | null };
export type PipelinePhase = {
  phase: number;
  used: boolean;
  command: string;
  input: string;
  path: string;
  lines: string[];
  ids: PipelineId[];
  date: string;
};
export type LoopTask = { id: string; title: string; finding: { id: string; severity: string; text: string } | null };
export type PipelineDemand = {
  slug: string;
  option: 'A' | 'B';
  entryPhase: number;
  tab: string;
  title: string;
  summary: string;
  phases: PipelinePhase[];
  tasks: LoopTask[];
};

export function toPipelineDemands(examples: Example[], locale: Locale): PipelineDemand[] {
  return examples.map((example) => ({
    slug: example.slug,
    option: example.startOption,
    entryPhase: example.entryPhase,
    tab: example.tab[locale],
    title: example.title[locale],
    summary: example.summary[locale],
    phases: example.phases.map((phase) => ({
      phase: phase.phase,
      used: phase.used,
      command: phase.command,
      input: phase.input[locale],
      path: phase.document.path,
      lines: phase.document.lines.map((line) => line[locale]),
      ids: phase.ids.map((created) => ({ id: created.id, label: created.label[locale], parent: created.parent })),
      date: phase.date,
    })),
    tasks: example.loop.tasks.map((task) => ({
      id: task.id,
      title: task.title[locale],
      finding: task.finding ? { id: task.finding.id, severity: task.finding.severity, text: task.finding.text[locale] } : null,
    })),
  }));
}
