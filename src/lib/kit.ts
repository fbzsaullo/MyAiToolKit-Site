// Fatos do kit lidos do snapshot (ADR-007, RN-19 do PRD-002). Os textos de interface não escrevem
// números sobre o kit: usam o marcador `{kit.commands}`, preenchido aqui no build.
import kit from '../data/kit.json';

export const KIT_VERSION = kit.version;
export const KIT_COMMANDS = kit.commands.length;

const MARKER = /\{kit\.commands\}/g;

// Preenche o marcador em qualquer texto, ou em todos os textos de um objeto de interface.
export function withKitFacts<T>(value: T): T {
  if (typeof value === 'string') return value.replace(MARKER, () => String(KIT_COMMANDS)) as T;
  if (Array.isArray(value)) return value.map((item) => withKitFacts(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withKitFacts(item)])) as T;
  }
  return value;
}
