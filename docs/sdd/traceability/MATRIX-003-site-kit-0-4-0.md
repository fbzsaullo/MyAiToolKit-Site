# Matriz de rastreabilidade — PRD-003 Site atualizado para o kit 0.4.0

- **PRD:** [`PRD-003-site-kit-0-4-0.md`](../prds/PRD-003-site-kit-0-4-0.md)
- **Plano:** [`PLAN-003-site-kit-0-4-0.md`](../plans/PLAN-003-site-kit-0-4-0.md)
- **SPEC-UI:** sem SPEC-UI própria — telas da [`SPEC-UI-001`](../prototype/SPEC-UI-001-landing-page.md) (UI-07, UI-12, UI-13), sem revisão
- **ADRs:** ADR-007 (snapshot do kit), `Aceito`
- **Reviews:** `REVIEW-T-30`, `REVIEW-T-31` e `REVIEW-T-32` de 2026-10-09
- **Testes:** `tests/*.spec.ts`, nome no formato `test("CA-XX: …")`
- **Gerada por:** skill `sdd-trace` do MyAiToolKit (regras da 0.5.0), em 2026-10-09, sobre a revisão 1 do PRD-003 (RN-20 e CA-31 substituídos pelo PRD-004). Plano concluído, sem mudança desde a T-32 (commit `4d421d8`)

> A matriz é uma fotografia. Quando PRD ou plano mudarem, gere de novo.

## Resultado

**Nenhum elo quebrado.**

| Conjunto | Total | Ligado |
| --- | --- | --- |
| Regras (RN) | 3 | 2 em vigor, com cenário e com tarefa; 1 revogada (RN-20) |
| Cenários (CA) | 3 | 2 em vigor, com tarefa e com teste; 1 revogado (CA-31) |
| Tarefas (T) | 3 | 3 `Concluído`, 3 com review |
| Apontamentos (R) | 2 | 2 Sugestões: R-02 resolvida na T-34 (PLAN-004); R-01 aceita |
| ADRs citados | 1 | existe e está `Aceito` |
| IDs repetidos entre documentos | 0 | RN-20…22, CA-31…33 e T-30…32 só existem no PRD-003 e no PLAN-003 |

### Tabela 1 — Da regra ao review

| RN | Regra (resumo) | Provada por (CA) | Feita em (T) | Decisão (ADR) | Review |
| --- | --- | --- | --- | --- | --- |
| ~~RN-20~~ | ~~Snapshot do kit 0.4.0, os mesmos 17 comandos, sem chip para o verificador~~ — revogada, ver RN-23 do PRD-004 | ~~CA-31~~ | T-30 (histórico) | ADR-007 | T-30 ✅ Aprovado |
| RN-21 | Revisão cruzada opcional nos reviews e desligada por padrão no setup | CA-32 | T-31 | — | T-31 ⚠️ Aprovado com ressalvas — R-01, R-02 (REVIEW-T-31-2026-10-09), Sugestões |
| RN-22 | `agents/` com `review-verifier.md` na árvore do kit, depois de `skills/` | CA-33 | T-32 | — | T-32 ✅ Aprovado |

### Tabela 2 — Do cenário ao teste

| CA | Cenário | Prova (RN) | Tela (UI, da SPEC-UI-001) | Feito em (T) | Teste | Review |
| --- | --- | --- | --- | --- | --- | --- |
| ~~CA-31~~ | ~~Site no kit 0.4.0~~ — revogado, ver CA-34 do PRD-004 | ~~RN-20~~ | UI-07, UI-13 | T-30 (histórico) | o teste virou o `CA-34` (`tests/kit.spec.ts`) | T-30 ✅ |
| CA-32 | Revisão cruzada opcional nos reviews | RN-21 | UI-07 | T-31 | `tests/commands.spec.ts` | T-31 ⚠️ (Sugestões) |
| CA-33 | Pasta agents/ na árvore do kit | RN-22 | UI-12 | T-32 | `tests/footer-open-source.spec.ts` | T-32 ✅ |

### Tabela 3 — Execução por tarefa

| Tarefa | Status no plano | Tem review? | Revisão cruzada | Pior severidade | Apontamentos em aberto | Commit |
| --- | --- | --- | --- | --- | --- | --- |
| T-30 | Concluído | Sim — `REVIEW-T-30-2026-10-09.md` | não acionada (sem candidatos) | — | 0 | `c17e04e` |
| T-31 | Concluído | Sim — `REVIEW-T-31-2026-10-09.md` | feita — 1 verificado, 1 confirmado (rebaixado a Sugestão) | Sugestão | 0 — R-02 resolvida na T-34 (PLAN-004); R-01 aceita (forma curta) | `a0373ae` |
| T-32 | Concluído | Sim — `REVIEW-T-32-2026-10-09.md` | não acionada (sem candidatos) | — | 0 | `4d421d8` |

### Diagrama

```mermaid
graph LR
    ADR007[ADR-007<br/>snapshot do kit] --> RN20
    RN20[RN-20 revogada<br/>ver RN-23 do PRD-004] -.-> CA31[CA-31 revogado<br/>ver CA-34]
    RN21[RN-21<br/>revisão cruzada opcional] --> CA32[CA-32]
    RN22[RN-22<br/>agents/ na árvore] --> CA33[CA-33]
    CA31 -.-> UI07[UI-07 / UI-13<br/>SPEC-UI-001]
    CA32 --> UI07
    CA33 --> UI12[UI-12<br/>SPEC-UI-001]
    UI07 --> T30[T-30 ✅]
    UI07 --> T31[T-31 ✅]
    UI12 --> T32[T-32 ✅]
    T30 --> Rev30[REVIEW-T-30<br/>✅ Aprovado]
    T31 --> Rev31[REVIEW-T-31<br/>⚠️ com ressalvas]
    T32 --> Rev32[REVIEW-T-32<br/>✅ Aprovado]
```

## Apontamentos de review — onde cada um terminou

| Apontamento | Severidade | Desfecho |
| --- | --- | --- |
| R-01 (REVIEW-T-31-2026-10-09) — valor do campo `Revisão cruzada` abreviado | Sugestão | Aceito: forma curta mantida pelo limite de linha da SPEC-UI-001; a mesma decisão vale para a prévia do round 2 (PRD-004, seção 13) |
| R-02 (REVIEW-T-31-2026-10-09) — prévia do `/sdd-review` em inglês misturava os idiomas | Sugestão | Resolvido na T-34 (PLAN-004, `0d420a8`): regra única na RN-24 do PRD-004 e prévia sem rótulo em português |

## Ligação com os outros PRDs

- **Revisão 1 (2026-10-09):** o snapshot e a versão passaram a ser os do kit 0.5.0, definidos no PRD-004. RN-20 e CA-31 estão riscados no PRD-003, registrados com `−` na seção Revisões, e saem da cobertura (regra de revogados do `sdd-trace`). Nenhum teste cita o CA-31: o teste que o provava virou o `CA-34`. Matriz do PRD-004: `MATRIX-004-site-kit-0-5-0.md`.
- A RN-21 e a RN-22 continuam valendo com o kit 0.5.0: o teste do CA-32 continua verde com a prévia nova do `/sdd-review` (o campo `Revisão cruzada` segue com uma verificação feita), e o do CA-33 não mudou.
- O PRD-003 não revoga nenhuma regra do PRD-001 nem do PRD-002; a SPEC-UI-001 não ganhou revisão.

## Observações (verificadas; não são elos quebrados)

- **Commits:** um por tarefa, depois do review, todos locais — nenhum push (decisão do responsável). Cada hash entrou no histórico do plano no commit seguinte.
- **Revisão cruzada (dogfooding da 0.4.0):** os três reviews foram chamados com `cruzada`. Só o da T-31 teve candidato (um `Importante`); o verificador, um subagente novo e só de leitura, confirmou o problema e sugeriu severidade menor, e a evidência citada foi conferida antes de rebaixar. Nada foi descartado nem ficou em disputa.
- **Textos que envelheceram sem mentir:** o título do cenário CA-28 e o "Dado" do CA-30 do PRD-002 dizem "kit 0.3.1"; continuam verdadeiros para a 0.5.0 (mesmos 17 comandos) e não foram reabertos.
- **Bateria de testes:** 178 testes verdes com `npm test -- --workers=4` depois da T-34 (PLAN-004).
