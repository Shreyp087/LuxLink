# Product brief: LuxLink field relay

## Mission

Make a small, verifiable emergency message portable across a local network outage using only preloaded phones, ordinary screens, cameras, and the movement of people.

## Product thesis

The optical carrier is deliberately ordinary. The product value is preserving message authority, freshness, and meaning while a bundle is received, stored offline, physically carried, and relayed through several disconnected devices.

## Primary user story

As a person moving between disconnected shelters, clinics, or campus checkpoints, I can receive a signed emergency update from a nearby screen, confirm who issued it, retain it without connectivity, and pass the original verified bundle to another person.

## Primary actors

| Actor                  | Need                                            | Interface promise                                                  |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Authorized issuer      | Publish a small, expiring message               | The complete bundle is signed before optical encoding.             |
| Carrier                | Receive, understand, retain, and relay          | The app never implies that the carrier authored the message.       |
| Recipient              | Determine origin, freshness, and instructions   | Verification state is textual, prominent, and deterministic.       |
| Civilian reporter      | Share an observation without borrowed authority | The report remains clearly marked as unverified.                   |
| Exercise administrator | Provision trust and test readiness              | Trusted keys and offline readiness are visible before an incident. |

## Product principles

1. **Authority survives the carrier.** Relays preserve the immutable issuer-signed object.
2. **Failure must be legible.** Unknown, expired, corrupt, incomplete, and untrusted are distinct states.
3. **Offline is a provisioned state.** The interface never hides the first-load/cache requirement.
4. **Small data wins.** Optimize for hundreds of bytes and first-attempt success, not file-transfer spectacle.
5. **The display is public.** Do not infer confidentiality from directionality or the absence of radio.
6. **Measured boundaries beat inflated claims.** Publish the tested devices, range, angle, lighting, and rate.
7. **Accessibility is part of the transport.** Safe-rate visuals, readable text, screen-reader semantics, and non-color status are required.

## MVP acceptance gates

- A 200-400 byte bundle transfers between at least one Android/Chrome and one iPhone/Safari path.
- Both devices can launch the preloaded app in airplane mode.
- A P-256 signature verifies locally against a pre-enrolled issuer key.
- One modified byte causes a hard verification failure.
- The issuer-signed object survives three relays unchanged.
- Duplicate and expired messages are handled visibly.
- Safe optical mode completes within five seconds after acquisition in the target test setup.
- Unknown keys render as `UNVERIFIED`, never as a weaker green success state.

## Non-goals for the hackathon

- general-purpose file sharing;
- live two-way distress chat;
- background mesh networking;
- hidden or color-based modulation;
- neural optical decoding;
- automatic truth or urgency decisions;
- cloud accounts or a dispatch backend;
- compliance, certification, or guaranteed-delivery claims.

## Demonstration contract

1. Put both receiving devices in airplane mode.
2. Show a trusted issuer composing and signing an evacuation update.
3. Receive and verify the update on Phone A.
4. Walk Phone A to Phone B and relay the bundle optically.
5. Verify the same issuer on Phone B.
6. Mutate a copy and demonstrate rejection.
7. End with the tested operating boundary and limitations.

## Milestones

### M0 - Foundation

Monorepo, CI, ownership, ADRs, threat model, interface system, and deterministic protocol tests.

**Status: complete.**

### M1 - Trusted local bundle

Compose, canonicalize, sign, verify, persist, deduplicate, expire, and relay a bundle without optical transport.

**Status: complete for the software MVP.**

### M2 - Conservative optical handoff

Static or animated monochrome QR framing with per-frame validation and explicit receiver progress.

**Status: complete.** Live-camera, image-batch, frame-pack, and no-hardware loopback paths share the
same collector and verification pipeline.

### M3 - Recovery and device qualification

Across-frame erasure recovery, device/lighting/range matrix, performance telemetry, safe-mode analysis, and offline installation checks.

**Status: partially complete.** Offline installation is automated. Erasure coding and physical
device qualification remain post-MVP work because they require field measurements.

### M4 - Judge-ready field story

Three-hop demonstration, tamper rejection, accessibility pass, measured reliability card, and a recorded fallback demo.

**Status: software support complete; submission production remains.** The application can create
signed hops and deterministic fallback demos. Recording and measured physical-device claims require
the submission team and test hardware.
