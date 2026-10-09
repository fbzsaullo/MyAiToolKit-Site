# PRD-004: Site atualizado para o MyAiToolKit 0.5.0

- **Produto/sistema:** site do MyAiToolKit (`MyAiToolKit-Site`)
- **Nível:** Funcionalidade
- **Card de origem:** pedido do responsável (2026-10-09) — levar ao site a versão 0.5.0 do kit
- **Responsável:** Fabrizio
- **Data:** 2026-10-09
- **Status:** Aprovado

> **Numeração.** Os IDs continuam a contagem do projeto (`templates/id-conventions.md` do kit, "Mais de um PRD no projeto"): os PRD-001 a PRD-003 vão até RN-22, CA-33 e UI-13, então este PRD começa em RN-23 e CA-34. Nenhuma tela nova.

---

## 1. Resumo — obrigatória

O site descreve o kit 0.4.0 (PRD-003, plano concluído). A 0.5.0 muda um detalhe da revisão cruzada, que continua opcional e desligada por padrão: no `/sdd-review`, do round 2 em diante, o verificador independente também **confere as correções** — os apontamentos do round anterior que o revisor marcou `Resolvido` vão para ele sem a marcação nem o motivo, e ele responde `Resolvido`, `Persiste` ou `Inconclusivo`, sempre com `arquivo:linha`. O relatório ganha o campo `Commit revisado:` e a coluna **Verificador** na tabela "Round anterior". O kit continua com 17 comandos e o `/code-review` não muda (não tem rounds). Este PRD leva ao site o snapshot 0.5.0 e mostra, na prévia do `/sdd-review`, um round 2 com a correção conferida.

## 2. Problema — obrigatória

- **O que dói:** o rodapé mostra a versão 0.4.0; o card do `/sdd-review` mostra só o round 1 e não deixa ver que, no round 2, o "Resolvido" passa a ser conferido.
- **Como é hoje:** `src/data/kit.json` está na 0.4.0 (`64adde2`); o teste de sincronização com o kit falha localmente desde a 0.5.0. A prévia do `/sdd-review` em inglês mistura um rótulo do relatório em português (`Recomendação:`) com rótulos em inglês — a Sugestão R-02 (REVIEW-T-31-2026-10-09), ainda em aberto.
- **Se não fizermos:** o site fica atrás do kit, e a RN-20 do PRD-003 ("o snapshot é o da versão 0.4.0") deixa de ser verdade assim que o snapshot for atualizado.

## 3. Objetivo — obrigatória

- O site mostra a versão 0.5.0 e continua com a lista exata de comandos do kit.
- Quem olha o card do `/sdd-review` vê que, do round 2 em diante, o verificador confere o que foi marcado como resolvido — sem achar que a revisão cruzada vem ligada.
- A prévia do `/sdd-review` em inglês segue uma regra só para rótulos e valores do relatório.

## 4. Escopo — obrigatória

**Dentro:**
- Snapshot do kit em 0.5.0 (`npm run sync:kit`).
- Prévia do `/sdd-review`: um round 2 com o campo `Commit revisado`, a linha da tabela "Round anterior" com a coluna Verificador e o campo `Revisão cruzada` com a correção conferida.
- Regra de idioma para a prévia em inglês, que fecha a R-02 (REVIEW-T-31-2026-10-09).
- Revisão 1 do PRD-003: RN-20 e CA-31 (kit 0.4.0) substituídos pela RN-23 e pelo CA-34 deste PRD.

**Fora:**
- Card do `/code-review`: a 0.5.0 não o muda (não há rounds fora do `sdd-review`).
- Card do `/sdd-setup`: a pergunta da revisão cruzada continua com o mesmo padrão (desligada); a 0.5.0 só detalhou o efeito de `auto` e `always`, que a prévia não mostra.
- Texto "O que gera" do `/sdd-review`: continua citando a revisão cruzada como opcional (RN-21); a conferência das correções aparece na prévia.
- Seção, bloco do diagrama, tela ou chip novos.
- Mudanças no kit e em `brand/`.

## 5. Quem usa — obrigatória quando há interface

Os mesmos perfis do PRD-001: devs que avaliam o kit, quem já usa e quer ver o que mudou, e quem segue o link do repositório.

## 6. Quebra para o board — obrigatória

- **Funcionalidade:** site atualizado para o kit 0.5.0
  - **História:** snapshot do kit 0.5.0, com os mesmos 17 comandos (RN-23)
  - **História:** conferência das correções no round 2 na prévia do `/sdd-review` (RN-24)

## 7. Fluxos — obrigatória quando há interação

Sem fluxo novo. A seção Comandos mantém o comportamento do PRD-001 (prévia com hover ou foco no desktop, sempre visível no celular e em telas de toque, Esc dispensa — UI-07 da SPEC-UI-001).

## 8. Regras de negócio — obrigatória

- **RN-23:** O site descreve o kit 0.5.0: o snapshot é o da versão 0.5.0 e a seção Comandos continua com os 17 comandos nos quatro grupos da RN-17 do PRD-002. O verificador da revisão cruzada continua sendo um agente do plugin, não um comando, e não ganha chip. Substitui a RN-20 do PRD-003. (ADR-007)
- **RN-24:** A prévia do `/sdd-review` mostra um round 2 com a correção conferida, nos campos que o relatório do kit 0.5.0 usa: o `Commit revisado`, uma linha da tabela "Round anterior" com um `Bloqueante` do round 1 e a resposta do **Verificador** (`Resolvido`), e o campo `Revisão cruzada` feito com a correção conferida. A prévia continua com 2 a 3 linhas de até ~68 caracteres. Na prévia em inglês, rótulos e frases ficam em inglês, e severidades, status e respostas do verificador ficam como o kit os escreve (`Bloqueante`, `Resolvido`) — a mesma convenção das outras prévias (`Status: Concluído`, `CR-01 Bloqueante`).

A RN-21 e a RN-22 do PRD-003 continuam valendo sem mudança: a revisão cruzada segue opcional e desligada por padrão, e o campo `Revisão cruzada` continua na prévia do `/sdd-review` com uma verificação feita. A RN-17, a RN-18 e a RN-19 do PRD-002 continuam valendo (a 0.5.0 não acrescenta comando), e a RN-13 do PRD-001 passa a mostrar `0.5.0`.

## 9. Critérios de aceite — obrigatória

```gherkin
Funcionalidade: Site atualizado para o MyAiToolKit 0.5.0

  Cenário [CA-34]: Site no kit 0.5.0
    Dado que o site foi construído com o snapshot do kit 0.5.0
    Então o rodapé mostra a versão "0.5.0" (RN-23)
    E a seção Comandos mostra um chip por comando do snapshot, 17 no kit 0.5.0
    E nenhum chip se chama "review-verifier"

  Cenário [CA-35]: Correção conferida no round 2 do /sdd-review
    Dado que estou na seção "Comandos"
    Quando vejo a prévia do "/sdd-review"
    Então ela mostra o campo "Commit revisado" de um round 2 (RN-24)
    E uma linha do "Round anterior" com um Bloqueante e a resposta do Verificador "Resolvido"
    E o campo "Revisão cruzada" feito, com a correção conferida
    E a prévia tem de 2 a 3 linhas
    E a prévia em inglês não traz rótulos do relatório em português
```

## 11. Dados e integrações — obrigatória quando se aplica

- `src/data/kit.json`, gerado por `npm run sync:kit` a partir do kit local (`KIT_PATH`, padrão `../MyAiToolKit`). Snapshot alvo: versão `0.5.0`, commit `912ca7a` do MyAiToolKit. (ADR-007)

## 13. Encaixe técnico (opcional)

- **Interface:** sem SPEC-UI nova e sem revisão da SPEC-UI-001. Muda só o conteúdo de componentes que já existem — a prévia de um card da UI-07 (Comandos) e a versão no rodapé (UI-13), que já vem do snapshot. Layout, estados e componentes continuam os da `SPEC-UI-001`.
- A lista de comandos continua conferida no build (`src/lib/commands.ts`): o snapshot 0.5.0 tem os mesmos 17 nomes.
- O valor do campo `Revisão cruzada` na prévia segue a forma curta já aceita na R-01 (REVIEW-T-31-2026-10-09): o kit escreve todas as contagens (`feita — 0 verificados (…) · 1 correção conferida (1 resolvida, 0 reabertas, 0 em disputa)`), o que passaria do limite de linha da SPEC-UI-001; a prévia omite as contagens zeradas.

## 15. Riscos e dependências — obrigatória

- **Exagerar o recurso** — dar a entender que a conferência acontece sempre, ou no `/code-review`. Mitigado pela RN-24 (round 2 do `/sdd-review` só), pela RN-21 do PRD-003 (opcional, desligada por padrão; o teste do CA-32 continua valendo) e pelo review conferindo com `templates/cross-check.md` do kit.
- **A 0.5.0 ainda não está publicada no GitHub do kit** — o snapshot vem do repositório local. O site só deve ir ao ar depois que o kit 0.5.0 estiver publicado; quem decide os pushes é o responsável.

## 17. Referências (opcional)

- PRDs anteriores: `docs/sdd/prds/PRD-001-landing-page.md`, `docs/sdd/prds/PRD-002-site-kit-0-3-1.md`, `docs/sdd/prds/PRD-003-site-kit-0-4-0.md` (RN-20 e CA-31 substituídos por RN-23 e CA-34 — Revisão 1 do PRD-003).
- Review de origem da regra de idioma: `docs/sdd/reviews/REVIEW-T-31-2026-10-09.md` (R-02, Sugestão).
- Interface: `docs/sdd/prototype/SPEC-UI-001-landing-page.md` (UI-07, UI-13).
- Kit: `CHANGELOG.md` (0.5.0), `templates/cross-check.md` (seções 7 a 9), `skills/sdd-review/references/review-template.md`.
