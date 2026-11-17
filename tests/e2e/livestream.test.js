import { test, expect } from '@playwright/test';

test('opens the scheduled public broadcast and shows the no-signal waiting screen', async ({ page }) => {
  await page.goto('/');
  const isMobile = page.viewportSize().width <= 600;
  const openButton = isMobile
    ? page.getByRole('button', { name: 'MasterWhats ao vivo' })
    : page.locator('.nav-rail-btn[aria-label="MasterWhats ao vivo"]');

  await openButton.click();
  await expect(page).toHaveURL(/#\/livestream$/);
  await expect(page.getByRole('heading', { name: 'Audiência pública — Caso Banco Master' })).toBeVisible();
  await expect(page.locator('.livestream-status')).toContainText('AGENDADA · TESTE');
  await expect(page.getByRole('heading', { name: 'A TRANSMISSÃO AINDA NÃO ESTÁ DISPONÍVEL' })).toBeVisible();
  await expect(page.locator('.livestream-panel')).toContainText('O Senado Federal ainda não disponibilizou o link da transmissão.');
  await expect(page.locator('.livestream-panel iframe')).toHaveCount(0);
  await expect(page.locator('.livestream-details')).toContainText('Andrei Rodrigues');
  await expect(page.locator('.livestream-details')).toContainText('Wellington César Lima e Silva');

  if (isMobile) {
    await page.getByRole('button', { name: 'Voltar para conversas' }).click();
  } else {
    await page.locator('.nav-rail-btn[aria-label="Conversas"]').click();
  }
  await expect(page).toHaveURL(/#\/$/);
});
