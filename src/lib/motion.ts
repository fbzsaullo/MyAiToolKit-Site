// Utilitários de movimento compartilhados (ADR-004). Toda animação consulta `prefersReducedMotion()`
// antes de começar; com movimento reduzido, o conteúdo final aparece pronto.
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Dispara `start` uma única vez, quando o elemento entra na tela.
export function onceVisible(element: Element, start: () => void, threshold = 0.3) {
  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    },
    { threshold },
  );
  observer.observe(element);
}
