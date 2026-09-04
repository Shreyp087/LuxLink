# LuxLink engineering handbook

This handbook is the shared operating agreement for engineers and autonomous contributors. Product requirements may change quickly; these engineering invariants should change only through review.

## Start here

| Document                                        | Purpose                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| [Architecture](architecture.md)                 | System boundaries, dependencies, runtime model, and quality attributes |
| [Development workflow](development-workflow.md) | Local setup, branches, commits, reviews, and repository commands       |
| [Testing strategy](testing-strategy.md)         | Test layers, device evidence, release gates, and non-goals             |
| [CI/CD](ci-cd.md)                               | Required automation, permissions, artifacts, and deployment principles |
| [Dependency policy](dependency-policy.md)       | How packages are selected, introduced, pinned, and retired             |
| [Definition of done](definition-of-done.md)     | The completion bar for production-quality work                         |
| [Team operating model](team-operating-model.md) | Independent ownership, interface contracts, handoffs, and review flow  |
| [ADRs](adr/README.md)                           | How durable architecture decisions are recorded                        |
| [RFCs](rfc/README.md)                           | How time-bounded cross-team proposals are reviewed                     |

Project-wide contribution and vulnerability-reporting policies live in `CONTRIBUTING.md` and `SECURITY.md`.

## Non-negotiable principles

1. **Offline behavior is a tested capability.** It is not inferred from the absence of an API call.
2. **Untrusted input stays untrusted.** A visually received payload crosses a security boundary.
3. **Safety beats throughput.** A slower, accessible transmission mode is the baseline.
4. **Evidence accompanies claims.** Performance numbers name hardware, browser, conditions, payload, and sample size.
5. **Compatibility is explicit.** Version envelopes and migrations are designed before incompatible protocol changes merge.
6. **The browser is an adapter.** Domain and protocol logic remain deterministic and portable.
7. **Dependencies earn their place.** Minimize runtime code and eliminate CDN dependencies.
