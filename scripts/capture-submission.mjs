import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const baseUrl = process.env.LUXLINK_CAPTURE_URL ?? 'http://127.0.0.1:4173';
const outputDirectory = new URL('../docs/assets/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const page = await context.newPage();

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByText('OFFLINE CORE READY').waitFor();
await page.locator('.skip-link').evaluate((element) => {
  element.style.display = 'none';
});

await page.screenshot({
  path: fileURLToPath(new URL('luxlink-overview.png', outputDirectory)),
  fullPage: false,
});

await page
  .getByLabel(/message \/ 160 bytes max/i)
  .fill('Medical supplies needed at the east shelter.');
await page.getByRole('button', { name: /sign & prepare signal/i }).click();
await page.getByLabel(/optical qr frame 1 of/i).waitFor();
await page.getByRole('button', { name: /pause signal/i }).click();
await page.locator('.field-system').screenshot({
  path: fileURLToPath(new URL('luxlink-optical-transfer.png', outputDirectory)),
});

const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: /download frame pack/i }).click();
const framePackPath = await (await downloadPromise).path();
if (framePackPath === null) throw new Error('Browser did not provide a frame-pack path.');

const receiverContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const receiverPage = await receiverContext.newPage();
await receiverPage.goto(baseUrl, { waitUntil: 'networkidle' });
await receiverPage.getByText('OFFLINE CORE READY').waitFor();
await receiverPage.locator('.skip-link').evaluate((element) => {
  element.style.display = 'none';
});
await receiverPage.getByRole('tab', { name: /scan/i }).click();
await receiverPage.locator('input[accept*=".luxlink"]').setInputFiles(framePackPath);
await receiverPage.getByText('CRYPTOGRAPHIC INTEGRITY VALID').waitFor();
await receiverPage.getByText('SOURCE NOT YET TRUSTED').waitFor();
await receiverPage.locator('.field-system').screenshot({
  path: fileURLToPath(new URL('luxlink-verified-receipt.png', outputDirectory)),
});

await receiverContext.close();
await browser.close();
console.log(`Captured submission screenshots in ${fileURLToPath(outputDirectory)}`);
