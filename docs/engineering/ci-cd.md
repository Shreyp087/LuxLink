# Continuous integration and delivery

## Pull-request gates

The CI workflow installs the committed lockfile and runs formatting, lint, strict type checks, unit tests, builds, and Playwright journeys. Failed browser runs upload traces, screenshots, and videos for seven days.

The security workflow performs dependency review on pull requests and CodeQL analysis on pushes and a weekly schedule. Dependabot proposes bounded dependency and GitHub Actions updates.

## Least privilege

Workflow permissions default to `contents: read`. Jobs request additional permissions only where required. New third-party actions must be pinned to a reviewed major version at minimum; security-critical release automation should pin an immutable commit SHA.

Secrets are never exposed to pull requests from forks. Build and test jobs do not receive deployment credentials.

## Branch protection to configure in GitHub

Repository administrators should protect `main` with:

- pull requests required;
- at least one approval and CODEOWNERS review;
- dismissal of stale approvals after new changes;
- required `Quality gates`, `Browser journeys`, and `CodeQL` checks;
- conversation resolution;
- linear history;
- blocked force-pushes and deletions;
- administrator enforcement where practical.

These settings live in GitHub and cannot be guaranteed by files in the repository.

## Delivery model

Deployment is intentionally not automated until the hosting target, environment ownership, provenance, rollback, and offline update behavior have ADRs. A future release pipeline should build once, verify the exact artifact, attach provenance, deploy by immutable digest, run smoke checks, and retain an immediate rollback.

Never deploy a service-worker change without testing upgrade from the currently deployed version. Offline users can remain on older protocol/UI versions for extended periods, so compatibility must be designed rather than assumed.
