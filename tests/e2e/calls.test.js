import { test, expect } from '@playwright/test';

// The Calls screen is a record, not a phone: every call the material holds,
// newest first, and a tap goes to the message where that call is.

const openCalls = async (page) => {
  await page.goto('/#/calls');
  await expect(page.locator('.calls-panel')).toBeVisible();
  await expect(page.locator('.calls-item').first()).toBeVisible({ timeout: 20000 });
};

test.describe('Calls screen', () => {
  test('lists the calls, newest first, with who called whom', async ({ page }) => {
    await openCalls(page);
    expect(await page.locator('.calls-item').count()).toBeGreaterThan(500);
    const first = page.locator('.calls-item').first();
    await expect(first.locator('.calls-item-name')).toContainText('Martha Graeff');
    await expect(first.locator('.calls-item-arrow')).toHaveAttribute('aria-label', /Chamada (feita|recebida)/);
    await expect(first.locator('.calls-item-meta')).toContainText('2025');
  });

  test('draws a missed incoming call in red', async ({ page }) => {
    await openCalls(page);
    const missed = page.locator('.calls-item.missed').first();
    await expect(missed).toBeAttached();
    await expect(missed.locator('.calls-item-meta')).toContainText('Perdida');
    const color = await missed.locator('.calls-item-name').evaluate(el => getComputedStyle(el).color);
    expect(color).toMatch(/^rgb\(229, 57, 53\)$/);
  });

  test('shows Flávio Bolsonaro’s missed call on 16 November at 10:34', async ({ page }) => {
    await openCalls(page);
    const call = page.locator('.calls-item[data-conversation="flavio-bolsonaro"][data-message="67"]');

    await expect(call.locator('.calls-item-meta')).toContainText('16 de nov. de 2025, 10:34');
    await expect(call.locator('.calls-item-meta')).toContainText('Perdida');
  });

  test('shows reported calls separately from calls recorded in conversations', async ({ page }) => {
    await openCalls(page);
    const list = page.locator('.calls-list');
    const unidentified = list.locator('.calls-item.reported').filter({ hasText: 'Destinatários não identificados' });
    const martha = list.locator('.calls-item.reported').filter({ hasText: 'Martha Graeff' });

    await expect(unidentified).toContainText('após 17h17');
    await expect(unidentified).toContainText('Relato publicado');
    await expect(martha).toContainText('aproximadamente 16h45');
    await expect(martha).toContainText('fones Bluetooth');
    await expect(page.locator('.calls-foot')).toContainText('relatos de ligações publicados');
  });

  test('mobile bottom navigation keeps all tab labels on one line', async ({ page }) => {
    test.skip(page.viewportSize().width > 600, 'Mobile bottom navigation only');
    await page.goto('/');
    await expect(page.locator('.conversation-item').first()).toBeVisible();
    await expect(page.locator('.sidebar-bottom-nav')).toBeVisible();

    const sizes = await page.locator('.sidebar-bottom-tab span').evaluateAll(elements => elements.map(element => ({
      whiteSpace: getComputedStyle(element).whiteSpace,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
    })));
    for (const size of sizes) {
      expect(size.whiteSpace).toBe('nowrap');
      expect(size.clientWidth).toBeGreaterThan(0);
      expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth);
      expect(size.lineHeight).toBeLessThan(16);
    }
  });

  test('the buttons across the top are there and do nothing', async ({ page }) => {
    await openCalls(page);
    for (const label of ['Ligar', 'Agendar', 'Teclado', 'Favoritos', 'Pesquisar chamadas', 'Menu']) {
      await expect(page.locator(`.calls-panel button[aria-label="${label}"]`)).toBeDisabled();
    }
  });

  test('tapping a call opens the conversation at that call', async ({ page }) => {
    await openCalls(page);
    const row = page.locator('.calls-item[data-conversation="fabio-faria"][data-message="134"]');
    await row.scrollIntoViewIfNeeded();
    await row.locator('.calls-item-main').click();
    await expect(page).toHaveURL(/#\/chat\/fabio-faria\/msg\/134$/);
    await expect(page.locator('.chat-msg-row[data-id="134"]')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.chat-msg-row[data-id="134"] .chat-call-label')).toContainText('04:34');
  });

  test('the phone icon at the right does the same', async ({ page }) => {
    await openCalls(page);
    const row = page.locator('.calls-item[data-conversation="fabio-faria"][data-message="88"]');
    await row.scrollIntoViewIfNeeded();
    await row.locator('.calls-item-kind').click();
    await expect(page).toHaveURL(/#\/chat\/fabio-faria\/msg\/88$/);
    await expect(page.locator('.chat-msg-row[data-id="88"]')).toBeVisible({ timeout: 20000 });
  });

  test('folds consecutive calls with the same person on the same day', async ({ page }) => {
    await openCalls(page);
    await expect(page.locator('.calls-item-name', { hasText: /\(\d+\)$/ }).first()).toBeAttached();
  });
});

test.describe('Getting there', () => {
  test('from the Chamadas tab, and back to the list from Conversas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.conversation-item').first()).toBeVisible();
    const isMobile = page.viewportSize().width <= 600;
    if (isMobile) {
      await page.locator('.sidebar-bottom-tab[data-tab="calls"]').click();
    } else {
      await page.locator('.nav-rail button[aria-label="Chamadas"], button[aria-label="Chamadas"]').first().click();
    }
    await expect(page).toHaveURL(/#\/calls$/);
    await expect(page.locator('.calls-panel')).toBeVisible();
    await expect(page.locator('.conversation-list')).toBeHidden();

    if (isMobile) {
      await page.locator('.sidebar-bottom-tab[data-tab="chats"]').click();
    } else {
      await page.locator('button[aria-label="Conversas"]').first().click();
    }
    await expect(page.locator('.conversation-list')).toBeVisible();
    await expect(page.locator('.calls-panel')).toBeHidden();
  });
});
