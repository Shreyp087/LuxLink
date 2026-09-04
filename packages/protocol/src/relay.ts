import { canonicalBytes, canonicalJson, deepFreeze } from './canonical.ts';
import { utf8Decode } from './bytes.ts';
import { hashCanonical, signCanonical, verifyCanonical } from './crypto.ts';
import { fail, ProtocolError } from './errors.ts';
import { bundleId, validateBundleTime, verifySignedBundle } from './bundle.ts';
import {
  RELAY_STATEMENT_VERSION,
  RELAY_VERSION,
  type KeyResolver,
  type RelayEnvelopeV1,
  type RelayStatementV1,
  type SignedBundleV1,
  type SigningIdentity,
  type ValidationContext,
  type VerificationResult,
} from './types.ts';
import { LIMITS, parseRelayEnvelope } from './validation.ts';

export function createRelayEnvelope(signedBundle: SignedBundleV1): RelayEnvelopeV1 {
  return parseRelayEnvelope({ version: RELAY_VERSION, signedBundle, hops: [] });
}

export async function envelopeId(envelope: RelayEnvelopeV1): Promise<string> {
  return hashCanonical(parseRelayEnvelope(envelope));
}

function prefix(envelope: RelayEnvelopeV1, length: number): RelayEnvelopeV1 {
  return parseRelayEnvelope({
    version: RELAY_VERSION,
    signedBundle: envelope.signedBundle,
    hops: envelope.hops.slice(0, length),
  });
}

function statement(
  bundleIdentifier: string,
  previousEnvelopeId: string,
  hopIndex: number,
  relayedAt: number,
  relayKeyId: string,
): RelayStatementV1 {
  return Object.freeze({
    version: RELAY_STATEMENT_VERSION,
    bundleId: bundleIdentifier,
    previousEnvelopeId,
    hopIndex,
    relayedAt,
    relayKeyId,
  });
}

export async function appendRelayHop(
  envelope: RelayEnvelopeV1,
  identity: SigningIdentity,
  relayedAt = Date.now(),
): Promise<RelayEnvelopeV1> {
  const parsed = parseRelayEnvelope(envelope);
  validateBundleTime(parsed.signedBundle.bundle, { now: relayedAt, clockSkewMs: 0 });
  if (parsed.hops.length >= parsed.signedBundle.bundle.maxHops)
    fail('HOP_LIMIT', 'Bundle has reached maxHops.');
  const previousEnvelopeId = await envelopeId(parsed);
  const body = statement(
    await bundleId(parsed.signedBundle.bundle),
    previousEnvelopeId,
    parsed.hops.length,
    relayedAt,
    identity.keyId,
  );
  const hop = {
    index: parsed.hops.length,
    relayKeyId: identity.keyId,
    relayedAt,
    previousEnvelopeId,
    signature: await signCanonical(body, identity),
  };
  return deepFreeze(
    parseRelayEnvelope({
      version: RELAY_VERSION,
      signedBundle: parsed.signedBundle,
      hops: [...parsed.hops, hop],
    }),
  );
}

export async function verifyRelayEnvelope(
  envelope: RelayEnvelopeV1,
  resolveKey: KeyResolver,
  context: ValidationContext = {},
): Promise<VerificationResult> {
  try {
    const parsed = parseRelayEnvelope(envelope);
    validateBundleTime(parsed.signedBundle.bundle, context);
    const originKey = await resolveKey(parsed.signedBundle.signature.keyId);
    if (!originKey) fail('UNKNOWN_ORIGIN_KEY', 'Origin public key is not trusted or available.');
    if (!(await verifySignedBundle(parsed.signedBundle, originKey, context))) {
      fail('INVALID_ORIGIN_SIGNATURE', 'Origin signature is invalid.');
    }
    const identifier = await bundleId(parsed.signedBundle.bundle);
    for (let index = 0; index < parsed.hops.length; index += 1) {
      const hop = parsed.hops[index]!;
      const now = context.now ?? Date.now();
      const skew = context.clockSkewMs ?? 30_000;
      if (hop.relayedAt > now + skew)
        fail('FUTURE_RELAY', `Relay hop ${index} is too far in the future.`);
      const previous = prefix(parsed, index);
      const expectedPreviousId = await envelopeId(previous);
      if (hop.previousEnvelopeId !== expectedPreviousId)
        fail('BROKEN_RELAY_CHAIN', `Relay hop ${index} does not reference its predecessor.`);
      const relayKey = await resolveKey(hop.relayKeyId);
      if (!relayKey) fail('UNKNOWN_RELAY_KEY', `Relay key at hop ${index} is unavailable.`);
      const body = statement(identifier, expectedPreviousId, index, hop.relayedAt, hop.relayKeyId);
      if (!(await verifyCanonical(body, hop.signature, relayKey)))
        fail('INVALID_RELAY_SIGNATURE', `Relay signature at hop ${index} is invalid.`);
    }
    return Object.freeze({
      valid: true,
      bundleId: identifier,
      envelopeId: await envelopeId(parsed),
      hopCount: parsed.hops.length,
    });
  } catch (error) {
    return Object.freeze({
      valid: false,
      error:
        error instanceof ProtocolError
          ? `${error.code}: ${error.message}`
          : 'UNEXPECTED_VERIFICATION_ERROR',
    });
  }
}

export function encodeRelayEnvelope(envelope: RelayEnvelopeV1): Uint8Array {
  const bytes = canonicalBytes(parseRelayEnvelope(envelope));
  if (bytes.byteLength > LIMITS.maximumEnvelopeJsonBytes)
    fail('ENVELOPE_SIZE', 'Relay envelope exceeds the protocol limit.');
  return bytes;
}

export function decodeRelayEnvelope(bytes: Uint8Array): RelayEnvelopeV1 {
  if (bytes.byteLength > LIMITS.maximumEnvelopeJsonBytes)
    fail('ENVELOPE_SIZE', 'Relay envelope exceeds the protocol limit.');
  try {
    const text = utf8Decode(bytes);
    const value: unknown = JSON.parse(text);
    const parsed = parseRelayEnvelope(value);
    if (canonicalJson(parsed) !== text)
      fail('NON_CANONICAL_JSON', 'Relay envelope JSON is not canonical.');
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError)
      return fail('INVALID_JSON', 'Relay envelope is not valid JSON.');
    throw error;
  }
}
