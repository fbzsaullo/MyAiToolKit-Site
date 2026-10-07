# ADR-003: Usar ilhas Preact carregadas com `client:visible` só no pipeline, na rastreabilidade e no diagrama

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

Três seções têm estado de verdade: o pipeline (fase ativa, seletor entre as duas demandas, rolagem conduzida), a rastreabilidade (ID em foco destacando a cadeia) e o diagrama da arquitetura (bloco selecionado, painel de detalhes, botão "Ver o fluxo"). As diretivas de hidratação do Astro (`client:visible`) só se aplicam a componentes de um framework de UI. O orçamento de JavaScript no carregamento inicial é de 50 KB.

## Decisão

As três partes são componentes **Preact** com `client:visible`: só baixam e hidratam quando a seção entra na tela. **Toda ilha é desenhada primeiro como HTML estático completo** (a lista das fases, a cadeia de IDs, o diagrama em SVG com lista equivalente) e a ilha apenas acrescenta interação. Interações pequenas fora dessas seções (copiar comando, abas de instalação, menu, troca de tema e idioma) usam scripts curtos sem framework.

## Motivos

- Preact tem poucos KB comprimido, a API de componentes do React e integração oficial com o Astro.
- `client:visible` tira as ilhas do carregamento inicial: o que conta para o orçamento de 50 KB é o que roda antes de qualquer rolagem.
- A camada estática por baixo garante acessibilidade, funcionamento sem JavaScript e o modo de movimento reduzido.

## Opções descartadas

### Svelte
- **Em resumo:** componentes compilados, sem DOM virtual.
- **Por que não:** o runtime atual não é menor que o do Preact para este caso, e o time já conhece o modelo de componentes do React.

### JavaScript puro com `IntersectionObserver` e `import()` manual
- **Em resumo:** carregar módulos à mão quando as seções aparecem.
- **Por que não:** reproduziria à mão o que o `client:visible` já faz, e o estado das três ilhas ficaria espalhado em código imperativo, difícil de testar.

### React
- **Por que não:** várias vezes maior que o Preact para a mesma API.

## Consequências

### O que melhora
- JS inicial mínimo; interação só onde explica algo.

### O que piora ou fica para depois
- **Dívida:** duas formas de interação convivendo (ilhas Preact e scripts curtos).
  - **Vira problema quando:** um script curto crescer e ganhar estado.
  - **Como resolver:** promovê-lo a ilha; a regra fica registrada no `AGENTS.md` do site.

## Para quem vai implementar

- `@astrojs/preact`; componentes em `src/components/islands/`.
- Cada ilha recebe por props todo o conteúdo já traduzido (nada de buscar conteúdo no cliente).
- A camada estática é renderizada pelo próprio Astro, no mesmo componente ou num irmão, para não haver salto de layout na hidratação (CLS).

## Referências

- Astro — diretivas de cliente: https://docs.astro.build/en/reference/directives-reference/#client-directives
- Preact: https://preactjs.com
