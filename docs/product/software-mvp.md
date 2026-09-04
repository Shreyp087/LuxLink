# Software MVP acceptance record

Status: implemented and automated as of field build 0003.

## Completed path

The browser application now performs the actual local protocol flow:

```text
compose -> canonicalize -> sign -> envelope -> transport packet -> chunk
        -> QR frames -> decode -> deduplicate -> reassemble -> SHA-256 check
        -> strict parse -> verify origin and relay signatures -> trust policy
        -> IndexedDB -> display or signed relay
```

There is no backend and no runtime API dependency. The QR decoder is loaded from the installed
application bundle only when reception is used. A generated service worker precaches every
production asset after the first successful load; the interface reports offline readiness only
after that worker controls the application.

## Implemented acceptance checks

| Capability            | Evidence                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Local P-256 identity  | A non-exportable Web Crypto private key is generated and retained in IndexedDB                      |
| Origin integrity      | Canonical bundle is signed and verified with ES256                                                  |
| Explicit source trust | Embedded keys prove integrity; contact trust requires manual fingerprint confirmation               |
| Optical sender        | 72-byte checksummed chunks render as high-resolution level-M QR symbols at 2 FPS                    |
| Optical receiver      | Live camera, multi-image import, and frame-pack import use one collector                            |
| Order and duplication | Repeated frames latch; persisted replays cannot replace first-seen data or richer custody           |
| End-to-end integrity  | CRC32 validates frames and SHA-256 validates reassembled bytes                                      |
| Store-carry-forward   | Accepted bundles persist and can receive a signed relay hop                                         |
| Offline application   | Production assets are precached; an automated offline reload passes                                 |
| Browser coverage      | Full file-transfer journey runs in desktop Chromium, mobile Chrome, and mobile Safari profiles      |
| QR interoperability   | Every QR PNG is decoded with scene detection plus pure-symbol fallback; a 10-run stress gate passes |
| Failure safety        | Strict schemas, size bounds, expiry, hop limits, and signature failures reject the object           |

## Deliberate no-hardware path

**Verify on this device** feeds the generated wire frames into a fresh receiver collector. Download
and re-import of a `.luxlink` frame pack additionally proves persistence across a file boundary.
These are deterministic fallback demonstrations when a second camera device is unavailable.

## External qualification boundary

The software deliverable is complete for the hackathon MVP. The following cannot honestly be
certified without physical devices or external review:

- camera range, angle, glare, motion, and low-light performance;
- Android-to-iPhone and iPhone-to-Android physical transfer timing;
- emergency-professional usability and accessibility field studies;
- independent cryptographic audit, key provisioning, and revocation operations;
- regulatory, emergency-service, or life-safety certification.

These are release-qualification activities, not hidden simulated features. Until completed, the
application remains an experimental fallback and must never be the sole emergency channel.
