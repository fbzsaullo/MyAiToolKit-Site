// Comportamento do cabeçalho e do rodapé: tema, idioma, menu do celular e seção ativa.
// Preferências ficam só no navegador (localStorage), sem cookie (RN-09).

type ThemeChoice = 'system' | 'light' | 'dark';
const THEME_KEY = 'matk-theme';
const LANG_KEY = 'matk-lang';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* armazenamento bloqueado: a escolha vale só nesta página */
  }
}

function currentTheme(): ThemeChoice {
  const saved = read(THEME_KEY);
  return saved === 'light' || saved === 'dark' ? saved : 'system';
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  write(THEME_KEY, choice === 'system' ? null : choice);
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.setAttribute('aria-label', button.dataset[`label${choice[0].toUpperCase()}${choice.slice(1)}`] ?? '');
    for (const icon of button.querySelectorAll<HTMLElement>('[data-theme-icon]')) {
      icon.hidden = icon.dataset.themeIcon !== choice;
    }
  }
}

const NEXT: Record<ThemeChoice, ThemeChoice> = { system: 'light', light: 'dark', dark: 'system' };

function setupTheme() {
  applyTheme(currentTheme());
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.addEventListener('click', () => applyTheme(NEXT[currentTheme()]));
  }
}

function setupLanguage() {
  // A escolha manual é gravada antes de navegar e sempre vence a detecção (ADR-008).
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-lang]')) {
    link.addEventListener('click', () => write(LANG_KEY, link.dataset.lang ?? null));
  }
}

function setupMenu() {
  const menu = document.querySelector<HTMLDetailsElement>('[data-menu]');
  if (!menu) return;
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
  menu.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) menu.open = false;
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
  });
}

function setupActiveSection() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.site-header__links [data-nav]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) {
          if (link.dataset.nav === entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  for (const link of links) {
    const section = document.getElementById(link.dataset.nav ?? '');
    if (section) observer.observe(section);
  }
}

export function setupHeader() {
  setupTheme();
  setupLanguage();
  setupMenu();
  setupActiveSection();
}
