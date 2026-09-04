# LuxLink brand direction: Signal Ledger

Status: recommended direction  
Last reviewed: 2026-09-04

## Brand idea

**A message you can carry.**

LuxLink turns a signed message into visible light, lets a person carry it across a disconnected place, and passes it forward without pretending the network still exists. The identity should make digital communication feel physical, accountable, and calm.

The brand is not "futuristic AI." It is a contemporary public utility with the authorship of a well-made field instrument.

## Naming note

`LuxLink` is the repository and current product codename. Prior research found existing uses of LuxLink in optical networking and research, so do not invest in a final legal wordmark or claim trademark ownership without clearance. `LightMule` remains the recommended public-facing working name for the store-carry-forward pivot. All tokens and components should keep the visible product name configurable.

The examples below use **LightMule** for product copy and **LuxLink** for technical/repository references. This is a design recommendation, not legal advice.

## Positioning

### One-line product description

> Carry verified emergency messages across a network outage using only screens and cameras.

### Hero line

> A message can travel without a network.

### Supporting line

> Receive it by light. Carry it offline. Relay it with its original signature intact.

### Honest qualifier

> An RF-independent fallback for preloaded compatible devices with line of sight.

### Voice characteristics

- **Calm, not heroic.** The user is doing the work; the product assists.
- **Concrete, not magical.** Name the screen, camera, signature, bundle, and relay.
- **Brief, not cryptic.** Short sentences are complete sentences.
- **Accountable, not omniscient.** State provenance and uncertainty.
- **Civic, not militarized.** Avoid tactical cosplay, command rhetoric, and disaster spectacle.

## Visual concept

### The relay trace

A thin line connects square registration nodes. Each node represents a custody event, not a live network endpoint.

```text
[SOURCE]------[CAPTURED]----------[RELAYED]------[VERIFIED]
  09:14          09:16              09:41          09:42
  A3C9            C012                7B4E           A3C9
```

Rules:

- Horizontal on wide layouts; vertical on narrow layouts and record views.
- Solid segment means the bundle was physically carried between two recorded optical events; it does **not** mean a connection stayed active.
- A square node is verified, a diamond is unverified, and an open circle is pending.
- The source signature fingerprint repeats at the final node to express end-to-end verification.
- Never use animated traveling dots during an offline carrying interval.

### Registration corners

Four cropped right-angle marks may frame a packet artifact, camera target, or hero illustration. They come from print registration and optical alignment, not from a QR-code finder pattern.

```text
+--                                      --+
|          INCIDENT 24-091 / B-07          |
|                                           |
|          WATER / 18 PEOPLE / 2H           |
+--                                      --+
```

Use sparingly: one framed object per composition.

### Custody stamp

A rectangular, two-line state marker:

```text
VERIFIED
KEY ...9A7C
```

It uses text, a geometric symbol, and color together. It may rotate no more than 1 degree on the marketing site to suggest a physical mark; operational stamps remain perfectly aligned.

## Logo direction

Do not generate a mascot, lightning bolt, chain link, sunburst, Wi-Fi mark, QR logo, or gradient monogram.

Recommended system:

1. A custom wordmark derived from the selected display type, with a cut in the crossbar or terminal that suggests a message leaving one carrier and entering another.
2. A small relay mark made from two square nodes and one interrupted rule. It must work at 16 px and in one color.
3. A full lockup that pairs the relay mark, wordmark, and optional descriptor `OFFLINE MESSAGE RELAY`.

The wordmark must be drawn as an original asset before launch. Until then, use live text; never ship an AI-generated pseudo-logo as final.

## Color system

The default surface is light because it remains readable in daylight and distinguishes the product from cyberpunk emergency software.

### Foundations

| Token          | Hex       | Purpose                                                                          |
| -------------- | --------- | -------------------------------------------------------------------------------- |
| `paper`        | `#F4F1E8` | Primary background; warm enough to feel physical, neutral enough for state color |
| `paper-raised` | `#FFFDF7` | Form and record surfaces                                                         |
| `ink`          | `#111A17` | Primary text, strong rules                                                       |
| `ink-muted`    | `#5C655F` | Secondary text; contrast 5.34:1 on `paper`                                       |
| `rule`         | `#C9C7BC` | Dividers and inactive registration marks                                         |
| `night`        | `#0D1512` | Broadcast/camera surround and optional night surface                             |

### Semantics

| Token       | Hex       | Ink pairing        | Meaning                                                      |
| ----------- | --------- | ------------------ | ------------------------------------------------------------ |
| `signal`    | `#E84A1B` | `#111A17` (4.58:1) | Primary action, active optical transmission                  |
| `verified`  | `#006B58` | white (6.47:1)     | Verified signature, offline-ready                            |
| `stored`    | `#1B55C3` | white (6.70:1)     | Informational/local record                                   |
| `attention` | `#E5A50A` | `#111A17` (8.21:1) | Degraded link, uncertainty, action soon                      |
| `danger`    | `#B42318` | white (6.57:1)     | Invalid signature, immediate danger, destructive consequence |

These calculated contrast ratios apply to solid color pairs at normal opacity. Implementation must test actual font weight, size, focus, hover, disabled, forced-colors, and composited states.

### Usage ratios

- 75% paper or night foundation.
- 18% ink, rules, and monochrome artifacts.
- 5% state color.
- 2% signal orange.

Do not create a gradient between semantic colors. Do not lower text opacity; select an explicit accessible token.

## Typography

### Families

- **Display and wayfinding:** [Barlow Condensed](https://github.com/jpt/barlow), weights 600 and 700. It draws from California public signage and is OFL licensed. Use only at 18 px and above.
- **UI and prose:** [Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/), weights 400, 500, and 700. It was designed for more distinguishable letterforms. Confirm and retain its license when bundling.
- **Data:** [IBM Plex Mono](https://github.com/IBM/plex), weights 400 and 500, OFL licensed. Use for IDs, times, byte counts, coordinates, hashes, and frame numbers only.

Self-host WOFF2 assets and preload only critical styles. A system-font fallback must preserve the hierarchy offline.

### Scale

| Role              | Mobile                      | Wide  | Family / weight      | Notes                           |
| ----------------- | --------------------------- | ----- | -------------------- | ------------------------------- |
| Hero              | `clamp(3rem, 12vw, 8.5rem)` | same  | Barlow Condensed 600 | `0.94` line-height; max 9 words |
| Page title        | 40 px                       | 64 px | Barlow Condensed 600 | sentence case                   |
| Operational state | 32 px                       | 48 px | Barlow Condensed 700 | concise verb or state           |
| Section title     | 28 px                       | 40 px | Barlow Condensed 600 | no decorative italics           |
| Body lead         | 20 px                       | 24 px | Atkinson 400         | max 58 characters per line      |
| Body/UI           | 17 px                       | 17 px | Atkinson 400         | 1.5 line-height                 |
| Control           | 17 px                       | 17 px | Atkinson 700         | sentence case                   |
| Equipment label   | 14 px                       | 14 px | IBM Plex Mono 500    | uppercase, tracking 0.04em      |
| Data              | 14 px                       | 15 px | IBM Plex Mono 400    | tabular numerals                |

Never use mono for paragraphs. Never use condensed type for error instructions or body copy.

## Shape and spacing

- Base spacing unit: 4 px.
- Operational content grid: 8 px rhythm.
- Marketing page grid: 12 columns wide, 4 columns narrow; visible alignment matters more than equal card widths.
- Control radius: 2 px.
- Panel radius: 4 px maximum.
- Camera/broadcast frame radius: 0 px.
- Primary button: 52 px minimum height, 16 px horizontal inset, 2 px border.
- Rule weight: 1 px normal, 2 px active/selected, 4 px for a major state rail.
- Marketing artifact may use a single 3 px hard offset shadow. No blur shadow in operational UI.

## Iconography and illustration

### Icons

- Original 20/24 px outline set on a 2 px stroke grid.
- Square terminals and 90-degree bends where legibility permits.
- Always pair unfamiliar icons with text.
- Use standard platform symbols for camera, close, back, play/pause, and accessibility controls; novelty is not a goal for known actions.
- State shapes: square verified, diamond unverified/claimed, triangle danger, open circle pending.

### Illustration

Use flat black-and-white technical drawings with one signal-orange annotation. Suitable subjects:

- two screens aligned across a gap;
- a hand carrying a labeled bundle between buildings;
- the relay trace crossing an outage zone;
- a packet cutaway showing signed content and custody envelope.

Avoid disaster photography, frightened faces, collapsed buildings, rescue uniforms, and false documentary scenes. They manipulate emotion and may imply deployment history.

## Motion

Motion is a state change, not wallpaper.

| Motion                |     Duration | Easing                   | Reduced motion                   |
| --------------------- | -----------: | ------------------------ | -------------------------------- |
| Button press          |        80 ms | linear                   | none; immediate state            |
| Panel reveal          |       160 ms | ease-out                 | opacity 80 ms or none            |
| Custody node added    |       240 ms | ease-out                 | node appears with no travel      |
| Marketing relay trace |  600 ms once | cubic-bezier(.2,.8,.2,1) | complete trace shown immediately |
| Progress update       | value-driven | linear                   | same; no pulsing                 |

No spring physics, elastic overshoot, parallax, scroll hijacking, continuous marquee, animated grain, or custom cursor. Decorative animation stops when the optical transmitter or camera is active.

## Photography

If photography is added, commission or capture it specifically for the product.

- Natural available light; devices in real hands and locations.
- Wide environmental frames mixed with close evidence shots.
- Visible screen content must be a clearly marked simulation.
- No heavy teal-orange grade, fake motion blur, or stock disaster scene.
- Caption what is real, simulated, and composited.

## Voice examples

### Good

- `Ready without network.`
- `Aim at the full code. Hold both devices still.`
- `12 of 18 source blocks recovered.`
- `Signature verified. Issued by Shelter Desk A.`
- `Unverified source. Read the details before acting.`
- `This bundle expired 18 minutes ago.`
- `Relay recorded. Original content is unchanged.`

### Avoid

- `The future of communication is here.`
- `AI-powered resilience.`
- `Military-grade.`
- `Unstoppable.`
- `Secure because it is light.`
- `Your guardian in every disaster.`
- `Quantum-safe` or `end-to-end encrypted` unless technically true and tested.

## Colophon requirements

The public site footer must disclose:

- typeface names and licenses;
- whether illustrations are original or sourced;
- version/build identifier;
- `Simulation, not an emergency service` near demo content;
- link to accessibility and security limitations;
- no unverified awards or partner marks.
