import { test, expect } from '@playwright/test';

test.describe('dark theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  async function openMobileMenu(page) {
    await page.locator('.sidebar-menu-btn').click();
  }

  test('can be enabled, restored after reload, and disabled again', async ({ page }) => {
    const isMobile = page.viewportSize().width <= 600;
    const themeButton = () => isMobile
      ? page.locator('.sidebar-dropdown-menu .sidebar-dropdown-item', { hasText: 'Ativar tema' })
      : page.locator('.nav-rail-btn[title="Ativar tema escuro"], .nav-rail-btn[title="Ativar tema claro"]');

    if (isMobile) await openMobileMenu(page);
    await themeButton().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.sidebar')).toHaveCSS('background-color', 'rgb(17, 27, 33)');

    if (isMobile) await openMobileMenu(page);
    if (isMobile) {
      await expect(themeButton()).toHaveText('Ativar tema claro');
    } else {
      await expect(page.locator('.nav-rail-btn[title="Ativar tema claro"]')).toBeVisible();
    }
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    if (isMobile) await openMobileMenu(page);
    await themeButton().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('theme control appears directly below settings on the navigation rail', async ({ page }) => {
    test.skip(page.viewportSize().width <= 600, 'Navigation rail is hidden on mobile');
    const settings = page.locator('.nav-rail-bottom .nav-rail-btn[title="Sobre"]');
    const theme = page.locator('.nav-rail-bottom .nav-rail-btn[title="Ativar tema escuro"]');
    await expect(settings).toBeVisible();
    await expect(theme).toBeVisible();
    const settingsBox = await settings.boundingBox();
    const themeBox = await theme.boundingBox();

    expect(themeBox.y).toBeGreaterThan(settingsBox.y + settingsBox.height);
  });

  test('the dark theme also styles the ChatGPT module', async ({ page }) => {
    const isMobile = page.viewportSize().width <= 600;
    if (isMobile) {
      await openMobileMenu(page);
      await page.locator('.sidebar-dropdown-menu .sidebar-dropdown-item', { hasText: 'Ativar tema escuro' }).click();
    } else {
      await page.locator('.nav-rail-btn[title="Ativar tema escuro"]').click();
    }

    if (isMobile) {
      await page.locator('.sidebar-chatgpt-link').click();
    } else {
      await page.locator('.nav-rail-btn[title="ChatGPT"]').click();
    }
    await expect(page.locator('.chatgpt-panel')).toBeVisible();
    await expect(page.locator('.chatgpt-panel')).toHaveCSS('background-color', 'rgb(17, 27, 33)');
  });
});
