// Abas no padrão ARIA (RN-10), sem framework: setas, Home e End, ativação automática.
// Sem JS, os painéis aparecem em sequência com os títulos; os papéis de aba só entram aqui.
export function setupTabs(root: ParentNode = document) {
  for (const container of root.querySelectorAll<HTMLElement>('[data-tabs]')) {
    const list = container.querySelector<HTMLElement>('[data-tab-list]');
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[data-tab]')];
    const panels = tabs.map((tab) => container.querySelector<HTMLElement>(`#${tab.getAttribute('aria-controls')}`)!);
    if (!list || tabs.length === 0) continue;

    list.setAttribute('role', 'tablist');
    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', tab.id);
      panels[i].tabIndex = 0;
    });

    const select = (index: number, focus = false) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
        if (active) panels[i].dataset.active = 'true';
        else delete panels[i].dataset.active;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        const next =
          event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
          : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
          : event.key === 'Home' ? 0
          : event.key === 'End' ? last
          : null;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });

    select(0);
  }
}
