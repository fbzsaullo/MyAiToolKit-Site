# ADR-011: Hospedar na Netlify com cabeçalhos de cache e de segurança versionados no `netlify.toml`

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

A hospedagem é na Netlify. São exigidos: `npm run build` publicando `dist`, versão do Node fixada, cache para assets com hash, CSP sem terceiros, `X-Content-Type-Options` e `Referrer-Policy`. O site tem dois scripts inline (idioma e tema) e ilhas JavaScript servidas do próprio domínio.

## Decisão

`netlify.toml` com:

- `[build] command = "npm run build"`, `publish = "dist"`, `NODE_VERSION = "24"` (a mesma versão usada no desenvolvimento).
- Cache: `/_astro/*` e fontes com `Cache-Control: public, max-age=31536000, immutable`; HTML com `public, max-age=0, must-revalidate`.
- Segurança em todas as rotas:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-<hash do script inline>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'`;
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy` desligando câmera, microfone, geolocalização e tópicos de interesse.
- O hash do script inline é calculado no build e escrito no cabeçalho por um passo de pós-build, para não ficar desatualizado.
- `/404.html` em pt-BR e en.

## Motivos

- Cabeçalhos versionados junto com o código são revisáveis e testáveis no deploy de prévia.
- Hash em vez de `'unsafe-inline'` em `script-src` mantém a CSP estrita mesmo com os scripts inline necessários (ADR-008, ADR-009).

## Opções descartadas

### `'unsafe-inline'` em `script-src`
- **Por que não:** anularia a proteção da CSP contra injeção de script.

### Cabeçalhos configurados no painel da Netlify
- **Por que não:** ficam fora do controle de versão.

## Consequências

### O que melhora
- Cache longo nos assets e política de segurança forte.

### O que piora ou fica para depois
- **Dívida:** `style-src 'unsafe-inline'` é necessário para estilos com escopo gerados pelo Astro e atributos `style` das ilhas.
  - **Vira problema quando:** surgir conteúdo de terceiros na página.
  - **Como resolver:** estilos com hash/nonce; hoje o risco é baixo, pois não há conteúdo externo.

## Para quem vai implementar

- `netlify.toml`, script de pós-build para o hash, verificação dos cabeçalhos no deploy de prévia.
- Sem `_redirects` de idioma (ADR-008).

## Referências

- Netlify — configuração por arquivo: https://docs.netlify.com/configure-builds/file-based-configuration/
- MDN — Content-Security-Policy
