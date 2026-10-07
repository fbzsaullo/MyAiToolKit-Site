# ADR-010: Hospedar Geist e Geist Mono no próprio site, via pacotes Fontsource

- **Status:** Substituído por ADR-013
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

A tipografia é Geist (títulos e texto) e Geist Mono (código, comandos e IDs), licença OFL, em WOFF2 com os subconjuntos latin e latin-ext, hospedadas no site. Nenhuma CDN externa. Pré-carregamento só do peso do título e `font-display: swap`.

## Decisão

- Pacotes **`@fontsource/geist-sans`** e **`@fontsource/geist-mono`** como fonte dos arquivos WOFF2, importando apenas os pesos usados (400, 500 e 600 da Geist; 400 e 500 da Geist Mono) e os subconjuntos latin e latin-ext.
- Os arquivos entram no build do Astro com nome com hash (cache imutável, ADR-011).
- `<link rel="preload">` apenas para Geist 600 latin, usado no título do hero.
- `font-display: swap` e métricas de fallback ajustadas (`size-adjust`) para manter o CLS perto de zero.

## Motivos

- Fontsource empacota os arquivos oficiais em WOFF2 por peso e subconjunto, prontos para importar.
- Servir do próprio domínio evita requisições a terceiros e respeita a CSP.

## Opções descartadas

### Google Fonts ou outra CDN
- **Por que não:** requisição a terceiros, proibida.

### Fonte variável inteira
- **Por que não:** um arquivo maior que a soma dos pesos usados.

## Consequências

### O que melhora
- Fontes rápidas, privadas e cacheáveis por um ano.

### O que piora ou fica para depois
- **Dívida:** pesos novos exigem novos imports.

## Para quem vai implementar

- Imports em `src/styles/fonts.css`; conferir que os arquivos finais são `.woff2` e só dos subconjuntos latin e latin-ext.

## Referências

- Fontsource — Geist: https://fontsource.org/fonts/geist-sans
- Geist (Vercel), licença OFL
