# PRD-002: Site atualizado para o MyAiToolKit 0.3.1

- **Produto/sistema:** site do MyAiToolKit (`MyAiToolKit-Site`)
- **Nível:** Funcionalidade
- **Card de origem:** pedido do responsável (2026-10-07) — levar ao site as versões 0.2.0, 0.3.0 e 0.3.1 do kit
- **Responsável:** Fabrizio
- **Data:** 2026-10-07
- **Status:** Aprovado

> **Numeração.** Os IDs continuam a contagem do projeto (o PRD-001 vai até RN-16 e CA-27), para que `test("CA-XX: …")` e o `sdd-trace` nunca encontrem dois cenários com o mesmo ID. Decisão do responsável em 2026-10-07.

---

## 1. Resumo — obrigatória

O site foi construído para o kit 0.1.0 (PRD-001, plano concluído). Desde então o kit ganhou cinco comandos (`/commit-message`, `/sdd-change`, `/sdd-bug`, `/sdd-adr`, `/pr-description`) e uma regra de comportamento que muda como ele é apresentado: **o kit nunca commita nem abre PR**. Este PRD leva essas mudanças ao site — a seção Comandos com 17 comandos em quatro grupos, o comportamento de commit explicado, e os textos que descrevem o kit (terminal do hero, contagens) de acordo com a versão 0.3.1.

## 2. Problema — obrigatória

- **O que dói:** o site mostra 12 comandos em três grupos e a versão 0.1.0, enquanto o kit tem 17 comandos na 0.3.1. Quem chega pelo site não descobre os fluxos de mudança, bug e ADR, nem o `/commit-message` e o `/pr-description`.
- **Como é hoje:** o snapshot `src/data/kit.json` está na 0.1.0; o teste de sincronização com o kit falha localmente; a prévia do `/sdd-execute` ainda diz que ele sugere o commit, o que deixou de ser verdade na 0.2.0.
- **Se não fizermos:** o site contradiz o kit (RN-03 do PRD-001 exige que nomes e comportamentos mostrados sejam exatamente os do kit).

## 3. Objetivo — obrigatória

- Toda a lista de comandos do kit 0.3.1 visível, agrupada e com prévia, nos dois idiomas.
- O visitante entende, em uma frase, que o kit entrega texto e o commit é dele.
- Nenhum número escrito à mão sobre o kit: contagens vêm do snapshot.

## 4. Escopo — obrigatória

**Dentro:**
- Snapshot do kit em 0.3.1 (`npm run sync:kit`).
- Seção Comandos em quatro grupos — Fases, Navegação, **Mudança** e Apoio —, com os cinco comandos novos.
- Explicação de que o kit nunca commita nem abre PR; prévias que refletem o comportamento atual (`/sdd-execute`, `/sdd-setup`).
- Terminal do hero com as opções A–F do `/sdd-start`.
- Contagens de comandos e skills (arquitetura, instalação, árvore do repositório) lidas do snapshot.

**Fora:**
- Seções novas, telas novas ou mudança de layout — a interface continua a da SPEC-UI-001.
- Exemplos novos de demanda para os fluxos de mudança e bug (as duas demandas do PRD-001 continuam as mesmas).
- Mudanças no kit.

## 5. Quem usa — obrigatória quando há interface

Os mesmos perfis do PRD-001: devs que avaliam o kit, quem já usa e quer ver o que mudou, e quem segue o link do repositório.

## 6. Quebra para o board — obrigatória

- **Funcionalidade:** site atualizado para o kit 0.3.1
  - **História:** comandos do kit 0.3.1 em quatro grupos, com prévia (RN-17)
  - **História:** o kit nunca commita, explicado no site (RN-18)
  - **História:** textos e contagens do kit atualizados (RN-19)

## 7. Fluxos — obrigatória quando há interação

Sem fluxo novo. A seção Comandos mantém o comportamento do PRD-001: prévia com hover ou foco no desktop, sempre visível no celular e em telas de toque, Esc dispensa (UI-07 da SPEC-UI-001).

## 8. Regras de negócio — obrigatória

- **RN-17:** A seção de comandos lista todos os comandos do kit 0.3.1 (17) em quatro grupos — Fases (`/sdd-architect`, `/sdd-prd`, `/sdd-prototype`, `/sdd-plan`, `/sdd-execute`, `/sdd-review`), Navegação (`/sdd-start`, `/sdd-next`, `/sdd-trace`), Mudança (`/sdd-change`, `/sdd-bug`, `/sdd-adr`) e Apoio (`/sdd-setup`, `/spike`, `/code-review`, `/commit-message`, `/pr-description`) —, cada um com quando usar, o que gera, a chamada no Codex (`$nome`) e uma prévia de 2 a 3 linhas. No Claude Code, o code-review do kit aparece como `/my-ai-toolkit:code-review`. A lista é conferida com o snapshot do kit. Substitui a RN-04 do PRD-001. (ADR-007)
- **RN-18:** O site diz que o kit nunca commita nem abre PR: a seção Comandos explica que o `/commit-message` e o `/pr-description` entregam texto, e nenhuma prévia mostra o kit commitando ou sugerindo commit fora do review (a mensagem de commit da tarefa sai do `/sdd-review` aprovado, não do `/sdd-execute`).
- **RN-19:** Os textos que descrevem o kit acompanham a versão do snapshot: o terminal do hero mostra as opções A–F do `/sdd-start`, e as contagens de comandos e skills (bloco Skills da arquitetura, conferência do `/plugin` na instalação, nota de `skills/` na árvore do repositório) são lidas do snapshot, nunca escritas à mão. (ADR-007)

A RN-13 do PRD-001 (versão lida do snapshot) continua valendo e passa a mostrar `0.3.1` sem mudança de regra.

## 9. Critérios de aceite — obrigatória

```gherkin
Funcionalidade: Site atualizado para o MyAiToolKit 0.3.1

  Cenário [CA-28]: Comandos do kit 0.3.1 em quatro grupos
    Dado que estou na seção "Comandos"
    Então vejo um chip por comando do snapshot, 17 no kit 0.3.1 (RN-17)
    E os grupos são Fases, Navegação, Mudança e Apoio, nesta ordem
    E o grupo Mudança traz "/sdd-change", "/sdd-bug" e "/sdd-adr"
    E o grupo Apoio traz "/commit-message" e "/pr-description"
    E cada chip diz quando usar, o que gera e a chamada no Codex

  Cenário [CA-29]: O kit nunca commita
    Dado que estou na seção "Comandos"
    Então a introdução diz que o kit nunca commita nem abre PR (RN-18)
    E a prévia do "/sdd-execute" não sugere commit
    E as prévias do "/commit-message" e do "/pr-description" entregam texto

  Cenário [CA-30]: Textos do kit acompanham o snapshot
    Dado que o site foi construído com o snapshot do kit 0.3.1
    Então o terminal do hero mostra as opções "A · B · C · D · E · F" do "/sdd-start" (RN-19)
    E o bloco Skills da arquitetura, a conferência do "/plugin" na instalação e a nota de "skills/" na árvore do repositório mostram 17
```

## 11. Dados e integrações — obrigatória quando se aplica

- `src/data/kit.json`, gerado por `npm run sync:kit` a partir do kit local (`KIT_PATH`) ou do repositório (`KIT_REPO`). Snapshot alvo: versão `0.3.1`, commit `e283458` do MyAiToolKit. (ADR-007)

## 13. Encaixe técnico (opcional)

- **Interface:** sem SPEC-UI nova. Muda o conteúdo da UI-07 (Comandos) e o texto de UI-02 (hero), UI-09 (arquitetura), UI-11 (instalação) e UI-12 (open source) da `SPEC-UI-001`; layout e estados continuam os mesmos.
- `src/lib/commands.ts` ganha o grupo `mudanca`; o build continua falhando se o snapshot tiver comando sem grupo.

## 15. Riscos e dependências — obrigatória

- **Snapshot desatualizado de novo** quando o kit crescer — mitigado pelo teste de sincronização com o kit e pelo teste que fixa os 17 comandos (lembra de abrir um PRD novo).
- **Prévia inventada** — as prévias dos comandos novos citam caminhos e status reais do kit 0.3.1 (`docs/sdd/bugs/`, `Cancelado`, seção Revisões); o review confere com o kit.

## 17. Referências (opcional)

- PRD de base: `docs/sdd/prds/PRD-001-landing-page.md` (RN-04 e CA-14 substituídos por RN-17 e CA-28).
- Interface: `docs/sdd/prototype/SPEC-UI-001-landing-page.md` (UI-02, UI-07, UI-09, UI-11, UI-12).
- Kit: https://github.com/fbzsaullo/MyAiToolKit — `CHANGELOG.md` (0.2.0, 0.3.0, 0.3.1).
