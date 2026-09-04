# Team operating model

LuxLink uses a small, virtual product organization: leads operate independently inside explicit boundaries, then integrate through contracts, reviews, and evidence. A title grants accountability, not permission to bypass review.

## Leads and ownership

| Lead                | Accountable for                                                                     | Primary paths                                     | Required partners                                 |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Platform / SDE      | Toolchain, CI, repository policy, releases, developer experience                    | root configs, `.github/**`, `docs/engineering/**` | Every lead for cross-cutting changes              |
| Protocol & Security | Wire/domain schemas, framing/reconstruction, verification, threat controls          | `packages/protocol/**`, protocol/security ADRs    | Web for adapters; Platform for supply chain       |
| Product Design      | Research, information architecture, interaction states, visual/accessibility system | `docs/design/**`, approved design artifacts       | Web for feasibility; Protocol for truthful states |
| Web Product         | Browser application, platform adapters, PWA/offline behavior, end-to-end journeys   | `apps/web/**`, `tests/e2e/**`                     | Design for experience; Protocol for contracts     |

One person or agent may cover multiple roles, but the review viewpoints remain distinct. Until GitHub teams exist, `@Shreyp087` is the CODEOWNER for each boundary. Future teams can replace the handle line-by-line without changing the model.

## Independent work contract

Before parallel work begins, every lead publishes:

- owned paths and files that are explicitly out of scope;
- user outcome and measurable acceptance criteria;
- proposed public interfaces, fixtures, and error vocabulary;
- dependencies and decisions needed from another lead;
- verification evidence to hand back.

Leads do not edit another lane to make local work pass. They propose an interface change, provide a failing consumer test or fixture, and ask the owner to accept or revise it. The final integrator resolves version and configuration conflicts; last-writer-wins is not an integration strategy.

## Collaboration flow

```text
research / problem brief
        |
        v
time-bounded RFC (when cross-team or uncertain)
        |
        v
ADR for the durable decision + interface/fixture freeze
        |
        v
independent implementation in owned paths
        |
        v
consumer tests + owner reviews + integrated quality gate
        |
        v
evidence-backed release decision
```

### RFC review

Use an RFC for a proposal that crosses two or more ownership areas, materially changes user behavior, has unresolved alternatives, or needs a short experiment. The author names a driver, reviewers, decision deadline, and validation plan. Reviewers comment from their accountable viewpoint. Silence is not approval.

The driver closes the RFC as accepted, rejected, or withdrawn. Accepted RFCs either lead to an ADR or explicitly explain why the choice is temporary/reversible.

### ADR review

Use an ADR for an accepted, difficult-to-reverse technical or policy decision. The owning lead authors it; every materially affected lead reviews it. Protocol/security decisions require Protocol & Security plus a consuming Web Product review. CI, release, dependency, hosting, and license decisions require Platform review. User-facing safety/accessibility decisions require Product Design review.

An ADR is accepted before the dependent implementation merges. Emergency fixes may merge first only with an owner-recorded follow-up and deadline.

## Interface handoffs

Cross-lane handoffs include executable evidence where possible:

- Protocol supplies versioned fixtures, invalid/tampered fixtures, types, and documented failure codes.
- Design supplies responsive states, focus/keyboard behavior, content, motion/safe-mode rules, and edge cases rather than only ideal screenshots.
- Web supplies adapter capability findings, physical-device results, and consumer tests that exercise public protocol entry points.
- Platform supplies reproducible commands, CI status, artifact provenance, and rollback/recovery instructions.

Interface changes follow producer/consumer sequencing: add compatible producer behavior, update consumers, collect migration evidence, then remove deprecated behavior in a separately reviewed change.

## Decision and escalation rules

- The accountable path owner makes reversible local decisions.
- Cross-boundary decisions require all affected owners; unresolved trade-offs go to the repository owner with written options and evidence.
- Security and accessibility objections block release until resolved or explicitly accepted by the repository owner with documented residual risk.
- No lead may convert a prototype measurement into a general product claim.
- When evidence is missing, reduce the claim or run the test; do not fill the gap with confidence.

## Integration cadence

Keep branches short-lived and integrate interface fixtures early. For each milestone, the final integrator runs the clean repository gate, checks working-tree scope, reconciles ADR/RFC status, and publishes known limitations. A weekly ceremony is unnecessary for a small team; these artifacts and gates are the coordination mechanism.
