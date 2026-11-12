import { test, expect } from '@playwright/test';

test.describe('Fast native chat printing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__printCalls = 0;
      window.print = () => { window.__printCalls += 1; };
    });
    await page.goto('/#/chat/alexandre-de-moraes');
    await expect(page.locator('.chat-msg-bubble').first()).toBeVisible();
  });

  test('opens the browser print flow from the chat menu', async ({ page }) => {
    await page.locator('.chat-header button[aria-label="Menu"]').click();
    const printAction = page.locator('.chat-dropdown-item', { hasText: 'Imprimir conversa' });
    await expect(printAction).toBeVisible();
    await printAction.click();
    await expect(page.locator('.chat-dropdown-menu')).toBeHidden();
    expect(await page.evaluate(() => window.__printCalls)).toBe(1);
  });

  test('print styles hide navigation and expand the loaded messages', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.sidebar')).toBeHidden();
    const overflow = await page.locator('.chat-messages').evaluate(el => getComputedStyle(el).overflowY);
    expect(overflow).toBe('visible');
  });
});
