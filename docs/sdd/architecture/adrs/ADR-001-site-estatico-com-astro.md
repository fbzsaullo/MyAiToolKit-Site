# ADR-001: Gerar o site como páginas estáticas com Astro

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O site é uma página única de apresentação, em dois idiomas, sem dados dinâmicos de usuário. As metas de desempenho são rígidas (LCP abaixo de 2 s em 4G e menos de 50 KB de JavaScript inicial) e a maior parte do conteúdo é texto, código e diagramas. Só três seções precisam de interação.

## Decisão

Usamos **Astro 7** em modo estático (`output: 'static'`). O build gera HTML pronto para `/` e `/en/`, e componentes interativos entram apenas como ilhas (ADR-003).

## Motivos

- Astro envia zero JavaScript por padrão; cada byte de JS é uma escolha explícita, o que torna o orçamento de 50 KB alcançável.
- As coleções de conteúdo tipadas resolvem textos por idioma e dados dos exemplos (ADR-006).
- Shiki já vem integrado para realce no build (ADR-005).
- A restrição da demanda já indica Astro; a decisão registra **como** ele é usado.

## Opções descartadas

### Next.js (estático ou SSR)
- **Em resumo:** React em todas as páginas, com exportação estática.
- **Por que não:** hidrata a página inteira por padrão; manter o JS inicial abaixo de 50 KB exigiria lutar contra o framework.

### HTML e CSS escritos à mão
- **Em resumo:** sem gerador.
- **Por que não:** duplicaria a página nos dois idiomas e não teria coleções nem realce de código no build.

## Consequências

### O que melhora
- Páginas rápidas, que funcionam sem JavaScript, hospedáveis em qualquer CDN.

### O que piora ou fica para depois
- **Dívida:** sem renderização no servidor, nada é personalizado por requisição.
  - **Vira problema quando:** o site precisar de conteúdo dinâmico (busca, conteúdo por usuário).
  - **Como resolver:** adaptador SSR do Astro para a Netlify, apenas nas rotas que precisarem.

### O que muda sem ser ganho nem perda
- O projeto passa a ter `package.json`, o que dispara o `/sdd-setup` com o perfil Node.

## Para quem vai implementar

- `astro.config.mjs` com `output: 'static'`, `site` (premissa da URL) e `i18n` (ADR-008).
- Tarefas relacionadas: buscar `Decisões base: ADR-001` em `docs/sdd/plans/PLAN-*.md`.

## Referências

- Documentação do Astro: https://docs.astro.build
