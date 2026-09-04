# Dependency policy

## Selection

A dependency must provide material value over a small local implementation and have an acceptable license, maintenance history, release cadence, browser impact, and security posture. Prefer platform APIs and narrowly scoped libraries. Production runtime dependencies receive stricter scrutiny than build tooling.

Do not introduce:

- runtime CDN scripts, fonts, styles, or modules;
- packages that evaluate received content as code;
- abandoned cryptography or home-grown cryptographic primitives;
- duplicate libraries for the same capability without a migration plan;
- packages whose terms prevent internal use or the project's eventual chosen distribution model.

## Changes

Use the pnpm workspace catalog for versions shared by multiple packages. Run `pnpm install` to update the lockfile; do not edit it manually. A dependency pull request states the reason, bundle/runtime impact, license, and migration/removal path when non-obvious.

Security updates take priority but still run the complete gate. Suppressions require an owner, rationale, expiry date, and tracking issue.

LuxLink is currently `UNLICENSED`; no public reuse permission has been granted. Adding an open-source license or accepting a dependency whose terms constrain future distribution requires an owner-approved ADR.

## Browser budget

The offline application downloads its complete trusted runtime before an outage. Every production byte affects install reliability. Large dependencies require a measured bundle delta and evidence that tree-shaking/code-splitting works as expected.

## Removal

Remove unused packages, stale resolutions, obsolete polyfills, and temporary forks promptly. Dependabot is configured for bounded update volume so review quality is not traded for alert closure.
