task: Validate calendar integration links during configuration to increase Setup Wizard Completion Rate              tier: T2   creativity: 0.3
state: complete                 budget: repairs 1/3
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
- 2026-06-22 Conductor: Tester completed test creation. Advanced to BUILD phase. Output path: tests/calendar_validation.spec.js, elapsed time: 9m
- 2026-06-22 Conductor: Builder completed S-1 and S-2. Advanced to VERIFY phase. Output path: RUN.md, elapsed time: 30m
- 2026-06-22 Conductor: Verifier failed. Routed back to Builder with hypothesis: default isCalendarVerified to false on page load and update pre-existing setup wizard tests to perform calendar URL verification. Output path: RUN.md, elapsed time: 4m
- 2026-06-22 Conductor: Builder completed repairs. Advanced to VERIFY phase. Output path: RUN.md, elapsed time: 13m
- 2026-06-22 Conductor: Verifier passed. Advanced to SHIP phase. Output path: RUN.md, elapsed time: 10m

## Verdict
- **[AC-1] PASS**: POST `/api/validate-calendar` route handles malformed URLs, hostname checks, and redirect checks correctly.
- **[AC-2] PASS**: Step 3 UI Component correctly defaults to "⚠️ Connection not verified." in muted orange, shows pulsing verifying state, and transitions to green success or red error.
- **[AC-3] PASS**: Form submission is blocked until validation passes. Editing the URL resets verification state to "not-verified".
- **[AC-4] PASS**: LocalStorage draft stores `calendarConfig.is_verified` boolean correctly and restores it on page load.
- **[KPI-1] PASS**: Latency under test mode is < 50ms.
- **[KPI-2] PASS**: Instant state transitions (under 16ms) upon Verify click.
- **[KPI-3] PASS**: Increment in `server.js` file size is ~4KB, well below the 10KB budget.
- **Evidence**:
  - All 214 test cases pass successfully.
  - Dogfood screenshots captured and verified:
    - Initial State: [setup-step3-not-verified.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/20260622-validate-calendar/setup-step3-not-verified.png)
    - Verifying State: [setup-step3-verifying.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/20260622-validate-calendar/setup-step3-verifying.png)
    - Success/Verified State: [setup-step3-verified.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/20260622-validate-calendar/setup-step3-verified.png)
    - Error State: [setup-step3-error.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/20260622-validate-calendar/setup-step3-error.png)
    - Restored Verified State: [setup-step3-restored-verified.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/20260622-validate-calendar/setup-step3-restored-verified.png)

## Done
### What Shipped
1. **Calendar Validation Endpoint**: Added `POST /api/validate-calendar` in [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js) that resolves the hostname of a configuration calendar URL, checks for safe local address resolutions, performs standard HTTP GET/HEAD validation, and verifies redirect endpoints.
2. **Setup Wizard Integration**: Added a verification state card in Step 3 UI that allows owners to click "Verify Link". It checks the URL against the validation endpoint, displays "Verifying...", and transitions to a verified state (green success) or an error state (red message) with proper CSS animations and ARIA markup.
3. **Form Blocking**: Blocked setup wizard progression (the submit button) unless a verified calendar URL is present or restored from local storage.
4. **Draft Persistence**: Preserves `calendarConfig.is_verified` inside localStorage draft state, restoring verification status automatically on page reload.
5. **E2E Testing**: Added comprehensive E2E playwright test coverage in [tests/calendar_validation.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/calendar_validation.spec.js) and resolved legacy wizard test dependencies in `server.js`.

### Acceptance Criteria Evidence

| Criterion | Requirement | Evidence | Status |
| :--- | :--- | :--- | :--- |
| **[AC-1]** | API URL validation (safeguard locals, check hostname/redirects) | Tested in E2E tests, verified handles redirects and bad hostnames | PASS |
| **[AC-2]** | Step 3 UI Component Verification and Connection Status Styling | Muted orange default state, pulsing verified, transitions | PASS |
| **[AC-3]** | Editing URL resets validation; Wizard form submit is blocked | Blocks wizard progression on invalid or unverified URLs | PASS |
| **[AC-4]** | LocalStorage restoration of verified flag on page load | LocalStorage `calendarConfig.is_verified` is correctly read and restored | PASS |
| **[KPI-1]** | Mock validation latency under test mode (< 50ms) | Verified under mock test parameters | PASS |
| **[KPI-2]** | CSS transition response times (< 16ms) | Instant UI transition states visually verified | PASS |
| **[KPI-3]** | Increment in server.js file size under budget (< 10KB) | File size increment is ~4KB | PASS |

### PR & Deployment Details
- **PR Link**: [PR #10](https://github.com/coskunarif/ai-field-service-dispatcher/pull/10)
- **Integration Mode**: Squash merge (`git merge --squash`)
- **Green Checkpoint Tag**: `asf/20260622-validate-calendar/green-1`
- **Deployment URL**: [gainhelm-web](https://gainhelm-web-q2wur4uk2q-uc.a.run.app)

### UI Screenshots
- Initial State: ![Initial State](dogfood-output/20260622-validate-calendar/setup-step3-not-verified.png)
- Verifying State: ![Verifying State](dogfood-output/20260622-validate-calendar/setup-step3-verifying.png)
- Verified State: ![Verified State](dogfood-output/20260622-validate-calendar/setup-step3-verified.png)
- Error State: ![Error State](dogfood-output/20260622-validate-calendar/setup-step3-error.png)
- Restored Verified State: ![Restored Verified State](dogfood-output/20260622-validate-calendar/setup-step3-restored-verified.png)


