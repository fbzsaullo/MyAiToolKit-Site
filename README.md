# MyAiToolKit — site

Landing page do [MyAiToolKit](https://github.com/fbzsaullo/MyAiToolKit): página única em pt-BR (`/`) e en (`/en/`), estática, monocromática e sem rastreadores. Feita com Astro e ilhas Preact.

> **Este site foi feito com o MyAiToolKit.** Arquitetura, ADRs, PRD, SPEC-UI, plano, um review por tarefa e a matriz de rastreabilidade estão em [`docs/sdd/`](docs/sdd/).

## Rodar

Requer Node 24 (`.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # gera dist/ (com a CSP em dist/_headers)
npm run preview    # serve o build
```

## Testar

```bash
npx playwright install chromium   # só na primeira vez
npm test           # build + orçamento de JS + links + Playwright (desktop e celular)
```

Os cenários do PRD aparecem nos testes com o ID no nome: `test("CA-XX: …")`.

## Publicar na Netlify

1. Na Netlify, crie um site a partir deste repositório.
2. O `netlify.toml` já define o build (`npm run build`, pasta `dist`, Node 24), o cache imutável de `/_astro/*`, os cabeçalhos de segurança e a página 404 em inglês.
3. A CSP com os hashes dos scripts inline é gerada no pós-build em `dist/_headers`. Não edite esse arquivo à mão.

Endereço provisório: `https://myaitoolkit.netlify.app`. Para trocar de domínio, atualize `site` em `astro.config.mjs`.

## Conteúdo

- Os textos ficam em `src/content/ui/` (um JSON por idioma) e as duas demandas de exemplo em `src/content/examples/`.
- A lista de comandos e a versão do kit vêm de `src/data/kit.json`. Para atualizar a partir do repositório do kit, rode `npm run sync:kit` (`KIT_PATH`, padrão `../MyAiToolKit`).
- `brand/` guarda a marca original e não deve ser alterada; os ícones são copiados para `public/` no build.
