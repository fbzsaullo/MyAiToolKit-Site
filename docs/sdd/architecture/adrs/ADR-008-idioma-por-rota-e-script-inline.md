# ADR-008: Separar idiomas por rota e detectar o idioma no primeiro acesso com script inline e `localStorage`

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O site tem pt-BR em `/` e en em `/en/`. No primeiro acesso, o idioma segue o navegador (`pt*` → português; demais → inglês). Há troca manual no cabeçalho e no rodapé, a escolha precisa ser lembrada e **sempre vencer** a detecção. A demanda proíbe cookies. As opções de detecção eram: redirecionamento na CDN (`_redirects` com condição `Language`) ou script inline mínimo.

## Decisão

- Rotas estáticas `/` e `/en/` com o roteamento i18n do Astro (`defaultLocale: 'pt-BR'`, `prefixDefaultLocale: false`), `lang` correto no `<html>`, `<link rel="alternate" hreflang>` para `pt-BR`, `en` e `x-default`.
- Um **script inline no `<head>`**, antes de qualquer CSS bloqueante, decide o idioma:
  1. se há escolha salva em `localStorage` (`matk-lang`), ela manda;
  2. senão, `navigator.languages[0]` começando com `pt` → português; qualquer outro → inglês;
  3. se o idioma decidido for diferente da página atual, `location.replace()` para a rota certa.
- A troca manual grava `matk-lang` e navega para a rota escolhida.
- Robôs de busca (sem JavaScript ou com idioma fixo) indexam as duas rotas pelo `hreflang`.

## Motivos

- O redirecionamento por `Language` na Netlify só pode ser vencido por cookie (`nf_lang`), e cookies estão proibidos. No navegador, a preferência em `localStorage` vence sempre, sem cookie.
- O script é pequeno e roda antes da pintura: quem vai para `/en/` não chega a ver o português.
- Todo o conteúdo continua acessível por URL direta, com ou sem JavaScript.

## Opções descartadas

### `_redirects` com condição `Language` na Netlify
- **Em resumo:** 302 de `/` para `/en/` conforme `Accept-Language`.
- **Por que não:** a escolha manual por português seria desfeita a cada visita, a menos que se usasse cookie.

### Uma rota só, trocando o texto por JavaScript
- **Por que não:** conteúdo invisível sem JS, sem `lang` correto por página e ruim para busca.

## Consequências

### O que melhora
- Preferência sempre respeitada, sem cookie e sem banner.

### O que piora ou fica para depois
- **Dívida:** visitantes de outros idiomas fazem um redirecionamento no navegador no primeiro acesso.
  - **Vira problema quando:** o redirecionamento afetar o LCP de forma mensurável.
  - **Como resolver:** medir no Lighthouse; se necessário, servir `/en/` como `x-default`.

## Para quem vai implementar

- Script inline compartilhado com o do tema (ADR-009), com o mínimo de bytes possível e permitido na CSP por hash (ADR-011).
- Testes: navegador em `en-US` vai para `/en/`; em `pt-BR` fica em `/`; escolha manual vence a detecção (ADR-012).

## Referências

- Astro — roteamento i18n: https://docs.astro.build/en/guides/internationalization/
- Netlify — redirecionamento por idioma: https://docs.netlify.com/routing/redirects/redirect-options/
