// Animação do hero (UI-02): roda uma vez ao entrar na tela, com pausar e repetir.
// Com movimento reduzido, não roda: o estado padrão do HTML já é o final.
import { onceVisible, prefersReducedMotion } from '../lib/motion';

const DURATION_MS = 7000;

export function setupHero() {
  const demo = document.querySelector<HTMLElement>('[data-hero-demo]');
  if (!demo || prefersReducedMotion()) return;

  const controls = demo.querySelector<HTMLElement>('[data-motion-controls]');
  const toggle = demo.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const replay = demo.querySelector<HTMLButtonElement>('[data-motion-replay]');
  let timer: number | undefined;
  let remaining = DURATION_MS;
  let startedAt = 0;

  const setPaused = (paused: boolean) => {
    demo.classList.toggle('is-paused', paused);
    if (!toggle) return;
    toggle.setAttribute('aria-label', (paused ? toggle.dataset.labelResume : toggle.dataset.labelPause) ?? '');
    toggle.querySelector<HTMLElement>('[data-when="running"]')!.hidden = paused;
    toggle.querySelector<HTMLElement>('[data-when="paused"]')!.hidden = !paused;
  };

  const finish = () => {
    demo.classList.remove('is-animating');
    setPaused(false);
    demo.dataset.state = 'done';
  };

  const schedule = (ms: number) => {
    window.clearTimeout(timer);
    startedAt = performance.now();
    remaining = ms;
    timer = window.setTimeout(finish, ms);
  };

  const start = () => {
    demo.classList.remove('is-animating');
    void demo.offsetWidth; // reinicia as animações CSS
    demo.classList.add('is-animating');
    demo.dataset.state = 'running';
    setPaused(false);
    if (controls) controls.hidden = false;
    schedule(DURATION_MS);
  };

  toggle?.addEventListener('click', () => {
    if (!demo.classList.contains('is-animating')) return;
    const paused = !demo.classList.contains('is-paused');
    setPaused(paused);
    if (paused) {
      window.clearTimeout(timer);
      remaining -= performance.now() - startedAt;
      demo.dataset.state = 'paused';
    } else {
      demo.dataset.state = 'running';
      schedule(remaining);
    }
  });
  replay?.addEventListener('click', start);

  onceVisible(demo, start);
}
