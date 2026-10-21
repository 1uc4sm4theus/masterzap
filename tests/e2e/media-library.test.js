import { test, expect } from '@playwright/test';

test('media library lists document and link messages and opens their chats', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/');
  await page.locator('button[aria-label="Mídias"]').click();
  await expect(page.locator('.media-panel')).toBeVisible();

  await page.locator('.media-tab[data-tab="document"]').click();
  const documentRow = page.locator('.media-record-row').first();
  await expect(documentRow).toBeVisible({ timeout: 180000 });
  await expect(documentRow.locator('.media-record-title')).not.toBeEmpty();

  await page.locator('.media-tab[data-tab="link"]').click();
  const linkRow = page.locator('.media-record-row').first();
  await expect(linkRow).toBeVisible({ timeout: 180000 });
  await expect(linkRow.locator('.media-record-title')).not.toBeEmpty();
  await linkRow.click();

  await expect(page).toHaveURL(/#\/chat\/[^/]+\/msg\/\d+$/);
});
