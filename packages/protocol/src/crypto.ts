import { canonicalBytes } from './canonical.ts';
import { fromBase64Url, toBase64Url } from './bytes.ts';
import { fail } from './errors.ts';
import type { SignatureV1, SigningIdentity } from './types.ts';

const ECDSA = { name: 'ECDSA', namedCurve: 'P-256' } as const;
const SIGN_ALGORITHM = { name: 'ECDSA', hash: 'SHA-256' } as const;

function ownedBytes(value: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy;
}

function webCrypto(): Crypto {
  const candidate: unknown = Reflect.get(globalThis, 'crypto');
  if (typeof candidate !== 'object' || candidate === null || !('subtle' in candidate))
    return fail('CRYPTO_UNAVAILABLE', 'Web Crypto is unavailable in this context.');
  return candidate as Crypto;
}

export async function sha256(value: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await webCrypto().subtle.digest('SHA-256', ownedBytes(value)));
}

export async function hashCanonical(value: unknown): Promise<string> {
  return toBase64Url(await sha256(canonicalBytes(value)));
}

export async function deriveKeyId(publicKey: CryptoKey): Promise<string> {
  const spki = await webCrypto().subtle.exportKey('spki', publicKey);
  return toBase64Url(await sha256(new Uint8Array(spki)));
}

export async function generateSigningIdentity(): Promise<SigningIdentity> {
  const pair = await webCrypto().subtle.generateKey(ECDSA, true, ['sign', 'verify']);
  return Object.freeze({
    keyId: await deriveKeyId(pair.publicKey),
    publicKey: pair.publicKey,
    privateKey: pair.privateKey,
  });
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  return toBase64Url(new Uint8Array(await webCrypto().subtle.exportKey('spki', publicKey)));
}

export async function importPublicKey(encoded: string): Promise<CryptoKey> {
  const bytes = fromBase64Url(encoded, 'publicKey');
  try {
    return await webCrypto().subtle.importKey('spki', ownedBytes(bytes), ECDSA, true, ['verify']);
  } catch {
    return fail('INVALID_PUBLIC_KEY', 'The supplied P-256 public key is invalid.');
  }
}

export async function signCanonical(
  value: unknown,
  identity: SigningIdentity,
): Promise<SignatureV1> {
  if (identity.keyId !== (await deriveKeyId(identity.publicKey))) {
    return fail('KEY_ID_MISMATCH', 'Signing identity keyId does not match its public key.');
  }
  const raw = new Uint8Array(
    await webCrypto().subtle.sign(
      SIGN_ALGORITHM,
      identity.privateKey,
      ownedBytes(canonicalBytes(value)),
    ),
  );
  if (raw.byteLength !== 64) {
    return fail('SIGNATURE_FORMAT', 'Web Crypto returned a non-ES256 signature shape.');
  }
  return Object.freeze({ algorithm: 'ES256', keyId: identity.keyId, value: toBase64Url(raw) });
}

export async function verifyCanonical(
  value: unknown,
  signature: SignatureV1,
  publicKey: CryptoKey,
): Promise<boolean> {
  if (signature.keyId !== (await deriveKeyId(publicKey))) return false;
  const raw = fromBase64Url(signature.value, 'signature');
  if (raw.byteLength !== 64) return false;
  try {
    return await webCrypto().subtle.verify(
      SIGN_ALGORITHM,
      publicKey,
      ownedBytes(raw),
      ownedBytes(canonicalBytes(value)),
    );
  } catch {
    return false;
  }
}
