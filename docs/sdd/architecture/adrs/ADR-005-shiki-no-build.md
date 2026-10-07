# ADR-005: Realçar código com Shiki no build, usando um tema monocromático próprio

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O site mostra muito código: comandos de instalação, trechos de documentos do kit, terminais, YAML do `config.yml`. A identidade exige realce monocromático (palavras-chave em `text` peso 500, strings em `text-2`, comentários em `text-muted`, comandos `/sdd-*` sublinhados), blocos que seguem o tema e terminais sempre escuros.

## Decisão

Usamos **Shiki** no build, com um **tema próprio** que, em vez de cores fixas, emite referências às variáveis CSS dos tokens. O HTML sai pronto e colorido pelo CSS, então o mesmo bloco funciona nos temas claro e escuro sem duplicação. Os comandos `/sdd-*`, `/spike` e `/code-review` recebem uma classe por transformador do Shiki para o sublinhado.

## Motivos

- Zero JavaScript no navegador para realce.
- Tema por variáveis CSS respeita a troca de tema sem gerar dois blocos.
- Shiki é o realce integrado do Astro.

## Opções descartadas

### Prism ou highlight.js no navegador
- **Por que não:** JavaScript extra no cliente e trabalho repetido a cada visita.

### Dois temas do Shiki (claro/escuro) com troca por classe
- **Por que não:** duplica o markup ou as cores inline; com tokens CSS a troca já acontece sozinha.

## Consequências

### O que melhora
- Código legível, coerente com a paleta e sem custo em tempo de execução.

### O que piora ou fica para depois
- **Dívida:** o tema próprio cobre só as gramáticas usadas (bash, powershell, yaml, markdown, gherkin, ruby, json).
  - **Vira problema quando:** surgir outra linguagem nos exemplos.
  - **Como resolver:** acrescentar os escopos ao tema.

## Para quem vai implementar

- Tema em `src/lib/shiki-theme.ts`; componente `CodeBlock.astro` com cabeçalho (nome do arquivo ou abas), botão copiar e linha destacada.
- Rolagem horizontal só dentro do bloco.

## Referências

- Shiki: https://shiki.style
