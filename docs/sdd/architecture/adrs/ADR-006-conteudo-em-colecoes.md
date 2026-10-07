# ADR-006: Guardar o conteúdo em coleções do Astro por idioma, com os exemplos como dados compartilhados

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O site existe em pt-BR e en. Textos de comandos, fases, benefícios e stacks se repetem em várias seções. As duas demandas fictícias ("Criação de um novo projeto" e "Recuperação de senha") precisam usar **os mesmos IDs** em todas as seções (pipeline, rastreabilidade, laço, review) para que tudo se conecte. Os nomes dos comandos não se traduzem.

## Decisão

- Coleções de conteúdo do Astro em `src/content/`, validadas com esquema:
  - `ui/` — textos de interface por idioma (`pt-BR.json`, `en.json`);
  - `sections/` — textos das seções por idioma;
  - `examples/` — as duas demandas, com **estrutura e IDs escritos uma única vez** e apenas os textos traduzíveis separados por idioma.
- Componentes recebem conteúdo; nenhum componente tem texto fixo.
- Um teste garante que os dois idiomas têm as mesmas chaves (ADR-012).

## Motivos

- Uma única fonte para os IDs elimina o risco de o `RN-02` do pipeline ser diferente do `RN-02` da rastreabilidade.
- O esquema pega chave faltando no build, não em produção.
- Separar estrutura de texto deixa a tradução mexer só em texto.

## Opções descartadas

### Biblioteca de i18n no cliente
- **Por que não:** JavaScript no carregamento e conteúdo invisível para quem não executa JS.

### Duas páginas `.astro` com o texto embutido
- **Por que não:** duplicaria a estrutura e os IDs, e as versões divergiriam.

## Consequências

### O que melhora
- Conteúdo revisável fora do código; exemplos coerentes entre seções e idiomas.

### O que piora ou fica para depois
- **Dívida:** traduções feitas à mão.
  - **Vira problema quando:** o volume de texto crescer.
  - **Como resolver:** teste de chaves já previsto; revisão por pessoa fluente.

## Para quem vai implementar

- `src/content.config.ts` com os esquemas.
- Os IDs dos exemplos seguem as regras de `templates/id-conventions.md` do kit (validação no teste).

## Referências

- Astro — coleções de conteúdo: https://docs.astro.build/en/guides/content-collections/
