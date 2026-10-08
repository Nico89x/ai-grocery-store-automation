import { test, expect, type Page } from '@playwright/test';
import { selectChipsMesh } from './scene-helpers';

const chips = 'Kesselchips Meersalz';
const water = 'Mineralwasser still';
const inventory = (page: Page, name: string) => page.locator('.inventory-row').filter({ hasText: name }).locator('strong');
async function select(page: Page, name: string) {
  await page.getByRole('button', { name: new RegExp(`^${name} –`) }).click();
  await expect(page.getByRole('dialog', { name: 'Produktdetails' })).toBeVisible();
  await page.getByRole('button', { name: 'In Warenkorb', exact: true }).click();
  await page.getByRole('button', { name: /Warenkorb ansehen/ }).click();
}
async function buy(page: Page, name: string) {
  await select(page, name);
  await page.getByRole('button', { name: 'Demo-Kauf auslösen', exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/simulation');
  await expect(page.getByRole('heading', { name: 'AI Grocery Store Automation', exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Simulation beschleunigen', exact: true }).click();
  // No customer timer manipulation: the direct simulation route starts paused.
  (page as Page & { testErrors?: string[] }).testErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { testErrors?: string[] }).testErrors).toEqual([]);
});
test('Warenkorb: Mengen, Preise, Entfernen und leerer Zustand', async ({ page }) => {
  await select(page, chips);
  await page.getByRole('button', { name: `${chips}: Menge erhöhen`, exact: true }).click();
  await expect(page.getByLabel(`${chips}: Menge`, { exact: true })).toHaveText('2');
  await expect(page.locator('.cart-total strong')).toHaveText('4,98 €');
  await page.getByRole('button', { name: `${chips}: Menge verringern`, exact: true }).click();
  await expect(page.locator('.cart-total strong')).toHaveText('2,49 €');
  await page.getByRole('button', { name: `${chips} entfernen`, exact: true }).click();
  await expect(page.getByText('Dein Warenkorb ist noch leer.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Demo-Kauf auslösen', exact: true })).toHaveCount(0);
});
test('Kauf → Bestand 4 auf 3 → eine Warnung → sechs erfolgreiche Events', async ({ page }) => {
  await buy(page, chips);
  await expect(page.locator('.success-note')).toHaveText('Demo-Prozess erfolgreich abgeschlossen.');
  await expect(inventory(page, 'Kesselchips')).toHaveText('3');
  await expect(page.locator('.stock-alert')).toContainText('Lagerwarnung ausgelöst');
  await expect(page.locator('.event-timeline .event.success')).toHaveCount(6);
  await expect(page.locator('.event-timeline code')).toHaveText(['order.created', 'inventory.checked', 'inventory.updated', 'low_stock.detected', 'notification.sent', 'order.completed']);
  await expect(page.locator('.metric').filter({ hasText: 'Lagerwarnungen' }).locator('strong')).toContainText('1');
  await expect(page.locator('.webhook-note')).toContainText('Lokale Demo-Verarbeitung');
});
test('3D-Raycaster öffnet Details direkt von der Chips-Packung', async ({page}) => {
  await selectChipsMesh(page);
});
test('Fehler nach Buchung und Retry ohne zweiten Bestandsabzug', async ({ page }) => {
  await page.getByLabel('Fehler beim Workflow simulieren', { exact: true }).check();
  await buy(page, water);
  await expect(page.getByRole('button', { name: 'Erneut versuchen', exact: true })).toBeVisible();
  await expect(inventory(page, 'Mineralwasser')).toHaveText('14');
  await expect(page.locator('.event-timeline .event.failed')).toHaveCount(1);
  await page.getByRole('button', { name: 'Erneut versuchen', exact: true }).click();
  await expect(page.locator('.success-note')).toBeVisible();
  await expect(inventory(page, 'Mineralwasser')).toHaveText('14');
  await expect(page.locator('.order-result')).toContainText('Versuch 2');
});
test('Animierte Kund:innen erzeugen eine abgeschlossene Bestellung', async ({ page }) => {
  // Software WebGL in Linux CI needs time to paint customer geometry.
  // Pin the first real customer order instead of chasing the live latest order.
  test.setTimeout(180000);
  await page.getByRole('button', { name: 'Kund:innen starten', exact: true }).click();
  await expect(page.getByLabel('Bestellung auswählen', { exact: true })).toBeVisible({ timeout: 90000 });
  await page.getByLabel('Bestellung auswählen', { exact: true }).selectOption('DEMO-001');
  await page.getByRole('button', { name: 'Kund:innen pausieren', exact: true }).click();
  await expect(page.locator('.success-note')).toBeVisible({ timeout: 90000 });
  await expect(page.locator('.order-result')).toContainText('Animierte Demo-Kund:in');
  await expect(page.locator('.event-timeline .event').filter({ hasText: 'inventory.updated' })).toContainText('Orangensaft: −1, jetzt 9 Stück');
  // Other customers can buy juice while slow software rendering paints the UI.
  // The pinned receipt proves the first decrement; live stock includes all orders.
  const remaining=Number(await inventory(page, 'Orangensaft').textContent());
  expect(remaining).toBeGreaterThanOrEqual(0);
  expect(remaining).toBeLessThanOrEqual(9);
});
test('Responsiv, Außen/Innenansicht, zugänglicher Dialog und Reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Laden betreten', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Augenhöhe', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await select(page, chips);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Simulation zurücksetzen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Simulation zurücksetzen', exact: true }).click();
  await expect(inventory(page, 'Kesselchips')).toHaveText('4');
  await expect(page.locator('.workflow-summary')).toContainText('Bereit für den ersten Kauf');
});
