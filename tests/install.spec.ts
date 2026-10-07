import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';

const KIT = process.env.KIT_PATH ?? '../MyAiToolKit';
const kitText = (path: string) => {
  try {
    return readFileSync(`${KIT}/${path}`, 'utf8');
  } catch {
    return null;
  }
};

test('CA-19: abas de instalação', async ({ browser }) => {
  const page = await visit(browser);
  const section = page.locator('#instalar');
  const tablist = section.getByRole('tablist', { name: 'IA de programação' });
  const tab = (name: string) => tablist.getByRole('tab', { name });

  // Padrão ARIA: Claude Code selecionada; setas, Home e End trocam e levam o foco.
  await expect(tab('Claude Code')).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel')).toHaveCount(1);
  await tab('Claude Code').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Codex')).toBeFocused();
  await expect(tab('Codex')).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel', { name: 'Codex' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Outras IAs')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(tab('Claude Code')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(tab('Outras IAs')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tab('Claude Code')).toBeFocused();
  await expect(tab('Codex')).toHaveAttribute('tabindex', '-1');

  // Comandos exatamente os do kit (RN-03).
  const claude = section.locator('#instalar-painel-claude');
  const claudeCode = await claude.locator('pre code').allTextContents();
  expect(claudeCode).toEqual([
    'git clone https://github.com/fbzsaullo/MyAiToolKit.git MyAiToolKit\nclaude plugin marketplace add ./MyAiToolKit\nclaude plugin install my-ai-toolkit@my-ai-toolkit',
    'claude plugin marketplace update my-ai-toolkit',
  ]);
  const readme = kitText('README.md');
  if (readme) {
    for (const line of ['claude plugin marketplace add ./MyAiToolKit', 'claude plugin install my-ai-toolkit@my-ai-toolkit', './MyAiToolKit/adapters/codex/install.sh --scope user', './MyAiToolKit/adapters/codex/install.ps1 -Scope user']) {
      expect(readme).toContain(line);
    }
    expect(kitText('adapters/claude-code/README.md')).toContain('claude plugin marketplace update my-ai-toolkit');
  }
  await tab('Codex').click();
  await expect(section.locator('#instalar-painel-codex pre code')).toHaveText([
    'git clone https://github.com/fbzsaullo/MyAiToolKit.git MyAiToolKit\n./MyAiToolKit/adapters/codex/install.sh --scope user',
    './MyAiToolKit/adapters/codex/install.ps1 -Scope user',
  ]);
  await tab('Outras IAs').click();
  const others = section.locator('#instalar-painel-others');
  await expect(others.getByRole('link', { name: 'adapters/README.md' })).toBeVisible();
  await expect(others.locator('[data-next-adapters] li')).toHaveText(['Cursor', 'Gemini CLI', 'GitHub Copilot']);
  await expect(others).toContainText('Ainda não suportados');

  // Primeiro uso: /sdd-setup e depois /sdd-start.
  await expect(section.locator('[data-first-use] pre code')).toHaveText('/sdd-setup\n/sdd-start');

  expect(await axeViolations(page)).toEqual([]);
});

test('CA-20: copiar um comando', async ({ browser }) => {
  const page = await visit(browser);
  // Registra o que a página entrega à área de transferência (a do sistema é compartilhada entre os testes).
  await page.evaluate(() => {
    const w = window as unknown as { __copied: string[] };
    w.__copied = [];
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => (w.__copied.push(text), Promise.resolve()) } });
  });
  const block = page.locator('#instalar-painel-claude [data-code-block]').first();
  await block.scrollIntoViewIfNeeded();
  const button = block.locator('[data-copy]');
  await expect(button).toHaveAccessibleName('Copiar');
  const shown = await block.locator('pre code').textContent();

  // ■ antes; ✓ depois (o quadrado esvazia e o traço do ✓ aparece).
  const mark = button.locator('.code-block__mark');
  await expect(mark).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await button.click();
  // A área de transferência recebe exatamente o texto exibido (RN-15).
  expect(await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied)).toEqual([shown]);
  await expect(button).toHaveAttribute('data-state', 'copied');
  await expect(button).toContainText('Copiado');
  await expect(mark).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect(await mark.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('""');
  await expect(block.getByRole('status')).toHaveText('Copiado');
  // Volta ao estado inicial depois de 2 s.
  await expect(button).not.toHaveAttribute('data-state', 'copied', { timeout: 4000 });
  await expect(button).toContainText('Copiar');
});

test('copiar sem permissão seleciona o texto', async ({ browser }) => {
  const page = await visit(browser);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) } });
  });
  const block = page.locator('[data-first-use] [data-code-block]');
  await block.scrollIntoViewIfNeeded();
  await block.getByRole('button', { name: 'Copiar' }).click();
  await expect(block.getByRole('status')).toHaveText('Selecionado — use Ctrl+C');
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('/sdd-setup\n/sdd-start');
});

test('instalação sem JavaScript: painéis em sequência, sem copiar', async ({ browser }) => {
  const page = await visit(browser, { javaScriptEnabled: false });
  const section = page.locator('#instalar');
  await expect(section.locator('.install__tabs')).toBeHidden();
  for (const id of ['claude', 'codex', 'others']) await expect(section.locator(`#instalar-painel-${id}`)).toBeVisible();
  await expect(section.locator('.install__panel-title')).toHaveText(['Claude Code', 'Codex', 'Outras IAs']);
  await expect(section.locator('.code-block__copy').first()).toBeHidden();
  await expect(section.getByRole('tab')).toHaveCount(0);
});
