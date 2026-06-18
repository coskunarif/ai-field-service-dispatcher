task: Increase organic search clicks and lead conversion rates for niche landing pages. Move CTR and waitlist signups. Why now: high search impressions but low clicks on trades. Runner-up: Increase homepage engagement and conversion rates.              tier: T2   creativity: 0.5
state: TESTER                budget: repairs 0/3
branch: asf/20260618-seo-conversion          checkpoint: none
caps: agents,web,human

## Log
- 2026-06-18 Conductor: starting fresh run for SEO/GEO improvement, initialized in SCOUT phase.
- 2026-06-18 Conductor: Scout finished with winner. Advanced to ARCHITECT phase.
- 2026-06-18 Conductor: Architect completed SPEC.md. Advanced to TESTER phase.
- 2026-06-18 Conductor: Tester completed tests (red baseline). Advanced to BUILD phase.
- 2026-06-18 Conductor: Builder disputed test description length check. Ruled test wrong; Tester sent to amend tests.
## Verdict
Disputed: seo_conversion.spec.js [AC-1] / [AC-2] (Audit Script) - Target descriptions specified in SPEC.md are under 120 characters (90-109 chars) but tests assert they must be >= 120 characters, causing contradictory failures.
## Done
