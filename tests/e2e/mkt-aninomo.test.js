import { test, expect } from '@playwright/test';

test('opens the Mkt-aninomo conversation from its direct chat route', async ({ page }) => {
  await page.goto('/#/chat/mkt-aninomo');
  await expect(page.locator('.chat-header-name')).toHaveText('Mkt-aninomo', { timeout: 20000 });
  await expect(page.locator('.chat-msg-row[data-id="1"]')).toBeVisible();
  await expect(page.locator('.chat-msg-row[data-id="1"]')).toContainText('A conversa com a Prioli foi excelente');
  await expect(page.locator('.chat-msg-row[data-id="14"]')).toBeVisible();
});
