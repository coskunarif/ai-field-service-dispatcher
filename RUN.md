task: we still dont have enough CTA in google search console, and no one is waitlist. we have to get more traction.              tier: T2   creativity: 0.5
state: VERIFY               budget: repairs 0/3
branch: asf/20260619-waitlist-conversion          checkpoint: none
caps: agents,ui,web,human

## Task
- **Objective**: Increase landing page waitlist conversion rate and search console clicks.
- **Metric**: Waitlist Signups (Conversion Rate) and GSC Click Volume.
- **Why now**: Search Console shows solid page 2/3 impressions for trade-specific terms but zero conversions due to weak above-fold call-to-actions, missing inline forms on core landing pages, and late-stage waitlist forms.
- **Runner-up**: Improve search console average rankings for tablet and dispatcher script query groups.

## Log
- 2026-06-19 Conductor: starting fresh run for traction and waitlist optimization. Triggered Scout.
- 2026-06-19 Scout: spawned background dev server on port 3005 (task-98).
- 2026-06-19 Scout: walked main flows, verified baseline playwright tests green, and captured dogfood screenshot evidence. Stopped server task-98.
- 2026-06-19 Conductor: Scout finished. Advanced to ARCHITECT phase. Output path: dogfood-output/scout-20260619/, elapsed time: 5m
- 2026-06-19 Conductor: Architect completed SPEC.md and addressed objections. Advanced to TESTER phase. Output path: SPEC.md, elapsed time: 4m
- 2026-06-19 Conductor: Tester completed tests (12 new tests failing, red baseline). Advanced to BUILD phase. Output path: tests/ (various), elapsed time: 3m
- 2026-06-19 Conductor: Builder completed all slices. Advanced to VERIFY phase. Output path: asf/20260619-waitlist-conversion branch, elapsed time: 24m
## Verdict
## Done
