import { test, expect } from '@playwright/test';

test('Grupos filter displays the group chats in the conversation list', async ({ page }) => {
  await page.goto('/');
  await page.locator('.sidebar-tag[data-filter="grupos"]').click();

  for (const id of [
    'g001-macallan',
    'g002-ciro-daniel-fabio-hugo',
    'g003-reuniao-semanal',
    'g004-master',
  ]) {
    await expect(page.locator(`.conversation-item[data-id="${id}"]`)).toBeVisible();
  }
  await expect(page.locator('.conversation-item[data-id="martha-graeff"]')).toBeHidden();
});

test('group conversation shows participant names, photos, and group info', async ({ page }) => {
  await page.goto('/#/chat/g002-ciro-daniel-fabio-hugo');

  await expect(page.locator('.chat-header-name')).toHaveText('Ciro Daniel Fábio Hugo');
  await expect(page.locator('.chat-msg-sender').first()).toHaveText('Ciro Nogueira');
  await expect(page.locator('.chat-group-sender-avatar').first()).toBeVisible();
  await expect(page.locator('.chat-msg-source-context').first()).toContainText('Operação Carbono Oculto');

  await page.locator('.chat-header-info-wrapper').click();
  const info = page.locator('.contact-info-drawer');
  await expect(info.locator('.contact-info-title')).toHaveText('Info do grupo');
  await expect(info.locator('.group-info-member-name').first()).toHaveText('Daniel Vorcaro');
  await expect(info).toContainText('Ciro Nogueira');
  await expect(info).toContainText('Mensagens temporárias com duração de 90 dias');
  await expect(info.locator('.group-info-source')).toHaveAttribute('href', /noticias\.uol\.com\.br/);
});

test('private Rueda excerpt is separate from the Reunião semanal group', async ({ page }) => {
  await page.goto('/#/chat/g003-reuniao-semanal');
  await expect(page.locator('.chat-msg-row')).toHaveCount(1);
  await expect(page.locator('.chat-msg-row')).not.toContainText('muita namorada p dar conta');

  await page.goto('/#/chat/antonio-rueda-g003-contexto');
  await expect(page.locator('.chat-header-info')).toContainText('relacionada ao grupo Reunião semanal');
  await expect(page.locator('.chat-msg-bubble')).toContainText('muita namorada p dar conta');
  await page.locator('.chat-header-info-wrapper').click();
  await expect(page.locator('.contact-info-drawer')).toContainText('Reunião semanal');
});

test('Macallan shows the supplied excerpt and marks omitted video content', async ({ page }) => {
  await page.goto('/#/chat/g001-macallan');
  await expect(page.locator('.chat-msg-row')).toHaveCount(8);
  await expect(page.locator('.chat-msg-row[data-id="1"]')).toContainText('Aquela de 3 metros estara la, Fabio');
  await expect(page.locator('.chat-msg-row[data-id="6"]')).toContainText('Trecho omitido pela Veja.');
  await expect(page.locator('.chat-msg-row[data-id="6"]')).toContainText('Horário não informado');
  await page.locator('.chat-header-info-wrapper').click();
  const info = page.locator('.contact-info-drawer');
  await expect(info).toContainText('26/10/2023 – 2024');
  await expect(info).toContainText('Lucas kallas USA');
  await expect(info).toContainText('Trecho parcial');
});

test('group information and member list fit on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/chat/g004-master');
  await page.locator('.chat-header-info-wrapper').click();
  await expect(page.locator('.contact-info-drawer')).toBeVisible();
  await expect(page.locator('.group-info-member-name')).toHaveCount(3);
  await expect(page.locator('.contact-info-drawer')).toContainText('Belline Santana');
});
