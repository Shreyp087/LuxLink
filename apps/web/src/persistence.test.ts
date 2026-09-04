import { bundleId, generateSigningIdentity } from '@luxlink/protocol';
import { describe, expect, it } from 'vitest';
import { createOriginTransmission, createRelayTransmission } from './field';
import { listMessages, saveMessage, type StoredMessage } from './persistence';

describe('persisted bundle deduplication', () => {
  it('preserves first-seen metadata and the longest verified custody prefix', async () => {
    const origin = await generateSigningIdentity();
    const relay = await generateSigningIdentity();
    const alternateRelay = await generateSigningIdentity();
    const now = Date.now();
    const first = await createOriginTransmission(
      {
        incidentId: 'TEST-PERSISTENCE-1',
        priority: 'normal',
        kind: 'status',
        text: 'Clinic inventory received.',
        lifetimeMinutes: 60,
        maxHops: 3,
      },
      origin,
      now,
    );
    const relayed = await createRelayTransmission(first.packet, relay, now + 1_000);
    const alternate = await createRelayTransmission(first.packet, alternateRelay, now + 1_000);
    const id = await bundleId(first.packet.envelope.signedBundle.bundle);
    const record = (packet: StoredMessage['packet'], savedAt: number, trusted: boolean) => ({
      id,
      savedAt,
      direction: 'received' as const,
      integrity: 'valid' as const,
      trustedAtReceipt: trusted,
      packet,
    });

    expect((await saveMessage(record(first.packet, now, false))).outcome).toBe('stored');
    expect((await saveMessage(record(relayed.packet, now + 1_000, false))).outcome).toBe(
      'extended',
    );
    const replay = await saveMessage(record(first.packet, now + 2_000, true));
    expect(replay.outcome).toBe('replay');
    expect(replay.record.savedAt).toBe(now);
    expect(replay.record.packet.envelope.hops).toHaveLength(1);
    expect(replay.record.trustedAtReceipt).toBe(true);
    const conflict = await saveMessage(record(alternate.packet, now + 3_000, false));
    expect(conflict.outcome).toBe('custody-conflict');
    expect(conflict.record.packet.envelope.hops[0]?.relayKeyId).toBe(relay.keyId);

    const persisted = (await listMessages()).find((message) => message.id === id);
    expect(persisted?.packet.envelope.hops).toHaveLength(1);
  });
});
