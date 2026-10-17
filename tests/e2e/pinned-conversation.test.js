import { test, expect } from '@playwright/test';

test.describe('Pinned conversations', () => {
  test('pins Martha without replacing sidebar rows or their images', async ({ page }) => {
    test.skip(page.viewportSize().width <= 600, 'Sidebar hidden when chat is open on mobile');
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/#/chat/martha-graeff');

    const marthaRow = page.locator('.conversation-item[data-id="martha-graeff"]');
    await expect(marthaRow).toBeVisible();
    await expect(page.locator('.chat-view')).toBeVisible({ timeout: 10000 });

    const rowsBefore = await page.locator('.conversation-item').evaluateAll(items =>
      items.map(item => ({
        id: item.dataset.id,
        image: item.querySelector('img')?.getAttribute('src') || null,
      }))
    );

    await page.locator('.chat-header button[aria-label="Menu"]').click();
    const pinItem = page.locator('.chat-dropdown-item', { hasText: 'Fixar conversa' });
    await expect(pinItem).toBeVisible();
    await pinItem.click();

    await expect(page.locator('.conversation-list > .conversation-item').first())
      .toHaveAttribute('data-id', 'martha-graeff');
    await expect(page.locator('.search-toast')).toContainText('Conversa fixada');

    const rowsAfter = await page.locator('.conversation-item').evaluateAll(items =>
      items.map(item => ({
        id: item.dataset.id,
        image: item.querySelector('img')?.getAttribute('src') || null,
      }))
    );
    expect(rowsAfter).toHaveLength(rowsBefore.length);
    expect(new Map(rowsAfter.map(row => [row.id, row.image])))
      .toEqual(new Map(rowsBefore.map(row => [row.id, row.image])));
    await expect(marthaRow).toHaveClass(/conversation-item-pinned/);
  });
});
