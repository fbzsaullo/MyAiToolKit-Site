import { expect, test } from '@playwright/test';

test('rotas respondem', async ({ request }) => {
  for (const path of ['/']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});
