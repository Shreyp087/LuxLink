# LuxLink product design principles

Status: normative for MVP  
Applies to: marketing site, install experience, receiver, broadcaster, relay vault  
Last reviewed: 2026-09-04

These principles turn the Signal Ledger direction into reviewable product rules. When aesthetic novelty conflicts with comprehension, safety, provenance, battery, or offline resilience, the latter wins.

## 1. Trust before delight

A completed scan is not necessarily a trusted message. The interface must visually separate transport status from verification status.

**Required**

- Say `Transfer complete` and `Signature verified` as separate events.
- Show source identity/fingerprint, signed time, bundle age, incident ID, and expiry on the receipt.
- Treat unknown keys as `Unverified source`, never as success with a small disclaimer.
- Reserve the strongest positive treatment for successful verification, not QR decoding.

**Review check:** Can a user distinguish `received`, `intact`, `verified`, and `trusted` without opening details?

## 2. One screen, one physical action

LuxLink is used while holding, aiming, carrying, or presenting a device. Each view should correspond to one physical act: compose, confirm, present, aim, carry, or relay.

**Required**

- One primary control per view.
- Secondary controls stay visually subordinate and never flank the primary action symmetrically.
- Capture and broadcast modes remove bottom navigation and nonessential decoration.
- A user can pause or exit a transfer without hunting through a menu.

**Review check:** Can the primary action be named from a blurred screenshot?

## 3. Make the invisible path visible

The core differentiator is store-carry-forward custody. Show the message path as a chronological relay trace, not a decorative network cloud.

**Required**

- Each hop is a node with time, device alias or anonymous fingerprint, and verification state.
- Hop count and remaining hop limit are plain text.
- Expired, duplicate, and superseded bundles stay legible in history and are clearly marked.
- Do not imply continuous connectivity between nodes.

**Review check:** Can a judge explain who created the bundle, who carried it, and who verified it?

## 4. Be precise about uncertainty

Do not compress urgency, severity, certainty, trust, and link quality into a single color or score. They answer different questions.

Inspired by [CAP 1.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.html), label these separately:

- **Urgency:** how soon action is needed.
- **Severity:** magnitude of harm.
- **Certainty:** confidence in the event report.
- **Trust:** cryptographic/source verification.
- **Link quality:** current optical decode conditions.

**Review check:** If certainty is low but severity is extreme, does the UI express both without contradiction?

## 5. Color is scarce infrastructure

Most of the interface is service paper, ink, and rules. Semantic color appears only where it changes interpretation or action.

**Required**

- Orange: operator action and active transfer.
- Teal: cryptographically verified/ready.
- Blue: informational or locally stored.
- Amber: degraded, attention soon, or uncertain.
- Red: invalid signature, immediate danger, destructive consequence.
- State always includes a word and an icon/shape.

**Review check:** Does the screen still work in grayscale and Windows forced-colors mode?

## 6. Operational quiet is a feature

LuxLink must not behave like an alarm casino. As the task becomes more urgent, reduce competing UI.

**Required**

- No ambient particles, looping marquees, cursor followers, parallax, animated gradients, or pulsing cards.
- Only one live region announces a state transition at a time.
- Use `role="alert"` only for conditions needing immediate attention; use `role="status"` for progress and completion.
- Keep red and shake animations out of routine errors.
- During QR broadcast, suspend all decorative animation.

See [USWDS Alert guidance](https://designsystem.digital.gov/components/alert/) and [Apple Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts).

**Review check:** If every animation is removed, is the state still obvious?

## 7. Design for sunlight, motion, gloves, and stress

The polished indoor demo is not the target condition.

**Required**

- Body copy minimum 16 px; operational labels minimum 14 px.
- Primary action minimum 52 px tall; all targets at least 44 x 44 CSS px, with 8 px separation where adjacent.
- Avoid thin font weights below 400 and critical condensed copy below 18 px.
- Maintain strong contrast; never place operational text over photography.
- Capture guidance is directional and concrete: `Move closer`, `Hold level`, `Reduce glare`.
- Never require a precision drag during receive/broadcast.

**Review check:** Can the main flow be completed one-handed at 200% text zoom?

## 8. Offline readiness must be proved, not promised

"Works offline" is a state with prerequisites, not marketing garnish.

**Required**

- Display `Ready without network` only after the service worker, application shell, decoder, fonts, icons, and required local data are cached.
- Before readiness, say `Finish setup before going offline` and name what remains.
- No runtime CDN, remote font, analytics, or icon dependency in an operational flow.
- Loss of network is advisory, not an error, if the offline bundle is ready.
- Provide a settings action to verify offline assets locally.

**Review check:** Does airplane mode after a cold restart preserve the full receive/store/relay flow?

## 9. Progressive disclosure, never progressive deception

Primary screens show the facts needed for action. Deeper metadata stays one tap away, but it is not replaced with vague reassurance.

**Required**

- Receipt summary: trust, source, age, expiry, priority, instruction, relay eligibility.
- Details: content hash, key fingerprint, signature algorithm, frame stats, full custody events.
- Advanced detail uses definition lists and selectable text, not tiny decorative chips.
- Technical terms include concise explanations.

**Review check:** Does the summary support safe action while the detail supports audit?

## 10. Tolerance for error is designed into the sequence

Follow [GOV.UK's universal-design emphasis](https://design-system.service.gov.uk/accessibility/accessibility-strategy/) on tolerance for error and low effort.

**Required**

- Save composition locally as a draft.
- Confirm consequence and recipients before signing/broadcasting.
- Destructive actions identify the bundle by title and short ID.
- Duplicates are detected without blaming the user.
- Failed transfer resumes or restarts safely; no partial packet appears as accepted.
- A signed bundle is immutable. Editing creates a superseding bundle with a new ID.

**Review check:** Can a rushed user recover from a wrong tap without losing the source message?

## 11. Plain language is operational design

UI language describes observable state and the next action. Avoid anthropomorphic or magical language.

| Avoid                              | Use                                                         |
| ---------------------------------- | ----------------------------------------------------------- |
| `AI is optimizing your connection` | `Glare is reducing frame reads. Tilt either screen.`        |
| `Something went wrong`             | `Camera access is blocked. Allow camera access to receive.` |
| `Success!`                         | `Signature verified. Stored on this device.`                |
| `Invalid`                          | `Signature does not match the bundle. Do not act on it.`    |
| `Offline mode`                     | `Ready without network` or `Setup incomplete`               |
| `Share`                            | `Broadcast by screen` or `Relay this bundle`                |
| `Sender` alone                     | `Claimed source` or `Verified source`, as applicable        |

Use sentence case. Reserve uppercase for compact equipment labels and short state stamps, never paragraphs.

## 12. Accessibility is part of transmission safety

**Required baseline**

- Target WCAG 2.2 AA; test with keyboard, VoiceOver, TalkBack, 200% zoom, reduced motion, increased contrast, and forced colors.
- Valid landmarks, one `h1`, logical heading order, skip link, visible labels, error summary and inline error association.
- Focus style: 3 px amber outer ring plus 2 px ink inner edge, at least 2 px offset.
- Do not auto-focus status banners except when required to resolve a blocking error.
- Default safe broadcast is 2 fps. Place a persistent `Pause broadcast` control outside the changing frame region.
- No saturated-red optical frames.
- Honor `prefers-reduced-motion: reduce`; replace spatial transitions with immediate state changes or a short opacity change.
- Provide a non-camera fallback for bundle import/export during development and accessibility testing.

WCAG's [three flashes criterion](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) is the minimum boundary, not proof that a light-based protocol is safe for every person.

## 13. The product never overclaims

LuxLink is a fallback for compatible, preloaded devices with line of sight. It is not a replacement for emergency services, radio, mesh networking, AirDrop, or CAP infrastructure.

**Required**

- Marketing says `RF-independent fallback`, not `works anywhere`.
- The install experience explains the preloading requirement.
- The interface never labels a person or organization verified unless a trust policy supports it.
- Demo data is visibly marked `SIMULATION`.
- Do not call CAP-inspired fields `CAP compliant` without implementing and testing the specification.

## Design review rubric

Score each major view from 0 to 2. A view must score at least 16/20 and cannot score 0 in trust, accessibility, or truthfulness.

| Dimension       | 0                       | 1                 | 2                                    |
| --------------- | ----------------------- | ----------------- | ------------------------------------ |
| Primary action  | Competing/unclear       | Discoverable      | Immediate and singular               |
| Mode visibility | Hidden                  | In header/detail  | Obvious at a glance                  |
| Trust state     | Conflated or missing    | Present           | Separates transport/integrity/source |
| Error recovery  | Dead end                | Generic retry     | Specific safe recovery               |
| Offline truth   | Implied                 | Status exists     | Status is verified and actionable    |
| Accessibility   | Critical failure        | Baseline only     | Tested in target modes               |
| Color semantics | Decorative/inconsistent | Mostly consistent | Scarce, redundant, documented        |
| Content         | Vague/anthropomorphic   | Understandable    | Observable state + next action       |
| Originality     | Template-like           | Branded           | Product mechanism creates identity   |
| Truthfulness    | Implied capability      | Caveats hidden    | Capability and limit are explicit    |

## Definition of design-ready

A feature is not ready for implementation until it has:

- happy, loading, empty, degraded, denied, interrupted, invalid, duplicate, expired, and offline states;
- keyboard order and accessible names;
- mobile and wide-screen layout behavior;
- data dependencies and maximum content lengths;
- exact status language;
- motion behavior under normal and reduced-motion settings;
- a stated rollback or exit path;
- design-review score recorded in its issue or pull request.
