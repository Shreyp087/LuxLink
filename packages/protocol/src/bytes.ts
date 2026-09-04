import { fail } from './errors.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

export function utf8Encode(value: string): Uint8Array {
  return encoder.encode(value);
}

export function utf8Decode(value: Uint8Array): string {
  try {
    return decoder.decode(value);
  } catch {
    return fail('INVALID_UTF8', 'Input is not valid UTF-8.');
  }
}

export function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

export function toBase64Url(value: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < value.length; offset += 0x8000) {
    binary += String.fromCharCode(...value.subarray(offset, offset + 0x8000));
  }
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : (
          globalThis as unknown as {
            Buffer: {
              from(data: string, encoding: string): { toString(encoding: string): string };
            };
          }
        ).Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

export function fromBase64Url(value: string, label = 'value'): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/u.test(value) || value.length % 4 === 1) {
    return fail('INVALID_BASE64URL', `${label} is not canonical base64url.`);
  }
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  try {
    const binary =
      typeof atob === 'function'
        ? atob(padded)
        : (
            globalThis as unknown as {
              Buffer: {
                from(data: string, encoding: string): { toString(encoding: string): string };
              };
            }
          ).Buffer.from(padded, 'base64').toString('binary');
    const result = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (toBase64Url(result) !== value) {
      return fail('INVALID_BASE64URL', `${label} is not canonical base64url.`);
    }
    return result;
  } catch {
    return fail('INVALID_BASE64URL', `${label} is not valid base64url.`);
  }
}

export function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    difference |= left[index]! ^ right[index]!;
  }
  return difference === 0;
}
