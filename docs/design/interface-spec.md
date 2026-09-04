# LuxLink interface specification

Status: MVP implementation contract  
Design direction: Signal Ledger  
Public-facing working name: LuxLink
Last reviewed: 2026-09-04

## Product surfaces

The product has two visual gears sharing one system.

1. **Public site:** explains the premise, proves it with a real interactive demo, and establishes trust. It may use editorial composition and one authored motion idea.
2. **Field application:** receives, composes, signs, stores, carries, and relays bundles. It is an instrument, not a marketing page.

Do not place marketing navigation, testimonials, feature carousels, or decorative visuals inside the field application.

## Information architecture

```text
/
|- Why light
|- How a relay works
|- Protocol proof
|- Field limits
|- Launch field app
|
/app
|- Field desk (readiness + primary tasks)
|- Receive
|- Compose
|  |- Review
|  |- Sign
|  `- Broadcast
|- Vault
|  |- Bundle detail
|  |- Relay
|  `- Supersede / expire
`- Setup
   |- Offline assets
   |- Identity / trusted keys
   |- Accessibility / safe playback
   `- Diagnostics
```

Primary navigation is `Desk`, `Receive`, `Compose`, `Vault`. Setup is reached from the readiness strip, not a fifth equal tab. In capture and broadcast mode, primary navigation is hidden and a persistent exit/pause control is present.

## Global application frame

### Wide layout, 1024 px and above

```text
+--------------------------------------------------------------------------------+
| LUXLINK / FIELD DESK       INCIDENT 24-091      READY WITHOUT NETWORK    09:41 |
+----------------------+---------------------------------------------------------+
| 01 DESK              |                                                         |
| 02 RECEIVE           |                  CURRENT TASK                            |
| 03 COMPOSE           |                                                         |
| 04 VAULT       [12]  |                                                         |
|                      |                                                         |
| SETUP                |                                                         |
| BUILD 0.1.0          |                                                         |
+----------------------+---------------------------------------------------------+
```

- Left rail: 216 px fixed; no collapsible icon-only mode.
- Top status line: 40 px, mono labels, one readiness state.
- Main content max width: 1120 px; operational forms max 720 px.
- Critical action remains in the main reading column, never a floating corner button.

### Narrow layout, below 768 px

```text
+----------------------------------+
| LUXLINK             READY  09:41|
| INCIDENT 24-091                  |
+----------------------------------+
|                                  |
|          CURRENT TASK            |
|                                  |
+----------------------------------+
| DESK | RECEIVE | COMPOSE | VAULT |
+----------------------------------+
```

- Bottom navigation: 64 px plus safe-area inset; text and icon on every item.
- Operational task views replace bottom navigation with a 52 px `Pause` or `Exit` rail.
- No horizontal page scroll at 320 CSS px.

## Landing page specification

The landing page should feel like a one-page field manual, not a feature SaaS template.

### Section 00 - utility header

```text
LUXLINK                         FIELD TEST 0.1 / GITHUB / LAUNCH APP ->
```

- Transparent over hero only if contrast remains solid; otherwise service-paper.
- `FIELD TEST 0.1` is a visible badge stating prototype maturity.
- No hamburger above 768 px; no mega menu.

### Section 01 - hero

```text
FIELD NOTE 01 / THE OUTAGE

A MESSAGE CAN TRAVEL
WITHOUT A NETWORK.

Receive it by light. Carry it offline. Relay it with the original signature intact.

[ LAUNCH FIELD APP ]   [ SEE THE 75-SECOND TEST ]

 [SOURCE]-----------[CARRIER]------------------------[RECEIVER]
  SIGNED 09:14        NO LINK / 27 MINUTES             VERIFIED 09:42
```

- Hero title occupies roughly 60% of viewport width on desktop, max two lines.
- The relay trace is SVG or CSS, not canvas/WebGL.
- On first view, the trace may draw once. Nodes appear only after their segment; under reduced motion it is fully present.
- The `NO LINK` interval is visibly longer than connected events to make store-carry-forward legible.

### Section 02 - physical explanation

Three numbered movements, not equal marketing cards:

```text
01 RECEIVE BY LIGHT     camera reads a safe-rate optical bundle
             |
02 CARRY OFFLINE        bundle remains signed in the local vault
             |
03 RELAY                another screen receives the unchanged source message
```

Include one flat technical illustration per movement. No icon bubble row.

### Section 03 - live proof band

Dark `night` background; actual product UI, not a video mockup.

- Toggle network off instruction.
- Create and locally sign a small demonstration bundle.
- Open sender and receiver in two viewports or provide an encoded sample.
- Show source hash before and after.
- Persistent label: `EXPERIMENTAL / NOT AN EMERGENCY SERVICE`.
- If camera access is unavailable, offer the real local loopback or frame-pack import without
  blocking the story.

### Section 04 - trust anatomy

Render one packet receipt at large scale. Annotation rails point to:

- source signature;
- created/expiry time;
- incident and bundle IDs;
- urgency/severity/certainty;
- hop limit;
- content hash;
- custody events.

Do not claim standards compliance. Use `CAP-inspired priority fields` and `BPv7-inspired bundle behavior` only where accurate.

### Section 05 - honest boundary

Title: `What light can - and cannot - do.`

Two asymmetric columns:

| Can                                        | Cannot                                      |
| ------------------------------------------ | ------------------------------------------- |
| Cross a local RF outage                    | Replace 911 or responder radio              |
| Work between preloaded compatible devices  | Install itself after the network is gone    |
| Preserve a source signature through relays | Hide the fact that a screen is broadcasting |
| Move short structured messages             | Promise high-speed arbitrary file transfer  |

This section is part of the pitch, not a legal footnote.

### Section 06 - build evidence

- Link to source, protocol notes, test matrix, accessibility statement, threat model, and benchmark results.
- Use actual commit/build version.
- No vanity metric, fake customer logo, or unverified testimonial.

### Section 07 - final action

> Put both devices in airplane mode.

Primary: `Launch field test`  
Secondary: `Read the limitations`

## Field desk

Purpose: establish readiness and let the operator choose one of three actions.

```text
+----------------------------------------------------------------+
| FIELD DESK                                           09:41 LOCAL |
| Incident 24-091 / North Shelter                                 |
+----------------------------------------------------------------+
| READY WITHOUT NETWORK                                           |
| App shell, decoder, local vault and 3 trusted keys checked.     |
| [ RUN READINESS TEST ]                                          |
+----------------------------------------------------------------+
| [ RECEIVE A BUNDLE ]                                            |
| Aim this device's camera at another screen.                     |
+-------------------------------+--------------------------------+
| [ COMPOSE + SIGN ]            | [ OPEN VAULT / 12 ]            |
| Create a structured message.  | 2 bundles eligible to relay.   |
+-------------------------------+--------------------------------+
| LAST EVENT / 09:36  Bundle B-07 verified and stored.            |
+----------------------------------------------------------------+
```

Rules:

- `Receive a bundle` is the dominant action because it is most time-sensitive and easiest to demonstrate.
- Readiness panel is teal only when tests pass. Missing camera permission is not a setup failure until receive is selected.
- Network status is not the hero metric; offline capability is.
- Recent event log is chronological, max five items, with `Open full log`.

## Compose flow

Use a three-step vertical sequence: `Message`, `Priority`, `Review + sign`. Avoid a wizard that hides previous answers entirely.

### Step 1 - message

Fields:

- Type: SOS, resource request, hazard, status, all-clear, acknowledgement.
- Short title: 60 characters.
- Instruction: 160 characters.
- People affected: optional integer.
- Need tags: water, medical, shelter, evacuation, power, other.
- Location: optional coordinates with accuracy/source and a human-readable place label.

Show byte budget as `312 / 512 BYTES` near the field group, not a generic character counter. Exceeding the budget names which fields are largest.

### Step 2 - priority

Urgency, severity, and certainty are separate radio groups with definitions. Never use three unlabeled colored selects.

Example:

```text
URGENCY / when is action needed?
( ) IMMEDIATE   act now
(x) EXPECTED    act within the next hour
( ) FUTURE      act later

SEVERITY / what harm is possible?
( ) EXTREME  (x) SEVERE  ( ) MODERATE  ( ) MINOR

CERTAINTY / how confident is this report?
(x) OBSERVED  ( ) LIKELY  ( ) POSSIBLE  ( ) UNKNOWN
```

### Step 3 - review and sign

- Render the final human-readable instruction first.
- Show source identity and short key fingerprint.
- Show expiry and hop limit.
- `Sign bundle` is distinct from `Begin broadcast`.
- Signing creates an immutable bundle and displays this consequence.
- If no signing key exists, say `This device has no source identity` and offer setup or `Create unverified bundle`; the latter is visibly unverified.

## Receive flow

### Permission primer

Before the browser prompt, explain:

> LuxLink needs the camera to read a code shown on another device. Frames are decoded on this device and are not uploaded.

Actions: `Continue to camera` and `Use encoded sample`.

Do not trigger camera permission on page load.

### Capture view

```text
+----------------------------------+
| RECEIVE / CAMERA         EXIT    |
|                                  |
|  +----------------------------+  |
|  | L                          |  |
|  |       camera preview       |  |
|  |                          J |  |
|  +----------------------------+  |
|                                  |
| HOLD STEADY                       |
| 12 / 18 SOURCE BLOCKS             |
| LINK / GOOD        GLARE / LOW    |
|                                  |
| [ PAUSE CAMERA ]                  |
+----------------------------------+
```

- Camera content has no decorative filter.
- Registration brackets are outside the decoded target and meet 3:1 non-text contrast.
- Link guidance gives one correction at a time, prioritized: full frame, distance, steadiness, glare, exposure.
- Progress reflects recoverable source blocks, not raw frames seen.
- Never show `100%` before integrity validation completes.
- Camera pause physically stops tracks where feasible, not just the preview.

### Capture states

| Condition     | Heading                    | Instruction                                                |
| ------------- | -------------------------- | ---------------------------------------------------------- |
| No target     | `Find the full code`       | `Aim at all four corners of the other screen.`             |
| Too far       | `Move closer`              | `The frame is too small to decode reliably.`               |
| Mixed frame   | `Hold steady`              | `Keep both devices still while the next blocks arrive.`    |
| Glare         | `Reduce glare`             | `Tilt either screen until the white areas look even.`      |
| Duplicate     | `Already stored`           | `Bundle B-07 is in this vault. No new copy was created.`   |
| Corrupt       | `Integrity check failed`   | `The bundle is incomplete. Keep scanning or restart.`      |
| Camera denied | `Camera access is blocked` | `Allow camera access in browser settings, then try again.` |

## Receipt and verification

The receipt is the product's most important screen.

```text
+----------------------------------------------------------------+
| BUNDLE B-07                        RECEIVED 09:42 / AGE 28 MIN   |
+----------------------------------------------------------------+
| [square] VERIFIED SOURCE                                         |
| Shelter Desk A / key ...9A7C                                   |
+----------------------------------------------------------------+
| WATER NEEDED FOR 18 PEOPLE                                      |
| Deliver to North Shelter gate before 11:00.                    |
|                                                                |
| URGENCY Expected  SEVERITY Severe  CERTAINTY Observed           |
+----------------------------------------------------------------+
| RELAY TRACE                                                     |
| SOURCE 09:14 ---- CAPTURED 09:16 ---- THIS DEVICE 09:42         |
+----------------------------------------------------------------+
| [ STORE + CLOSE ]      [ RELAY THIS BUNDLE ]                    |
| Details / signature / content hash                              |
+----------------------------------------------------------------+
```

State priority:

1. Invalid signature: full-width danger rail, no positive checkmark, primary action `Quarantine bundle`.
2. Unknown/unverified source: amber rail, `Store as unverified` available, `Relay` requires explicit confirmation.
3. Verified known source: teal stamp; content remains paper/ink, not a full teal card.
4. Expired or superseded: state shown above message title; instructions are not presented as current.

Signature verification proves a key signed the bytes. It does not by itself prove the real-world person or organization; details must say how the key became trusted.

## Broadcast flow

### Preflight

Before moving content, show:

- bundle short ID and size;
- safe playback profile, default `SAFE / 2 FPS`;
- brightness recommendation;
- warning that anyone with a camera in view may record the broadcast;
- visible `Start broadcast` action.

### Active broadcast

```text
+----------------------------------------------------------------+
| BROADCAST B-07                 SAFE / 2 FPS       [ PAUSE ]     |
|                                                                |
|             +----------------------------------+                |
|             |                                  |                |
|             |       OPTICAL FRAME REGION       |                |
|             |                                  |                |
|             +----------------------------------+                |
|                                                                |
| FRAME 044     CYCLE 03     EST. RECOVERY 68%                   |
| Ask the receiver to keep scanning until it shows VERIFIED.     |
|                                                   [ END ]       |
+----------------------------------------------------------------+
```

- The optical region is the only changing region.
- `Pause` stays in a stable position outside it and is keyboard reachable.
- No toast, spinner, blinking live dot, or animated background appears while active.
- Since a one-way sender cannot know receiver completion, do not label receiver progress or auto-stop based on a fabricated acknowledgement.
- `End broadcast` returns to a summary; it does not claim delivery.

### Broadcast summary

Say `Broadcast ended`, not `Delivered`.

Show elapsed time, cycles displayed, and an optional manual action `Receiver confirmed receipt`. Any manual confirmation is logged as operator-reported, not cryptographically acknowledged.

## Vault

The vault is a ledger, not a tile gallery.

```text
VAULT / 12 BUNDLES

[ ALL 12 ] [ ACTIONABLE 4 ] [ RELAY 2 ] [ EXPIRED 3 ]

STATUS       ID       MESSAGE                         AGE     HOPS
VERIFIED     B-07     Water / North Shelter           28m     1/4
UNVERIFIED   K-21     Road blocked / Route 8          44m     2/3
SUPERSEDED   C-12     Clinic status                   2h      1/4
EXPIRED      M-03     Generator request               6h      3/3
```

- On mobile, each row becomes a two-line ledger record, not a floating card.
- Default sort: actionable first, then priority, then newest.
- Every sort/filter is labeled and resettable.
- Search is local and visibly marked `ON THIS DEVICE`.
- Swipe is never the only path to archive/quarantine/delete.

## Bundle detail

Order:

1. current state and instruction;
2. source/trust;
3. urgency/severity/certainty;
4. relay trace;
5. actions;
6. technical details.

Technical details use a `<dl>`:

```text
Bundle ID          bndl:sha256:7af3...
Content hash       7af3 92e1 ... 84c0
Signature          ECDSA P-256 / valid
Source key         ...9A7C / locally trusted 2026-09-03
Created            2026-09-04 09:14:22 -0500
Expires            2026-09-04 11:14:22 -0500
Hop limit          1 used / 4 allowed
Payload            346 bytes
```

Hashes are selectable with a copy action; truncation is visible and expandable. Never put security-critical information only in a tooltip.

## Setup and readiness

Readiness checklist:

- application shell cached;
- decoder cached;
- fonts/icons cached;
- local storage write/read check;
- crypto self-test;
- trusted-key count;
- camera support and permission status;
- safe playback preference;
- available local storage estimate when supported.

Statuses: `Ready`, `Action needed`, `Unavailable`, `Not tested`. Avoid `Healthy` for an untested capability.

Provide `Run readiness test` and a plain exportable diagnostics summary that excludes message content and private key material.

## Component inventory

| Component          | Purpose                        | Constraints                                                   |
| ------------------ | ------------------------------ | ------------------------------------------------------------- |
| `ReadinessStrip`   | Offline and system state       | One current state; links to details; no looping animation     |
| `ModeHeader`       | Incident, mode, local time     | Persists in field app; no breadcrumb during capture           |
| `StateStamp`       | Verified/unverified/expired    | Text + shape + color; not interactive                         |
| `PriorityFacts`    | Urgency/severity/certainty     | Separate definition items; no aggregate traffic light         |
| `RelayTrace`       | Custody chronology             | Accessible ordered list under visual SVG/CSS rendering        |
| `BundleLabel`      | Human-readable packet artifact | Fixed hierarchy; message never hidden behind hover            |
| `LinkGuidance`     | One capture correction         | `role="status"`, debounced to avoid announcements every frame |
| `TransferMeter`    | Source blocks recovered        | Text count + progress element; no false precision             |
| `AlertRail`        | Blocking danger or advisory    | One per view; follows USWDS severity discipline               |
| `PrimaryAction`    | Dominant next action           | One per view; 52 px minimum height                            |
| `LedgerTable`      | Vault records                  | Semantic table wide; accessible record list narrow            |
| `TechnicalDetails` | Audit metadata                 | Definition list; selectable values                            |
| `OpticalStage`     | Changing QR/frame region       | Isolated from controls; labeled; safe profile visible         |

## Interaction states

Every interactive component implements:

- default;
- hover where a pointing device exists;
- focus-visible;
- pressed;
- disabled with reason adjacent;
- busy with a deterministic label;
- error when the action fails;
- forced-colors;
- reduced-motion.

Disabled controls do not use opacity alone. Prefer keeping the control readable and explain the prerequisite: `Sign the bundle before broadcasting`.

## Accessibility contract

- Semantic HTML is the default; ARIA repairs only missing native semantics.
- DOM order matches visual order at every breakpoint.
- Camera preview has an accessible description and a text status stream; it is not announced frame by frame.
- Progress changes are announced at meaningful thresholds, not every percentage.
- Optical stage includes persistent pause and exposure warning.
- Forms provide a summary at the top and errors at each field; focus moves to the summary only after a failed submit.
- Modals are limited to destructive confirmation, permission explanation, or security-critical branching. Routine details use in-page disclosure.
- At 400% zoom, all actions remain reachable without two-dimensional scrolling, except the optical frame itself where aspect ratio must be maintained.
- Localization allows 40% text expansion; no fixed-height text containers.
- Times include timezone or explicit `LOCAL`; relative age accompanies absolute time.

## Motion and live-region contract

- Maximum one decorative motion event per landing-page viewport.
- Zero decorative motion in `/app`.
- No element flashes more than three times per second; safe broadcast defaults to 2 fps and is separately assessed against [WCAG 2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold).
- `prefers-reduced-motion: reduce` removes trace drawing, count-up, and spatial transitions.
- `aria-live="polite"` for readiness, source-block thresholds, and stored state.
- `role="alert"` only for invalid signature, destructive failure, or a new immediate-risk alert while the app is in use.
- Debounce camera guidance announcements to at least 3 seconds and only announce when the corrective action changes.

## Responsive checkpoints

Test content, not device names:

- 320 x 568: smallest supported view; one-column tasks.
- 390 x 844: primary mobile demo.
- 768 x 1024: tablet/paired demo.
- 1024 x 768: landscape field desk.
- 1440 x 900: presentation and judge demo.
- 200% text zoom at 1280 px.
- 400% zoom at 1280 px for reflow validation.

Do not create a tablet-only two-pane compose flow until the one-column sequence is complete.

## Content-state checklist

For each flow, implement and demo:

- first use;
- ready offline;
- setup incomplete;
- empty vault;
- camera permission prompt, denied, and unavailable;
- no optical target;
- poor alignment/glare;
- interrupted transfer;
- duplicate bundle;
- integrity failure;
- verified known source;
- valid signature with unknown source;
- invalid signature;
- expired and superseded message;
- storage quota failure;
- relay at hop limit;
- reduced motion and safe playback.

## Analytics and privacy

The MVP should default to no third-party analytics in the field application.

If local telemetry is needed for testing:

- label it `Test metrics stored on this device`;
- record frame timing/error statistics without camera frames or message content;
- provide export and erase actions;
- never include private keys, full hashes tied to sensitive content, precise location, or identity without explicit protocol need and consent;
- ensure telemetry code cannot block operational flow.

## Definition of implementation complete

A surface is complete only when:

1. It matches the hierarchy and copy contract above.
2. It uses the documented design tokens rather than one-off colors and spacing.
3. It is functional in airplane mode after verified setup.
4. Keyboard and screen-reader paths are tested.
5. Reduced-motion and forced-color modes remain usable.
6. Failure states are deliberately designed, not default exceptions.
7. The screen does not imply delivery, identity, confidentiality, or standards compliance that the protocol cannot prove.
8. A screenshot passes the originality test in `visual-research.md`.
