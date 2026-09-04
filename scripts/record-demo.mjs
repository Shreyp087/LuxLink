import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const senderUrl = process.env.LUXLINK_DEMO_URL ?? 'http://127.0.0.1:4173';
const receiverUrl = senderUrl.replace('127.0.0.1', 'localhost');
const timingScale = Number(process.env.LUXLINK_DEMO_SPEED ?? '1');
if (!Number.isFinite(timingScale) || timingScale <= 0) {
  throw new Error('LUXLINK_DEMO_SPEED must be a positive number.');
}
const outputPath = join(tmpdir(), 'luxlink-story-demo.webm');
const recordingDirectory = join(tmpdir(), 'luxlink-story-recording');
const frameDirectory = join(tmpdir(), 'luxlink-story-frames');
await Promise.all([
  mkdir(recordingDirectory, { recursive: true }),
  mkdir(frameDirectory, { recursive: true }),
]);

async function imageData(name) {
  const bytes = await readFile(new URL(`../docs/assets/${name}`, import.meta.url));
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

const storyImages = {
  outage: await imageData('story-outage.png'),
  gap: await imageData('story-gap.png'),
  handoff: await imageData('story-handoff.png'),
  resolution: await imageData('story-resolution.png'),
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: recordingDirectory,
    size: { width: 1280, height: 720 },
  },
  reducedMotion: 'no-preference',
});
const page = await context.newPage();

// Keep the film stage on a trustworthy loopback origin so Web Crypto remains
// available inside both embedded field devices.
await page.goto(senderUrl);
await page.setContent(`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <style>
        :root {
          color-scheme: dark;
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #0d1512;
          color: #fffdf7;
        }
        * { box-sizing: border-box; }
        html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #0d1512; }
        [hidden] { display: none !important; }
        .film-chrome {
          position: fixed; z-index: 100; inset: 0 0 auto 0; height: 54px; padding: 0 34px;
          display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(244,241,232,.35);
          background: rgba(13,21,18,.9); font: 700 12px/1 ui-monospace, SFMono-Regular, monospace;
          letter-spacing: .12em;
        }
        .mark { width: 18px; height: 18px; border: 3px solid #e84a1b; position: relative; }
        .mark::after { content: ""; position: absolute; inset: 4px; background: #e84a1b; }
        .film-chrome__mode { color: #83d5c1; }
        .film-chrome__time { margin-left: auto; color: #b8c1bc; }
        .story { position: absolute; inset: 54px 0 0; background: #0d1512; }
        .story__image {
          position: absolute; inset: -3%; width: 106%; height: 106%; object-fit: cover;
          transform-origin: center; animation: drift 15s ease-out both;
        }
        .story__scrim {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(7,13,11,.88) 0%, rgba(7,13,11,.55) 44%, rgba(7,13,11,.08) 73%),
            linear-gradient(0deg, rgba(7,13,11,.72), transparent 48%);
        }
        .story__copy { position: absolute; z-index: 2; left: 64px; top: 62px; width: 700px; }
        .eyebrow { margin: 0 0 18px; color: #ff7145; font: 800 13px/1 ui-monospace, SFMono-Regular, monospace; letter-spacing: .16em; }
        .story h1 { margin: 0; max-width: 760px; white-space: pre-line; font-size: 68px; line-height: .91; letter-spacing: -.045em; text-transform: uppercase; }
        .story__body { margin: 22px 0 0; width: 570px; color: #e7e3da; font-size: 22px; line-height: 1.38; }
        .lower-third {
          position: absolute; z-index: 3; left: 64px; bottom: 38px; width: min(920px, calc(100vw - 128px));
          display: grid; grid-template-columns: max-content 1fr; gap: 20px; align-items: center;
          padding: 15px 18px; border: 2px solid #e84a1b; background: rgba(13,21,18,.95);
          box-shadow: 6px 6px 0 #e84a1b;
        }
        .lower-third strong { color: #ff7145; font: 800 13px/1 ui-monospace, SFMono-Regular, monospace; letter-spacing: .1em; }
        .lower-third span { font-size: 21px; font-weight: 750; line-height: 1.25; }
        .devices { position: absolute; inset: 54px 0 0; padding: 24px 38px 104px; background: #f4f1e8; color: #111a17; }
        .devices__head { height: 66px; display: flex; align-items: flex-start; gap: 22px; }
        .devices__head h1 { margin: 0; font-size: 37px; line-height: .95; letter-spacing: -.03em; text-transform: uppercase; }
        .devices__head p { margin: 3px 0 0 auto; width: 390px; font: 700 12px/1.5 ui-monospace, SFMono-Regular, monospace; letter-spacing: .04em; }
        .device-grid { display: grid; grid-template-columns: 1fr 70px 1fr; gap: 18px; align-items: center; }
        .device { min-width: 0; }
        .device__label { height: 34px; display: flex; justify-content: space-between; align-items: center; padding: 0 12px; color: #fffdf7; background: #111a17; font: 800 11px/1 ui-monospace, SFMono-Regular, monospace; letter-spacing: .09em; }
        .device__label span:last-child { color: #50d0ad; }
        .device__screen { position: relative; height: 448px; overflow: hidden; border: 2px solid #111a17; background: #f4f1e8; box-shadow: 6px 6px 0 #e84a1b; }
        .device iframe { width: 1120px; height: 914px; border: 0; transform: scale(.508); transform-origin: top left; }
        .bridge { position: relative; height: 448px; overflow: hidden; }
        .bridge::before { content: ""; position: absolute; left: 50%; top: 12px; bottom: 12px; border-left: 1px dashed #5c655f; }
        .bridge__packet { position: absolute; left: 28px; top: 210px; width: 14px; height: 14px; border: 3px solid #e84a1b; opacity: .3; }
        .bridge.is-active .bridge__packet { opacity: 1; animation: packet 1.1s ease-in-out infinite alternate; }
        .bridge__arrow { position: absolute; left: 24px; top: 240px; color: #e84a1b; font: 800 30px/1 ui-monospace, monospace; }
        .device-caption {
          position: fixed; z-index: 101; left: 50%; bottom: 22px; width: min(1000px, calc(100vw - 76px));
          transform: translateX(-50%); display: grid; grid-template-columns: max-content 1fr; gap: 20px;
          align-items: center; padding: 14px 18px; border: 2px solid #e84a1b; background: rgba(13,21,18,.97);
          box-shadow: 6px 6px 0 #e84a1b; color: #fffdf7;
        }
        .device-caption strong { color: #ff7145; font: 800 13px/1 ui-monospace, SFMono-Regular, monospace; letter-spacing: .1em; }
        .device-caption span { font-size: 20px; font-weight: 750; line-height: 1.25; }
        @keyframes drift { from { transform: scale(1.04) translate3d(-.6%, .2%, 0); } to { transform: scale(1.0) translate3d(.6%, -.2%, 0); } }
        @keyframes packet { from { transform: translateY(-34px) rotate(0); } to { transform: translateY(34px) rotate(90deg); } }
      </style>
    </head>
    <body>
      <header class="film-chrome">
        <i class="mark"></i><span>LUXLINK / FIELD STORY</span><span class="film-chrome__mode">SIMULATED SCENARIO</span>
        <span class="film-chrome__time">NO SPECIAL HARDWARE</span>
      </header>
      <main>
        <section class="story" id="story">
          <img class="story__image" id="story-image" alt="" />
          <div class="story__scrim"></div>
          <div class="story__copy"><p class="eyebrow" id="story-eyebrow"></p><h1 id="story-title"></h1><p class="story__body" id="story-body"></p></div>
          <div class="lower-third"><strong id="story-speaker"></strong><span id="story-caption"></span></div>
        </section>
        <section class="devices" id="devices" hidden>
          <div class="devices__head"><h1>Two isolated browsers.<br />One human link.</h1><p>CLINIC NODE → OPTICAL PACKET → SHELTER NODE<br />NO ACCOUNT / NO SERVER / NO SHARED STORAGE</p></div>
          <div class="device-grid">
            <article class="device"><div class="device__label"><span>MAYA / CLINIC</span><span>LOCAL STORE A</span></div><div class="device__screen"><iframe id="sender" src="${senderUrl}"></iframe></div></article>
            <div class="bridge" id="bridge"><i class="bridge__packet"></i><span class="bridge__arrow">→</span></div>
            <article class="device"><div class="device__label"><span>ARUN / SHELTER</span><span>LOCAL STORE B</span></div><div class="device__screen"><iframe id="receiver" src="${receiverUrl}"></iframe></div></article>
          </div>
          <div class="device-caption"><strong id="device-label">LIVE SYSTEM</strong><span id="device-copy">Loading two isolated local stores…</span></div>
        </section>
      </main>
    </body>
  </html>
`);

async function wait(milliseconds) {
  await page.waitForTimeout(milliseconds * timingScale);
}

async function showStory({ image, eyebrow, title, body, speaker, caption }) {
  await page.locator('#story').evaluate(
    (story, scene) => {
      story.hidden = false;
      const picture = story.querySelector('#story-image');
      if (picture !== null && picture.tagName === 'IMG') {
        picture.src = scene.image;
        picture.style.animation = 'none';
        picture.getBoundingClientRect();
        picture.style.animation = '';
      }
      const values = {
        '#story-eyebrow': scene.eyebrow,
        '#story-title': scene.title,
        '#story-body': scene.body,
        '#story-speaker': scene.speaker,
        '#story-caption': scene.caption,
      };
      for (const [selector, value] of Object.entries(values)) {
        const element = story.querySelector(selector);
        if (element !== null) element.textContent = value;
      }
    },
    { image, eyebrow, title, body, speaker, caption },
  );
  await page.locator('#devices').evaluate((devices) => {
    devices.hidden = true;
  });
}

async function setStoryCaption(speaker, caption) {
  await page.locator('#story').evaluate(
    (story, content) => {
      const speakerElement = story.querySelector('#story-speaker');
      const captionElement = story.querySelector('#story-caption');
      if (speakerElement !== null) speakerElement.textContent = content.speaker;
      if (captionElement !== null) captionElement.textContent = content.caption;
    },
    { speaker, caption },
  );
}

async function setDeviceCaption(label, copy, bridgeActive = false) {
  await page.locator('#devices').evaluate(
    (devices, content) => {
      const labelElement = devices.querySelector('#device-label');
      const copyElement = devices.querySelector('#device-copy');
      const bridge = devices.querySelector('#bridge');
      if (labelElement !== null) labelElement.textContent = content.label;
      if (copyElement !== null) copyElement.textContent = content.copy;
      bridge?.classList.toggle('is-active', content.bridgeActive);
    },
    { label, copy, bridgeActive },
  );
}

await showStory({
  image: storyImages.outage,
  eyebrow: '01 / THE OUTAGE / 21:14',
  title: "THE MESSAGE EXISTS.\nTHE NETWORK DOESN'T.",
  body: 'A simulated clinic has an urgent medical update. The shelter across the gap cannot receive it.',
  speaker: 'NARRATOR',
  caption:
    'The failure is quiet: the places still exist, but every digital path between them is gone.',
});
await wait(8_500);
await setStoryCaption(
  'MAYA / CLINIC',
  '“The shelter needs our update. Cellular is down. Wi-Fi is down. The cloud is out of reach.”',
);
await wait(6_500);

await showStory({
  image: storyImages.gap,
  eyebrow: '02 / THE EXISTING GAP',
  title: 'EVERY MESSENGER ASSUMES A PATH.',
  body: 'Cellular, Wi-Fi, Bluetooth pairing, and cloud messaging all expect continuous connectivity.',
  speaker: 'NARRATOR',
  caption: 'But one path is still open: a person can walk through the underpass.',
});
await wait(9_000);
await setStoryCaption('ARUN / COURIER', '“If I can cross the gap, the message can cross with me.”');
await wait(5_000);

await showStory({
  image: storyImages.handoff,
  eyebrow: '03 / THE INSIGHT',
  title: 'MAKE THE PERSON THE NETWORK.',
  body: 'Sign the message. Turn it into visible light. Carry the verified packet forward.',
  speaker: 'NARRATOR',
  caption:
    'That insight became LuxLink: human store–carry–forward using ordinary screens and cameras.',
});
await wait(11_500);

const sender = page.frameLocator('#sender');
const receiver = page.frameLocator('#receiver');
await Promise.all([
  sender.getByText('OFFLINE CORE READY').waitFor({ state: 'attached' }),
  receiver.getByText('OFFLINE CORE READY').waitFor({ state: 'attached' }),
]);
await page.locator('#story').evaluate((story) => {
  story.hidden = true;
});
await page.locator('#devices').evaluate((devices) => {
  devices.hidden = false;
});
await Promise.all([
  sender.locator('.field-system').scrollIntoViewIfNeeded(),
  receiver.locator('.field-system').scrollIntoViewIfNeeded(),
]);

await setDeviceCaption(
  'CLINIC / WRITE + SIGN',
  'Maya writes a bounded message. Her local P-256 identity signs the exact bytes.',
);
const messageInput = sender.getByLabel(/message \/ 160 bytes max/i);
await messageInput.fill('');
await messageInput.pressSequentially('Medical supplies needed at the east shelter.', { delay: 28 });
await wait(4_500);
const signButton = sender.getByRole('button', { name: /sign & prepare signal/i });
await signButton.scrollIntoViewIfNeeded();
await signButton.click();
await sender.getByLabel(/optical qr frame 1 of/i).waitFor();
await sender.locator('.field-system').scrollIntoViewIfNeeded();

await setDeviceCaption(
  'SCREEN → CAMERA',
  'LuxLink divides the signed packet into paced QR frames. No network transport is used.',
  true,
);
await wait(7_000);
await sender.getByRole('button', { name: /pause signal/i }).click();

const canvas = sender.locator('canvas[aria-label^="Optical QR frame"]');
const frameLabel = await canvas.getAttribute('aria-label');
const totalFrames = Number(frameLabel?.match(/of (\d+)/u)?.[1]);
if (!Number.isInteger(totalFrames) || totalFrames < 2) {
  throw new Error('Could not determine the optical frame count.');
}
let currentFrame = Number(await canvas.getAttribute('data-rendered-frame'));
if (!Number.isInteger(currentFrame) || currentFrame < 1 || currentFrame > totalFrames) {
  throw new Error('Could not determine the current optical frame.');
}
while (currentFrame !== 1) {
  const expectedFrame = (currentFrame % totalFrames) + 1;
  await sender.getByRole('button', { name: 'NEXT' }).click();
  await sender.locator(`canvas[data-rendered-frame="${expectedFrame}"]`).waitFor();
  currentFrame = expectedFrame;
}
const frameImages = [];
for (let index = 0; index < totalFrames; index += 1) {
  await sender.locator(`canvas[data-rendered-frame="${index + 1}"]`).waitFor();
  const dataUrl = await canvas.evaluate((element) => element.toDataURL('image/png'));
  const framePath = join(frameDirectory, `frame-${String(index + 1).padStart(2, '0')}.png`);
  await writeFile(framePath, Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
  frameImages.push(framePath);
  if (index < totalFrames - 1) await sender.getByRole('button', { name: 'NEXT' }).click();
}

await receiver.getByRole('tab', { name: /scan/i }).click();
await receiver.locator('input[accept="image/*"]').setInputFiles(frameImages);
await receiver.getByText('CRYPTOGRAPHIC INTEGRITY VALID').waitFor();
await receiver.getByText('SOURCE NOT YET TRUSTED').waitFor();
await receiver.locator('.field-system').scrollIntoViewIfNeeded();
await setDeviceCaption(
  'SHELTER / VERIFY',
  'A separate local store reassembles every frame, checks the digest, and verifies the signature.',
  false,
);
await wait(8_000);

await receiver.getByRole('tab', { name: /carry/i }).click();
await receiver
  .getByRole('heading', { name: 'Medical supplies needed at the east shelter.' })
  .waitFor();
await setDeviceCaption(
  'STORE / CARRY',
  'The verified packet persists offline. Integrity and identity trust remain separate decisions.',
);
await wait(6_500);

const relayButton = receiver.getByRole('button', { name: /sign \+ relay/i });
await relayButton.scrollIntoViewIfNeeded();
await relayButton.click();
await receiver.getByLabel(/optical qr frame 1 of/i).waitFor();
await receiver.locator('.field-system').scrollIntoViewIfNeeded();
await setDeviceCaption(
  'SIGNED RELAY / HOP 1',
  'Arun appends custody without changing Maya’s original message or signature.',
  true,
);
await wait(7_500);

await showStory({
  image: storyImages.resolution,
  eyebrow: '04 / THE OUTCOME',
  title: 'THE NETWORK NEVER CAME BACK.',
  body: 'It did not have to. One person carried an accountable message across the gap, and the shelter could act.',
  speaker: 'NARRATOR',
  caption:
    'LuxLink does not replace emergency networks. It gives verified small data one more path when they disappear.',
});
await wait(9_000);
await page.locator('#story').evaluate((story) => {
  const eyebrow = story.querySelector('#story-eyebrow');
  const title = story.querySelector('#story-title');
  const body = story.querySelector('#story-body');
  const speaker = story.querySelector('#story-speaker');
  const caption = story.querySelector('#story-caption');
  if (eyebrow !== null) eyebrow.textContent = 'LUXLINK / FIELD RELAY';
  if (title !== null) title.textContent = 'WHEN THE NETWORK STOPS,\nTHE MESSAGE WALKS.';
  if (body !== null) body.textContent = 'Signed at source. Carried by people. Verified locally.';
  if (speaker !== null) speaker.textContent = 'SOURCE AVAILABLE';
  if (caption !== null) caption.textContent = 'github.com/Shreyp087/LuxLink';
});
await wait(7_000);

const video = page.video();
await context.close();
if (video === null) throw new Error('Playwright did not create a video.');
await video.saveAs(outputPath);
await browser.close();
console.log(`Recorded ${outputPath}`);
