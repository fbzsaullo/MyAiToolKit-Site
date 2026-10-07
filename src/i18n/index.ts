// Idiomas e rotas do site (ADR-008).
import ptBR from '../content/ui/pt-BR.json';
import en from '../content/ui/en.json';

export const LOCALES = ['pt-BR', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-BR';

const ui = { 'pt-BR': ptBR, en } as const;
export type UI = typeof ptBR;

export function t(locale: Locale): UI {
  return ui[locale];
}

// Caminho da página inicial em cada idioma.
export function homePath(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt-BR' : 'en';
}

// URL absoluta, a partir do `site` configurado no Astro.
export function absolute(site: URL | undefined, path: string): string {
  return new URL(path, site ?? 'https://myaitoolkit.netlify.app').toString();
}
