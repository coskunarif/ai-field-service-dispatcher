# Refactoring Parity Ledger

## Target

module: null # populated during discovery, or given by the user
state: PROFILE # PROFILE | BUILD | VERIFY | JUDGE | DONE
rejections: 0
budget: 3

## Baseline Metrics

- Warning Count: null
- Execution Time / Latency: null
- Bundle / File Size: null

## Parity Assertions

- [ ] Happy path outputs match
- [ ] Error response codes match
- [ ] Empty/Null inputs match

## Backlog

- **Extract Monolithic HTML Templates in server.js**: Extract massive inline HTML template strings (like `renderSandboxPage`, `renderSetupPage`, `renderAppPage`) to dedicated `.html` files to reduce file size from 214KB to under 30KB.
- **Externalize Hardcoded Database Secrets in api/migrate.js**: Replace the hardcoded `postgresql://` connection URI with an environment variable configuration (e.g. `process.env.DATABASE_URL`) to prevent credential leakage.
- **Deduplicate Logic between server.js and find-social-leads.mjs**: Extract shared utilities `computeIntentScore` and `draftSuggestedReply` into a shared library module (e.g., `lib/utils.js`) to eliminate code redundancy and prevent behavioral drift.
