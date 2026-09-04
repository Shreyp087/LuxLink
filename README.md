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

The first milestone proves one complete path:

1. Compose a structured emergency bundle.
2. Sign it with a pre-enrolled issuer key.
3. Render a conservative monochrome optical sequence.
4. Receive it on a second device without a network.
5. Verify, store, and relay the exact issuer-signed object.
6. Reject tampered, expired, duplicate, and unknown-authority messages visibly.

The interface in `apps/web` currently communicates that operating model while the optical codec is developed.

## Safety status

This is an experimental hackathon prototype. It has not been certified, field-tested, independently audited, or endorsed by FEMA, the FCC, or emergency services.
