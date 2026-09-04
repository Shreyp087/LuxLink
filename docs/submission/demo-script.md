# LuxLink 90-second no-hardware demo

This path needs one browser and exercises the real framing, reassembly, hashing, parsing, signature,
storage, and relay code. Keep the browser at 100% zoom and use a 1440 × 900 or larger window.

## Before recording

1. Run `pnpm dev` and open the printed local URL.
2. Wait for **OFFLINE CORE READY**.
3. Reload once so the service worker and identity are settled.
4. Keep the default message, or enter: `Medical supplies needed at the east shelter.`
5. Close unrelated tabs and hide notifications.

## Spoken demo and actions

### 0:00–0:12 — The problem

**Show:** hero and system constraints.

**Say:** “When an outage breaks the network, nearby places become disconnected even if people can
still move between them. LuxLink turns that movement into a secure store–carry–forward link using
only a browser, a screen, and optionally a camera.”

### 0:12–0:30 — Create and sign

**Do:** scroll to the field system. Point out the incident, priority, expiry, hop limit, and local
fingerprint. Select **SIGN & PREPARE SIGNAL**.

**Say:** “The browser bounds and canonicalizes this emergency message, hashes it, and signs it with
a local P-256 identity. No account, cloud API, or backend is involved.”

### 0:30–0:48 — Optical packet

**Show:** the moving QR code, frame count, bundle fingerprint, hop count, and expiry. Pause once if
needed.

**Say:** “This is not one oversized QR code. The signed self-contained packet is split into paced,
order-independent frames. Each frame has a corruption check, and the full transfer is protected by
a SHA-256 digest.”

### 0:48–1:05 — Verify without hardware

**Do:** select **VERIFY ON THIS DEVICE**. LuxLink moves to **SCAN** and displays
**CRYPTOGRAPHIC INTEGRITY VALID**.

**Say:** “For judging with one computer, loopback uses the same collector, parser, hash check, and
signature verifier as camera reception. A second device can scan the same sequence directly.”

### 1:05–1:20 — Explain honest trust

**Show:** the verified receipt and trusted-source state.

**Say:** “A signature proves the bytes survived; it does not automatically prove the signer is an
authority. LuxLink keeps cryptographic integrity and approved identity trust visibly separate.”

### 1:20–1:30 — Carry and relay

**Do:** open **CARRY**, show the saved message, then select **SIGN + RELAY**.

**Say:** “The packet persists offline. A carrier can append a signed custody hop and transmit it
again without changing the original message. When the network stops, the message walks.”

## Optional proof after the main demo

- Turn network emulation off and reload to show the precached shell and saved inbox.
- Download a `.luxlink` frame pack and import it in a fresh browser profile.
- Use a second phone or laptop to show live screen-to-camera reception.
- Run `pnpm validate` and show the three-browser Playwright result.

## Recording fallback

If a live camera is unreliable under stage lighting, use **VERIFY ON THIS DEVICE** for the main
demo and describe the camera as the alternate carrier. Do not call the prototype field-tested or
encrypted.
