// UI-03: a coluna "pedido solto" alterna os três resultados uma vez (≤ 5 s) e termina com os três listados.
// Sem JS ou com movimento reduzido, a lista já aparece completa.
import { onceVisible, prefersReducedMotion } from '../lib/motion';

const STEP_MS = 1400;

export function setupProblem() {
  const list = document.querySelector<HTMLElement>('[data-problem-results]');
  if (!list || prefersReducedMotion()) return;
  const total = list.children.length * STEP_MS;
  onceVisible(list, () => {
    list.classList.add('is-cycling');
    list.dataset.state = 'running';
    window.setTimeout(() => {
      list.classList.remove('is-cycling');
      list.dataset.state = 'done';
    }, total);
  });
}
