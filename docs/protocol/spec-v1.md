# LightMule Protocol v1

Status: hackathon MVP specification. It is not an Internet standard and has not
received independent security review.

## 1. Scope

The protocol carries short, structured emergency messages when compatible devices
can see one another's screens and cameras but cannot use an IP or RF link. The
optical carrier is replaceable: the signed bundle and relay envelope can also be
copied over another transport without changing their meaning.

There are four nested objects:

1. `EmergencyBundleV1` is the origin's message and forwarding policy.
2. `SignedBundleV1` binds that message to the origin's P-256 public key.
3. `RelayEnvelopeV1` adds zero or more signed, append-only custody hops.
4. `TransportPacketV1` carries the envelope with the public keys required to verify it.

Every object is strictly parsed. Unknown fields, non-canonical base64url, unsafe
integers, excess lengths, and unsupported versions are rejected.

## 2. Canonical serialization and identifiers

Signatures and identifiers operate on canonical JSON bytes:

- UTF-8 encoding without a byte-order mark;
- object keys sorted lexicographically by UTF-16 code unit;
- no whitespace;
- arrays retain their declared order;
- finite JSON numbers only; `-0` is serialized as `0`;
- no `undefined`, `BigInt`, custom prototypes, or cyclic values.

This is the JSON Canonicalization Scheme (RFC 8785) behavior for the deliberately
restricted data model used here. The bundle ID is:

```text
base64url-no-padding(SHA-256(canonical-json(bundle)))
```

The envelope ID uses the same construction over the complete relay envelope.
Identifiers are content addresses, not secrets.

## 3. Emergency bundle

Required fields:

| Field                    | Rule                                                  |
| ------------------------ | ----------------------------------------------------- |
| `version`                | Exactly `lightmule.bundle.v1`                         |
| `incidentId`             | 1-64 UTF-8 bytes; letters, digits, `.`, `_`, `:`, `-` |
| `sourceKeyId`            | SHA-256 of the origin SPKI, base64url without padding |
| `createdAt`, `expiresAt` | Unix epoch milliseconds as safe integers              |
| `priority`               | `critical`, `high`, `normal`, or `low`                |
| `kind`                   | `sos`, `hazard`, `resource`, `status`, or `ack`       |
| `text`                   | 0-160 UTF-8 bytes; plain text only                    |
| `nonce`                  | 16 random bytes, base64url without padding            |
| `maxHops`                | Integer 0-16                                          |

Optional fields are a bounded location, `peopleCount` 0-9999, a sorted unique list
of recognized needs, and `acknowledgesBundleId`. The last field is required for
`ack` and forbidden for other message kinds. Lifetimes are positive and at most 24
hours.

The nonce prevents two otherwise identical reports from receiving the same ID. It
does not alone prevent replay; recipients also enforce time, incident, and local
deduplication policy.

## 4. Origin signature

The origin signs the canonical bundle with ECDSA P-256 and SHA-256 (`ES256`). The
signature value is the 64-byte `r || s` form returned by Web Crypto, base64url
without padding. The `signature.keyId` must equal `bundle.sourceKeyId`.

Verification means only that the holder of the corresponding private key signed
the exact bytes. The application decides whether that key represents a dispatcher,
responder, organization, or unverified community member.

## 5. Append-only relay chain

A new envelope starts with the signed bundle and no hops. Relaying creates a new
envelope rather than mutating the previous one. Hop `n` contains:

- zero-based index `n`;
- relay key ID;
- relay timestamp;
- hash of the entire envelope containing hops `0..n-1`;
- ES256 signature over a relay statement containing the bundle ID and all fields
  above.

A verifier reconstructs every prefix, checks its hash, resolves each relay key, and
checks every signature. Dropping, reordering, inserting, or editing a hop breaks the
chain. The origin signature remains independently verifiable at every hop.

Relays refuse expired bundles or chains at `maxHops`. A receiver may apply a small
clock-skew allowance; the default library allowance is 30 seconds. Relay timestamps
must be monotonic and may not be unreasonably far in the verifier's future.

## 6. Self-contained transport packet

The transport packet version is `lightmule.packet.v1`. It contains a relay envelope and a
`publicKeys` object mapping every unique origin and relay key ID to its base64url-encoded P-256 SPKI.
The set must be exact: missing and unrelated keys are rejected. Each decoded key is re-derived and
must match its claimed SHA-256 key ID before signature verification begins.

Embedded public keys make a packet independently integrity-verifiable; they do **not** establish a
person's or organization's identity. An application grants operational trust only through a
separate pre-enrollment or fingerprint-comparison process.

Canonical packet JSON is limited to 40 KiB. The current application produces much smaller packets
for short emergency text.

## 7. Optical transfer frames

An arbitrary encoded transport packet is divided into 1-1024 byte chunks, with 160 bytes as the
library default. A transfer supports at most 4096 frames and 4 MiB.
Every frame contains:

- protocol version;
- random 96-bit session ID;
- SHA-256 transfer ID for all original bytes;
- zero-based index and total frame count;
- base64url payload;
- CRC32 over the canonical frame body.

The compact text wire form is:

```text
LM1.<sessionId>.<transferId>.<index-base36>.<total-base36>.<crc32>.<payload>
```

All separators are literal periods. Numeric fields use lowercase canonical base36 without leading
zeroes. Base64url fields cannot contain periods, so the six-field body is unambiguous. The complete
wire frame is limited to 2048 UTF-8 bytes. CRC32 detects camera/decoder corruption; it is not an
authenticator. The transfer hash detects incorrect reassembly. Origin and relay signatures provide
authenticity. The compact form replaced a redundant JSON-plus-base64 wrapper because lower-density
QR symbols materially improved decoder reliability.

Frames may arrive out of order. The MVP block framing requires every distinct
frame before reassembly. A future fountain-code profile can replace this erasure
layer without changing the signed envelope.

## 8. Receiver algorithm

1. Reject over-limit frame text before decoding.
2. Parse a frame, enforce exact fields, and verify CRC32.
3. Group by `(sessionId, transferId, total)` and deduplicate by index.
4. Reassemble only after all indexes are present; verify `transferId`.
5. Strictly parse the transport packet and enforce exact embedded signer keys.
6. Import each public key, derive its key ID, and reject mismatches.
7. Enforce bundle time and hop limits and verify the origin signature.
8. Verify each relay prefix and signature in order.
9. Separately resolve whether the origin fingerprint is operationally trusted.
10. Persist the accepted envelope before showing a successful receipt; retain first-seen metadata
    and replace custody history only with an exact signed extension.

## 9. Application optical profile

Field build 0002 fixes an intentionally conservative profile:

- 72 raw payload bytes per frame;
- QR error-correction level M with the required four-module quiet zone;
- pure black modules on a pure white field;
- 768-pixel generated canvas, responsively scaled for display;
- two frame changes per second with pause and manual navigation controls.

The receiver uses the same collector for camera results, uploaded QR images, imported frame packs,
and local loopback. Frames are order-independent and duplicates are idempotent. An accepted transfer
latches until the operator resets the collector. Image import first uses scene detection, then a
pure-symbol fallback for application-exported QR PNGs.

## 10. Interoperability boundary

Version 1 defines payload semantics, signatures, relay chaining, a self-contained packet, and a
simple block frame. QR version, error-correction level, display frame rate, color modulation, camera
exposure, and acknowledgements belong to an optical link profile and may differ between compatible
applications. The profile above records this application's current behavior.
