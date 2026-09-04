# Contributing to LuxLink

LuxLink is an offline-first communication system. Changes must be reviewable, reproducible, and honest about what was actually tested. A polished demo is not evidence of field reliability.

## Prerequisites

- Node.js `24.18.0` (see `.nvmrc`)
- Corepack
- pnpm `11.19.0` (pinned by `packageManager`)
- Git
- A modern Chromium browser; WebKit is required for the full browser test suite

## Bootstrap

```sh
nvm use
corepack enable
pnpm install
cp .env.example .env.local
pnpm check
```

Commit the generated `pnpm-lock.yaml` whenever dependency metadata changes. Never manually edit the lockfile.

## Day-to-day workflow

1. Start from an up-to-date `main` branch.
2. Create a short branch such as `feat/receive-flow` or `fix/replay-detection`.
3. Make the smallest coherent change and add tests with it.
4. Run `pnpm check`. Run `pnpm test:e2e` for a user journey or browser integration change.
5. Open a pull request using the repository template and attach evidence.
6. Address review comments with new commits. Squash only when merging.

Use [Conventional Commits](https://www.conventionalcommits.org/) with one of the allowed scopes:

```text
feat(app): add transfer progress recovery
fix(protocol): reject expired bundles
docs(security): document trust bootstrap limitation
```

Breaking changes use `!`, for example `feat(protocol)!: revise bundle envelope`.

## Engineering expectations

- Preserve dependency direction described in `docs/engineering/architecture.md`.
- Keep deterministic domain logic outside UI components and browser adapters.
- Treat incoming optical payloads, camera metadata, URLs, and imported files as hostile.
- Never claim encryption, identity, delivery, range, speed, or reliability that a test does not prove.
- Keep runtime operation independent of a network after the application has been installed and cached.
- Provide a reduced-motion/safe-display path for animated optical output.
- Record durable or difficult-to-reverse decisions as ADRs.

## Pull-request size and review

Prefer changes below roughly 400 non-generated lines. Larger work should be split by independently verifiable behavior. A pull request must not merge with unresolved high-risk review comments, failing required checks, or newly introduced critical/high dependency vulnerabilities.

Protocol, cryptography, trust, storage migration, and accessibility-sensitive changes require explicit owner review. Authors do not approve their own changes when another qualified reviewer is available.

## Testing on physical devices

Camera and display behavior cannot be validated by browser automation alone. Relevant pull requests should record:

- device and operating-system versions;
- browser and version;
- display brightness and approximate distance/angle;
- payload size and encoding profile;
- observed successes, failures, and recovery behavior.

Use synthetic, non-sensitive payloads. Never attach real emergency or personal information to an issue or pull request.

## Reporting security issues

Do not open a public issue. Follow [SECURITY.md](SECURITY.md).
