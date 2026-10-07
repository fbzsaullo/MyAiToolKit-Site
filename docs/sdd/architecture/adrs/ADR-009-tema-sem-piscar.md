# ADR-009: Seguir o tema do sistema, com troca manual lembrada e aplicada antes da primeira pintura

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O site tem tema claro e escuro. Ele segue `prefers-color-scheme`, permite troca manual lembrada e não pode piscar o tema errado ao carregar. Sem cookies.

## Decisão

- Sem escolha salva, o CSS segue `prefers-color-scheme` sozinho (ADR-002), sem depender de JavaScript.
- O mesmo script inline do idioma (ADR-008) lê `localStorage` (`matk-theme`: `light` ou `dark`) e, se houver escolha, aplica `data-theme` no `<html>` antes da primeira pintura.
- O botão do cabeçalho alterna e grava a escolha; também é possível voltar a "seguir o sistema".
- A logo troca entre `myaitoolkit-wordmark-black.svg` e `myaitoolkit-wordmark-white.svg` por CSS, conforme o tema.

## Motivos

- Script síncrono no `<head>` é a única forma de aplicar a escolha manual sem flash.
- Sem escolha, nenhum JavaScript é necessário.

## Opções descartadas

### Aplicar o tema depois do carregamento
- **Por que não:** pisca o tema errado em toda visita com escolha manual.

### Cookie lido no servidor
- **Por que não:** cookies proibidos e site estático.

## Consequências

### O que melhora
- Tema correto desde o primeiro quadro.

### O que piora ou fica para depois
- **Dívida:** o script inline precisa estar na CSP por hash; mudar o script exige atualizar o hash.
  - **Como resolver:** gerar o hash no build (ADR-011).

## Para quem vai implementar

- `data-theme` no `<html>`; tokens do tema escuro em `:root[data-theme="dark"]` e no media query quando não houver `data-theme`.
- `<meta name="color-scheme" content="light dark">` e `theme-color` do `head-snippet.html`.
- Teste: escolha manual persiste entre recargas e não há troca visual na carga (ADR-012).

## Referências

- WCAG 2.2 — 1.4.3 Contraste mínimo
