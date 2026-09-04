# Research findings that constrain the build

## Decision

Generic animated screen-to-camera file transfer is a no-go as the project's innovation claim. The current build must be positioned as a signed, safety-conscious, store-carry-forward emergency relay.

## Prior-art pressure

- PixNet, COBRA, HiLight, InFrame++, FareQR, and DeepLight establish a long research history for screen-camera communication.
- Multipart UR and current browser projects establish animated QR plus fountain-style recovery.
- LiveDrop and Decimen Optical Transfer overlap the original general-purpose product pitch.
- BPv7/BPSec and CRIMP establish delay-tolerant bundles and crisis data-mule concepts.

Therefore the repository must never claim to have invented optical screen-camera transport, animated QR, emergency data mules, or signed bundles.

## Engineering boundary

- Start with a high-contrast monochrome carrier.
- Default to a low-rate safe mode near two frames per second.
- Treat 0.3-1.0 m, controlled indoor lighting, and 200-400 byte bundles as the first qualification envelope.
- Expect mixed exposures, rolling shutter, autofocus hunting, glare, skipped frames, duplicates, and background suspension.
- Do not make sender-side adaptive-rate claims without a real return channel.
- Do not depend on native `BarcodeDetector`, WebGPU, camera manual controls, or threaded WebAssembly.

## Browser boundary

The portable receive path is:

```text
HTTPS -> getUserMedia -> visible muted playsinline video
      -> requestVideoFrameCallback -> Canvas ROI
      -> JS/WASM decoder -> IndexedDB
```

A Service Worker can prepare the shell for offline use only after the first successful secure-context load. Installation and storage readiness must be explicit product states.

## Security boundary

- Visible optical traffic can be recorded.
- CRC and erasure recovery detect accidents; they do not authenticate an issuer.
- The bundle requires a canonical signed manifest, content hash, incident identifier, unique message identifier, expiry, and strict size/type limits.
- Trust bootstrap and key revocation during an outage remain unsolved product problems.
- Civilian messages remain unverified unless their real-world identity has been provisioned independently.

## Safety boundary

- Rapid display changes require flash-threshold evaluation.
- Avoid saturated red and large full-screen luminance inversions.
- Provide start, stop, timeout, and reduced-flash behavior.
- Never rely on color alone for trust or completion.

## Evidence base

The detailed research report and claim-source ledger were produced before repository implementation. Key starting sources include:

- [IEEE 802.15.7-2018](https://standards.ieee.org/ieee/802.15.7/6820/)
- [Bundle Protocol Version 7, RFC 9171](https://www.rfc-editor.org/rfc/rfc9171.html)
- [Bundle Protocol Security, RFC 9172](https://www.rfc-editor.org/rfc/rfc9172.html)
- [Multipart UR implementation guide](https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2024-001-multipart-ur.md)
- [Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [Decimen Optical QR Transfer](https://github.com/Pendia/Decimen-Optical-QR-Transfer)
- [LiveDrop](https://livedrop.eu/company/faqs)

This document is a build constraint, not a claim of legal clearance, standards conformance, safety certification, or field reliability.
