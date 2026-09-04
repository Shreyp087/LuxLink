# @luxlink/protocol

Dependency-free TypeScript primitives for LightMule/LuxLink emergency bundles and
screen-to-camera transfer frames.

This package deliberately does less than a general messaging protocol. It signs a
small, strictly validated emergency message, preserves that message through an
append-only relay chain, and splits the resulting bytes into bounded frames with
CRC32 error detection. It works with the standard Web Crypto API in browsers and
modern Node.js.

```ts
import {
  appendRelayHop,
  chunkTransfer,
  createBundle,
  createRelayEnvelope,
  createTransportPacket,
  encodeFrame,
  encodeTransportPacket,
  exportPublicKey,
  generateSigningIdentity,
  signBundle,
  verifyTransportPacket,
} from '@luxlink/protocol';

const dispatcher = await generateSigningIdentity();
const courier = await generateSigningIdentity();

const bundle = createBundle({
  incidentId: 'INC-2026-09-04',
  sourceKeyId: dispatcher.keyId,
  createdAt: Date.now(),
  expiresAt: Date.now() + 15 * 60_000,
  priority: 'critical',
  kind: 'sos',
  text: 'Two people trapped near the north stairwell.',
  nonce: crypto.getRandomValues(new Uint8Array(16)),
  maxHops: 4,
});

const signed = await signBundle(bundle, dispatcher);
const relayed = await appendRelayHop(createRelayEnvelope(signed), courier, Date.now());
const packet = createTransportPacket(relayed, {
  [dispatcher.keyId]: await exportPublicKey(dispatcher.publicKey),
  [courier.keyId]: await exportPublicKey(courier.publicKey),
});
const frames = (await chunkTransfer(encodeTransportPacket(packet), { chunkSize: 112 })).map(
  encodeFrame,
);
const result = await verifyTransportPacket(packet);
```

`verifyTransportPacket` proves that the embedded keys signed the packet. Applications must still
compare the origin key ID against a separately provisioned trust registry.

See `docs/protocol/spec-v1.md` and `docs/security/threat-model.md` for the wire
rules, trust assumptions, and explicit non-claims.
