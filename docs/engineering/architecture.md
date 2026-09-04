# Architecture

## System intent

LuxLink is a local-first web application that encodes small, structured bundles into a visual stream, receives them through a camera, verifies their integrity and provenance, stores them locally, and can relay them later without a network.

The browser application is not an emergency-service backend and the optical channel is not inherently confidential.

## Workspace boundaries

The target monorepo shape is:

```text
apps/
  web/                 installable browser application
packages/
  protocol/            deterministic schemas, framing, hashing and verification
  ui/                  optional reusable presentational primitives
tests/
  e2e/                 cross-package user journeys
docs/
  engineering/         engineering policy and ADRs
```

Recommended dependency direction:

```text
@luxlink/web ---> @luxlink/protocol
      |
      +---------> @luxlink/ui (optional)

@luxlink/protocol -X-> browser APIs, framework code, or @luxlink/web
```

Packages expose public entry points. Consumers must not import another workspace's private source paths.

## Runtime layers

### Presentation

Routes, components, interaction state, accessible announcements, and the visual design system. Presentation translates user intent into use-case calls but does not define bundle validity.

### Application

Use cases such as compose, transmit, receive, verify, accept, reject, relay, expire, and delete. This layer coordinates dependencies through narrow interfaces.

### Domain and protocol

Pure schemas and deterministic transformations. Given identical bytes and policy inputs, this layer must return identical results. It owns protocol version interpretation, bounds checks, identifiers, integrity outcomes, and error taxonomy.

### Adapters

Camera capture, display timing, QR/codecs, Web Crypto, IndexedDB, service workers, and browser lifecycle integration. Adapters convert platform-specific failures into typed application errors.

## Trust boundaries

- Camera frames and decoded bytes are hostile until parsed, bounded, and verified.
- A cryptographic signature is not automatically a trusted identity.
- IndexedDB contains attacker-controlled content and potentially sensitive metadata.
- Service-worker updates are executable supply-chain events.
- Build dependencies and GitHub Actions are part of the trusted computing base.

No received text is rendered as HTML. No received URL opens automatically. Parser work is bounded by payload size, frame count, time, and memory limits.

## Offline contract

After one successful installation/load, the production application must support its core compose, transmit, receive, verify, store, inspect, and relay journey with all network interfaces unavailable. Runtime assets are same-origin and precached. A first visit still requires distribution; the UI states that limitation plainly.

Network availability must not silently change verification semantics. Telemetry is opt-in, queues no sensitive payloads, and is never required for operation.

## Reliability model

An optical transfer has explicit states rather than optimistic animation:

```text
idle -> preparing -> transmitting/scanning -> reconstructing -> verifying
     -> accepted | rejected | expired | cancelled | recoverable-failure
```

Persist only after bounds and integrity checks succeed. The UI distinguishes received, reconstructed, integrity-verified, identity-trusted, and acknowledged; these terms are not interchangeable.

## Architecture fitness checks

- Protocol tests run without a DOM, camera, or network.
- A production build contains no runtime CDN requests.
- The offline Playwright journey blocks the network after warm-up.
- Unsupported cameras, denied permissions, visibility changes, and storage failures have deliberate UI states.
- All generated visual output offers a safe/reduced-motion mode.

Protocol wire details and cryptographic choices require their own ADRs and focused threat review.
