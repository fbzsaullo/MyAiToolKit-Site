// Botão copiar dos blocos de código (RN-15): copia exatamente o texto exibido e dá retorno ■ → ✓.
// Sem permissão de área de transferência, seleciona o texto para cópia manual.

const RESET_MS = 2000;

function selectText(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

async function copy(button: HTMLButtonElement) {
  const block = button.closest<HTMLElement>('[data-code-block]');
  const code = block?.querySelector('pre code');
  const status = block?.querySelector<HTMLElement>('[role="status"]');
  const label = button.querySelector<HTMLElement>('.code-block__copy-text');
  if (!block || !code || !label) return;

  const text = code.textContent ?? '';
  try {
    await navigator.clipboard.writeText(text);
    button.dataset.state = 'copied';
    label.textContent = button.dataset.copied ?? '';
    if (status) status.textContent = button.dataset.copied ?? '';
  } catch {
    selectText(code);
    button.dataset.state = 'failed';
    if (status) status.textContent = status.dataset.failed ?? '';
    label.textContent = status?.dataset.failed ?? '';
  }

  window.setTimeout(() => {
    delete button.dataset.state;
    label.textContent = button.dataset.label ?? '';
    if (status) status.textContent = '';
  }, RESET_MS);
}

export function setupCopyButtons() {
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy]');
    if (button) void copy(button);
  });
}
