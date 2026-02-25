lexguard demo suite

what this includes
1. four full-length fake contracts with distinct compliance issues
2. a quick map of expected violations per contract
3. upload instructions

contracts
1. zenwave-saas-agreement.txt (intentionally risky: residency, consent, retention, breach timing, liability, notice)
2. aurora-nda.txt (mostly ok, one remedies issue)
3. logicore-msa.txt (critical gdpr violations: no dpa, indefinite retention, no 72h breach)
4. cloudbase-saas.txt (cleaner, used for expiry warning demo)

expected issues (high level)
1. zenwave: eu residency conflict, consent missing for third-party sharing, indefinite retention, vague breach timeline, low liability cap, 7-day termination notice
2. aurora: remedies exclude injunctive relief
3. logicore: no dpa, retention indefinite, no breach timeline, unrestricted cross-border processing
4. cloudbase: minimal issues, expiry warning within 90 days if you set expiry to 2026-03-15

how to use
1. upload any file via /upload (paste text or file)
2. run scans on /contracts/[id] or /scan with categories like: gdpr, data privacy, data residency
3. compare output with expected issues above
