import { test, expect } from '@playwright/test';

test('opens amiga-anonima-01 and labels the date at month precision', async ({ page }) => {
  await page.goto('/#/chat/amiga-anonima-01');
  await expect(page.locator('.chat-header-name')).toHaveText('amiga-anonima-01', { timeout: 20000 });
  await expect(page.locator('.chat-date-badge')).toHaveText('julho de 2024');
  await expect(page.locator('.chat-msg-row[data-id="1"]'))
    .toContainText('Ontem fui parar na festa da Anitta. Ela quase me estuprou. Saí correndo');
});
