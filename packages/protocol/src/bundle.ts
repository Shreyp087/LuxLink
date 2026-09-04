import { canonicalBytes, canonicalJson, deepFreeze } from './canonical.ts';
import { hashCanonical, signCanonical, verifyCanonical } from './crypto.ts';
import { toBase64Url, utf8Decode } from './bytes.ts';
import { fail } from './errors.ts';
import {
  BUNDLE_VERSION,
  SIGNED_VERSION,
  type BundleInput,
  type EmergencyBundleV1,
  type SignedBundleV1,
  type SigningIdentity,
  type ValidationContext,
} from './types.ts';
import { LIMITS, parseBundle, parseSignedBundle } from './validation.ts';

export function createBundle(input: BundleInput): EmergencyBundleV1 {
  return parseBundle({
    version: BUNDLE_VERSION,
    ...input,
    nonce: typeof input.nonce === 'string' ? input.nonce : toBase64Url(input.nonce),
    ...(input.needs === undefined ? {} : { needs: [...input.needs].sort() }),
  });
}

export async function bundleId(bundle: EmergencyBundleV1): Promise<string> {
  return hashCanonical(parseBundle(bundle));
}

export function encodeBundle(bundle: EmergencyBundleV1): Uint8Array {
  const bytes = canonicalBytes(parseBundle(bundle));
  if (bytes.byteLength > LIMITS.maximumBundleJsonBytes)
    fail('BUNDLE_SIZE', 'Encoded bundle exceeds the protocol limit.');
  return bytes;
}

export function decodeBundle(bytes: Uint8Array): EmergencyBundleV1 {
  if (bytes.byteLength > LIMITS.maximumBundleJsonBytes)
    fail('BUNDLE_SIZE', 'Encoded bundle exceeds the protocol limit.');
  try {
    const text = utf8Decode(bytes);
    const value: unknown = JSON.parse(text);
    const parsed = parseBundle(value);
    if (canonicalJson(parsed) !== text) fail('NON_CANONICAL_JSON', 'Bundle JSON is not canonical.');
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) return fail('INVALID_JSON', 'Bundle is not valid JSON.');
    throw error;
  }
}

export async function signBundle(
  bundle: EmergencyBundleV1,
  identity: SigningIdentity,
): Promise<SignedBundleV1> {
  const parsed = parseBundle(bundle);
  if (parsed.sourceKeyId !== identity.keyId)
    fail('KEY_ID_MISMATCH', 'Bundle sourceKeyId does not match signer.');
  return deepFreeze({
    version: SIGNED_VERSION,
    bundle: parsed,
    signature: await signCanonical(parsed, identity),
  });
}

export async function verifySignedBundle(
  signed: SignedBundleV1,
  publicKey: CryptoKey,
  context: ValidationContext = {},
): Promise<boolean> {
  const parsed = parseSignedBundle(signed);
  validateBundleTime(parsed.bundle, context);
  return verifyCanonical(parsed.bundle, parsed.signature, publicKey);
}

export function validateBundleTime(
  bundle: EmergencyBundleV1,
  context: ValidationContext = {},
): void {
  const parsed = parseBundle(bundle);
  const now = context.now ?? Date.now();
  const skew = context.clockSkewMs ?? 30_000;
  if (
    !Number.isSafeInteger(now) ||
    !Number.isSafeInteger(skew) ||
    skew < 0 ||
    skew > LIMITS.maximumFutureSkewMs
  ) {
    fail('CLOCK', 'Invalid validation clock context.');
  }
  if (parsed.createdAt > now + skew)
    fail('NOT_YET_VALID', 'Bundle creation time is too far in the future.');
  if (parsed.expiresAt < now - skew) fail('EXPIRED', 'Bundle has expired.');
}

export function encodeSignedBundle(signed: SignedBundleV1): Uint8Array {
  const bytes = canonicalBytes(parseSignedBundle(signed));
  if (bytes.byteLength > LIMITS.maximumSignedBundleJsonBytes)
    fail('SIGNED_BUNDLE_SIZE', 'Signed bundle exceeds the protocol limit.');
  return bytes;
}

export function decodeSignedBundle(bytes: Uint8Array): SignedBundleV1 {
  if (bytes.byteLength > LIMITS.maximumSignedBundleJsonBytes)
    fail('SIGNED_BUNDLE_SIZE', 'Signed bundle exceeds the protocol limit.');
  try {
    const text = utf8Decode(bytes);
    const value: unknown = JSON.parse(text);
    const parsed = parseSignedBundle(value);
    if (canonicalJson(parsed) !== text)
      fail('NON_CANONICAL_JSON', 'Signed bundle JSON is not canonical.');
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError)
      return fail('INVALID_JSON', 'Signed bundle is not valid JSON.');
    throw error;
  }
}
