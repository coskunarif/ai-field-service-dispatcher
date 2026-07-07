# BRIEFING — 2026-06-27T15:36:20-07:00

## Mission
Modify `scripts/gainhelm-seo-geo-audit.mjs` to implement robust validation checks and test them.

## 🔒 My Identity
- Archetype: Worker 1 / Implementer
- Roles: implementer, qa, specialist
- Working directory: /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/worker_m1_1
- Original parent: e54a909b-971f-4c9c-a47a-78c624d3423b
- Milestone: Milestone 1 - SEO/GEO Audit Enhancements

## 🔒 Key Constraints
- Modify automated SEO/GEO audit script `scripts/gainhelm-seo-geo-audit.mjs`.
- Genuine implementation (no cheating or hardcoding).
- Must exit with code 1 if failures occur and print clear diagnostic messages.
- Must verify that it reports the expected 16 (or 14-16) validation errors.

## Current Parent
- Conversation ID: e54a909b-971f-4c9c-a47a-78c624d3423b
- Updated: not yet

## Task Summary
- **What to build**: Modifying `scripts/gainhelm-seo-geo-audit.mjs` to add HTML entity decoding, route/trade page detection, title match checks, and FAQPage JSON-LD structural and trade keyword verification.
- **Success criteria**: Validation logic works correctly, exits with status code 1 on errors, reports 14-16 validation errors on current codebase, command runs successfully.
- **Interface contracts**: `scripts/gainhelm-seo-geo-audit.mjs`
- **Code layout**: Root directory scripts

## Key Decisions Made
- Implemented robust HTML entity decoding helper.
- Built isTargetPage selector for target/landing pages using the exact requested route logic.
- Implemented getPageTradeKeywords to handle the `/`, key routes, and trade segment paths accurately.
- Used a general recursive JSON-LD FAQPage collector function `findFAQPages`.
- Integrated everything into the main route audit loop, printing failures and exiting with code 1.

## Change Tracker
- **Files modified**: `scripts/gainhelm-seo-geo-audit.mjs`
- **Build status**: Verified that the audit script runs and produces exactly 16 expected failures, and Playwright test fails exactly on `[AC-2]` because landing pages are not yet fixed.
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (script runs and fails with correct exit status and diagnostic message)
- **Lint status**: 0 violations (no custom linter detected)
- **Tests added/modified**: Integrated test verification via `npm run audit:seo-geo` and Playwright `tests/seo_conversion.spec.js`

## Loaded Skills
- None

## Artifact Index
- `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/worker_m1_1/handoff.md` — Final handoff report
