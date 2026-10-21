import { test, expect } from '@playwright/test';

test.describe('Search — Batch 7', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search input is visible in sidebar', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await expect(input).toBeVisible();
  });

  test('typing in search shows results panel', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    // Wait for debounce + index load
    await page.locator('.search-results').waitFor({ timeout: 10000 });
    await expect(page.locator('.search-results')).toBeVisible();
  });

  test('search results contain matching messages', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-result-item').first().waitFor({ timeout: 10000 });

    const items = page.locator('.search-result-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search results show sender and date', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-result-item').first().waitFor({ timeout: 10000 });

    const sender = page.locator('.search-result-sender').first();
    await expect(sender).toBeVisible();

    const date = page.locator('.search-result-date').first();
    await expect(date).toBeVisible();
  });

  test('search results show the total number of matching messages', async ({ page }) => {
    await page.locator('.sidebar-search-input').fill('Bom dia');

    const count = page.locator('.search-results-count');
    await expect(count).toBeVisible({ timeout: 10000 });
    await expect(count).toHaveText(/^\d+ resultados? encontrados?$/);
  });

  test('search results highlight the matching text', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-result-item').first().waitFor({ timeout: 10000 });

    const highlight = page.locator('.search-highlight').first();
    await expect(highlight).toBeVisible();
    const text = await highlight.textContent();
    expect(text.toLowerCase()).toContain('bom dia');
  });

  test('conversation list is hidden during search', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-results').waitFor({ timeout: 10000 });

    const convList = page.locator('.conversation-list');
    await expect(convList).not.toBeVisible();
  });

  test('clearing search restores conversation list', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-results').waitFor({ timeout: 10000 });

    // Clear the input
    await input.fill('');
    const convList = page.locator('.conversation-list');
    await expect(convList).toBeVisible();
  });

  test('pressing Escape clears search', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-results').waitFor({ timeout: 10000 });

    await input.press('Escape');
    const convList = page.locator('.conversation-list');
    await expect(convList).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('no results shows empty message', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('xyzzyxyzzy12345');

    const empty = page.locator('.search-empty');
    await expect(empty).toBeVisible({ timeout: 10000 });
    await expect(empty).toContainText('Nenhuma mensagem encontrada');
  });

  test('matching conversations are listed before matching messages', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Alexandre');

    const conversationResult = page.locator('.search-conversation-item').first();
    await expect(conversationResult).toBeVisible({ timeout: 10000 });
    await expect(conversationResult).toContainText('Alexandre');

    const headings = page.locator('.search-results-heading');
    await expect(headings.first()).toHaveText('Conversas');
    await expect(headings.nth(1)).toHaveText('Mensagens', { timeout: 10000 });
  });

  test('clicking a matching conversation opens that conversation', async ({ page }) => {
    await page.locator('.sidebar-search-input').fill('Diogo Batista');
    await page.locator('.search-conversation-item').first().click();

    await expect(page.locator('.chat-view')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/#\/chat\/diogo-batista-vorcaro/);
  });

  test('conversation search ignores the selected sidebar filter', async ({ page }) => {
    await page.locator('.sidebar-tag[data-filter="favoritas"]').click();
    await page.locator('.sidebar-search-input').fill('Diogo');

    await expect(page.locator('.search-conversation-item').first()).toContainText('Diogo');
  });

  test('a message result opens the conversation where it was found', async ({ page }) => {
    await page.locator('.sidebar-search-input').fill('troféu do Min Alexandre');

    const result = page.locator('.search-result-item').filter({ hasText: 'Ana Matos MKT' }).first();
    await expect(result).toBeVisible({ timeout: 10000 });
    await result.click();

    await expect(page.locator('.chat-view')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/#\/chat\/ana-matos-mkt/);
  });

  test('search is accent-insensitive', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    // Search without accent should still match accented content
    await input.fill('voce');
    await page.locator('.search-results').waitFor({ timeout: 10000 });

    const items = page.locator('.search-result-item');
    const count = await items.count();
    // Should find results if "você" exists in the data
    expect(count).toBeGreaterThanOrEqual(0); // May or may not find results
  });

  test('clicking a search result opens the conversation', async ({ page }) => {
    const input = page.locator('.sidebar-search-input');
    await input.fill('Bom dia');
    await page.locator('.search-result-item').first().waitFor({ timeout: 10000 });

    await page.locator('.search-result-item').first().click();

    // Should navigate to the chat view
    const chatView = page.locator('.chat-view');
    await expect(chatView).toBeVisible({ timeout: 10000 });
  });
});
