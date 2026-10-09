# PLAN-004: Site atualizado para o MyAiToolKit 0.5.0

- **PRD:** `docs/sdd/prds/PRD-004-site-kit-0-5-0.md`
- **SPEC-UI:** sem SPEC-UI própria — reaproveita UI-07 e UI-13 de `docs/sdd/prototype/SPEC-UI-001-landing-page.md`
- **Stack:** Node 24 · Astro 7 · Preact · Motion · Shiki · CSS próprio · Playwright + axe · Netlify
- **Responsável:** Fabrizio
- **Data:** 2026-10-09
- **Status:** Em execução
- **Estimativa total (informada pelo usuário):**

---

## 1. Resumo — obrigatória

Duas tarefas, uma por regra do PRD-004: primeiro o snapshot do kit 0.5.0 (a base da outra), depois a prévia do `/sdd-review` com o round 2 e a correção conferida pelo verificador.

## 2. Como vai para produção — obrigatória

- **Modelo de entrega:** entrega única, como no PLAN-003.
- **Pronto significa:** CA-34 e CA-35 com teste verde; `npm test` inteiro verde (os cenários do PRD-001 ao PRD-003 que continuam em vigor seguem valendo, o CA-32 inclusive); `/sdd-trace` sem elos quebrados no PRD-004 e a matriz do PRD-003 gerada de novo com a Revisão 1.

## 3. Premissas e decisões — obrigatória quando houver

> ⚠️ **Premissa:** a numeração continua a do projeto, como manda o kit desde a 0.3.2 — tarefas a partir de T-33, regras a partir de RN-23, cenários a partir de CA-34. Nenhuma tela nova (a maior continua UI-13).

> ⚠️ **Premissa:** o kit 0.5.0 está em `../MyAiToolKit` (commit `912ca7a`) para a sincronização (ADR-007). Ele ainda não está publicado no GitHub do kit: o agente commita localmente, um commit por tarefa depois do review aprovado, e **não faz push** — os pushes são decisão do responsável. O hash de cada tarefa entra no histórico no commit seguinte.

> ⚠️ **Premissa:** o `docs/sdd/config.yml` continua com `review.cross_check: auto` e sem `git.commit` (vale `T-XX: <descrição>`, o padrão do histórico). Os reviews deste plano são chamados com `cruzada`, no modelo de relatório da 0.5.0 (campo `Commit revisado`).

> ⚠️ **Premissa:** o PLAN-003 está concluído e não é reaberto. O teste do CA-31 (`tests/kit.spec.ts`), que fixa a 0.4.0, vira o do CA-34 na T-33 — a RN-20 e o CA-31 estão riscados no PRD-003 (Revisão 1).

> ⚠️ **Premissa:** a estimativa por tarefa não foi informada pelo usuário; os campos `Estimativa` ficam vazios.

Decisões que moldam o plano: ADR-007 (snapshot do kit).

## 4. Dependências — obrigatória com mais de 5 tarefas

T-34 depende da T-33 (snapshot 0.5.0).

## 5. Fases — obrigatória

### Fase 1 — Site no kit 0.5.0

- **Objetivo:** o site descreve exatamente o kit 0.5.0.
- **Fecha quando:** `npm test` inteiro verde e `/sdd-trace` sem elos quebrados.

---

#### T-33 — Sincronizar o snapshot do kit 0.5.0

- **Status:** Pendente
- **Complexidade:** Baixa
- **Estimativa:**
- **Depende de:** —
- **Implementa:** RN-23
- **Valida:** CA-34
- **Decisões base:** ADR-007
- **Telas:** UI-07 (default), UI-13 (default) — da SPEC-UI-001
- **Arquivos/camadas:**
  - `src/data/kit.json` (`npm run sync:kit`) *(editado)*
  - `tests/kit.spec.ts` *(editado — o teste do CA-31, que fixava a 0.4.0, vira o do CA-34)*

**Critério de aceite (testável):**
- [ ] Snapshot em 0.5.0 (`912ca7a`) com os mesmos 17 comandos; rodapé com `0.5.0`; nenhum chip para o `review-verifier`; teste de sincronização com o kit verde

**Testes a escrever:**
- *E2E:* `test("CA-34: …")`, nos dois idiomas

---

#### T-34 — Mostrar a conferência das correções no round 2 na prévia do /sdd-review

- **Status:** Pendente
- **Complexidade:** Baixa
- **Estimativa:**
- **Depende de:** T-33
- **Implementa:** RN-24
- **Valida:** CA-35
- **Decisões base:** —
- **Telas:** UI-07 (default, previa, celular) — da SPEC-UI-001
- **Arquivos/camadas:**
  - `src/content/ui/*.json` *(editados — prévia do `/sdd-review`)*
  - `tests/commands.spec.ts` *(editado)*

**Critério de aceite (testável):**
- [ ] A prévia do `/sdd-review` mostra, nos dois idiomas, o `Commit revisado` de um round 2, uma linha do "Round anterior" com um `Bloqueante` e a resposta do Verificador `Resolvido`, e o campo `Revisão cruzada` feito com a correção conferida; 2 a 3 linhas de até ~68 caracteres; a prévia em inglês sem rótulos do relatório em português; o CA-32 continua verde

**Testes a escrever:**
- *E2E:* `test("CA-35: …")`, nos dois idiomas

---

> **Status aceitos (texto exato):** `Pendente` | `Em andamento` | `Concluído` | `Bloqueado` | `Cancelado`, sem emoji.

## 9. Pontos de validação humana — obrigatória

Autonomia concedida pelo responsável no site: viram autoverificações registradas no histórico.

- [ ] Depois da **T-34** — revisar a seção Comandos nos dois idiomas, no desktop e no celular

## 11. Histórico de execução — preenchido durante a execução

| Tarefa | Status | Data | Commit | Observação |
| --- | --- | --- | --- | --- |
