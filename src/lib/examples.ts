// Acesso às duas demandas fictícias (ADR-006). Os IDs vêm escritos uma única vez nos JSON;
// aqui só se escolhe o idioma dos textos.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type Example = CollectionEntry<'examples'>['data'] & { slug: string };
export type Localized = { 'pt-BR': string; en: string };

export async function getExamples(): Promise<Example[]> {
  const entries = await getCollection('examples');
  return entries.map((entry) => ({ ...entry.data, slug: entry.id })).sort((a, b) => a.order - b.order);
}

export function pick(text: Localized, locale: Locale): string {
  return text[locale];
}
