# ADR-012: Testar com Playwright e axe, verificar links e impor um orçamento de JavaScript no build

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

Cada `CA-XX` do PRD precisa de um teste com o ID no nome, no formato do perfil Node do kit (`it("CA-XX: …")` / `test("CA-XX: …")`). É preciso testar comportamento, idioma, tema, movimento reduzido, teclado e acessibilidade, checar links quebrados e manter o JavaScript inicial abaixo de 50 KB.

## Decisão

- **Playwright** (`@playwright/test`) para os testes de comportamento contra o site construído (`astro preview`), com projetos para desktop e celular. Nome de cada teste que prova um cenário: `test("CA-XX: …")`.
- **axe** (`@axe-core/playwright`) nas duas rotas, nos dois temas e com movimento reduzido.
- **Links:** `linkinator` sobre `dist/`, com os links externos do GitHub verificados apenas quanto ao formato (sem depender de rede no CI).
- **Orçamento de JS:** script de pós-build que soma o JavaScript carregado antes de qualquer interação (scripts não diferidos e módulos importados pelo HTML) e falha o build acima de 50 KB comprimido; ilhas `client:visible` são contabilizadas à parte com limite próprio por ilha.
- **Conteúdo:** teste que compara as chaves de pt-BR e en (ADR-006), valida os IDs dos exemplos com as regras do kit e compara `src/data/kit.json` com o kit quando disponível (ADR-007).
- Tudo roda em `npm test` e no CI.

## Motivos

- Playwright cobre o que importa aqui (idioma do navegador, `prefers-reduced-motion`, tema, teclado e viewport de celular) emulando o navegador.
- Orçamento no build impede que o desempenho piore em silêncio.

## Opções descartadas

### Só Lighthouse
- **Por que não:** mede, mas não garante comportamento nem impede regressão a cada mudança. Continua como verificação manual antes de publicar.

### Testes unitários de componentes
- **Por que não:** a maior parte do valor está no comportamento na página real; testes unitários entram só para a lógica das ilhas, se ela crescer.

## Consequências

### O que melhora
- Cada cenário do PRD tem prova executável e rastreável pelo `/sdd-trace`.

### O que piora ou fica para depois
- **Dívida:** os navegadores do Playwright precisam ser instalados no CI (`npx playwright install --with-deps chromium`).

## Para quem vai implementar

- `playwright.config.ts`, pasta `tests/`, scripts `test`, `test:e2e`, `check:links`, `check:budget`.

## Referências

- Playwright: https://playwright.dev
- axe-core: https://github.com/dequelabs/axe-core
