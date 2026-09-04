import { utf8Encode } from './bytes.ts';
import { fail } from './errors.ts';

export type CanonicalValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

function assertUnicode(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        fail('INVALID_UNICODE', 'Canonical JSON forbids unpaired UTF-16 surrogates.');
      }
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      fail('INVALID_UNICODE', 'Canonical JSON forbids unpaired UTF-16 surrogates.');
    }
  }
}

function serialize(value: unknown, seen: Set<object>): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'string') {
    assertUnicode(value);
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      return fail('NON_CANONICAL_VALUE', 'Canonical JSON forbids non-finite numbers.');
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (typeof value !== 'object') {
    return fail('NON_CANONICAL_VALUE', `Canonical JSON cannot encode ${typeof value}.`);
  }
  if (seen.has(value)) return fail('CYCLIC_VALUE', 'Canonical JSON cannot encode cyclic objects.');
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      return `[${value.map((entry) => serialize(entry, seen)).join(',')}]`;
    }
    const prototype = Reflect.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      return fail('NON_PLAIN_OBJECT', 'Canonical JSON accepts only arrays and plain objects.');
    }
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const entries = keys.map((key) => {
      assertUnicode(key);
      const entry = record[key];
      if (entry === undefined) return fail('UNDEFINED_VALUE', `Property ${key} is undefined.`);
      return `${JSON.stringify(key)}:${serialize(entry, seen)}`;
    });
    return `{${entries.join(',')}}`;
  } finally {
    seen.delete(value);
  }
}

/** RFC 8785/JCS-compatible for this protocol's JSON subset. */
export function canonicalJson(value: unknown): string {
  return serialize(value, new Set());
}

export function canonicalBytes(value: unknown): Uint8Array {
  return utf8Encode(canonicalJson(value));
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}
