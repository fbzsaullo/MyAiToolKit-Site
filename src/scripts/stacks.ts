// UI-10.default: as ligações do AGENTS.md para cada IA acendem em sequência quando a seção entra na tela.
// Sem JS ou com movimento reduzido, tudo já aparece aceso (UI-10.reduzido).
import { onceVisible, prefersReducedMotion } from '../lib/motion';

export function setupStacks() {
  const hub = document.querySelector<HTMLElement>('[data-hub]');
  if (!hub || prefersReducedMotion()) return;
  if (hub.getBoundingClientRect().top < window.innerHeight) return; // já visível: fica aceso
  hub.dataset.state = 'pending';
  onceVisible(hub, () => (hub.dataset.state = 'lit'), 0.4);
}
