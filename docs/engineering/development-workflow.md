# Development workflow

## Repository commands

| Command          | Result                                       |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Runs workspace development tasks in parallel |
| `pnpm build`     | Builds packages in dependency order          |
| `pnpm lint`      | Runs package lint tasks                      |
| `pnpm typecheck` | Runs strict TypeScript checks                |
| `pnpm test:unit` | Runs package unit suites                     |
| `pnpm test:e2e`  | Runs Playwright browser journeys             |
| `pnpm format`    | Applies repository formatting                |
| `pnpm check`     | Runs the local merge gate                    |

Workspace packages implement the relevant `build`, `typecheck`, `test`, and `clean` scripts so Turborepo can schedule them consistently. Repository-wide ESLint runs from the root; packages may add narrower lint commands when they need custom rules.

## Branches and commits

`main` is protected and releasable. Use short-lived branches named `<type>/<summary>`, such as `feat/offline-inbox` or `fix/frame-bounds`. Rebase or merge `main` before final review; do not rewrite a branch another contributor is actively using without coordination.

Commit messages follow Conventional Commits and are checked by the local hook. Commits should be independently understandable and avoid mixing mechanical formatting with behavioral changes.

## Pull requests

Open a draft early for cross-cutting work. The description states the outcome, verification, risk, recovery path, and evidence. UI work includes screenshots for relevant breakpoints and modes. Optical work includes physical-device conditions. Security-sensitive changes explain threat impact.

Merge only after required checks pass and CODEOWNERS review is satisfied. Prefer squash merging to keep `main` legible. The squash title remains a valid Conventional Commit.

## Working with autonomous agents

- Give each agent explicit file ownership and acceptance criteria.
- Agents inspect the worktree before edits and do not overwrite unrelated changes.
- Parallel agents coordinate shared configuration through the platform owner.
- Generated code receives the same tests and review as human-authored code.
- The final owner reconciles interfaces and runs the whole repository gate.

## Environment variables

Copy `.env.example` to `.env.local`. `VITE_` variables are public build inputs and must never contain secrets. New variables require documentation, a safe default, validation at startup, and CI consideration.

## Architecture decisions

Create an ADR before merging a difficult-to-reverse change in protocol shape, cryptography, trust bootstrap, storage schema, deployment, framework, or compatibility policy. Small local decisions belong in code and tests, not ADRs.
