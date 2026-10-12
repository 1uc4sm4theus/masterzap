import { test, expect } from '@playwright/test';

test('opens the unidentified interlocutor with no invented date or message continuation', async ({ page }) => {
  await page.goto('/#/chat/interlocutor-nao-identificado-01');
  await expect(page.locator('.chat-header-name')).toHaveText('interlocutor-nao-identificado-01', { timeout: 20000 });
  await expect(page.locator('.chat-date-badge')).toHaveText('Data e horário não informados');
  await expect(page.locator('.chat-msg-row[data-id="1"]'))
    .toContainText('Se eu não tivesse apaixonado…');
});
