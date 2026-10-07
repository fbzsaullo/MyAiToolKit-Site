import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// ADR-014: repositório do site público só para leitura.
test('repositório do site com todos os direitos reservados', () => {
  const license = readFileSync('LICENSE', 'utf8');
  expect(license).toContain('Todos os direitos reservados.');
  expect(license).toContain('All rights reserved.');
  expect(license).toContain('docs/sdd/');
  // Nenhuma licença aberta declarada por engano.
  // (a menção à licença MIT do kit é esperada; o que não pode haver é uma concessão de uso.)
  expect(license).not.toMatch(/Permission is hereby granted|Creative Commons|SPDX-License-Identifier/i);

  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.license).toBe('UNLICENSED');
  expect(pkg.private).toBe(true);

  const readme = readFileSync('README.md', 'utf8');
  expect(readme).toMatch(/## Licença[\s\S]*somente para consulta/);
});
