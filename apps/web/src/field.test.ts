import { generateSigningIdentity } from '@luxlink/protocol';
import { describe, expect, it } from 'vitest';
import {
  createOriginTransmission,
  createRelayTransmission,
  OpticalCollector,
  prepareTransmission,
} from './field';

describe('software-only optical workflow', () => {
  it('accepts shuffled frames, ignores duplicates, and verifies the exact packet', async () => {
    const identity = await generateSigningIdentity();
    const now = Date.now();
    const transmission = await createOriginTransmission(
      {
        incidentId: 'TEST-OPTICAL-1',
        priority: 'critical',
        kind: 'hazard',
        text: 'Bridge closed. Use north route.',
        lifetimeMinutes: 60,
        maxHops: 4,
      },
      identity,
      now,
    );
    expect(transmission.frames.length).toBeGreaterThan(1);

    const collector = new OpticalCollector();
    const first = await collector.accept(transmission.frames.at(-1)!, now + 1_000);
    const duplicate = await collector.accept(transmission.frames.at(-1)!, now + 1_000);
    expect(first.received).toBe(1);
    expect(duplicate.duplicate).toBe(true);

    let completed = duplicate;
    for (const frame of transmission.frames.slice(0, -1).reverse()) {
      completed = await collector.accept(frame, now + 1_000);
    }
    expect(completed.verification?.valid).toBe(true);
    expect(completed.packet?.envelope.signedBundle.bundle.text).toBe(
      'Bridge closed. Use north route.',
    );
    const replay = await collector.accept(transmission.frames[0]!, now + 1_000);
    expect(replay.replay).toBe(true);
    expect(replay.duplicate).toBe(true);
  });

  it('adds a verifiable relay hop and produces a new optical transfer', async () => {
    const origin = await generateSigningIdentity();
    const relay = await generateSigningIdentity();
    const now = Date.now();
    const first = await createOriginTransmission(
      {
        incidentId: 'TEST-RELAY-1',
        priority: 'high',
        kind: 'status',
        text: 'Shelter has capacity for twenty people.',
        lifetimeMinutes: 60,
        maxHops: 4,
      },
      origin,
      now,
    );
    const relayed = await createRelayTransmission(first.packet, relay, now + 2_000);
    expect(relayed.packet.envelope.hops).toHaveLength(1);

    const collector = new OpticalCollector();
    let completed;
    for (const frame of relayed.frames) completed = await collector.accept(frame, now + 3_000);
    expect(completed?.verification?.valid).toBe(true);
    expect(completed?.verification?.hopCount).toBe(1);
  });

  it('does not mix sessions even when they contain the same packet bytes', async () => {
    const identity = await generateSigningIdentity();
    const now = Date.now();
    const first = await createOriginTransmission(
      {
        incidentId: 'TEST-SESSION-1',
        priority: 'normal',
        kind: 'status',
        text: 'Checkpoint operating normally.',
        lifetimeMinutes: 60,
        maxHops: 2,
      },
      identity,
      now,
    );
    const second = await prepareTransmission(first.packet);
    const collector = new OpticalCollector();
    await collector.accept(first.frames[0]!, now + 1_000);
    await expect(collector.accept(second.frames[1]!, now + 1_000)).rejects.toThrow(
      /different transfer/,
    );
  });
});
