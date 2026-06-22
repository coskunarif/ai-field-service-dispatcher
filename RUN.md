task: Validate calendar integration links during configuration to increase Setup Wizard Completion Rate              tier: T2   creativity: 0.5
state: TESTER                budget: repairs 0/3
branch: asf/20260622-validate-calendar          checkpoint: none
caps: agents,ui,web,human

## Task
- **Objective**: Validate calendar integration links during configuration to increase Setup Wizard Completion Rate (SWCR)
- **Metric**: Setup Wizard Completion Rate (SWCR)
- **Why Now**: Owners often save invalid or restricted calendar URLs in Step 3, leading to silent failures on dispatch notifications later. Verification during wizard onboarding ensures active integration.
- **Runner-up**: Enable custom trade entries in setup wizard to increase Setup Wizard Completion Rate (SWCR)

## Log
- 2026-06-22 Conductor: starting fresh run. Triggered Scout.
- 2026-06-22 Conductor: Scout finished. Advanced to ARCHITECT phase. Output path: dogfood-output/scout-20260622-run2/, elapsed time: 10m
- 2026-06-22 Conductor: Architect completed SPEC.md. Advanced to TESTER phase. Output path: SPEC.md, elapsed time: 22m

## Verdict

## Done

