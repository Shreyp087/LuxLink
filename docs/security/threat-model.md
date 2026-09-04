# LuxLink Security and Trust Model

Status: design review for a hackathon MVP. This document names protections and
limitations so the demonstration does not imply guarantees the software lacks.

## Assets and trust boundaries

Protected assets are message integrity, source attribution to a known key, expiry,
relay-chain integrity, and correct byte reassembly. Availability, confidentiality,
and real-world identity are separate concerns.

The camera, operating system, browser, local storage, preloaded trust registry, and
device clock are inside the receiver's trust boundary. Screens, optical space,
human couriers, and unknown relay devices are outside it.

## Threats and controls

| Threat                                 | MVP control                                          | Residual risk                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Camera observes a transmission         | None                                                 | Any camera with line of sight can record the payload and metadata.                                                              |
| Origin message is edited               | Origin ES256 signature over canonical bytes          | Compromised origin key can sign false messages.                                                                                 |
| Attacker impersonates authority        | Key ID derived from public key; app trust registry   | A signature proves key possession, not a person's identity. Trust bootstrap remains operational.                                |
| Old message is replayed                | Creation/expiry time, random nonce, bundle-ID dedupe | Bad clocks and cleared local history weaken replay detection.                                                                   |
| Relay edits or removes route history   | Each relay signs the prior envelope hash             | An entirely new chain can start from a valid origin bundle. This is detectable as a different custody history, not preventable. |
| Relay resets hop budget                | Origin-signed `maxHops`; chain length checked        | A relay can discard the existing envelope and rebroadcast the origin bundle with no history.                                    |
| QR/frame corruption                    | Per-frame CRC32 and end-to-end SHA-256 transfer ID   | CRC32 is not cryptographic and deliberate corruption remains denial of service.                                                 |
| Frames from two transfers are mixed    | Session, transfer hash, total count, unique index    | Attackers can flood many session IDs; applications need quotas and eviction.                                                    |
| Parser/resource exhaustion             | Exact schemas and byte/count/depth limits            | Repeated valid-size traffic can still drain battery or occupy the camera.                                                       |
| Malicious text triggers active content | Protocol permits plain text only                     | UI must render as text, never HTML, and never auto-open detected links.                                                         |
| Private key theft                      | Not solved by protocol                               | MVP browser storage is not adequate for high-assurance responder keys.                                                          |
| Device/storage seizure                 | Not solved by v1                                     | Signed messages and location metadata remain readable at rest.                                                                  |
| Receiver falsely claims delivery       | Not solved by one-way transfer                       | A separately signed acknowledgement must travel back through some channel.                                                      |

## Trust states the UI must preserve

Do not collapse cryptographic validity and operational trust into one green check.
The product should show independent states:

1. **Integrity:** valid signature / invalid signature / not checked.
2. **Identity:** trusted responder / recognized community key / unknown key.
3. **Freshness:** current / near expiry / expired / clock uncertain.
4. **Custody:** direct from origin / verified relay chain / incomplete or invalid chain.

An unknown but cryptographically valid key is **unverified**, not "trusted". A
trusted key can still send incorrect information. Critical instructions require
human judgment and organizational policy.

## Key provisioning

For the demo, ship a small, auditable registry of public keys and labels inside the
offline application bundle. Show the public-key fingerprint when registering or
comparing a key. In a real deployment, keys need an authenticated enrollment,
revocation, rotation, role, incident scope, and expiry mechanism.

Private keys should be non-exportable Web Crypto keys where supported. That reduces
accidental extraction but does not make a general browser a hardware security
module. High-assurance deployments should use platform key storage and a native
application after independent review.

Field build 0002 generates its demonstration identity locally, stores the `CryptoKey` objects in
IndexedDB, marks the private signing key non-exportable, exports only a public contact card through
the interface, and requires an explicit user action before an unknown source fingerprint becomes
trusted. Non-exportable does not prevent malicious same-origin code from requesting signatures.
Transport packets embed verification keys so they can prove integrity while offline. Those embedded
keys are attacker-controlled input until parsed and matched to their derived IDs, and they never
grant trust by themselves.

The local message store keeps the first-seen timestamp and original direction for a bundle ID.
Later packets replace its envelope only when they extend the stored custody chain exactly; shorter
replays and alternate branches cannot overwrite that history. Trust may be upgraded independently,
and removing a contact immediately changes the interface's current-trust label.

## Availability and human safety

An attacker can cover the camera, saturate it with light, display counterfeit
frames, jam scanning, flood sessions, or simply withhold a device. Store-carry-
forward improves reachability; it does not guarantee delivery. The UI must say
"saved locally" and "relayed to this device," never "rescue dispatched" unless an
authorized system separately confirms that outcome.

Optical animation can create accessibility and photosensitivity hazards. The
default safety profile should use monochrome frames at no more than 2-3 visual
changes per second, avoid saturated red, keep average luminance stable, expose an
immediate pause control, and stop automatically when transfer completes. Higher
rate modes need explicit safety and device testing.

## Explicit non-claims

Version 1 does **not** claim:

- confidentiality, anonymity, traffic-analysis resistance, or secure deletion;
- proof of a person's legal identity or authorization;
- guaranteed delivery, emergency-service dispatch, or live synchronization;
- Byzantine consensus, global ordering, or protection from compromised endpoints;
- post-quantum security;
- formal verification, FIPS validation, standards compliance, or production
  readiness;
- that line of sight is a security boundary;
- that CRC32 authenticates anything.

## Security release gate

Before any real emergency pilot: commission independent review, fuzz strict parsers,
test browser signature interoperability, design authenticated provisioning and
revocation, encrypt sensitive data for known recipients, protect keys at rest,
define retention/deletion policy, conduct accessibility testing, and run field
exercises with public-safety professionals. Until then, label the application a
demonstration and never make it the sole communications path.
