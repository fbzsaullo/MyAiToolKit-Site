// Referência dos comandos (UI-07, RN-04). Os nomes e as chamadas vêm do snapshot do kit (ADR-007);
// aqui só se decide em que grupo cada um aparece. Se o kit ganhar ou perder um comando, o build falha.
import kit from '../data/kit.json';

export type CommandGroup = 'fases' | 'navegacao' | 'mudanca' | 'apoio';
export type KitCommand = { name: string; claude: string; codex: string };

export const GROUPS: Record<CommandGroup, string[]> = {
  fases: ['sdd-architect', 'sdd-prd', 'sdd-prototype', 'sdd-plan', 'sdd-execute', 'sdd-review'],
  navegacao: ['sdd-start', 'sdd-next', 'sdd-trace'],
  mudanca: ['sdd-change', 'sdd-bug', 'sdd-adr'],
  apoio: ['sdd-setup', 'spike', 'code-review', 'commit-message', 'pr-description'],
};

// No Claude Code, o code-review do kit é chamado pelo nome do plugin, para não colidir com o nativo.
const CLAUDE_OVERRIDE: Record<string, string> = { 'code-review': '/my-ai-toolkit:code-review' };

export function commandGroups(): { group: CommandGroup; commands: KitCommand[] }[] {
  const byName = new Map(kit.commands.map((c) => [c.name, c]));
  const grouped = Object.values(GROUPS).flat();
  const missing = kit.commands.map((c) => c.name).filter((name) => !grouped.includes(name));
  const unknown = grouped.filter((name) => !byName.has(name));
  if (missing.length || unknown.length) {
    throw new Error(`Comandos fora de sincronia com o kit — sem grupo: ${missing.join(', ') || '—'}; fora do kit: ${unknown.join(', ') || '—'}`);
  }
  return (Object.keys(GROUPS) as CommandGroup[]).map((group) => ({
    group,
    commands: GROUPS[group].map((name) => {
      const command = byName.get(name)!;
      return { name, claude: CLAUDE_OVERRIDE[name] ?? command.claude, codex: command.codex };
    }),
  }));
}
