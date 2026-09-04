# Security policy

## Supported versions

LuxLink is pre-1.0 software. Only the latest commit on `main` is supported until versioned releases begin. The project is a prototype and must not be treated as a certified emergency, medical, or public-safety system.

## Report a vulnerability privately

Use GitHub's [private vulnerability reporting](https://github.com/Shreyp087/LuxLink/security/advisories/new). Do not include secrets or real incident data in the report. If private reporting is unavailable, contact the repository owner through their GitHub profile and ask for a private reporting channel without disclosing the vulnerability publicly.

Please include:

- affected commit or version;
- impact and attacker assumptions;
- minimal reproduction using synthetic data;
- suggested mitigation, if known;
- whether the issue is already public.

We target an acknowledgment within three business days. Remediation timing depends on severity and available maintainer capacity. We will coordinate disclosure and credit unless anonymity is requested.

## High-priority classes

Reports are especially valuable when they involve:

- signature or integrity verification bypass;
- replay, expiry, deduplication, or trust-state confusion;
- script injection or unsafe rendering from a decoded bundle;
- unintended disclosure of stored payloads or key material;
- storage persistence or deletion failures;
- denial of service from malformed or oversized optical frames;
- dependency or build-pipeline compromise.

## Scope and safety

Test only accounts, devices, and data you own or are authorized to use. Do not disrupt services, access another person's data, perform social engineering, or use real emergency traffic. Good-faith research within these boundaries will not be pursued by the project maintainers.

## Security limitations

- Line of sight is not confidentiality; another camera may record a transmission.
- A valid signature proves control of a key, not a person's real-world identity.
- Browser storage security depends on the device, browser, operating system, and lock state.
- Offline-first means the application must already be installed or cached before connectivity is lost.
- No prototype result establishes fitness for life-safety use.
