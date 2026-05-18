# Gainhelm UI runtime verification

Use this when validating gainhelm.com UI/UX changes in `ai-field-service-dispatcher`.

## Local server
- From repo root: `PORT=<free-port> npm start` (equivalent to `node server.js`). Port 3000 may already be occupied.
- Static pages are served as clean routes. Core UI/UX surfaces: `/`, `/hvac-dispatch-software`, `/plumbing-dispatch-software`, `/field-service-scheduling`, `/mobile-dispatch-board`, `/how-to-choose-hvac-dispatch-app`, `/how-hvac-dispatch-apps-reduce-phone-tag`, `/hvac-dispatch-app-vs-spreadsheets`.
- Page/asset verification does not need `DATABASE_URL`; local POST `/waitlist` will fail without it, so test form UX with fetch mocked/intercepted instead of real submission.
- Quick syntax check: `node --check server.js`.

## Browser/runtime checks
- For mobile UX, run local server and use headless Chrome/CDP at `390x844`.
- Verify concrete DOM/runtime evidence rather than narrative claims: route loaded, `document.documentElement.scrollWidth <= innerWidth`, CTA/form dimensions, active element sequence, computed focus styles, and live-region text.
- Waitlist form baseline: labels for `name`, `email`, `company`; visible required affordance for required fields; `email` has `aria-describedby="waitlist-help"`; status element has `role="status" aria-live="polite"`; empty submit should show field-specific validation, focus the missing field, and make no fetch call.
- For submission-state checks, instrument/mock `window.fetch` so no request reaches `https://api.gainhelm.com/waitlist`; verify loading/disabled affordance, success status text, API/network error recovery, and restored form usability.
- For valid-submit UX, use a delayed mocked fetch and capture **both** pending and final states. Final success alone is insufficient: prove pending submit text/disabled state, `fetchCalls=1` against the mock, no real external request, then resolve the mock and prove success/restored state.
- For CTA-to-`#waitlist` checks on mobile landing pages, click the primary CTA and record post-click `location.hash`, `scrollY`, `scrollWidth`, waitlist heading/context/control rects, and Tab continuation focus; this caught/guarded anchor-spacing regressions better than static link checks.

## Git hygiene
- Before commit/push, inspect `git status --short`, `git diff --check`, and route-scoped diffs. Do not include downloaded design zips or local transient artifacts.
