# ADR-013: Gerar os subconjuntos latin e latin-ext da Geist a partir dos arquivos oficiais

- **Status:** Aceito
- **Data:** 2026-10-06
- **Responsável:** Fabrizio
- **Proposta:** [../proposta-arquitetural.md](../proposta-arquitetural.md)

## Contexto

O ADR-010 previa os pacotes Fontsource para hospedar Geist e Geist Mono em WOFF2 com os subconjuntos latin e latin-ext. Ao executar a T-04, o metadata do `@fontsource/geist-sans` 5.3.0 mostrou **apenas o subconjunto `latin`** (o `@fontsource/geist-mono` tem `latin-ext`). Seguir o ADR-010 deixaria a Geist sem latin-ext, contrariando a demanda.

## Decisão

- Usamos os WOFF2 **oficiais** do pacote `geist` (Vercel, licença OFL), fixado na versão 1.7.2.
- Um script (`scripts/build-fonts.mjs`, comando `npm run build:fonts`) gera, com a biblioteca `subset-font` (harfbuzz em WebAssembly, sem Python), os arquivos de cada peso usado em dois subconjuntos: `latin` (faixas do Google Fonts para latin, mais as setas U+2190–21FF usadas nos diagramas) e `latin-ext`.
- Os arquivos gerados ficam **versionados** em `src/assets/fonts/` e entram no build do Astro com nome com hash. O build não depende do script.
- `@font-face` com `unicode-range` por subconjunto: o navegador só baixa o latin-ext se a página tiver caracteres dessa faixa (pt-BR e en ficam no latin).
- Demais pontos do ADR-010 continuam valendo: pesos 400/500/600 (Geist) e 400/500 (Geist Mono), `font-display: swap`, preload só da Geist 600 latin.

## Motivos

- Cumpre a demanda (latin e latin-ext) para as duas famílias com a mesma origem e o mesmo processo.
- Arquivos oficiais garantem fidelidade ao desenho da fonte.
- Subconjuntos versionados deixam o build determinístico e sem etapa extra.

## Opções descartadas

### Manter Fontsource para a Geist Sans só com latin
- **Por que não:** contraria a demanda; caracteres latin-ext cairiam na fonte do sistema.

### Servir os arquivos oficiais completos
- **Por que não:** cada peso completo tem cerca de 45 KB, contra ~22 KB do subconjunto latin.

### pyftsubset (fonttools)
- **Por que não:** exige Python no ambiente de desenvolvimento; `subset-font` roda no Node que o projeto já usa.

## Consequências

### O que melhora
- Cobertura latin + latin-ext real nas duas famílias, com arquivos pequenos.

### O que piora ou fica para depois
- **Dívida:** atualizar a Geist exige rodar `npm run build:fonts` e versionar os arquivos.
  - **Vira problema quando:** a versão do pacote `geist` mudar e ninguém regenerar.
  - **Como resolver:** a versão está fixada no `package.json`; regenerar faz parte de qualquer atualização dela.

## Para quem vai implementar

- `scripts/build-fonts.mjs`, `src/assets/fonts/*.woff2`, `src/styles/fonts.css`.
- Substitui o [ADR-010](ADR-010-fontes-geist-locais.md).

## Referências

- Geist (Vercel): https://vercel.com/font — licença OFL
- subset-font: https://github.com/papandreou/subset-font
