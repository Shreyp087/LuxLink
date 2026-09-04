export const BUNDLE_VERSION = 'lightmule.bundle.v1' as const;
export const SIGNED_VERSION = 'lightmule.signed.v1' as const;
export const RELAY_VERSION = 'lightmule.relay.v1' as const;
export const FRAME_VERSION = 'lightmule.frame.v1' as const;
export const PACKET_VERSION = 'lightmule.packet.v1' as const;
export const RELAY_STATEMENT_VERSION = 'lightmule.relay-statement.v1' as const;

export const PRIORITIES = ['critical', 'high', 'normal', 'low'] as const;
export const MESSAGE_KINDS = ['sos', 'hazard', 'resource', 'status', 'ack'] as const;
export const NEEDS = [
  'evacuation',
  'food',
  'medical',
  'rescue',
  'shelter',
  'transport',
  'water',
] as const;

export type Priority = (typeof PRIORITIES)[number];
export type MessageKind = (typeof MESSAGE_KINDS)[number];
export type Need = (typeof NEEDS)[number];

export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracyMeters?: number;
}

export interface EmergencyBundleV1 {
  readonly version: typeof BUNDLE_VERSION;
  readonly incidentId: string;
  readonly sourceKeyId: string;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly priority: Priority;
  readonly kind: MessageKind;
  readonly text: string;
  readonly nonce: string;
  readonly maxHops: number;
  readonly location?: GeoLocation;
  readonly peopleCount?: number;
  readonly needs?: readonly Need[];
  readonly acknowledgesBundleId?: string;
}

export interface BundleInput {
  readonly incidentId: string;
  readonly sourceKeyId: string;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly priority: Priority;
  readonly kind: MessageKind;
  readonly text: string;
  readonly nonce: Uint8Array | string;
  readonly maxHops: number;
  readonly location?: GeoLocation;
  readonly peopleCount?: number;
  readonly needs?: readonly Need[];
  readonly acknowledgesBundleId?: string;
}

export interface SignatureV1 {
  readonly algorithm: 'ES256';
  readonly keyId: string;
  readonly value: string;
}

export interface SignedBundleV1 {
  readonly version: typeof SIGNED_VERSION;
  readonly bundle: EmergencyBundleV1;
  readonly signature: SignatureV1;
}

export interface RelayHopV1 {
  readonly index: number;
  readonly relayKeyId: string;
  readonly relayedAt: number;
  readonly previousEnvelopeId: string;
  readonly signature: SignatureV1;
}

export interface RelayEnvelopeV1 {
  readonly version: typeof RELAY_VERSION;
  readonly signedBundle: SignedBundleV1;
  readonly hops: readonly RelayHopV1[];
}

export interface RelayStatementV1 {
  readonly version: typeof RELAY_STATEMENT_VERSION;
  readonly bundleId: string;
  readonly previousEnvelopeId: string;
  readonly hopIndex: number;
  readonly relayedAt: number;
  readonly relayKeyId: string;
}

export interface SigningIdentity {
  readonly keyId: string;
  readonly publicKey: CryptoKey;
  readonly privateKey: CryptoKey;
}

export type KeyResolver = (keyId: string) => CryptoKey | undefined | Promise<CryptoKey | undefined>;

export interface ValidationContext {
  readonly now?: number;
  readonly clockSkewMs?: number;
}

export interface VerificationResult {
  readonly valid: boolean;
  readonly bundleId?: string;
  readonly envelopeId?: string;
  readonly hopCount?: number;
  readonly error?: string;
}

export interface OpticalFrameV1 {
  readonly version: typeof FRAME_VERSION;
  readonly sessionId: string;
  readonly transferId: string;
  readonly index: number;
  readonly total: number;
  readonly payload: string;
  readonly crc32: string;
}

export interface ChunkOptions {
  readonly chunkSize?: number;
  readonly sessionId?: Uint8Array | string;
}

/**
 * Self-contained transport object. Embedded keys prove signature integrity; they do not establish
 * that a signer is trusted. Applications must compare key IDs through a separate trust channel.
 */
export interface TransportPacketV1 {
  readonly version: typeof PACKET_VERSION;
  readonly envelope: RelayEnvelopeV1;
  readonly publicKeys: Readonly<Record<string, string>>;
}
