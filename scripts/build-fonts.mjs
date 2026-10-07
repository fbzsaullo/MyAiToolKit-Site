// Gera os subconjuntos WOFF2 de Geist e Geist Mono a partir dos arquivos oficiais
// (pacote `geist`, licença OFL) — ADR-013.
//
//   npm run build:fonts
//
// Os arquivos gerados ficam versionados em src/assets/fonts/ e só precisam ser
// refeitos quando a versão do pacote `geist` mudar.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import subsetFont from 'subset-font';

const SOURCE = 'node_modules/geist/dist/fonts';
const TARGET = 'src/assets/fonts';

// Faixas usadas pelo Google Fonts para os subconjuntos latin e latin-ext.
const SUBSETS = {
  latin: [
    [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6, 0x02c6],
    [0x02da, 0x02da], [0x02dc, 0x02dc], [0x0304, 0x0304], [0x0308, 0x0308], [0x0329, 0x0329],
    [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2190, 0x21ff], [0x2212, 0x2212],
    [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd],
  ],
  'latin-ext': [
    [0x0100, 0x02ba], [0x02bd, 0x02c5], [0x02c7, 0x02cc], [0x02ce, 0x02d7], [0x02dd, 0x02ff],
    [0x1d00, 0x1dbf], [0x1e00, 0x1e9f], [0x1ef2, 0x1eff], [0x2020, 0x2020], [0x20a0, 0x20ab],
    [0x20ad, 0x20c0], [0x2113, 0x2113], [0x2c60, 0x2c7f], [0xa720, 0xa7ff],
  ],
};

const FONTS = [
  { family: 'Geist', file: 'geist-sans/Geist-Regular.woff2', weight: 400, slug: 'geist' },
  { family: 'Geist', file: 'geist-sans/Geist-Medium.woff2', weight: 500, slug: 'geist' },
  { family: 'Geist', file: 'geist-sans/Geist-SemiBold.woff2', weight: 600, slug: 'geist' },
  { family: 'Geist Mono', file: 'geist-mono/GeistMono-Regular.woff2', weight: 400, slug: 'geist-mono' },
  { family: 'Geist Mono', file: 'geist-mono/GeistMono-Medium.woff2', weight: 500, slug: 'geist-mono' },
];

const textFor = (ranges) =>
  ranges.flatMap(([from, to]) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i))).join('');

mkdirSync(TARGET, { recursive: true });

for (const font of FONTS) {
  const original = readFileSync(join(SOURCE, font.file));
  for (const [subset, ranges] of Object.entries(SUBSETS)) {
    const output = await subsetFont(original, textFor(ranges), { targetFormat: 'woff2' });
    const name = `${font.slug}-${font.weight}-${subset}.woff2`;
    writeFileSync(join(TARGET, name), output);
    console.log(`${name}: ${(output.length / 1024).toFixed(1)} KB`);
  }
}
