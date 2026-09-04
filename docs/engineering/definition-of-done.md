# Definition of done

A change is done only when every applicable statement is true.

## Behavior

- Acceptance criteria are observable and met.
- Empty, loading, success, recoverable failure, terminal failure, cancellation, and unsupported states are deliberate.
- Offline, reload, and browser lifecycle effects are understood.
- Compatibility and migration behavior are documented for persisted or transmitted data.

## Quality

- Relevant tests exist at the cheapest effective layers.
- `pnpm check` passes from a clean installation.
- User-journey changes pass Playwright; optical changes have recorded physical-device evidence.
- Performance and reliability claims state conditions and include failures.

## Security, privacy, and accessibility

- Inputs are bounded and treated according to their trust level.
- No secrets or personal/incident data appear in code, fixtures, logs, screenshots, or analytics.
- Keyboard, focus, semantic labeling, contrast, zoom, and reduced-motion/safe-display behavior are verified.
- Threat-model or protocol-impacting changes receive owner review.

## Operations and documentation

- Logs and errors are actionable without leaking payloads.
- New environment variables and dependencies are documented.
- Durable architecture decisions have an accepted ADR.
- The pull request includes evidence and a safe recovery path.
