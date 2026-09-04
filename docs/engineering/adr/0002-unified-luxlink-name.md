# ADR 0002: Use LuxLink as the single project name

- Status: accepted
- Date: 2026-09-04

## Context

Early exploration used two different names. That split identity leaked into interface copy, package
descriptions, protocol version strings, browser storage, and optical frame prefixes. Keeping two
names would confuse judges, users, contributors, and future compatibility work.

## Decision

Use **LuxLink** everywhere:

- product and Devpost name;
- GitHub repository and documentation;
- `@luxlink` package namespace;
- `.luxlink` exports and local browser storage;
- `luxlink.*.v1` protocol identifiers;
- `LX1.` compact optical frame prefix.

No former-name compatibility layer is retained. The project is pre-release, so this is the safest
point to make the intentional breaking cleanup. Legal or trademark clearance remains a separate
pre-commercial requirement.

## Consequences

- The product has one searchable, explainable identity.
- Previously generated pre-release packets, frame packs, and browser storage that used the old
  identifiers are intentionally incompatible.
- Future renames must use an explicit protocol migration plan rather than another global alias.
