# LightMule Protocol v1

Status: hackathon MVP specification. It is not an Internet standard and has not
received independent security review.

## 1. Scope

The protocol carries short, structured emergency messages when compatible devices
can see one another's screens and cameras but cannot use an IP or RF link. The
optical carrier is replaceable: the signed bundle and relay envelope can also be
copied over another transport without changing their meaning.

There are three nested objects:

1. `EmergencyBundleV1` is the origin's message and forwarding policy.
2. `SignedBundleV1` binds that message to the origin's P-256 public key.
3. `RelayEnvelopeV1` adds zero or more signed, append-only custody hops.

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

## 6. Optical transfer frames

An arbitrary encoded envelope is divided into 1-1024 byte chunks, with 160 bytes
as the QR-oriented default. A transfer supports at most 4096 frames and 4 MiB.
Every frame contains:

- protocol version;
- random 96-bit session ID;
- SHA-256 transfer ID for all original bytes;
- zero-based index and total frame count;
- base64url payload;
- CRC32 over the canonical frame body.

The text wire form is `LM1.` followed by base64url-encoded canonical JSON. It is
limited to 2048 UTF-8 bytes. CRC32 detects camera/decoder corruption; it is not an
authenticator. The transfer hash detects incorrect reassembly. The origin and
relay signatures provide authenticity.

Frames may arrive out of order. The MVP block framing requires every distinct
frame before reassembly. A future fountain-code profile can replace this erasure
layer without changing the signed envelope.

## 7. Receiver algorithm

1. Reject over-limit frame text before decoding.
2. Parse a frame, enforce exact fields, and verify CRC32.
3. Group by `(sessionId, transferId, total)` and deduplicate by index.
4. Reassemble only after all indexes are present; verify `transferId`.
5. Strictly parse the relay envelope and enforce time and hop limits.
6. Resolve the origin key and verify its signature.
7. Verify each relay prefix and signature in order.
8. Enforce incident membership, trust role, duplicate, and display policy.
9. Persist the accepted envelope before showing a successful receipt.

## 8. Interoperability boundary

Version 1 defines payload semantics, signatures, relay chaining, and a simple block
frame. It does not define QR version, error-correction level, display frame rate,
color modulation, camera exposure, or acknowledgements. Those belong to an optical
link profile and must be negotiated or fixed by the application.
