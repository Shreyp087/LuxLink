import { expect, test } from '@playwright/test';

test('presents the field-relay narrative and interactive handoff', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /when the network stops/i })).toBeVisible();
  await expect(page.getByText('READY WITHOUT NETWORK')).toBeVisible();
  await page.getByRole('button', { name: /run field test/i }).click();
  await expect(page.getByText('SIGNATURE VALID')).toBeVisible({ timeout: 6_000 });
});
