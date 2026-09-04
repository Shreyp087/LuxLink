import {
  appendRelayHop,
  bundleId,
  chunkTransfer,
  createBundle,
  createRelayEnvelope,
  createTransportPacket,
  decodeFrame,
  decodeTransportPacket,
  encodeFrame,
  encodeTransportPacket,
  exportPublicKey,
  reassembleFrames,
  signBundle,
  verifyTransportPacket,
  type BundleInput,
  type OpticalFrameV1,
  type SigningIdentity,
  type TransportPacketV1,
  type VerificationResult,
} from '@luxlink/protocol';

export const OPTICAL_FRAME_RATE = 2;
export const OPTICAL_CHUNK_SIZE = 72;

export interface Transmission {
  readonly bundleId: string;
  readonly packet: TransportPacketV1;
  readonly frames: readonly string[];
}

export interface OriginMessageInput {
  readonly incidentId: BundleInput['incidentId'];
  readonly priority: BundleInput['priority'];
  readonly kind: BundleInput['kind'];
  readonly text: BundleInput['text'];
  readonly lifetimeMinutes: number;
  readonly maxHops: number;
  readonly peopleCount?: number;
  readonly needs?: BundleInput['needs'];
}

export interface CollectionProgress {
  readonly duplicate: boolean;
  readonly replay: boolean;
  readonly received: number;
  readonly total: number;
  readonly transferId: string;
  readonly packet?: TransportPacketV1;
  readonly verification?: VerificationResult;
}

export async function prepareTransmission(packet: TransportPacketV1): Promise<Transmission> {
  const frames = await chunkTransfer(encodeTransportPacket(packet), {
    chunkSize: OPTICAL_CHUNK_SIZE,
  });
  return Object.freeze({
    bundleId: await bundleId(packet.envelope.signedBundle.bundle),
    packet,
    frames: Object.freeze(frames.map(encodeFrame)),
  });
}

export async function createOriginTransmission(
  input: OriginMessageInput,
  identity: SigningIdentity,
  now = Date.now(),
): Promise<Transmission> {
  const bundle = createBundle({
    incidentId: input.incidentId,
    sourceKeyId: identity.keyId,
    createdAt: now,
    expiresAt: now + input.lifetimeMinutes * 60_000,
    priority: input.priority,
    kind: input.kind,
    text: input.text,
    nonce: globalThis.crypto.getRandomValues(new Uint8Array(16)),
    maxHops: input.maxHops,
    ...(input.peopleCount === undefined ? {} : { peopleCount: input.peopleCount }),
    ...(input.needs === undefined || input.needs.length === 0 ? {} : { needs: input.needs }),
  });
  const signed = await signBundle(bundle, identity);
  const packet = createTransportPacket(createRelayEnvelope(signed), {
    [identity.keyId]: await exportPublicKey(identity.publicKey),
  });
  return prepareTransmission(packet);
}

export async function createRelayTransmission(
  packet: TransportPacketV1,
  identity: SigningIdentity,
  now = Date.now(),
): Promise<Transmission> {
  const envelope = await appendRelayHop(packet.envelope, identity, now);
  return prepareTransmission(
    createTransportPacket(envelope, {
      ...packet.publicKeys,
      [identity.keyId]: await exportPublicKey(identity.publicKey),
    }),
  );
}

export class OpticalCollector {
  #sessionId?: string;
  #transferId?: string;
  #total = 0;
  #completed?: CollectionProgress;
  readonly #frames = new Map<number, OpticalFrameV1>();

  reset(): void {
    this.#sessionId = undefined;
    this.#transferId = undefined;
    this.#total = 0;
    this.#completed = undefined;
    this.#frames.clear();
  }

  async accept(encoded: string, now = Date.now()): Promise<CollectionProgress> {
    const frame = decodeFrame(encoded.trim());
    if (
      this.#transferId !== undefined &&
      (frame.transferId !== this.#transferId ||
        frame.sessionId !== this.#sessionId ||
        frame.total !== this.#total)
    ) {
      throw new Error('A different transfer is already in progress. Reset the receiver first.');
    }
    this.#sessionId = frame.sessionId;
    this.#transferId = frame.transferId;
    this.#total = frame.total;
    if (this.#completed !== undefined) {
      return Object.freeze({ ...this.#completed, duplicate: true, replay: true });
    }
    const duplicate = this.#frames.has(frame.index);
    this.#frames.set(frame.index, frame);
    const progress = {
      duplicate,
      replay: false,
      received: this.#frames.size,
      total: this.#total,
      transferId: frame.transferId,
    };
    if (this.#frames.size !== this.#total) return Object.freeze(progress);

    const bytes = await reassembleFrames([...this.#frames.values()]);
    const packet = decodeTransportPacket(bytes);
    const verification = await verifyTransportPacket(packet, { now });
    const completed = Object.freeze({ ...progress, packet, verification });
    this.#completed = completed;
    return completed;
  }
}

export function fingerprint(keyId: string): string {
  return (
    keyId
      .match(/.{1,7}/gu)
      ?.slice(0, 4)
      .join(' · ') ?? keyId
  );
}
