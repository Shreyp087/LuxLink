# Testing strategy

## Goals

Tests reduce uncertainty at the cheapest layer that can observe the behavior. They do not convert a prototype into a certified life-safety system.

## Layers

### Unit and property tests

Pure protocol and domain behavior belongs here: schema bounds, canonical serialization, sequence handling, reconstruction, expiry, hop limits, deduplication, tamper detection, and error taxonomy. Use deterministic fixtures and seeded randomness. Every fixed parser or verification bug gets a regression test.

### Adapter integration tests

Exercise IndexedDB transactions, Web Crypto interoperability, service-worker caching, camera capability fallbacks, and codec boundaries. Simulate quota failures, missing capabilities, interrupted writes, and malformed data.

### Browser journeys

Playwright covers compose, send preparation, permission failures, receive/verify states, offline reload, local persistence, relay, expiry, deletion, keyboard navigation, and reduced motion. The default CI suite uses Chromium and WebKit mobile emulation. Emulation is not physical-camera validation.

### Physical device matrix

Before a release affecting the optical path, record at least:

- one Android/Chromium sender and receiver path;
- one iOS/WebKit sender and receiver path where supported;
- laptop-to-phone transfer;
- low light, glare, off-axis, motion, distance, and brightness variation;
- interruption, resume/retry, duplicate, tampered, expired, and oversized inputs;
- the baseline safe-display profile.

Record raw observations and failures, not only the best run.

## Required invariants

- Malformed input cannot crash the receive loop or trigger unbounded work.
- No payload is marked verified before cryptographic/integrity checks complete.
- Duplicate and expired bundles are handled deterministically.
- Relay does not replace the original signer identity.
- Core behavior works after the network is blocked and the application is reloaded.
- Reduced-motion preferences never trigger a high-frequency transmission automatically.
- Received text is rendered inertly and received links never auto-open.

## Performance evidence

Benchmarks name device, operating system, browser, camera/display settings, distance, angle, lighting, encoder profile, payload size, frame rate, sample count, success rate, median, and tail latency. A single successful demonstration is not a benchmark.

## Coverage

Coverage is a diagnostic, not the goal. Protocol parsing, security decisions, and state transitions should approach exhaustive branch coverage. UI snapshots are used sparingly; behavior and accessible names are preferred.
