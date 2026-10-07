# MyAiToolKit — site

<!-- myaitoolkit:start -->

## Resumo

Landing page oficial do MyAiToolKit: página única, em pt-BR (`/`) e en (`/en/`), que explica o kit, mostra o pipeline SDD com duas demandas de exemplo e leva à instalação. Site estático, monocromático, sem rastreadores, construído com o próprio kit.

## Stack

- **Linguagem e framework:** Node 24 · Astro 7.3.6 (estático)
- **Interação:** ilhas Preact 10.29 com `client:visible`; Motion para animações dirigidas por rolagem
- **Estilo:** CSS próprio com tokens em variáveis (sem framework de CSS)
- **Código:** Shiki no build, tema monocromático próprio
- **Testes:** Playwright + axe (a partir da T-03)
- **Hospedagem:** Netlify (`netlify.toml`)

Detalhes de versões: `docs/sdd/stack-report.md`.

## Comandos

```bash
npm ci                 # instalar
npm run dev            # rodar local (copia os ícones da marca antes)
npm run build          # gerar dist/
npm run preview        # servir o build
npm audit              # auditoria de dependências
```

<!-- TODO: comando de testes entra na T-03 (Playwright). Sem script `test` no package.json até lá. -->

## Convenções

- Padrão é HTML estático; JavaScript só nas três ilhas (pipeline, rastreabilidade, diagrama) e em scripts curtos sem framework (copiar, abas, menu, tema, idioma) (ADR-003).
- Toda ilha tem uma camada estática completa por baixo, que funciona sem JS e com movimento reduzido (ADR-003, ADR-004).
- Só as cores dos tokens de `src/styles/tokens.css`; estado por inversão, preenchimento □ → ■, peso, traço e rótulo — nunca só por cor (ADR-002).
- Nenhum texto fixo em componente: textos vêm das coleções em `src/content/` por idioma; os IDs das demandas de exemplo são escritos uma única vez (ADR-006).
- Nomes de comandos do kit não se traduzem; a lista de comandos e a versão vêm de `src/data/kit.json` (`npm run sync:kit`) (ADR-007).
- `brand/` é imutável (logos e ícones byte a byte iguais aos originais).
- Testes de cenário do PRD: `test("CA-XX: <descrição>")` em `tests/`.
- Commits: um por tarefa do plano, `T-XX: descrição`, depois do review aprovado.

## Restrições

- Nenhum script, fonte, imagem ou CDN de terceiros; nenhum cookie; nenhuma estatística de acesso.
- WCAG 2.2 AA; `prefers-reduced-motion` desliga todo movimento.
- Menos de 50 KB de JS no carregamento inicial; LCP < 2 s em 4G.
- URL base provisória: `https://myaitoolkit.netlify.app`.

## Documentação do pipeline

- **Configuração do toolkit:** `docs/sdd/config.yml`
- **Arquitetura:** `docs/sdd/architecture/proposta-arquitetural.md`
- **Decisões (ADRs):** `docs/sdd/architecture/adrs/`
- **Requisitos (PRD):** `docs/sdd/prds/` — regras `RN-XX`, cenários `CA-XX`
- **Interface (SPEC-UI):** `docs/sdd/prototype/` — telas `UI-XX`
- **Plano:** `docs/sdd/plans/` — tarefas `T-XX`
- **Reviews:** `docs/sdd/reviews/` — apontamentos `R-XX`

## Como trabalhar neste projeto

Este projeto usa o pipeline SDD do MyAiToolKit. Antes de implementar:

1. Procure o plano em `docs/sdd/plans/PLAN-XXX-*.md`.
2. Pegue a primeira tarefa `Status: Pendente` cujas dependências (`Depende de:`) estejam todas `Concluído`.
3. Leia a tarefa inteira, incluindo `Implementa:`, `Valida:`, `Decisões base:` e `Telas:`.
4. Abra o que ela referencia: `RN-XX` e `CA-XX` no PRD; `ADR-XXX` em `docs/sdd/architecture/adrs/`; `UI-XX` na SPEC-UI.
5. Respeite os pontos de validação humana do plano.
6. Escreva os testes com o `CA-XX` no nome, no formato acima.
7. Ao terminar, atualize o `Status:` da tarefa e o histórico do plano.
8. Uma tarefa por vez, sempre seguida de review.

Com o MyAiToolKit instalado: `sdd-execute` executa uma tarefa, `sdd-review T-XX` revisa,
`code-review` faz review avulso e `spike` analisa o esforço de um card.

<!-- myaitoolkit:end -->

<!-- Daqui para baixo o conteúdo é mantido pelo time; o /sdd-setup não altera. -->
