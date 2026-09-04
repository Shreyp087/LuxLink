import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.LUXLINK_DEMO_URL ?? 'http://127.0.0.1:4173';
const outputPath = join(tmpdir(), 'luxlink-demo.webm');
const recordingDirectory = join(tmpdir(), 'luxlink-demo-recording');
await mkdir(recordingDirectory, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: recordingDirectory,
    size: { width: 1280, height: 720 },
  },
  reducedMotion: 'reduce',
});
const page = await context.newPage();

async function wait(milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function setCaption(label, copy) {
  await page.locator('body').evaluate(
    (body, caption) => {
      const ownerDocument = body.ownerDocument;
      let overlay = ownerDocument.querySelector('[data-demo-caption]');
      if (overlay === null) {
        overlay = ownerDocument.createElement('aside');
        overlay.setAttribute('data-demo-caption', '');
        overlay.innerHTML = '<strong></strong><span></span>';
        body.append(overlay);
      }
      const strong = overlay.querySelector('strong');
      const span = overlay.querySelector('span');
      if (strong !== null) strong.textContent = caption.label;
      if (span !== null) span.textContent = caption.copy;
    },
    { label, copy },
  );
}

async function emphasize(locator) {
  await locator.evaluate((element) => {
    element.style.outline = '4px solid #ff4d17';
    element.style.outlineOffset = '4px';
  });
  await wait(900);
}

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByText('OFFLINE CORE READY').waitFor();
await page.locator('.skip-link').evaluate((element) => {
  element.style.display = 'none';
});
await page.addStyleTag({
  content: `
    [data-demo-caption] {
      position: fixed;
      z-index: 1000;
      left: 50%;
      bottom: 22px;
      width: min(960px, calc(100vw - 48px));
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 18px;
      align-items: center;
      padding: 14px 18px;
      border: 2px solid #ff4d17;
      background: rgba(13, 21, 18, 0.96);
      box-shadow: 6px 6px 0 #ff4d17;
      color: #fffdf7;
      font-family: "Atkinson Hyperlegible Next", system-ui, sans-serif;
      pointer-events: none;
    }
    [data-demo-caption] strong {
      color: #ff7145;
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 14px;
      letter-spacing: 0.08em;
    }
    [data-demo-caption] span {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
    }
  `,
});

await wait(1_000);
await setCaption('01 / THE PROBLEM', 'When networks disappear, nearby places become isolated.');
await wait(6_500);

await setCaption(
  '02 / WRITE',
  'Create a small, time-bounded emergency message. Everything stays in this browser.',
);
await page.locator('.field-system').scrollIntoViewIfNeeded();
await wait(2_000);
const messageInput = page.getByLabel(/message \/ 160 bytes max/i);
await messageInput.fill('');
await messageInput.pressSequentially('Medical supplies needed at the east shelter.', { delay: 24 });
await wait(2_500);

await setCaption(
  '03 / SIGN',
  'A local P-256 identity signs the exact message bytes. No cloud API.',
);
const signButton = page.getByRole('button', { name: /sign & prepare signal/i });
await signButton.scrollIntoViewIfNeeded();
await emphasize(signButton);
await signButton.click();
await page.getByLabel(/optical qr frame 1 of/i).waitFor();

await setCaption(
  '04 / SHOW',
  'The signed packet becomes paced, order-independent QR frames with corruption checks.',
);
await page.locator('.field-system').scrollIntoViewIfNeeded();
await wait(7_500);

const verifyButton = page.getByRole('button', { name: /verify on this device/i });
await verifyButton.scrollIntoViewIfNeeded();
await emphasize(verifyButton);
await verifyButton.click();
await page.getByText('CRYPTOGRAPHIC INTEGRITY VALID').waitFor();
await page.locator('.field-system').scrollIntoViewIfNeeded();
await setCaption(
  '05 / VERIFY',
  'The same receiver pipeline reassembles, hashes, parses, and verifies every signature.',
);
await wait(7_500);

const carryTab = page.getByRole('tab', { name: /carry/i });
await emphasize(carryTab);
await carryTab.click();
await page.getByRole('heading', { name: 'Medical supplies needed at the east shelter.' }).waitFor();
await setCaption(
  '06 / CARRY',
  'The verified packet is stored locally and remains available offline.',
);
await wait(6_500);

const relayButton = page.getByRole('button', { name: /sign \+ relay/i });
await relayButton.scrollIntoViewIfNeeded();
await emphasize(relayButton);
await relayButton.click();
await page.getByLabel(/optical qr frame 1 of/i).waitFor();
await setCaption(
  '07 / RELAY',
  'A carrier appends a signed custody hop without changing the original message.',
);
await page.locator('.field-system').scrollIntoViewIfNeeded();
await wait(7_500);

await setCaption('LUXLINK', 'When the network stops, the message walks.');
await wait(6_000);

const video = page.video();
await context.close();
if (video === null) throw new Error('Playwright did not create a video.');
await video.saveAs(outputPath);
await browser.close();
console.log(`Recorded ${outputPath}`);
