# PRD-003: Site atualizado para o MyAiToolKit 0.4.0

- **Produto/sistema:** site do MyAiToolKit (`MyAiToolKit-Site`)
- **Nível:** Funcionalidade
- **Card de origem:** pedido do responsável (2026-10-09) — levar ao site as versões 0.3.2 e 0.4.0 do kit
- **Responsável:** Fabrizio
- **Data:** 2026-10-09
- **Status:** Aprovado

> **Numeração.** Os IDs continuam a contagem do projeto, agora regra do próprio kit desde a 0.3.2 (`templates/id-conventions.md`, "Mais de um PRD no projeto"): o PRD-001 e o PRD-002 vão até RN-19 e CA-30, então este PRD começa em RN-20 e CA-31.

---

## 1. Resumo — obrigatória

O site descreve o kit 0.3.1 (PRD-002, plano concluído). A 0.3.2 só trouxe correções internas e a regra de numeração entre PRDs, que o site já segue. A 0.4.0 trouxe a **revisão cruzada**, opcional, no `/sdd-review` e no `/code-review`: um verificador independente, só de leitura, tenta derrubar os apontamentos graves sem ver o raciocínio de quem apontou. Ela vem desligada (`review.cross_check: never`), o `/sdd-setup` passou a perguntar se fica desligada, automática ou sempre ligada, e o verificador mora numa pasta nova do kit, `agents/`. Este PRD leva ao site o snapshot 0.4.0, a revisão cruzada descrita como o que ela é — opcional e desligada por padrão — e a pasta `agents/` na árvore do repositório.

## 2. Problema — obrigatória

- **O que dói:** o rodapé mostra a versão 0.3.1; os cards do `/sdd-review`, do `/code-review` e do `/sdd-setup` não dizem nada da revisão cruzada; a árvore do repositório do kit não tem a pasta `agents/`, que existe desde a 0.4.0.
- **Como é hoje:** `src/data/kit.json` está na 0.3.1 (`e283458`); o teste de sincronização com o kit falha localmente desde a 0.3.2.
- **Se não fizermos:** o site fica atrás do kit, e quem lê o README do kit encontra um recurso e uma pasta que o site não mostra (RN-03 do PRD-001 exige que nomes e comportamentos mostrados sejam os do kit).

## 3. Objetivo — obrigatória

- O site mostra a versão 0.4.0 e continua com a lista exata de comandos do kit.
- Quem olha os reviews no site sabe que existe a revisão cruzada e que ela é opcional, sem achar que vem ligada.
- A árvore do repositório do kit bate com a do README do kit na pasta nova.

## 4. Escopo — obrigatória

**Dentro:**
- Snapshot do kit em 0.4.0 (`npm run sync:kit`).
- Cards do `/sdd-review` e do `/code-review`: "O que gera" cita a revisão cruzada como opcional; a prévia mostra o campo `Revisão cruzada` do relatório.
- Prévia do `/sdd-setup`: a pergunta da revisão cruzada respondida com o padrão do kit (desligada).
- Árvore do repositório do kit (seção Open source) com `agents/` e o `review-verifier.md`.

**Fora:**
- Seção, bloco do diagrama ou tela novos para a revisão cruzada — ela é um detalhe de dois comandos, não uma fase.
- Chip para o verificador: ele é um agente do plugin, não um comando.
- Textos sobre a 0.3.2: as correções são internas ao kit (chave da branch base do `sdd-review`, texto do adaptador do Claude Code, contagem de status) e não aparecem no site; a regra de numeração entre PRDs já é seguida aqui desde o PRD-002.
- Mudanças no kit.

## 5. Quem usa — obrigatória quando há interface

Os mesmos perfis do PRD-001: devs que avaliam o kit, quem já usa e quer ver o que mudou, e quem segue o link do repositório.

## 6. Quebra para o board — obrigatória

- **Funcionalidade:** site atualizado para o kit 0.4.0
  - **História:** snapshot do kit 0.4.0, com os mesmos 17 comandos (RN-20)
  - **História:** revisão cruzada opcional nos cards dos reviews e do setup (RN-21)
  - **História:** pasta `agents/` na árvore do repositório do kit (RN-22)

## 7. Fluxos — obrigatória quando há interação

Sem fluxo novo. A seção Comandos mantém o comportamento do PRD-001 (prévia com hover ou foco no desktop, sempre visível no celular e em telas de toque, Esc dispensa — UI-07 da SPEC-UI-001), e a árvore da seção Open source continua estática (UI-12).

## 8. Regras de negócio — obrigatória

- **RN-20:** ~~O site descreve o kit 0.4.0: o snapshot é o da versão 0.4.0 e a seção Comandos continua com os 17 comandos nos quatro grupos da RN-17 do PRD-002. O verificador da revisão cruzada é um agente do plugin (`agents/review-verifier.md`), não um comando, e não ganha chip. (ADR-007)~~ (substituída — ver RN-23 do PRD-004, kit 0.5.0)
- **RN-21:** O site apresenta a revisão cruzada como opcional e desligada por padrão: o "O que gera" do `/sdd-review` e do `/code-review` cita a revisão cruzada como opcional; a prévia dos dois mostra o campo `Revisão cruzada` do relatório com uma verificação feita; a prévia do `/sdd-setup` mostra a revisão cruzada desligada, o padrão do kit (`review.cross_check: never`). Nenhum texto do site a mostra ligada por padrão.
- **RN-22:** A árvore do repositório do kit, na seção Open source, mostra a pasta `agents/` com o `review-verifier.md`, logo depois de `skills/` — a ordem do README do kit.

A RN-17, a RN-18 e a RN-19 do PRD-002 continuam valendo sem mudança (a 0.4.0 não acrescenta comando), e a RN-13 do PRD-001 passa a mostrar `0.4.0`.

## 9. Critérios de aceite — obrigatória

```gherkin
Funcionalidade: Site atualizado para o MyAiToolKit 0.4.0

  Cenário [CA-31]: ~~Site no kit 0.4.0~~ (substituído — ver CA-34 do PRD-004)
    Dado que o site foi construído com o snapshot do kit 0.4.0
    Então o rodapé mostra a versão "0.4.0" (RN-20)
    E a seção Comandos mostra um chip por comando do snapshot, 17 no kit 0.4.0
    E nenhum chip se chama "review-verifier"

  Cenário [CA-32]: Revisão cruzada opcional nos reviews
    Dado que estou na seção "Comandos"
    Então o "O que gera" do "/sdd-review" e do "/my-ai-toolkit:code-review" diz que a revisão cruzada é opcional (RN-21)
    E a prévia dos dois mostra o campo "Revisão cruzada" com uma verificação feita
    E a prévia do "/sdd-setup" mostra a revisão cruzada desligada, como padrão

  Cenário [CA-33]: Pasta agents/ na árvore do kit
    Dado que estou na seção "Open source"
    Então a árvore do repositório do kit mostra "agents/" com "review-verifier.md" (RN-22)
    E "agents/" vem logo depois de "skills/"
```

## 11. Dados e integrações — obrigatória quando se aplica

- `src/data/kit.json`, gerado por `npm run sync:kit` a partir do kit local (`KIT_PATH`, padrão `../MyAiToolKit`). Snapshot alvo: versão `0.4.0`, commit `64adde2` do MyAiToolKit. (ADR-007)

## 13. Encaixe técnico (opcional)

- **Interface:** sem SPEC-UI nova e sem revisão da SPEC-UI-001. Muda só o conteúdo de componentes que já existem — o texto e a prévia de três cards da UI-07 (Comandos), um item a mais no `FileTree` da UI-12 (Open source) e a versão no rodapé (UI-13), que já vem do snapshot. Layout, estados e componentes continuam os da `SPEC-UI-001`.
- A lista de comandos continua conferida no build (`src/lib/commands.ts`): o snapshot 0.4.0 tem os mesmos 17 nomes.

## 15. Riscos e dependências — obrigatória

- **Exagerar o recurso** — apresentar a revisão cruzada como ligada, automática por padrão ou como debate entre agentes. Mitigado pela RN-21, pelo teste do CA-32 e pelo review conferindo com `templates/cross-check.md` do kit.
- **A 0.4.0 ainda não está publicada no GitHub do kit** — o snapshot vem do repositório local. O site só deve ir ao ar depois que o kit 0.4.0 estiver publicado; quem decide os pushes é o responsável.

## 17. Referências (opcional)

- PRDs anteriores: `docs/sdd/prds/PRD-001-landing-page.md`, `docs/sdd/prds/PRD-002-site-kit-0-3-1.md` (nenhuma regra revogada por este PRD).
- Interface: `docs/sdd/prototype/SPEC-UI-001-landing-page.md` (UI-07, UI-12, UI-13).
- Kit: `CHANGELOG.md` (0.3.2 e 0.4.0), `templates/cross-check.md`, `agents/review-verifier.md`, `skills/sdd-setup/SKILL.md` (pergunta 6).
- Continuação: `docs/sdd/prds/PRD-004-site-kit-0-5-0.md` (site atualizado para o kit 0.5.0).

## 18. Revisões

| Nº | Data | O que mudou | IDs | Motivo / origem |
| --- | --- | --- | --- | --- |
| 1 | 2026-10-09 | Snapshot e versão passam a ser os do kit 0.5.0, definidos em outro PRD | −RN-20, −CA-31 | Substituídos por RN-23 e CA-34 do PRD-004 |
