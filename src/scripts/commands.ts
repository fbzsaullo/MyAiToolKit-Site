// Prévia dos comandos (UI-07.previa): abre com hover ou foco só por CSS. Este script só garante que
// a prévia possa ser dispensada com Esc sem mover o foco nem o ponteiro (WCAG 1.4.13).
export function setupCommands(root: ParentNode = document) {
  for (const card of root.querySelectorAll<HTMLElement>('[data-command]')) {
    const reset = () => delete card.dataset.dismissed;
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') card.dataset.dismissed = 'true';
    });
    card.addEventListener('mouseleave', reset);
    card.addEventListener('focusout', reset);
  }
}
