import AxeBuilder from '@axe-core/playwright';
import type { Browser, Page } from '@playwright/test';

export type Visit = {
  path?: string;
  locale?: string;
  colorScheme?: 'light' | 'dark';
  reducedMotion?: 'reduce' | 'no-preference';
  javaScriptEnabled?: boolean;
  storage?: Record<string, string>;
  viewport?: { width: number; height: number };
};

// Abre o site num contexto novo, com idioma, tema, movimento e armazenamento controlados.
export async function visit(browser: Browser, options: Visit = {}): Promise<Page> {
  const context = await browser.newContext({
    baseURL: 'http://localhost:4321',
    locale: options.locale ?? 'pt-BR',
    colorScheme: options.colorScheme ?? 'light',
    reducedMotion: options.reducedMotion ?? 'no-preference',
    javaScriptEnabled: options.javaScriptEnabled ?? true,
    viewport: options.viewport,
  });
  if (options.storage) {
    const entries = Object.entries(options.storage);
    await context.addInitScript((pairs: [string, string][]) => {
      for (const [key, value] of pairs) window.localStorage.setItem(key, value);
    }, entries);
  }
  const page = await context.newPage();
  await page.goto(options.path ?? '/');
  return page;
}

// Violações de WCAG 2.2 A e AA na página atual.
export async function axeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return result.violations;
}
