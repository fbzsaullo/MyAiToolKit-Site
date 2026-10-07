import { expect, test } from '@playwright/test';
import { axeViolations, visit } from './helpers';

async function openTrace(browser: import('@playwright/test').Browser, path = '/') {
  const page = await visit(browser, { path });
  const trace = page.locator('[data-trace]');
  await trace.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(trace).toHaveAttribute('data-hydrated', 'true');
  return { page, trace };
}

test('CA-12: focar um ID destaca a cadeia', async ({ browser }) => {
  const { page, trace } = await openTrace(browser);
  const chain = trace.locator('.trace__chain');
  await expect(chain.locator('.trace__id')).toHaveCount(6);

  // Pelo teclado: Tab até o primeiro ID da cadeia.
  const rn02 = chain.getByRole('button', { name: 'RN-02' });
  await rn02.focus();
  await expect(rn02).toHaveAttribute('aria-pressed', 'true');
  await expect(rn02).toHaveAttribute('data-state', 'selected');
  await expect(rn02).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(rn02).toHaveCSS('color', 'rgb(255, 255, 255)');

  // A linha do RN-02 na matriz acende; as outras regras esmaecem.
  const row02 = trace.locator('tr[data-row="RN-02"]');
  for (const tag of await row02.locator('.trace__tag').all()) await expect(tag).toHaveAttribute('data-state', 'linked');
  await expect(trace.locator('tr[data-row="RN-04"] .trace__id')).toHaveAttribute('data-state', 'dim');
  await expect(trace.locator('tr[data-row="RN-04"] .trace__id')).toHaveCSS('opacity', '0.35');
  await expect(page.getByRole('status').filter({ hasText: 'RN-02' })).toBeAttached();

  // Com um clique numa regra da matriz: só a cadeia dela fica destacada.
  const rn04 = trace.locator('tr[data-row="RN-04"]').getByRole('button', { name: 'RN-04' });
  await rn04.click();
  await expect(rn04).toHaveAttribute('aria-pressed', 'true');
  await expect(rn02).toHaveAttribute('aria-pressed', 'false');
  await expect(trace.locator('tr[data-row="RN-04"] [data-key="T-05"]')).toHaveAttribute('data-state', 'linked');
  await expect(trace.locator('tr[data-row="RN-01"] [data-key="T-02"]')).toHaveAttribute('data-state', 'dim');
  await expect(chain.getByRole('button', { name: 'T-03', exact: true })).toHaveAttribute('data-state', 'dim');

  // O teste da cadeia e a coluna de testes da matriz são o mesmo elo.
  await chain.locator('[data-kind="test"] .trace__id').click();
  await expect(trace.locator('tr[data-row="RN-02"] [data-key="test:CA-03"]')).toHaveAttribute('data-state', 'selected');

  // Esc limpa a seleção.
  await page.keyboard.press('Escape');
  await expect(trace).not.toHaveAttribute('data-selected', /.+/);
  await expect(trace.locator('[data-state]')).toHaveCount(0);

  // Mede o contraste só depois que as transições de volta da inversão terminam.
  await expect
    .poll(() => trace.evaluate((el) => el.getAnimations({ subtree: true }).length))
    .toBe(0);
  expect(await axeViolations(page)).toEqual([]);
});

test('CA-13: elo quebrado aparece com rótulo', async ({ browser }) => {
  const { trace } = await openTrace(browser);
  const row = trace.locator('tr[data-row="RN-04"]');
  await expect(row).toHaveAttribute('data-broken', 'true');
  const broken = row.locator('[data-broken-link]');
  await expect(broken).toBeVisible();
  await expect(broken).toContainText('RN-04 sem teste');
  // Linha tracejada, sem depender de cor.
  await expect(broken.locator('.trace__broken-line')).toHaveCSS('border-top-style', 'dashed');
  await expect(broken.locator('.trace__broken-label')).toHaveCSS('border-top-style', 'dashed');
  // As demais regras têm teste.
  await expect(trace.locator('[data-broken-link]')).toHaveCount(1);
});

test('rastreabilidade em inglês', async ({ browser }) => {
  const { trace } = await openTrace(browser, '/en/');
  await expect(trace.locator('tr[data-row="RN-04"] [data-broken-link]')).toContainText('RN-04 has no test');
  await expect(trace.locator('.trace__chain .trace__id').first()).toHaveText('RN-02');
});

test('rastreabilidade completa sem JavaScript', async ({ browser }) => {
  const page = await visit(browser, { javaScriptEnabled: false });
  const trace = page.locator('[data-trace]');
  await expect(trace.locator('.trace__chain .trace__id')).toHaveCount(6);
  await expect(trace.locator('tbody tr')).toHaveCount(4);
  await expect(trace.locator('[data-broken-link]')).toContainText('RN-04 sem teste');
  // Sem JS não há destaque: os IDs ficam inertes.
  await expect(trace.locator('.trace__id').first()).toBeDisabled();
  await expect(trace.locator('[data-state]')).toHaveCount(0);
});

test('matriz rola só dentro dela no celular', async ({ browser }) => {
  const page = await visit(browser, { viewport: { width: 375, height: 800 } });
  const scroll = page.locator('.trace__scroll');
  await scroll.scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  const inner = await scroll.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(inner).toBe(true);
});
