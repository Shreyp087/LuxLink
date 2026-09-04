# Architecture decision records

ADRs capture durable decisions, context, trade-offs, and consequences. They are not design proposals after the fact.

## Process

1. Copy `0000-template.md` to the next zero-padded number and a short kebab-case title.
2. Open it as `Proposed` before or with the implementation pull request.
3. Request the owners of affected boundaries.
4. Merge as `Accepted`, or record `Rejected` with the reason.
5. Never rewrite accepted history. A new ADR supersedes an old one and links both directions.

Valid statuses are `Proposed`, `Accepted`, `Rejected`, `Deprecated`, and `Superseded by ADR-NNNN`.

## Index

| ADR                                | Status   | Decision                                       |
| ---------------------------------- | -------- | ---------------------------------------------- |
| [0001](0001-monorepo-toolchain.md) | Accepted | TypeScript/pnpm/Turborepo engineering baseline |
