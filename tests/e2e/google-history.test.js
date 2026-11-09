import { test, expect } from '@playwright/test';

test('opens the attributed Google search history from navigation and filters it', async ({ page }) => {
  await page.goto('/');
  const isMobile = page.viewportSize().width <= 600;
  const menuButton = isMobile
    ? page.locator('.sidebar-google-history-link')
    : page.locator('.nav-rail-btn[aria-label="Histórico do Google"]');

  await menuButton.click();
  await expect(page).toHaveURL(/#\/google-history$/);
  await expect(page.getByRole('heading', { name: 'Google' })).toBeVisible();
  await expect(page.locator('.google-history-entry')).toHaveCount(3);
  await expect(page.locator('.google-history-date')).toContainText('16 de novembro de 2025');
  await expect(page.locator('.google-history-disclaimer')).toContainText('não correspondem a uma exportação');

  const search = page.getByRole('searchbox', { name: 'Filtrar pesquisas do Google' });
  await search.fill('Soares Leite');
  await expect(page.locator('.google-history-entry:visible')).toHaveCount(1);
  await expect(page.locator('.google-history-entry:visible')).toContainText('Quem é Ricardo Soares Leite?');

  if (isMobile) {
    await page.getByRole('button', { name: 'Voltar para conversas' }).click();
  } else {
    await page.locator('.nav-rail-btn[aria-label="Conversas"]').click();
  }
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.locator('.conversation-list')).toBeVisible();
});
