import { test, expect } from '@playwright/test';

test('opening an event shows its date, approximate time, place, and mentioned people', async ({ page }) => {
  await page.goto('/#/events');

  await page.getByRole('option', { name: /I Fórum Jurídico/ }).click();

  const details = page.locator('.event-detail-pane');
  await expect(details).toContainText('24–26 de abril de 2024');
  await expect(details).toContainText('Horário aproximado');
  await expect(details).toContainText('Hotel Peninsula');
  await expect(details).toContainText('Michel Temer');
});

test('agenda message references open the original conversation at that message', async ({ page }) => {
  await page.goto('/#/events');
  await page.getByRole('option', { name: /Pedido para falar com Andrei Rodrigues/ }).click();
  await page.getByRole('link', { name: /Abrir mensagem sobre Andrei Rodrigues/ }).click();

  await expect(page).toHaveURL(/#\/chat\/alexandre-de-moraes\/msg\/69$/);
  await expect(page.locator('.chat-msg-row[data-id="69"]')).toBeVisible();
});

test('mobile can open the agenda from conversations and return from event details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Agenda de eventos' }).click();
  await expect(page.getByRole('listbox', { name: 'Eventos' })).toBeVisible();

  await page.getByRole('option', { name: /Summit Valor Econômico/ }).click();
  await expect(page.getByRole('button', { name: 'Voltar à lista de eventos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voltar à lista de eventos' })).toBeFocused();
  await page.getByRole('button', { name: 'Voltar à lista de eventos' }).click();

  await expect(page.getByRole('listbox', { name: 'Eventos' })).toBeVisible();
  await expect(page.getByRole('option', { name: /Summit Valor Econômico/ })).toBeFocused();
});
