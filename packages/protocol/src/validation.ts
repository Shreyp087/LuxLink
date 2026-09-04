import { fromBase64Url, utf8Encode } from './bytes.ts';
import { fail } from './errors.ts';
import {
  BUNDLE_VERSION,
  FRAME_VERSION,
  MESSAGE_KINDS,
  NEEDS,
  PACKET_VERSION,
  PRIORITIES,
  RELAY_VERSION,
  SIGNED_VERSION,
  type EmergencyBundleV1,
  type Need,
  type OpticalFrameV1,
  type RelayEnvelopeV1,
  type SignatureV1,
  type TransportPacketV1,
} from './types.ts';

export const LIMITS = Object.freeze({
  incidentIdBytes: 64,
  textBytes: 160,
  maximumLifetimeMs: 24 * 60 * 60 * 1_000,
  maximumFutureSkewMs: 5 * 60 * 1_000,
  maximumHops: 16,
  maximumPeopleCount: 9_999,
  maximumFramePayloadBytes: 1_024,
  maximumFrames: 4_096,
  maximumEncodedFrameBytes: 2_048,
  maximumBundleJsonBytes: 2_048,
  maximumSignedBundleJsonBytes: 4_096,
  maximumEnvelopeJsonBytes: 32_768,
  maximumPacketJsonBytes: 40_960,
} as const);

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return fail('INVALID_SHAPE', `${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail('UNKNOWN_FIELD', `Unknown field: ${key}.`);
  }
  for (const key of required) {
    if (!(key in value)) fail('MISSING_FIELD', `Missing field: ${key}.`);
  }
}

function integer(value: unknown, label: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    return fail('INVALID_INTEGER', `${label} must be an integer from ${minimum} to ${maximum}.`);
  }
  return value as number;
}

function boundedString(value: unknown, label: string, minBytes: number, maxBytes: number): string {
  if (typeof value !== 'string') return fail('INVALID_STRING', `${label} must be a string.`);
  const length = utf8Encode(value).byteLength;
  if (length < minBytes || length > maxBytes) {
    return fail('STRING_SIZE', `${label} must be ${minBytes}-${maxBytes} UTF-8 bytes.`);
  }
  return value;
}

function keyId(value: unknown, label: string): string {
  const encoded = boundedString(value, label, 43, 43);
  if (fromBase64Url(encoded, label).byteLength !== 32)
    return fail('INVALID_KEY_ID', `${label} must encode 32 bytes.`);
  return encoded;
}

function digestId(value: unknown, label: string): string {
  return keyId(value, label);
}

function isNeed(value: string): value is Need {
  return (NEEDS as readonly string[]).includes(value);
}

function signature(value: unknown): SignatureV1 {
  const input = record(value, 'signature');
  exactKeys(input, ['algorithm', 'keyId', 'value']);
  if (input.algorithm !== 'ES256') fail('INVALID_ALGORITHM', 'Only ES256 signatures are accepted.');
  const encoded = boundedString(input.value, 'signature.value', 86, 86);
  if (fromBase64Url(encoded, 'signature.value').byteLength !== 64) {
    fail('SIGNATURE_FORMAT', 'ES256 signature must encode 64 bytes.');
  }
  return Object.freeze({
    algorithm: 'ES256',
    keyId: keyId(input.keyId, 'signature.keyId'),
    value: encoded,
  });
}

export function parseBundle(value: unknown): EmergencyBundleV1 {
  const input = record(value, 'bundle');
  exactKeys(
    input,
    [
      'version',
      'incidentId',
      'sourceKeyId',
      'createdAt',
      'expiresAt',
      'priority',
      'kind',
      'text',
      'nonce',
      'maxHops',
    ],
    ['location', 'peopleCount', 'needs', 'acknowledgesBundleId'],
  );
  if (input.version !== BUNDLE_VERSION) fail('VERSION', `Expected ${BUNDLE_VERSION}.`);
  const incidentId = boundedString(input.incidentId, 'incidentId', 1, LIMITS.incidentIdBytes);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(incidentId))
    fail('INCIDENT_ID', 'incidentId contains unsupported characters.');
  const createdAt = integer(input.createdAt, 'createdAt', 0, Number.MAX_SAFE_INTEGER);
  const expiresAt = integer(input.expiresAt, 'expiresAt', 0, Number.MAX_SAFE_INTEGER);
  if (expiresAt <= createdAt) fail('LIFETIME', 'expiresAt must be later than createdAt.');
  if (expiresAt - createdAt > LIMITS.maximumLifetimeMs)
    fail('LIFETIME', 'Bundle lifetime exceeds 24 hours.');
  if (!PRIORITIES.includes(input.priority as never)) fail('PRIORITY', 'Invalid priority.');
  if (!MESSAGE_KINDS.includes(input.kind as never)) fail('MESSAGE_KIND', 'Invalid message kind.');
  const nonce = boundedString(input.nonce, 'nonce', 22, 22);
  if (fromBase64Url(nonce, 'nonce').byteLength !== 16) fail('NONCE', 'nonce must encode 16 bytes.');

  let location: EmergencyBundleV1['location'];
  if (input.location !== undefined) {
    const candidate = record(input.location, 'location');
    exactKeys(candidate, ['latitude', 'longitude'], ['accuracyMeters']);
    if (
      typeof candidate.latitude !== 'number' ||
      !Number.isFinite(candidate.latitude) ||
      candidate.latitude < -90 ||
      candidate.latitude > 90
    ) {
      fail('LOCATION', 'latitude must be from -90 through 90.');
    }
    if (
      typeof candidate.longitude !== 'number' ||
      !Number.isFinite(candidate.longitude) ||
      candidate.longitude < -180 ||
      candidate.longitude > 180
    ) {
      fail('LOCATION', 'longitude must be from -180 through 180.');
    }
    if (
      candidate.accuracyMeters !== undefined &&
      (typeof candidate.accuracyMeters !== 'number' ||
        !Number.isFinite(candidate.accuracyMeters) ||
        candidate.accuracyMeters < 0 ||
        candidate.accuracyMeters > 100_000)
    ) {
      fail('LOCATION', 'accuracyMeters must be from 0 through 100000.');
    }
    location = Object.freeze({
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      ...(candidate.accuracyMeters === undefined
        ? {}
        : { accuracyMeters: candidate.accuracyMeters }),
    });
  }

  let needs: EmergencyBundleV1['needs'];
  if (input.needs !== undefined) {
    if (
      !Array.isArray(input.needs) ||
      input.needs.length < 1 ||
      input.needs.length > NEEDS.length
    ) {
      fail('NEEDS', 'needs must contain 1-7 unique values.');
    }
    const providedNeeds: readonly unknown[] = input.needs;
    const parsedNeeds = providedNeeds.map((entry) => {
      if (typeof entry !== 'string' || !isNeed(entry)) {
        return fail('NEEDS', 'needs must contain only supported values.');
      }
      return entry;
    });
    const sorted = [...parsedNeeds].sort();
    if (
      sorted.some((entry, index) => entry !== parsedNeeds[index] || entry === sorted[index - 1])
    ) {
      fail('NEEDS', 'needs must be unique, valid, and lexicographically sorted.');
    }
    needs = Object.freeze(sorted);
  }

  const parsed: EmergencyBundleV1 = {
    version: BUNDLE_VERSION,
    incidentId,
    sourceKeyId: keyId(input.sourceKeyId, 'sourceKeyId'),
    createdAt,
    expiresAt,
    priority: input.priority as EmergencyBundleV1['priority'],
    kind: input.kind as EmergencyBundleV1['kind'],
    text: boundedString(input.text, 'text', 0, LIMITS.textBytes),
    nonce,
    maxHops: integer(input.maxHops, 'maxHops', 0, LIMITS.maximumHops),
    ...(location === undefined ? {} : { location }),
    ...(input.peopleCount === undefined
      ? {}
      : { peopleCount: integer(input.peopleCount, 'peopleCount', 0, LIMITS.maximumPeopleCount) }),
    ...(needs === undefined ? {} : { needs }),
    ...(input.acknowledgesBundleId === undefined
      ? {}
      : { acknowledgesBundleId: digestId(input.acknowledgesBundleId, 'acknowledgesBundleId') }),
  };
  if (parsed.kind === 'ack' && parsed.acknowledgesBundleId === undefined)
    fail('ACK_TARGET', 'ack messages require acknowledgesBundleId.');
  if (parsed.kind !== 'ack' && parsed.acknowledgesBundleId !== undefined)
    fail('ACK_TARGET', 'Only ack messages may set acknowledgesBundleId.');
  return Object.freeze(parsed);
}

export function parseSignedBundle(value: unknown) {
  const input = record(value, 'signedBundle');
  exactKeys(input, ['version', 'bundle', 'signature']);
  if (input.version !== SIGNED_VERSION) fail('VERSION', `Expected ${SIGNED_VERSION}.`);
  const bundle = parseBundle(input.bundle);
  const parsedSignature = signature(input.signature);
  if (bundle.sourceKeyId !== parsedSignature.keyId)
    fail('KEY_ID_MISMATCH', 'Origin signature key does not match sourceKeyId.');
  return Object.freeze({ version: SIGNED_VERSION, bundle, signature: parsedSignature });
}

export function parseRelayEnvelope(value: unknown): RelayEnvelopeV1 {
  const input = record(value, 'relayEnvelope');
  exactKeys(input, ['version', 'signedBundle', 'hops']);
  if (input.version !== RELAY_VERSION) fail('VERSION', `Expected ${RELAY_VERSION}.`);
  if (!Array.isArray(input.hops)) fail('HOPS', 'hops must be an array.');
  const signedBundle = parseSignedBundle(input.signedBundle);
  if (input.hops.length > signedBundle.bundle.maxHops || input.hops.length > LIMITS.maximumHops) {
    fail('HOP_LIMIT', 'Relay chain exceeds maxHops.');
  }
  let previousRelayTime = signedBundle.bundle.createdAt;
  const hops = input.hops.map((value, index) => {
    const hop = record(value, `hops[${index}]`);
    exactKeys(hop, ['index', 'relayKeyId', 'relayedAt', 'previousEnvelopeId', 'signature']);
    const parsedSignature = signature(hop.signature);
    const relayKeyId = keyId(hop.relayKeyId, 'relayKeyId');
    if (parsedSignature.keyId !== relayKeyId)
      fail('KEY_ID_MISMATCH', 'Relay signature key does not match relayKeyId.');
    const relayedAt = integer(
      hop.relayedAt,
      'hop.relayedAt',
      previousRelayTime,
      signedBundle.bundle.expiresAt,
    );
    previousRelayTime = relayedAt;
    return Object.freeze({
      index: integer(hop.index, 'hop.index', index, index),
      relayKeyId,
      relayedAt,
      previousEnvelopeId: digestId(hop.previousEnvelopeId, 'previousEnvelopeId'),
      signature: parsedSignature,
    });
  });
  return Object.freeze({ version: RELAY_VERSION, signedBundle, hops: Object.freeze(hops) });
}

export function parseFrame(value: unknown): OpticalFrameV1 {
  const input = record(value, 'frame');
  exactKeys(input, ['version', 'sessionId', 'transferId', 'index', 'total', 'payload', 'crc32']);
  if (input.version !== FRAME_VERSION) fail('VERSION', `Expected ${FRAME_VERSION}.`);
  const sessionId = boundedString(input.sessionId, 'sessionId', 16, 16);
  if (fromBase64Url(sessionId, 'sessionId').byteLength !== 12)
    fail('SESSION_ID', 'sessionId must encode 12 bytes.');
  const total = integer(input.total, 'total', 1, LIMITS.maximumFrames);
  const payload = boundedString(
    input.payload,
    'payload',
    1,
    Math.ceil((LIMITS.maximumFramePayloadBytes * 4) / 3),
  );
  const payloadBytes = fromBase64Url(payload, 'payload');
  if (payloadBytes.byteLength < 1 || payloadBytes.byteLength > LIMITS.maximumFramePayloadBytes)
    fail('FRAME_PAYLOAD', 'Frame payload has invalid size.');
  const crc32 = boundedString(input.crc32, 'crc32', 8, 8);
  if (!/^[0-9a-f]{8}$/u.test(crc32)) fail('CRC32', 'crc32 must be eight hexadecimal characters.');
  return Object.freeze({
    version: FRAME_VERSION,
    sessionId,
    transferId: digestId(input.transferId, 'transferId'),
    index: integer(input.index, 'index', 0, total - 1),
    total,
    payload,
    crc32,
  });
}

export function parseTransportPacket(value: unknown): TransportPacketV1 {
  const input = record(value, 'transportPacket');
  exactKeys(input, ['version', 'envelope', 'publicKeys']);
  if (input.version !== PACKET_VERSION) fail('VERSION', `Expected ${PACKET_VERSION}.`);

  const envelope = parseRelayEnvelope(input.envelope);
  const keyInput = record(input.publicKeys, 'publicKeys');
  const signerIds = [
    envelope.signedBundle.signature.keyId,
    ...envelope.hops.map((hop) => hop.relayKeyId),
  ];
  const expected = new Set(signerIds);
  const supplied = Object.keys(keyInput);
  if (supplied.length !== expected.size || supplied.some((id) => !expected.has(id))) {
    fail('PUBLIC_KEYS', 'publicKeys must contain exactly one key for every unique signer.');
  }

  const publicKeys: Record<string, string> = {};
  for (const id of expected) {
    keyId(id, 'publicKeys key');
    if (!Object.hasOwn(keyInput, id)) fail('PUBLIC_KEYS', `Missing public key for signer ${id}.`);
    const encoded = boundedString(keyInput[id], `publicKeys.${id}`, 1, 256);
    const bytes = fromBase64Url(encoded, `publicKeys.${id}`);
    if (bytes.byteLength < 80 || bytes.byteLength > 160) {
      fail('INVALID_PUBLIC_KEY', 'An embedded public key has an invalid encoded size.');
    }
    publicKeys[id] = encoded;
  }

  return Object.freeze({
    version: PACKET_VERSION,
    envelope,
    publicKeys: Object.freeze(publicKeys),
  });
}
