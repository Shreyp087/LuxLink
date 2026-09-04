import { canonicalBytes, canonicalJson } from './canonical.ts';
import { utf8Decode } from './bytes.ts';
import { deriveKeyId, hashCanonical, importPublicKey } from './crypto.ts';
import { fail, ProtocolError } from './errors.ts';
import { verifyRelayEnvelope } from './relay.ts';
import {
  PACKET_VERSION,
  type RelayEnvelopeV1,
  type TransportPacketV1,
  type ValidationContext,
  type VerificationResult,
} from './types.ts';
import { LIMITS, parseTransportPacket } from './validation.ts';

export function createTransportPacket(
  envelope: RelayEnvelopeV1,
  publicKeys: Readonly<Record<string, string>>,
): TransportPacketV1 {
  return parseTransportPacket({ version: PACKET_VERSION, envelope, publicKeys });
}

export async function packetId(packet: TransportPacketV1): Promise<string> {
  return hashCanonical(parseTransportPacket(packet));
}

export function encodeTransportPacket(packet: TransportPacketV1): Uint8Array {
  const bytes = canonicalBytes(parseTransportPacket(packet));
  if (bytes.byteLength > LIMITS.maximumPacketJsonBytes) {
    fail('PACKET_SIZE', 'Transport packet exceeds the protocol limit.');
  }
  return bytes;
}

export function decodeTransportPacket(bytes: Uint8Array): TransportPacketV1 {
  if (bytes.byteLength > LIMITS.maximumPacketJsonBytes) {
    fail('PACKET_SIZE', 'Transport packet exceeds the protocol limit.');
  }
  try {
    const text = utf8Decode(bytes);
    const value: unknown = JSON.parse(text);
    const parsed = parseTransportPacket(value);
    if (canonicalJson(parsed) !== text) {
      fail('NON_CANONICAL_JSON', 'Transport packet JSON is not canonical.');
    }
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail('INVALID_JSON', 'Transport packet is not valid JSON.');
    }
    throw error;
  }
}

/** Verifies self-contained cryptographic integrity, not real-world signer trust. */
export async function verifyTransportPacket(
  packet: TransportPacketV1,
  context: ValidationContext = {},
): Promise<VerificationResult> {
  try {
    const parsed = parseTransportPacket(packet);
    const keys = new Map<string, CryptoKey>();
    for (const [claimedId, encoded] of Object.entries(parsed.publicKeys)) {
      const publicKey = await importPublicKey(encoded);
      if ((await deriveKeyId(publicKey)) !== claimedId) {
        return Object.freeze({ valid: false, error: 'KEY_ID_MISMATCH: Embedded key ID mismatch.' });
      }
      keys.set(claimedId, publicKey);
    }
    return verifyRelayEnvelope(parsed.envelope, (id) => keys.get(id), context);
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
