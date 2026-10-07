# ADR-004: Animar com Motion e CSS, sempre de forma progressiva e desligável

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

As animações do site explicam algo (digitação do terminal, árvore de pastas sendo criada, rolagem conduzida do pipeline, laço execução ⇄ review, cadeia de rastreabilidade, fluxo do diagrama). Regras definidas: 150–200 ms nas interações, 400–700 ms nas explicativas, curva `cubic-bezier(0.2, 0, 0, 1)`, digitação com `steps()`, uma execução ao entrar na tela, pausa e repetição em animações com mais de 5 s e `prefers-reduced-motion` desligando todo movimento. A rolagem conduzida exige sincronizar a fase ativa com a posição da página.

## Decisão

- **CSS** para tudo o que é simples: transições de interação, digitação com `steps()`, linhas desenhadas com `stroke-dashoffset`, preenchimento □ → ■.
- **Motion** (motion.dev), importado função a função (`animate`, `scroll`, `inView`), **somente dentro das ilhas** (ADR-003), para a rolagem conduzida do pipeline, o laço de tarefas e o fluxo do diagrama.
- A rolagem conduzida usa `position: sticky` no desktop; no celular não há rolagem presa — cada fase acende ao chegar ao centro da tela.
- Com `prefers-reduced-motion: reduce`, nenhuma animação roda: o conteúdo final aparece pronto. Os botões de pausar e repetir existem mesmo sem essa preferência.

## Motivos

- Motion é modular e menor que GSAP com ScrollTrigger para o que precisamos, e usa a Web Animations API do navegador.
- Deixar a maior parte em CSS reduz JavaScript e funciona antes da hidratação.
- `position: sticky` mantém a página rolando normalmente; nada sequestra o scroll.

## Opções descartadas

### GSAP + ScrollTrigger
- **Em resumo:** a referência em animação dirigida por rolagem.
- **Por que não:** mais pesado para o escopo, e o pin do ScrollTrigger manipula o layout de um jeito que complica o CLS e o modo de movimento reduzido.

### Só CSS (scroll-driven animations)
- **Em resumo:** `animation-timeline: view()` sem JavaScript.
- **Por que não:** o suporte ainda não é universal nos navegadores, e a fase ativa precisa de estado acessível (atributos ARIA) que CSS sozinho não atualiza.

## Consequências

### O que melhora
- Movimento com significado, leve e desligável.

### O que piora ou fica para depois
- **Dívida:** duas fontes de animação (CSS e Motion).
  - **Vira problema quando:** a mesma animação for feita das duas formas.
  - **Como resolver:** tokens de duração e curva (`--dur-fast`, `--dur-explain`, `--ease`) compartilhados e usados também pelas chamadas do Motion.

## Para quem vai implementar

- Tokens de movimento em `src/styles/tokens.css`.
- Um utilitário `prefersReducedMotion()` usado por todas as ilhas antes de qualquer `animate`.
- Teste com emulação de `reduced-motion` (ADR-012).

## Referências

- Motion: https://motion.dev
- WCAG 2.2 — 2.2.2 Pause, Stop, Hide; 2.3.3 Animation from Interactions
