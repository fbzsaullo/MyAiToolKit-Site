# PLAN-003: Site atualizado para o MyAiToolKit 0.4.0

- **PRD:** `docs/sdd/prds/PRD-003-site-kit-0-4-0.md`
- **SPEC-UI:** sem SPEC-UI própria — reaproveita UI-07, UI-12 e UI-13 de `docs/sdd/prototype/SPEC-UI-001-landing-page.md`
- **Stack:** Node 24 · Astro 7 · Preact · Motion · Shiki · CSS próprio · Playwright + axe · Netlify
- **Responsável:** Fabrizio
- **Data:** 2026-10-09
- **Status:** Em execução
- **Estimativa total (informada pelo usuário):**

---

## 1. Resumo — obrigatória

Três tarefas, uma por regra do PRD-003: primeiro o snapshot do kit 0.4.0 (a base das outras duas), depois a revisão cruzada nos cards do `/sdd-review`, do `/code-review` e do `/sdd-setup`, e por fim a pasta `agents/` na árvore do repositório do kit.

## 2. Como vai para produção — obrigatória

- **Modelo de entrega:** entrega única, como no PLAN-002.
- **Pronto significa:** CA-31, CA-32 e CA-33 com teste verde; `npm test` inteiro verde (os cenários do PRD-001 e do PRD-002 continuam valendo); `/sdd-trace` sem elos quebrados no PRD-003.

## 3. Premissas e decisões — obrigatória quando houver

> ⚠️ **Premissa:** a numeração continua a do projeto, como manda o kit desde a 0.3.2 — tarefas a partir de T-30, regras a partir de RN-20, cenários a partir de CA-31.

> ⚠️ **Premissa:** o kit 0.4.0 está em `../MyAiToolKit` (commit `64adde2`) para a sincronização (ADR-007). Ele ainda não está publicado no GitHub do kit: o agente commita localmente, um commit por tarefa depois do review aprovado, e **não faz push** — os pushes são decisão do responsável (2026-10-09). O hash de cada tarefa entra no histórico no commit seguinte.

> ⚠️ **Premissa:** o `docs/sdd/config.yml` do site passa a ter `review.cross_check: auto`, como o `/sdd-setup refresh` da 0.4.0 registraria (escolha do responsável, 2026-10-09); entra na T-30. Os reviews deste plano são chamados com `cruzada`, que liga a verificação em cada um. O `config.yml` continua sem `git.commit`: vale o padrão do kit, `T-XX: <descrição>`, que é o que o histórico do site já usa.

> ⚠️ **Premissa:** a estimativa por tarefa não foi informada pelo usuário; os campos `Estimativa` ficam vazios.

Decisões que moldam o plano: ADR-007 (snapshot do kit).

## 4. Dependências — obrigatória com mais de 5 tarefas

T-31 e T-32 dependem da T-30 (snapshot 0.4.0).

## 5. Fases — obrigatória

### Fase 1 — Site no kit 0.4.0

- **Objetivo:** o site descreve exatamente o kit 0.4.0.
- **Fecha quando:** `npm test` inteiro verde e `/sdd-trace` sem elos quebrados.

---

#### T-30 — Sincronizar o snapshot do kit 0.4.0

- **Status:** Pendente
- **Complexidade:** Baixa
- **Estimativa:**
- **Depende de:** —
- **Implementa:** RN-20
- **Valida:** CA-31
- **Decisões base:** ADR-007
- **Telas:** UI-07 (default), UI-13 (default) — da SPEC-UI-001
- **Arquivos/camadas:**
  - `src/data/kit.json` (`npm run sync:kit`) *(editado)*
  - `tests/kit.spec.ts` *(editado — o teste que fixava a 0.3.1 vira o do CA-31)*
  - `docs/sdd/config.yml` *(editado — `review.cross_check: auto`)*

**Critério de aceite (testável):**
- [ ] Snapshot em 0.4.0 (`64adde2`) com os mesmos 17 comandos; rodapé com `0.4.0`; nenhum chip para o `review-verifier`; teste de sincronização com o kit verde

**Testes a escrever:**
- *E2E:* `test("CA-31: …")`, nos dois idiomas

---

#### T-31 — Mostrar a revisão cruzada como opcional nos cards dos reviews e do setup

- **Status:** Pendente
- **Complexidade:** Baixa
- **Estimativa:**
- **Depende de:** T-30
- **Implementa:** RN-21
- **Valida:** CA-32
- **Decisões base:** —
- **Telas:** UI-07 (default, previa, celular) — da SPEC-UI-001
- **Arquivos/camadas:**
  - `src/content/ui/*.json` *(editados — "O que gera" e prévia do `/sdd-review` e do `/code-review`, prévia do `/sdd-setup`)*
  - `tests/commands.spec.ts` *(editado)*

**Critério de aceite (testável):**
- [ ] "O que gera" do `/sdd-review` e do `/code-review` cita a revisão cruzada como opcional; as prévias dos dois mostram o campo `Revisão cruzada` no formato do relatório do kit; a prévia do `/sdd-setup` mostra a revisão cruzada desligada (padrão); prévias continuam com 2 a 3 linhas

**Testes a escrever:**
- *E2E:* `test("CA-32: …")`, nos dois idiomas

---

#### T-32 — Mostrar a pasta agents/ na árvore do repositório do kit

- **Status:** Pendente
- **Complexidade:** Baixa
- **Estimativa:**
- **Depende de:** T-30
- **Implementa:** RN-22
- **Valida:** CA-33
- **Decisões base:** —
- **Telas:** UI-12 (default, celular) — da SPEC-UI-001
- **Arquivos/camadas:**
  - `src/content/ui/*.json` *(editados — item `agents` na árvore da seção Open source)*
  - `tests/footer-open-source.spec.ts` *(editado)*

**Critério de aceite (testável):**
- [ ] A árvore mostra `agents/` com a nota `review-verifier.md`, logo depois de `skills/`, nos dois idiomas

**Testes a escrever:**
- *E2E:* `test("CA-33: …")`, nos dois idiomas

---

> **Status aceitos (texto exato):** `Pendente` | `Em andamento` | `Concluído` | `Bloqueado` | `Cancelado`, sem emoji.

## 9. Pontos de validação humana — obrigatória

Autonomia concedida pelo responsável no site: viram autoverificações registradas no histórico.

- [ ] Depois da **T-32** — revisar a seção Comandos e a seção Open source nos dois idiomas, no desktop e no celular

## 11. Histórico de execução — preenchido durante a execução

| Tarefa | Status | Data | Commit | Observação |
| --- | --- | --- | --- | --- |
