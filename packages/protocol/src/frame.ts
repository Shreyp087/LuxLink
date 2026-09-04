import { canonicalBytes } from './canonical.ts';
import { concatBytes, equalBytes, fromBase64Url, toBase64Url, utf8Encode } from './bytes.ts';
import { sha256 } from './crypto.ts';
import { fail } from './errors.ts';
import { FRAME_VERSION, type ChunkOptions, type OpticalFrameV1 } from './types.ts';
import { LIMITS, parseFrame } from './validation.ts';

const FRAME_PREFIX = 'LM1.';

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1)
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): string {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff]! ^ (value >>> 8);
  return ((value ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

function frameBody(frame: Omit<OpticalFrameV1, 'crc32'>) {
  return {
    version: frame.version,
    sessionId: frame.sessionId,
    transferId: frame.transferId,
    index: frame.index,
    total: frame.total,
    payload: frame.payload,
  };
}

export function createFrame(body: Omit<OpticalFrameV1, 'version' | 'crc32'>): OpticalFrameV1 {
  const withVersion = { version: FRAME_VERSION, ...body };
  return parseFrame({ ...withVersion, crc32: crc32(canonicalBytes(withVersion)) });
}

export function encodeFrame(frame: OpticalFrameV1): string {
  const parsed = parseFrame(frame);
  const expected = crc32(canonicalBytes(frameBody(parsed)));
  if (parsed.crc32 !== expected) fail('CRC_MISMATCH', 'Frame CRC32 is invalid.');
  const encoded = `${FRAME_PREFIX}${[
    parsed.sessionId,
    parsed.transferId,
    parsed.index.toString(36),
    parsed.total.toString(36),
    parsed.crc32,
    parsed.payload,
  ].join('.')}`;
  if (utf8Encode(encoded).byteLength > LIMITS.maximumEncodedFrameBytes)
    fail('FRAME_SIZE', 'Encoded frame exceeds the protocol limit.');
  return encoded;
}

export function decodeFrame(encoded: string): OpticalFrameV1 {
  if (utf8Encode(encoded).byteLength > LIMITS.maximumEncodedFrameBytes)
    fail('FRAME_SIZE', 'Encoded frame exceeds the protocol limit.');
  if (!encoded.startsWith(FRAME_PREFIX)) fail('FRAME_PREFIX', 'Frame prefix is invalid.');
  const fields = encoded.slice(FRAME_PREFIX.length).split('.');
  if (fields.length !== 6) fail('FRAME_SHAPE', 'Frame must contain six wire fields.');
  const [sessionId, transferId, encodedIndex, encodedTotal, checksum, payload] = fields as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const index = parseBase36(encodedIndex, 'index');
  const total = parseBase36(encodedTotal, 'total');
  const frame = parseFrame({
    version: FRAME_VERSION,
    sessionId,
    transferId,
    index,
    total,
    payload,
    crc32: checksum,
  });
  if (frame.crc32 !== crc32(canonicalBytes(frameBody(frame))))
    fail('CRC_MISMATCH', 'Frame CRC32 is invalid.');
  return frame;
}

function parseBase36(value: string, label: string): number {
  if (!/^(?:0|[1-9a-z][0-9a-z]*)$/u.test(value)) {
    return fail('FRAME_INTEGER', `${label} is not canonical base36.`);
  }
  const parsed = Number.parseInt(value, 36);
  if (!Number.isSafeInteger(parsed) || parsed.toString(36) !== value) {
    return fail('FRAME_INTEGER', `${label} is outside the supported range.`);
  }
  return parsed;
}

export async function chunkTransfer(
  bytes: Uint8Array,
  options: ChunkOptions = {},
): Promise<readonly OpticalFrameV1[]> {
  if (
    bytes.byteLength < 1 ||
    bytes.byteLength > LIMITS.maximumFramePayloadBytes * LIMITS.maximumFrames
  ) {
    fail('TRANSFER_SIZE', 'Transfer must contain 1 byte through 4 MiB.');
  }
  const chunkSize = options.chunkSize ?? 160;
  if (
    !Number.isInteger(chunkSize) ||
    chunkSize < 1 ||
    chunkSize > LIMITS.maximumFramePayloadBytes
  ) {
    fail('CHUNK_SIZE', 'chunkSize must be from 1 through 1024 bytes.');
  }
  const total = Math.ceil(bytes.byteLength / chunkSize);
  if (total > LIMITS.maximumFrames) fail('FRAME_COUNT', 'Transfer requires too many frames.');
  let session: Uint8Array;
  if (options.sessionId === undefined) {
    session = globalThis.crypto.getRandomValues(new Uint8Array(12));
  } else {
    session =
      typeof options.sessionId === 'string'
        ? fromBase64Url(options.sessionId, 'sessionId')
        : options.sessionId;
  }
  if (session.byteLength !== 12) fail('SESSION_ID', 'sessionId must contain 12 bytes.');
  const sessionId = toBase64Url(session);
  const transferId = toBase64Url(await sha256(bytes));
  const frames = Array.from({ length: total }, (_, index) =>
    createFrame({
      sessionId,
      transferId,
      index,
      total,
      payload: toBase64Url(
        bytes.subarray(index * chunkSize, Math.min(bytes.byteLength, (index + 1) * chunkSize)),
      ),
    }),
  );
  return Object.freeze(frames);
}

export async function reassembleFrames(frames: readonly OpticalFrameV1[]): Promise<Uint8Array> {
  if (frames.length < 1 || frames.length > LIMITS.maximumFrames)
    fail('FRAME_COUNT', 'Invalid number of frames.');
  const parsed = frames.map(parseFrame);
  const first = parsed[0]!;
  if (parsed.length !== first.total)
    fail(
      'INCOMPLETE_TRANSFER',
      `Expected ${first.total} unique frames, received ${parsed.length}.`,
    );
  const ordered = new Array<Uint8Array | undefined>();
  ordered.length = first.total;
  ordered.fill(undefined);
  for (const frame of parsed) {
    if (
      frame.sessionId !== first.sessionId ||
      frame.transferId !== first.transferId ||
      frame.total !== first.total
    ) {
      fail('MIXED_TRANSFER', 'Frames belong to different transfers.');
    }
    if (frame.crc32 !== crc32(canonicalBytes(frameBody(frame))))
      fail('CRC_MISMATCH', `Frame ${frame.index} CRC32 is invalid.`);
    if (ordered[frame.index] !== undefined)
      fail('DUPLICATE_FRAME', `Frame ${frame.index} is duplicated.`);
    ordered[frame.index] = fromBase64Url(frame.payload, 'payload');
  }
  if (ordered.some((chunk) => chunk === undefined))
    fail('INCOMPLETE_TRANSFER', 'One or more frames are missing.');
  const result = concatBytes(ordered as Uint8Array[]);
  if (!equalBytes(await sha256(result), fromBase64Url(first.transferId, 'transferId'))) {
    fail('TRANSFER_HASH', 'Reassembled transfer hash does not match transferId.');
  }
  return result;
}
