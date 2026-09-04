# LuxLink visual research

Status: implementation reference  
Owner: Product Design  
Last reviewed: 2026-09-04

## Research question

How can LuxLink feel like a credible piece of public infrastructure and still be visually memorable enough for a hackathon demonstration?

The answer is not a mood-board collage. It is a controlled split:

- The public website may be editorial, tactile, and surprising.
- The operational application must behave like a field instrument: direct, calm, dense only where density helps, and unmistakable about trust.
- Both surfaces share one visual grammar: registration marks, packet labels, rule lines, large sequence numbers, restrained signal orange, and high-legibility type.

The working aesthetic is **field instrument x civic infrastructure**. It is deliberately not glassmorphism, a dark cyberpunk console, a glowing AI gradient, or a generic card dashboard.

## Method and caveat

This review combines direct inspection of current sites with original design-system and human-factors guidance. Award sites are used to study composition and voice, not as evidence that an interaction is safe. Safety-critical guidance outranks visual fashion. Observations describe reusable principles; no layout, illustration, motion sequence, code, or brand asset is to be copied.

The review is a curated cross-section, not a claim to have examined every strong webpage on the internet.

## Reference matrix

| Reference                                                                                                                                                                                                                               | What is world-class about it                                                                                                                                                                                                                            | Transfer to LuxLink                                                                                                                                                                                                   | Do not transfer                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Daylight Computer](https://daylightcomputer.com/) and [Basement's case study](https://basement.studio/showcase/daylight-simplicity-in-motion)                                                                                          | A singular, human thesis carries the entire page. Warm documentary imagery, physical framing, a limited amber accent, and idiosyncratic typography make technology feel humane. The site received Awwwards and FWA recognition according to the studio. | Lead with one sentence that a person can repeat. Photograph or illustrate the physical act of one screen passing a message to another. Use one warm signal color and let the product behavior be the spectacle.       | Rounded floating commerce panels, lifestyle sentimentality, or its amber/cream styling as a costume. LuxLink must feel more civic and less consumer-retreat. |
| [Teenage Engineering](https://teenage.engineering/)                                                                                                                                                                                     | The interface looks authored: product-manual diagrams, huge typographic compression, tiny technical labels, hard black and white, and rare orange. Information architecture is visible rather than hidden inside anonymous UI chrome.                   | Treat packet metadata like equipment labeling. Pair oversized statements with compact, aligned technical copy. Use bespoke line diagrams and direct labels.                                                           | Do not imitate its wordmark, icons, character illustrations, intentionally tiny navigation, or playful ambiguity on operational screens.                     |
| [Igloo Inc.](https://www.igloo.inc/), Awwwards' 2024 Site and Developer Site of the Year ([award announcement](https://www.linkedin.com/posts/awwwards_we-are-thrilled-to-announce-that-the-winners-activity-7307431367728861187-ED07)) | A single visual world creates immediate memory; the loading mark and monochrome 3D scene behave as one art-directed experience.                                                                                                                         | Give the marketing hero one ownable scene: a message visibly crossing a chain of devices or hands. A strong concept beats a dozen interchangeable feature cards.                                                      | Persistent WebGL, hidden navigation, long preloaders, and decorative interaction. Those are unacceptable for an offline emergency tool.                      |
| [Vitsoe](https://www.vitsoe.com/us)                                                                                                                                                                                                     | The page structure mirrors its product philosophy: modular, direct, durable, and free of fashion-cycle ornament. Claims are concrete and arranged as a readable system.                                                                                 | Make composability visible. A message is a durable bundle with parts, not magic. Explain the product with structural diagrams and plain claims.                                                                       | Minimalism that removes status or makes controls too subtle.                                                                                                 |
| [Are.na](https://www.are.na/)                                                                                                                                                                                                           | Numbered, essay-like sections make a software product feel like a cultural publication. The home page explains a point of view before enumerating features. Its colophon openly identifies its type system.                                             | Use numbered field notes, an explicit product position, and a real colophon. Let the landing page read like a compact field manual rather than a SaaS sales funnel.                                                   | Long philosophical copy inside the operational application.                                                                                                  |
| [earth.nullschool.net](https://earth.nullschool.net/)                                                                                                                                                                                   | A data instrument can be visually arresting because the data is the visual. Modes, source, scale, time, and units are exposed instead of abstracted away.                                                                                               | Make the transmission itself visible: frame count, bundle age, source, verification, hop count, and link quality can become the visual identity.                                                                      | Dense scientific controls shown before the user needs them; animated ambient data that consumes battery.                                                     |
| [NASA Display Standard, Appendix F](https://www.nasa.gov/reference/appendix-f-vol-2/)                                                                                                                                                   | The standard treats displays as human-system interfaces: modes should be sparing, control-to-display relationships obvious, colors consistent, and out-of-capability conditions explicit.                                                               | Every transfer screen identifies the current mode, next action, system limit, and recovery path. Controls sit next to the result they affect.                                                                         | Space-themed decoration, star fields, aerospace iconography, or faux mission-control density.                                                                |
| [NIST Usability Handbook for Public Safety Communications](https://www.nist.gov/publications/usability-handbook-public-safety-communications-ensuring-successful-systems-first)                                                         | It centers user and task analysis for first-responder communications rather than assuming a novel interface will be adopted.                                                                                                                            | Validate the flows with stressed, distracted users; document task completion, error recovery, glove/one-hand constraints, and environmental conditions.                                                               | Calling the product "first-responder ready" before representative field evaluation.                                                                          |
| [OASIS Common Alerting Protocol 1.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.html)                                                                                                                                      | CAP separates urgency, severity, and certainty; it also carries source, identifier, instructions, area, and related-message semantics.                                                                                                                  | Present urgency, severity, and certainty as separate labeled facts. Make source and instructions prominent. Use CAP-inspired language while clearly stating the MVP is not CAP compliant.                             | Reducing all alert meaning to one red/yellow/green badge.                                                                                                    |
| [USWDS Site Alert](https://designsystem.digital.gov/components/site-alert/) and [Alert](https://designsystem.digital.gov/components/alert/)                                                                                             | Emergency information is consistent, concise, context-specific, and accessible. USWDS explicitly warns that overusing bright red or orange can create fear or panic.                                                                                    | Reserve emergency treatment for immediate conditions. Start alert copy with its type; pair color with text and icon. Use `role="alert"` only when interruption is warranted and `role="status"` for advisory changes. | Stacks of banners, permanently red interfaces, or alerts used as decoration.                                                                                 |
| [GOV.UK accessibility strategy](https://design-system.service.gov.uk/accessibility/accessibility-strategy/) and [notification banner](https://design-system.service.gov.uk/components/notification-banner/)                             | Progressive enhancement, semantic HTML, visible focus, restrained banners, and predictable placement make services resilient.                                                                                                                           | Essential content remains meaningful without animation and survives partial JavaScript failure. Use one notification region, placed consistently, with a conspicuous focus state.                                     | Borrowing the GOV.UK visual identity or crown-service tone.                                                                                                  |
| [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/)                                                                                                                                                                     | Letterforms are intentionally differentiated for readers with low vision; the 2025 Next family expands weights and language support.                                                                                                                    | Use it for body/UI copy where fast recognition matters. Self-host the licensed files so offline use does not depend on a font CDN.                                                                                    | Assuming typeface choice alone makes the interface accessible.                                                                                               |

## What the references collectively say

### 1. Originality comes from a point of view, not a bag of effects

Daylight, Teenage Engineering, Are.na, and Igloo are memorable for different reasons, but each has a single authored premise. LuxLink's premise is **a message is a physical object with custody**. The design should repeatedly express that idea through:

- bundle labels;
- relay stamps;
- visible hops;
- sender fingerprints;
- age and expiry marks;
- a sequence line that grows as devices carry the bundle;
- a deliberately physical start/stop broadcast action.

Adding blobs, mesh gradients, floating cards, 3D phones, chat bubbles, or a decorative particle field would dilute that premise.

### 2. The operational product should look quieter as risk rises

Common startup design makes emergencies louder through more red, glow, shake, and motion. Public-safety guidance suggests the opposite discipline. LuxLink should remove secondary actions, shorten language, and increase spatial clarity when urgency rises. Red is a scarce semantic resource, never a background theme.

### 3. Technical truth can be the visual system

The strongest distinctive material is already in the product:

- packet sequence and checksum;
- source signature state;
- incident identifier;
- hop count and custody path;
- transfer progress and dropped-frame recovery;
- offline-cache readiness;
- bundle age and expiry.

Expose these selectively. A large `03/11` frame count or `VERIFIED / KEY ...9A7C` stamp is more ownable than a generic success checkmark.

### 4. Marketing and mission surfaces have different motion budgets

The website may use restrained scroll reveals and a one-time relay-line sequence. The application may only animate to explain state. Broadcast frames are functional content and receive their own safety controls; decorative movement must stop during camera or screen transmission.

## Proposed visual territory: Signal Ledger

**Signal Ledger** combines four sources without imitating any one of them:

1. **Civic forms:** ruled regions, serial numbers, stamps, issue times, plain instructions.
2. **Field equipment:** high-contrast labels, exposed states, tactile rectangular controls, calibration marks.
3. **Editorial publishing:** asymmetric headlines, narrow notes, numbered sections, generous empty space.
4. **Optical transfer:** registration corners, frame ticks, scan windows, and a custody line.

The core brand device is the **relay trace**: a thin rule connecting square registration nodes, with each successful hop adding a dated node. It is not a network graph, blockchain chain, QR code, Wi-Fi glyph, or lightning bolt.

## Anti-moodboard: patterns rejected

| Pattern                       | Why it is rejected                                                                | Replacement                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Purple/blue aurora gradient   | Instantly reads as undifferentiated AI software and performs poorly in sunlight.  | Warm service-paper canvas, black ink, one signal-orange action.                                |
| Glass cards and backdrop blur | Reduces edge clarity, raises GPU cost, and implies decorative depth.              | Opaque panels, rule lines, slight paper-offset only on marketing artifacts.                    |
| Hero with floating 3D devices | Says nothing unique about custody or relaying.                                    | A flat, diagrammatic relay trace between real device silhouettes or photographed hands.        |
| Dashboard of equal cards      | Hides priority and encourages feature-first hierarchy.                            | One primary task rail plus a chronological bundle ledger.                                      |
| Chat interface                | Suggests live bidirectional connectivity that the product does not provide.       | Signed bundle composer and custody log.                                                        |
| Cyberpunk terminal            | Romanticizes crisis, lowers readability, and overclaims technical sophistication. | Contemporary civic instrument with legible sans and carefully limited mono.                    |
| Constant pulsing/glow         | Competes with optical frames and can create accessibility issues.                 | Static state plus one localized progress sweep.                                                |
| Pills everywhere              | Makes controls and metadata visually interchangeable.                             | Rectangular controls; capsule only for a compact removable filter.                             |
| Red as brand color            | Makes routine operation feel dangerous and leaves no emergency escalation.        | Signal orange for action; red only for danger, invalid signature, and destructive consequence. |
| Fake map backdrop             | Implies location/network capability before it exists.                             | Incident ID, optional coordinates, and clear provenance in a text-first record.                |
| AI assistant persona          | Adds uncertainty and undermines operator trust.                                   | Deterministic guidance: observable condition, suggested correction, explicit limit.            |

## Experience references translated into rules

### Marketing page

- One declarative hero sentence, no rotating headline.
- One original relay visualization above the fold.
- Sections numbered `FIELD NOTE 01`, `02`, etc., but normal sentence case for prose.
- Alternate dense evidence bands with large editorial whitespace.
- Show proof artifacts: actual signed-bundle fields, airplane-mode status, and device handoff.
- Use a short, authored manifesto only once; do not repeat mission copy in feature cards.

### Application

- One dominant task per screen.
- Header always answers: product, incident, readiness, and current mode.
- Persistent low-bandwidth/offline state is text, not an icon alone.
- Verification receives more visual weight than transfer completion.
- Every irreversible or safety-relevant action has a plain-language consequence.
- Advanced metadata is progressive disclosure, not hidden from assistive technology.

## Research-backed safety constraints

- [WCAG 2.2, 2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) requires content not to flash more than three times in a one-second period unless it stays below defined thresholds. Default optical playback to the project's safe 2 fps profile and provide a persistent pause control. This is an implementation constraint, not a medical guarantee.
- Honor `prefers-reduced-motion`; Apple's [Reduced Motion criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria) specifically call out parallax, animated blur, multi-axis and ongoing motion.
- Use alerts sparingly. Apple's [alert guidance](https://developer.apple.com/design/human-interface-guidelines/alerts) recommends direct neutral language and actionable interruptions.
- Color never carries state alone. Alert type, icon, heading, and next action must survive grayscale and forced-color modes.
- Do not claim emergency-service or field readiness before user research and environmental testing described by NIST.

## Originality test for design review

A proposed screen fails review if any of these are true:

1. Removing the logo makes it indistinguishable from an AI chat, crypto wallet, or generic analytics template.
2. The visual hook is a gradient, glow, frosted card, particle system, or stock 3D render.
3. More than one element continuously animates during a task.
4. The screen cannot state its current mode and next action in one glance.
5. Red appears without immediate risk, invalid trust, or destructive consequence.
6. Packet provenance is visually weaker than transfer speed.
7. A screenshot implies capabilities that the MVP does not have.

## Current prototype audit - 2026-09-04

The initial `apps/web` direction was reviewed against this research. It is already much stronger than a generic AI product page; the recommendations below refine it rather than replace it.

### Preserve

- **The public naming split.** `LIGHTMULE` is visible while `LUXLINK REPOSITORY` remains in the colophon.
- **The hero thesis.** `When the network stops, the message walks.` is concrete, ownable, and accurately centers physical custody.
- **Warm paper + black instrument field.** This gives daylight legibility and a credible physical character.
- **Protocol facts as visual material.** Frame rate, signing algorithm, message ID, age, hops, size, and signature make the technology visible.
- **The honest boundary.** `Not a replacement for emergency networks` and the simulation note are unusually good hackathon communication.
- **Hard borders and offset shadow.** These feel constructed rather than template-generated when used sparingly.

### Refine before treating the prototype as the design-system reference

| Current choice                                 | Refinement                                                                                                 | Reason                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Continuous orange marquee                      | Replace with a static evidence rail, or run the text once only on the marketing page                       | Continuous motion is decorative, competes with the optical concept, and contradicts the product's operational-quiet rule.                    |
| Acid green `#D9FF43` for verified state        | Use the verified teal token                                                                                | A fourth accent pushes the console toward cyberpunk equipment and weakens the semantic palette.                                              |
| Cyan `#007C8B` for normal text                 | Darken to `#006B58` on paper, or reserve the brighter cyan for large non-text link-quality graphics        | The current cyan is approximately 4.29:1 on the current paper background, below the 4.5:1 WCAG AA threshold for normal text.                 |
| Cyan status dot with glow                      | Remove the glow; pair a square state shape with `Ready without network`                                    | Glow is decorative and the circular light suggests generic live connectivity.                                                                |
| Full-page graph-paper background               | Limit the grid to diagrams, camera calibration, and technical evidence bands                               | A grid everywhere becomes visual noise and reads as a familiar "technical startup" shortcut.                                                 |
| Circular reticle + rotating core               | Use rectangular registration corners and the relay trace; animate once or only when explaining acquisition | Radar/scope imagery implies radio sensing and militarizes the tone. Continuous stepped rotation is also unnecessary.                         |
| Avenir/Georgia/SF Mono stack                   | Self-host the documented Barlow Condensed, Atkinson Hyperlegible Next, and IBM Plex Mono subset            | The existing stack is competent but platform-dependent and does not create a consistent, offline-capable identity.                           |
| `VERIFIED AT EVERY HOP`                        | Say `SOURCE SIGNATURE SURVIVES EVERY HOP`                                                                  | Relays can verify the original signature, but that phrase should not imply every carrier identity or custody event is independently trusted. |
| `0 RADIO runtime dependency`                   | Say `NO RF OR NETWORK TRANSPORT AFTER SETUP`                                                               | The revised phrase states the actual protocol boundary and preserves the important preloading caveat.                                        |
| Atlanta coordinates in the page rail           | Label the entire scenario `SIMULATION / ATLANTA`, or replace with an incident-only value                   | Unqualified real coordinates can make a demonstration look like a live deployment.                                                           |
| Whole transfer console as `aria-live="polite"` | Give only the concise current-state text a polite live region                                              | Re-rendering a container with steps, buttons, and notes may produce verbose or inconsistent announcements.                                   |
| Round progress/status nodes                    | Apply the semantic shape system: square verified, diamond unverified, open circle pending, triangle danger | Shape redundancy makes status survive grayscale and color-vision differences.                                                                |

### Direction verdict

**Keep the current direction.** It already expresses field instrument x civic infrastructure and avoids the most common AI-dashboard patterns. The main risk is adding one flourish too many. Removing the marquee, acid accent, ambient grid, and continuous reticle motion will make the work feel more authored, not less. The operational app should be quieter than the marketing prototype.

## Source index

Primary and original sources are preferred:

- [NASA Human Integration Design Handbook - Display Standard](https://www.nasa.gov/reference/appendix-f-vol-2/)
- [NIST Handbook 161](https://doi.org/10.6028/NIST.HB.161)
- [OASIS CAP 1.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.html)
- [USWDS Alert](https://designsystem.digital.gov/components/alert/)
- [USWDS Site Alert](https://designsystem.digital.gov/components/site-alert/)
- [GOV.UK accessibility strategy](https://design-system.service.gov.uk/accessibility/accessibility-strategy/)
- [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Apple Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- [Apple Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria)
- [Daylight Computer](https://daylightcomputer.com/)
- [Daylight case study by Basement](https://basement.studio/showcase/daylight-simplicity-in-motion)
- [Teenage Engineering](https://teenage.engineering/)
- [Igloo Inc.](https://www.igloo.inc/)
- [Vitsoe](https://www.vitsoe.com/us)
- [Are.na](https://www.are.na/)
- [earth.nullschool.net](https://earth.nullschool.net/)
- [Braille Institute: Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/)
- [IBM Plex typeface and licensing](https://www.ibm.com/design/language/typography/typeface/)
- [Barlow source and OFL](https://github.com/jpt/barlow)
