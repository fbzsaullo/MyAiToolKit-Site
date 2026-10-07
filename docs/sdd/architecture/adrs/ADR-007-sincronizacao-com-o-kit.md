# ADR-007: Sincronizar comandos e versão do kit por script, gravando um snapshot versionado

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O site lista os 12 comandos do kit e mostra a versão (`0.1.0`). Esses dados vivem nos `SKILL.md` (frontmatter `name` e `description`) e no `.claude-plugin/plugin.json` do repositório do kit, que é **outro repositório**. A demanda pede para ler essas fontes se for viável. O build da Netlify não deve depender de rede nem de outro repositório para funcionar.

## Decisão

Um script Node sem dependências externas (`scripts/sync-kit.mjs`, comando `npm run sync:kit`):

1. lê o kit de `KIT_PATH` (padrão `../MyAiToolKit`, a pasta irmã), ou, se a variável `KIT_REPO` estiver definida, faz um clone raso dela numa pasta temporária;
2. extrai `name` e `description` de cada `skills/*/SKILL.md` e a `version` do `plugin.json`;
3. grava `src/data/kit.json`, **versionado no repositório do site**.

O build lê só o snapshot. Um teste compara o snapshot com o kit quando o kit está disponível e avisa se estiver desatualizado.

**Premissa:** as `description` dos `SKILL.md` são longas e escritas para a IA escolher a skill. O site **não as exibe como estão**: usa o snapshot para garantir quais comandos existem e qual é a versão, e os textos curtos de cada chip ("quando usar", "o que gera") ficam nas coleções de conteúdo (ADR-006), revisados contra a descrição sincronizada.

## Motivos

- Build determinístico e sem rede: a Netlify constrói o mesmo site que a máquina local.
- O site não fica descrevendo um comando que o kit não tem: o teste quebra se a lista divergir.

## Opções descartadas

### Submódulo git do kit
- **Por que não:** acopla o histórico dos dois repositórios e complica o clone e o build para quem contribui.

### Buscar do GitHub a cada build
- **Por que não:** o build passaria a depender da rede e da API do GitHub, e poderia mudar sem ninguém ter alterado o site.

### Exibir a `description` dos `SKILL.md` direto
- **Por que não:** é texto para máquina (gatilhos de ativação), longo demais para um chip e só em português.

## Consequências

### O que melhora
- Lista de comandos e versão verificáveis contra a fonte.

### O que piora ou fica para depois
- **Dívida:** sincronizar é um passo manual.
  - **Vira problema quando:** o kit lançar versões e ninguém rodar `sync:kit`.
  - **Como resolver:** workflow agendado no CI que roda a sincronização e abre um PR.

## Para quem vai implementar

- `scripts/sync-kit.mjs`, `src/data/kit.json`, script `sync:kit` no `package.json`.
- O parser de frontmatter lê só as chaves de topo `name`, `description` e `version` (sem biblioteca YAML).

## Referências

- Repositório do kit: https://github.com/fbzsaullo/MyAiToolKit
