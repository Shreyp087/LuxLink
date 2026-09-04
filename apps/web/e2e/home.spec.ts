import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('creates, exports, receives, verifies, and persists a signed optical bundle', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /when the network stops/i })).toBeVisible();
  await expect(page.getByText('OFFLINE CORE READY')).toBeVisible();

  await page.getByLabel(/message \/ 160 bytes max/i).fill('Water available at the east shelter.');
  await page.getByRole('button', { name: /sign & prepare signal/i }).click();
  await expect(page.getByLabel(/optical qr frame 1 of/i)).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /download frame pack/i }).click();
  const download = await downloadPromise;
  const framePackPath = await download.path();
  expect(framePackPath).not.toBeNull();

  await page.getByRole('tab', { name: /scan/i }).click();
  await page.locator('input[accept*=".luxlink"]').setInputFiles(framePackPath!);
  await expect(page.getByText('CRYPTOGRAPHIC INTEGRITY VALID')).toBeVisible();
  await expect(page.getByText('TRUSTED SOURCE', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText('OFFLINE CORE READY')).toBeVisible();
  await page.getByRole('tab', { name: /carry/i }).click();
  await expect(
    page.getByRole('heading', { name: 'Water available at the east shelter.' }),
  ).toBeVisible();

  await page.getByRole('tab', { name: /write/i }).click();
  await page.getByLabel(/message \/ 160 bytes max/i).fill('Identity survived the offline reload.');
  await page.getByRole('button', { name: /sign & prepare signal/i }).click();
  await expect(page.getByLabel(/optical qr frame 1 of/i)).toBeVisible();
});

test('reopens the installed field shell without a network', async ({ page, context }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Chromium provides deterministic service-worker offline control.',
  );
  await page.goto('/');
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    await navigator.serviceWorker.ready;
    return true;
  });
  await page.reload();
  await expect(page.getByText('OFFLINE CORE READY')).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /when the network stops/i })).toBeVisible();
  await expect(page.getByText('OFFLINE CORE READY')).toBeVisible();
  await context.setOffline(false);
});

test('decodes every rendered QR image into a verified bundle', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByText('OFFLINE CORE READY')).toBeVisible();
  await page.getByRole('button', { name: /sign & prepare signal/i }).click();
  await page.getByRole('button', { name: /pause signal/i }).click();

  const canvas = page.locator('canvas[aria-label^="Optical QR frame"]');
  const label = await canvas.getAttribute('aria-label');
  const total = Number(label?.match(/of (\d+)/u)?.[1]);
  expect(total).toBeGreaterThan(1);
  const frameImages: string[] = [];
  for (let index = 0; index < total; index += 1) {
    await expect(canvas).toHaveAttribute('data-rendered-frame', String(index + 1));
    const path = testInfo.outputPath(`frame-${index + 1}.png`);
    const dataUrl = await canvas.evaluate((element) =>
      (element as HTMLCanvasElement).toDataURL('image/png'),
    );
    await writeFile(path, Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
    frameImages.push(path);
    if (index < total - 1) await page.getByRole('button', { name: 'NEXT' }).click();
  }

  await page.getByRole('tab', { name: /scan/i }).click();
  await page.locator('input[accept="image/*"]').setInputFiles(frameImages);
  await expect(page.getByText('CRYPTOGRAPHIC INTEGRITY VALID')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(`${total} / ${total} UNIQUE FRAMES`)).toBeVisible();
});

test('requires fingerprint confirmation and reflects trust removal', async ({
  browser,
  page,
}, testInfo) => {
  const senderContext = await browser.newContext({ acceptDownloads: true });
  const sender = await senderContext.newPage();
  await sender.goto('/');
  await expect(sender.getByText('OFFLINE CORE READY')).toBeVisible();
  await sender.getByLabel(/message \/ 160 bytes max/i).fill('Unknown source trust exercise.');
  await sender.getByRole('button', { name: /sign & prepare signal/i }).click();
  const downloadPromise = sender.waitForEvent('download');
  await sender.getByRole('button', { name: /download frame pack/i }).click();
  const framePackPath = testInfo.outputPath('unknown-source.luxlink');
  await (await downloadPromise).saveAs(framePackPath);
  await senderContext.close();

  await page.goto('/');
  await expect(page.getByText('OFFLINE CORE READY')).toBeVisible();
  await page.getByRole('tab', { name: /scan/i }).click();
  await page.locator('input[accept*=".luxlink"]').setInputFiles(framePackPath);
  await expect(page.getByText('CRYPTOGRAPHIC INTEGRITY VALID')).toBeVisible();
  await expect(page.getByText('SOURCE NOT YET TRUSTED')).toBeVisible();

  const confirmation = page.locator('.trust-confirmation');
  const fingerprint = await confirmation.locator('code').innerText();
  const trustButton = confirmation.getByRole('button', { name: /trust verified fingerprint/i });
  await expect(trustButton).toBeDisabled();
  await confirmation.locator('input').fill(fingerprint.slice(-6));
  await trustButton.click();
  await expect(page.getByText('TRUSTED SOURCE', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: /trust/i }).click();
  await page.getByRole('button', { name: 'REMOVE' }).click();
  await page.getByRole('tab', { name: /carry/i }).click();
  await expect(page.getByText('SOURCE NOT CURRENTLY TRUSTED')).toBeVisible();
});
