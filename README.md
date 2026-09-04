# LightMule

> The message walks.

LightMule is an experimental, offline-first field relay for small, signed emergency messages. A bundle can move from screen to camera, remain stored on a device without a network, and be optically relayed by the person carrying it.

The repository remains named `LuxLink`; **LightMule** is the working product name because earlier commercial and academic projects already use LuxLink.

## Product boundary

LightMule is designed as an RF-independent, line-of-sight fallback for preloaded devices. It is not a replacement for 911, emergency alerts, cellular networks, AirDrop, or Quick Share. Visible transmissions are public by default. Signatures protect integrity and issuer provenance; encryption is a separate feature.

## Workspace

```text
apps/web              Product UI and offline PWA
packages/protocol     Bundle, cryptography, framing, and relay rules
docs/design           Visual research and interface specifications
docs/engineering      Architecture, ownership, operations, and ADRs
docs/product          Product scope and milestones
docs/protocol         Wire and bundle protocol documentation
docs/security         Threat model and trust assumptions
```

## Local development

Requirements:

- Node.js version from `.nvmrc`
- Corepack-enabled pnpm

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Before opening a pull request:

```bash
pnpm validate
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the engineering workflow and [docs/product/brief.md](./docs/product/brief.md) for the product contract.

## Current milestone

The software MVP implements one complete path:

1. Compose a structured emergency bundle.
2. Sign it with a locally generated P-256 identity.
3. Render a conservative 2 FPS monochrome QR sequence.
4. Receive frames through a live camera, QR image batch, or `.luxlink` frame pack.
5. Reassemble, hash-check, parse, verify, and store the exact issuer-signed object.
6. Distinguish cryptographic integrity from explicitly approved source trust.
7. Append a signed custody hop and optically relay the bundle again.
8. Reopen the precached application and persisted inbox without a network.

Use **Verify on this device** for a complete no-hardware loopback. It traverses the same framing,
reassembly, hashing, parsing, and signature verification code as camera reception. Camera capture
requires HTTPS or localhost and explicit browser permission.

See [docs/product/software-mvp.md](./docs/product/software-mvp.md) for the implemented acceptance
record and the remaining physical-field qualification boundary.

## Safety status

This is an experimental hackathon prototype. It has not been certified, field-tested on physical
phone pairs, independently audited, or endorsed by FEMA, the FCC, or emergency services.
