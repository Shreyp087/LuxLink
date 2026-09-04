# ADR-0001: TypeScript monorepo toolchain

- Status: Accepted
- Date: 2026-09-04
- Owners: @Shreyp087
- Deciders: @Shreyp087
- Technical area: tooling

## Context

LuxLink needs an independently testable browser application and protocol core, fast local feedback, reproducible CI, and clear ownership boundaries. The initial repository has no legacy toolchain or compatibility constraints.

## Decision drivers

- Keep protocol logic portable and independent of the UI framework.
- Support parallel package development without duplicating configuration.
- Use widely understood tools suitable for a small team.
- Make browser and offline journeys first-class tests.
- Pin the runtime and package manager for reproducibility.

## Considered options

1. pnpm workspaces with Turborepo, TypeScript, Vitest, and Playwright.
2. npm workspaces with custom scripts.
3. A single application package with protocol code colocated in UI source.

## Decision

Use Node.js 24, pnpm workspaces, and Turborepo for task orchestration. TypeScript runs in strict mode from a shared base configuration. Vitest is the unit/integration runner and Playwright owns cross-browser user journeys. ESLint and Prettier provide static and mechanical consistency. Conventional Commits describe repository history.

The root package is private. Deployable applications live under `apps/*`; reusable packages live under `packages/*`. A committed pnpm lockfile is the dependency source of truth.

## Consequences

### Positive

- Packages can be developed and tested independently with one repository gate.
- Task caching improves feedback without hiding dependency order.
- Protocol code has an enforceable path away from browser and framework coupling.
- Browser behavior, including offline journeys, has a dedicated test tool.

### Negative

- Contributors must install the pinned Node/pnpm versions.
- Workspace scripts and package names must follow repository conventions.
- Turborepo adds configuration and a cache that occasionally needs diagnosis.
- WebKit CI increases test time.

### Neutral or deferred

- The web framework and hosting provider are separate decisions.
- A shared UI package is optional until reuse is demonstrated.
- Automated deployment remains intentionally undefined.

## Validation

Revisit if clean CI exceeds 15 minutes, task caching becomes unreliable, protocol tests require a browser, or multiple packages cannot consume the base configuration without overrides.

## Rollout and recovery

The repository begins with this toolchain, so no migration is required. Each package supplies the scripts expected by `turbo.json`. Removing Turborepo remains possible because package scripts are directly executable.

## Security, privacy, and accessibility

The lockfile, Dependabot, dependency review, CodeQL, and least-privilege workflows reduce supply-chain risk. Playwright includes mobile Chromium and WebKit projects so critical accessibility and offline journeys are not validated in one engine only.

## Links

- Pull request: Initial engineering foundation
- Issue or research: `docs/engineering/architecture.md`
- Supersedes: None
- Superseded by: None
