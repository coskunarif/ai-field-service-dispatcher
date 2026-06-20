task: Increase landing page search click-through rates and average search positions.              tier: T1   creativity: 0.5
state: TESTER                   budget: repairs 0/2
branch: asf/20260620-seo-ctr          checkpoint: none
caps: agents,ui,web,human

## Log
- 2026-06-20 Conductor: starting fresh run. Triggered Scout.
- 2026-06-20 Conductor: Scout finished. Advanced to ARCHITECT phase. Output path: dogfood-output/scout-20260620/, elapsed time: 11m
- 2026-06-20 Conductor: Architect completed SPEC.md. Advanced to BUILD phase. Output path: SPEC.md, elapsed time: 1m
- 2026-06-20 Conductor: Builder completed S-1 and S-2, and disputed tests/seo_conversion.spec.js. Advanced to TESTER phase for test amendment. Output path: RUN.md, elapsed time: 12m

## Task
- **Objective**: Increase landing page search click-through rates and average search positions.
- **Metric it moves**: Search click-through rate (CTR) and average Search Console position.
- **Why now**: The local SEO/GEO audit flagged 10 trade landing pages with meta descriptions outside the optimal 120-180 character standard, hurting search result click conversion.
- **Runner-up**: Increase wizard setup completion rate for waitlist users.

## Verdict
- tests/seo_conversion.spec.js: targets mapping uses outdated meta descriptions; contradicts the optimized Interface Contract in SPEC.md.

## Done
- S-1: Implement configurable overrides and ignore rules support in scripts/gainhelm-seo-geo-audit.mjs and create seo-audit-config.json.
- S-2: Update the meta descriptions and JSON-LD structured data blocks inside all 9 target landing page HTML files. (DISPUTED tests/seo_conversion.spec.js as it uses outdated meta descriptions).
