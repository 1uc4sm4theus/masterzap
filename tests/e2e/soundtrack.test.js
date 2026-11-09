import { test, expect } from '@playwright/test';

test('opens Trilha Sonora, loads the Deezer preview player, and keeps it while navigating', async ({ page }) => {
  await page.goto('/');
  const isMobile = page.viewportSize().width <= 600;
  const menuButton = isMobile
    ? page.locator('.sidebar-soundtrack-link')
    : page.locator('.nav-rail-btn[aria-label="Trilha Sonora"]');

  await menuButton.click();
  await expect(page).toHaveURL(/#\/soundtrack$/);
  await expect(page.getByRole('heading', { name: 'Trilha Sonora' })).toBeVisible();
  await expect(page.locator('.soundtrack-track')).toHaveCount(34);
  await expect(page.locator('.soundtrack-track').first()).toContainText('Caminho no Deserto');
  await expect(page.locator('.soundtrack-track').nth(1)).toContainText('Eu Só Quero Tua Presença');

  const widgetResponse = page.waitForResponse(response =>
    response.url().includes('/widget/dark/track/1589515782'),
  );
  await page.locator('.soundtrack-play').first().click();
  const response = await widgetResponse;
  expect(response.status()).toBe(200);
  await expect(page.locator('.soundtrack-player')).toBeVisible();
  await expect(page.locator('.soundtrack-player iframe')).toHaveAttribute(
    'src',
    'https://widget.deezer.com/widget/dark/track/1589515782',
  );

  if (isMobile) {
    await page.locator('.soundtrack-back').click();
  } else {
    await page.locator('.nav-rail-btn[aria-label="Conversas"]').click();
  }
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.locator('.conversation-list')).toBeVisible();
  await expect(page.locator('.soundtrack-player iframe')).toHaveCount(1);

  await page.locator('.conversation-item').first().click();
  await expect(page.locator('.chat-view')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.soundtrack-player iframe')).toHaveCount(1);
});
