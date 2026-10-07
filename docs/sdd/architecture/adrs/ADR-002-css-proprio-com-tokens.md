# ADR-002: Escrever o CSS à mão, com tokens em variáveis e sem framework de CSS

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

A identidade visual é monocromática e precisa: nove tokens de cor com versões clara e escura, uma escala tipográfica fluida com `clamp()`, cantos retos (0 px em blocos, no máximo 4 px em botões e etiquetas), bordas de 1 px, nenhuma sombra e um grid aparente. O tema muda pelo sistema e pela troca manual (ADR-009).

## Decisão

Usamos **CSS próprio**, organizado em camadas (`@layer reset, tokens, base, layout, components, utilities`). Os tokens da identidade viram variáveis CSS em `:root`, com os valores do tema escuro em `:root[data-theme="dark"]` e no `@media (prefers-color-scheme: dark)` quando não há escolha manual. Os componentes Astro usam CSS com escopo local.

## Motivos

- Os tokens da identidade já estão definidos; um framework de utilitários seria só uma camada de tradução.
- Variáveis CSS trocam o tema sem JavaScript e sem duplicar regras.
- Nenhuma dependência de build extra e nenhum CSS não usado no pacote final.

## Opções descartadas

### Tailwind CSS
- **Em resumo:** utilitários configurados com os tokens.
- **Por que não:** a paleta tem 9 cores e o vocabulário visual é pequeno; o ganho não compensa a camada extra. O markup também fica mais difícil de ler nos componentes de documentação.

### Biblioteca de componentes pronta
- **Em resumo:** botões, abas e cartões prontos.
- **Por que não:** traria raios, sombras e cores que a identidade proíbe; desfazer custaria mais do que construir.

## Consequências

### O que melhora
- O CSS reflete a especificação visual de forma direta e auditável.

### O que piora ou fica para depois
- **Dívida:** sem utilitários, padrões de espaçamento podem divergir entre componentes.
  - **Vira problema quando:** surgirem muitos componentes novos.
  - **Como resolver:** tokens de espaçamento (`--space-1` … `--space-10`) e revisão no `/sdd-review`.

### O que muda sem ser ganho nem perda
- Os contrastes da paleta já atendem WCAG AA; mudar um token exige reconferir o contraste.

## Para quem vai implementar

- `src/styles/tokens.css`, `src/styles/global.css`.
- Regras invioláveis: nada de sombra, gradiente ou cor fora dos tokens; foco visível de 2 px com afastamento de 2 px.

## Referências

- Identidade visual definida na demanda (seção 3 do prompt do site).
