# VoltHacks 2026 submission copy

## Project name

LuxLink

## Tagline

When the network stops, the message walks.

## Short description

LuxLink turns a browser into an offline, human-carried emergency relay: sign a small message, send
it as QR frames, verify it locally, store it, and relay it—without a server.

## Inspiration

Most messaging tools assume a continuous radio or Internet path. During an outage, that assumption
can divide nearby areas into disconnected islands even while people are still moving between them.
LuxLink started from a simple question: if a person can cross the gap, can a verified message cross
with them?

The goal was not to imitate a mesh network or promise magical connectivity. It was to make physical
custody a first-class part of the communication model and to show exactly which guarantees survive
each handoff.

## What it does

LuxLink is an installable offline-first web app for short, structured emergency messages. A sender
writes a message, chooses its priority and lifetime, and signs it with a P-256 identity generated in
the browser. LuxLink packages the signed content and displays it as a conservative two-frame-per-
second sequence of QR codes.

A receiver collects those frames through a camera, uploaded QR images, or a `.luxlink` frame pack.
It accepts frames in any order, ignores duplicates, checks each CRC, verifies the complete transfer
hash, strictly parses the packet, and verifies the origin and relay signatures. The accepted packet
is stored in IndexedDB for offline access. A carrier can then add a signed custody hop and relay the
packet again while the source message and signature remain intact.

The app deliberately separates **cryptographic integrity** from **source trust**. A valid signature
proves the message was not changed; the user must separately compare and approve the signer’s full
fingerprint before LuxLink labels that source trusted.

## How it works

1. The browser generates a non-exportable local signing identity with the Web Crypto API.
2. The message is bounded, canonicalized, content-addressed with SHA-256, and signed with ECDSA
   P-256/SHA-256.
3. A self-contained packet carries the relay envelope and exactly the public keys required for
   verification.
4. Packet bytes are divided into compact `LX1` optical frames with CRC32 corruption checks and a
   SHA-256 transfer ID.
5. The receiver reassembles all distinct frames, verifies the transfer and every signature, and
   persists the exact signed envelope.
6. Relaying creates a new append-only envelope whose signed hop commits to the complete previous
   envelope, producing a tamper-evident custody chain.

## What makes it innovative

LuxLink treats a walking person as a store–carry–forward link without pretending that a network
connection stayed alive. It combines a usable browser interface with a real bounded protocol:
order-independent optical frames, corruption detection, content addressing, self-contained public
keys, an immutable source signature, and signed relay custody.

It also makes a subtle security distinction visible instead of hiding it. Integrity is computed;
identity trust is a separate human decision. That matters in an emergency tool, where a green
“verified” label can otherwise imply far more than the cryptography actually proves.

## How it was built

The project is a TypeScript monorepo with a React/Vite offline PWA and a dependency-light protocol
package. The protocol uses browser-native Web Crypto for P-256 signing and SHA-256 hashing. QR codes
are generated with `qrcode` and received with ZXing. IndexedDB stores the local identity, trust
registry, and accepted messages; a precaching service worker makes the installed shell available
after the first load.

The visual system was designed as a civic field instrument rather than an AI dashboard: warm paper,
hard rules, registration marks, an optical black field, visible protocol facts, and restrained state
color. There is no chatbot layout, glassmorphism, decorative gradient, or generated pseudo-logo.

## Challenges

- Keeping QR frames dense enough to carry a signed, self-contained packet while still making them
  reliable for real browser decoders.
- Normalizing P-256 signatures consistently across browser and Node runtimes.
- Making out-of-order and duplicate frames safe while enforcing strict size and shape limits.
- Preserving the exact origin-signed object as relay hops are appended.
- Explaining the difference between signature validity and trusted identity without making the
  workflow confusing.
- Providing a credible no-hardware judging path that exercises the same core receiver pipeline as
  a camera transfer.

## Accomplishments

- A complete write → sign → frame → receive → verify → store → relay loop.
- Real rendered QR images decoded back into a verified packet in automated browser tests.
- Offline reload of the installed application and persisted inbox.
- Append-only signed relay custody with tamper and limit rejection.
- Explicit fingerprint confirmation, trust removal, and current-trust display.
- End-to-end coverage on desktop Chromium, mobile Chrome, and mobile Safari/WebKit.
- Automated formatting, linting, type checks, unit tests, production builds, CodeQL, dependency
  review, and lockfile audit in GitHub Actions.

## What was learned

An optical demo is only the visible tip of the system. Most of the difficult work is deciding what
the bytes mean, limiting what a parser will accept, preserving provenance through a relay, and being
honest about what a signature cannot prove. The project also showed that a hardware-shaped problem
can have a meaningful software-only prototype when the fallback path is designed as a first-class
feature rather than a mock.

## What is next

- Qualify camera-to-camera transfer across physical phone pairs, screen sizes, glare, motion, and
  low-light conditions.
- Add an optional fountain-code framing profile for packet recovery when some frames are missed.
- Introduce encrypted recipient or group profiles while keeping signatures independently
  verifiable.
- Add pre-enrolled organization keys, revocation material, and deployment-specific trust policy.
- Run accessibility, usability, protocol interoperability, and independent security reviews.

## Technologies

TypeScript, React 19, Vite 8, Progressive Web App, service workers, IndexedDB, Web Crypto API,
ECDSA P-256/SHA-256, canonical JSON, CRC32, QR Code, ZXing, pnpm workspaces, Turborepo, Vitest,
Playwright, ESLint, Prettier, GitHub Actions, CodeQL, and dependency review.

## Challenge fit

Open Innovation / Anything Engineering Based with Impact.

## Source code

https://github.com/Shreyp087/LuxLink

## Suggested screenshot captions

1. **The full field system:** LuxLink exposes the operating constraints and complete local workflow
   instead of hiding the protocol behind a generic dashboard.
2. **Screen-to-camera signal:** A real signed packet is divided into paced, corruption-checked QR
   frames with visible bundle, frame, hop, and expiry evidence.
3. **Verified receipt:** Transfer integrity and the source signature are valid, while source trust
   remains a separate fingerprint-confirmation decision.

## Safety disclosure

LuxLink is an experimental hackathon prototype, not a replacement for 911 or public emergency
networks. Visible transfers are not encrypted. The prototype has not been certified, independently
audited, or physically field-qualified, and it is not endorsed by emergency services or government
agencies.
