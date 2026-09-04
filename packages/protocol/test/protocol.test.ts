import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BUNDLE_VERSION,
  ProtocolError,
  appendRelayHop,
  bundleId,
  canonicalJson,
  chunkTransfer,
  createBundle,
  createRelayEnvelope,
  decodeRelayEnvelope,
  decodeFrame,
  encodeRelayEnvelope,
  decodeBundle,
  encodeBundle,
  encodeFrame,
  createTransportPacket,
  decodeTransportPacket,
  encodeTransportPacket,
  exportPublicKey,
  generateSigningIdentity,
  parseBundle,
  reassembleFrames,
  signBundle,
  utf8Encode,
  verifyRelayEnvelope,
  verifySignedBundle,
  verifyTransportPacket,
  crc32,
} from '../src/index.ts';

function makeBundle(sourceKeyId: string, now = 1_800_000_000_000) {
  return createBundle({
    incidentId: 'INC-ALPHA-7',
    sourceKeyId,
    createdAt: now,
    expiresAt: now + 900_000,
    priority: 'critical',
    kind: 'sos',
    text: 'Two people need medical evacuation.',
    nonce: new Uint8Array(16).fill(7),
    maxHops: 3,
    peopleCount: 2,
    needs: ['medical', 'evacuation'],
    location: { latitude: 41.8781, longitude: -87.6298, accuracyMeters: 12 },
  });
}

describe('canonical JSON and schema', () => {
  it('sorts object keys deterministically', () => {
    assert.equal(canonicalJson({ z: 1, a: [true, null, 'x'] }), '{"a":[true,null,"x"],"z":1}');
  });

  it('rejects non-canonical wire JSON and unpaired Unicode', async () => {
    const identity = await generateSigningIdentity();
    const bundle = makeBundle(identity.keyId);
    assert.deepEqual(decodeBundle(encodeBundle(bundle)), bundle);
    assert.throws(() => decodeBundle(utf8Encode(JSON.stringify(bundle))), /not canonical/);
    assert.throws(() => canonicalJson('\ud800'), /unpaired/);
  });

  it('normalizes needs and freezes output', async () => {
    const identity = await generateSigningIdentity();
    const bundle = makeBundle(identity.keyId);
    assert.deepEqual(bundle.needs, ['evacuation', 'medical']);
    assert.equal(Object.isFrozen(bundle), true);
    assert.equal(Object.isFrozen(bundle.location), true);
    assert.equal((await bundleId(bundle)).length, 43);
  });

  it('rejects unknown fields and oversized messages', async () => {
    const identity = await generateSigningIdentity();
    const valid = makeBundle(identity.keyId);
    assert.throws(() => parseBundle({ ...valid, surprise: true }), ProtocolError);
    assert.throws(() => parseBundle({ ...valid, text: 'x'.repeat(161) }), /text must be/);
    assert.throws(() => parseBundle({ ...valid, version: 'future' }), /Expected/);
  });
});

describe('signatures and relay chain', () => {
  it('keeps private signing keys non-exportable', async () => {
    const identity = await generateSigningIdentity();
    assert.equal(identity.privateKey.extractable, false);
    assert.equal(identity.publicKey.extractable, true);
    assert.equal((await exportPublicKey(identity.publicKey)).length > 0, true);
    await assert.rejects(() => crypto.subtle.exportKey('jwk', identity.privateKey));
  });

  it('verifies an origin signature and rejects tampering', async () => {
    const origin = await generateSigningIdentity();
    const now = 1_800_000_000_000;
    const signed = await signBundle(makeBundle(origin.keyId, now), origin);
    assert.equal(await verifySignedBundle(signed, origin.publicKey, { now }), true);
    const tampered = { ...signed, bundle: { ...signed.bundle, text: 'Send money.' } };
    assert.equal(await verifySignedBundle(tampered, origin.publicKey, { now }), false);
  });

  it('builds and verifies a two-hop append-only route', async () => {
    const origin = await generateSigningIdentity();
    const relayA = await generateSigningIdentity();
    const relayB = await generateSigningIdentity();
    const now = 1_800_000_000_000;
    const signed = await signBundle(makeBundle(origin.keyId, now), origin);
    const once = await appendRelayHop(createRelayEnvelope(signed), relayA, now + 1_000);
    const twice = await appendRelayHop(once, relayB, now + 2_000);
    const keys = new Map([
      [origin.keyId, origin.publicKey],
      [relayA.keyId, relayA.publicKey],
      [relayB.keyId, relayB.publicKey],
    ]);
    const result = await verifyRelayEnvelope(twice, (id) => keys.get(id), { now: now + 3_000 });
    assert.equal(result.valid, true);
    assert.equal(result.hopCount, 2);
    assert.equal(Object.isFrozen(twice.hops), true);
    assert.deepEqual(decodeRelayEnvelope(encodeRelayEnvelope(twice)), twice);

    const shortened = { ...twice, hops: [twice.hops[1]!] };
    const invalid = await verifyRelayEnvelope(shortened, (id) => keys.get(id), {
      now: now + 3_000,
    });
    assert.equal(invalid.valid, false);
  });

  it('rejects expiry and unknown trust keys', async () => {
    const origin = await generateSigningIdentity();
    const now = 1_800_000_000_000;
    const envelope = createRelayEnvelope(await signBundle(makeBundle(origin.keyId, now), origin));
    const expired = await verifyRelayEnvelope(envelope, () => origin.publicKey, {
      now: now + 1_000_000,
      clockSkewMs: 0,
    });
    assert.match(expired.error ?? '', /EXPIRED/);
    const unknown = await verifyRelayEnvelope(envelope, () => undefined, { now });
    assert.match(unknown.error ?? '', /UNKNOWN_ORIGIN_KEY/);
  });

  it('rejects non-monotonic and future relay timestamps', async () => {
    const origin = await generateSigningIdentity();
    const relay = await generateSigningIdentity();
    const now = 1_800_000_000_000;
    const initial = createRelayEnvelope(await signBundle(makeBundle(origin.keyId, now), origin));
    const once = await appendRelayHop(initial, relay, now + 10_000);
    await assert.rejects(() => appendRelayHop(once, relay, now + 9_000), /hop.relayedAt/);
    const keys = new Map([
      [origin.keyId, origin.publicKey],
      [relay.keyId, relay.publicKey],
    ]);
    const future = await verifyRelayEnvelope(once, (id) => keys.get(id), { now, clockSkewMs: 0 });
    assert.match(future.error ?? '', /FUTURE_RELAY/);
  });
});

describe('optical frames', () => {
  it('matches the standard CRC32 check value', () => {
    assert.equal(crc32(utf8Encode('123456789')), 'cbf43926');
  });

  it('round-trips shuffled frames and validates CRC', async () => {
    const data = utf8Encode(
      'LightMule carries a signed emergency bundle across the outage. '.repeat(12),
    );
    const frames = await chunkTransfer(data, {
      chunkSize: 80,
      sessionId: new Uint8Array(12).fill(5),
    });
    const encoded = frames.map(encodeFrame);
    const decoded = encoded.map(decodeFrame).reverse();
    assert.deepEqual(await reassembleFrames(decoded), data);

    const corrupt = `${encoded[0]!.slice(0, -1)}${encoded[0]!.endsWith('A') ? 'B' : 'A'}`;
    assert.throws(() => decodeFrame(corrupt), ProtocolError);
    const fields = encoded[0]!.split('.');
    fields[3] = '00';
    assert.throws(() => decodeFrame(fields.join('.')), /canonical base36/);
    assert.throws(() => decodeFrame(`${encoded[0]}.extra`), /six wire fields/);
  });

  it('rejects missing, duplicate, and mixed frames', async () => {
    const a = await chunkTransfer(utf8Encode('a'.repeat(400)), {
      chunkSize: 100,
      sessionId: new Uint8Array(12).fill(1),
    });
    const b = await chunkTransfer(utf8Encode('b'.repeat(400)), {
      chunkSize: 100,
      sessionId: new Uint8Array(12).fill(2),
    });
    await assert.rejects(() => reassembleFrames(a.slice(1)), /Expected 4 unique frames/);
    await assert.rejects(() => reassembleFrames([a[0]!, a[0]!, a[2]!, a[3]!]), /duplicated/);
    await assert.rejects(
      () => reassembleFrames([a[0]!, b[1]!, a[2]!, a[3]!]),
      /different transfers/,
    );
  });
});

describe('self-contained transport packets', () => {
  it('round-trips and verifies embedded signer keys', async () => {
    const origin = await generateSigningIdentity();
    const relay = await generateSigningIdentity();
    const now = 1_800_000_000_000;
    const signed = await signBundle(makeBundle(origin.keyId, now), origin);
    const envelope = await appendRelayHop(createRelayEnvelope(signed), relay, now + 1_000);
    const packet = createTransportPacket(envelope, {
      [origin.keyId]: await exportPublicKey(origin.publicKey),
      [relay.keyId]: await exportPublicKey(relay.publicKey),
    });
    const decoded = decodeTransportPacket(encodeTransportPacket(packet));
    const result = await verifyTransportPacket(decoded, { now: now + 2_000 });
    assert.equal(result.valid, true);
    assert.equal(result.hopCount, 1);
  });

  it('rejects missing, extra, and mismatched public keys', async () => {
    const origin = await generateSigningIdentity();
    const other = await generateSigningIdentity();
    const now = 1_800_000_000_000;
    const envelope = createRelayEnvelope(await signBundle(makeBundle(origin.keyId, now), origin));
    assert.throws(() => createTransportPacket(envelope, {}), /exactly one key/);
    assert.throws(
      () =>
        createTransportPacket(envelope, {
          [origin.keyId]: 'AA',
          [other.keyId]: 'AA',
        }),
      /exactly one key/,
    );
    const packet = createTransportPacket(envelope, {
      [origin.keyId]: await exportPublicKey(other.publicKey),
    });
    const result = await verifyTransportPacket(packet, { now });
    assert.equal(result.valid, false);
    assert.match(result.error ?? '', /KEY_ID_MISMATCH/);
  });
});

assert.equal(BUNDLE_VERSION, 'lightmule.bundle.v1');
