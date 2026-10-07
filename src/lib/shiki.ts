// Realce de código no build com tema monocromático por variáveis CSS (ADR-005).
// Nenhuma cor sai daqui: o Shiki emite `var(--shiki-token-*)` e o CSS liga cada uma a um token.
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';

export type CodeLang = 'bash' | 'powershell' | 'yaml' | 'markdown' | 'gherkin' | 'ruby' | 'json' | 'text';

const theme = createCssVariablesTheme({
  name: 'matk-mono',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true,
});

let highlighter: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [theme],
    langs: ['bash', 'powershell', 'yaml', 'markdown', 'gherkin', 'ruby', 'json'],
  });
  return highlighter;
}

// Comandos do kit, sublinhados no código (identidade visual).
const COMMAND = /(\/(?:sdd-[a-z]+|spike|code-review|my-ai-toolkit:[a-z-]+|plugin)\b|\$(?:sdd-[a-z]+|spike|code-review)\b)/g;

export async function highlight(code: string, lang: CodeLang, highlightLines: number[] = []): Promise<string> {
  const shiki = await getHighlighter();
  const html = shiki.codeToHtml(code, {
    lang: lang === 'text' ? 'text' : lang,
    theme: 'matk-mono',
    transformers: [
      {
        pre(node) {
          // O fundo vem do CSS do bloco; o Shiki não define cor no <pre>.
          delete node.properties.style;
          node.properties.tabindex = '0';
        },
        line(node, line) {
          if (highlightLines.includes(line)) this.addClassToHast(node, 'is-highlighted');
        },
        span(node) {
          const style = String(node.properties.style ?? '');
          if (style.includes('--shiki-token-keyword')) this.addClassToHast(node, 'tk-keyword');
        },
      },
    ],
  });
  // Sublinha comandos só no texto (entre > e <), nunca em atributos.
  return html.replace(/>([^<]+)</g, (_, text: string) => `>${text.replace(COMMAND, '<span class="tk-cmd">$1</span>')}<`);
}
