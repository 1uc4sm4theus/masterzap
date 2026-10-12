import { test, expect } from '@playwright/test';

test('opens the Cezinha de Madureira conversation from its direct chat route', async ({ page }) => {
  await page.goto('/#/chat/cezinha-de-madureira');
  await expect(page.locator('.chat-header-name')).toHaveText('Cezinha de Madureira', { timeout: 20000 });
  await expect(page.locator('.chat-msg-row[data-id="1"]')).toBeVisible();
  await expect(page.locator('.chat-msg-row[data-id="9"]')).toContainText('Ministro já está te esperando');
});
