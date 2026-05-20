# Gainhelm UI runtime verification

Use this when validating gainhelm.com UI/UX changes in `ai-field-service-dispatcher`.

## Local server
- From repo root: `PORT=<free-port> npm start` (equivalent to `node server.js`). Port 3000 may already be occupied.
- Static pages are served as clean routes. Core UI/UX surfaces: `/`, `/hvac-dispatch-software`, `/plumbing-dispatch-software`, `/field-service-scheduling`, `/mobile-dispatch-board`, `/how-to-choose-hvac-dispatch-app`, `/how-hvac-dispatch-apps-reduce-phone-tag`, `/hvac-dispatch-app-vs-spreadsheets`.
- Page/asset verification does not need `DATABASE_URL`; local POST `/waitlist` will fail without it, so test form UX with fetch mocked/intercepted instead of real submission.
- Quick syntax check: `node --check server.js`.

## Route/navigation audit fast path
- Route source of truth is the `pages` map in `server.js`; most pages duplicate `<header>` markup, so nav changes must be checked across every `*.html`, not only `index.html`.
- Before manual browser passes, run a local link/route coverage check:
  ```bash
  PORT=3123 npm start >/tmp/gainhelm.log 2>&1 & echo $! >/tmp/gainhelm.pid
  node - <<'NODE'
  import { readdirSync, readFileSync } from 'fs';
  const routes=[...readFileSync('server.js','utf8').matchAll(/'([^']+)': '([^']+\.html)'/g)].map(m=>m[1]);
  const nav=(readFileSync('index.html','utf8').match(/<nav[\s\S]*?<\/nav>/)||[''])[0];
  const hrefs=[...new Set([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(h=>h.startsWith('/')))];
  console.log('missing from nav:', routes.filter(r=>!hrefs.includes(r)).join(', ') || 'none');
  for (const h of hrefs) if (!h.includes('#')) {
    const res=await fetch('http://127.0.0.1:3123'+h);
    console.log(res.status, h);
  }
  NODE
  ```
- Browser proof that paid off in the long nav run: desktop and mobile header snapshots, Services disclosure click, a dropdown link click, all-route active/current-page state, link graph/hash checks, and no-JS/reduced-motion/forced-colors spot checks.
- Favicon is intentionally served by `server.js` at `/favicon.ico` as inline SVG (`image/svg+xml`); verify with `curl -D - /favicon.ico` before treating favicon errors as missing files.

## Browser/runtime checks
- For mobile UX, run local server and use headless Chrome/CDP at `390x844`; also spot-check `320x568`, landscape `667x375`, tablet `768/1024`, and high zoom when nav/header layout is touched.
- Verify concrete DOM/runtime evidence rather than narrative claims: route loaded, `document.documentElement.scrollWidth <= innerWidth`, CTA/form dimensions, active element sequence, computed focus styles, and live-region text.
- Waitlist form baseline: labels for `name`, `email`, `company`; visible required affordance for required fields; `email` has `aria-describedby="waitlist-help"`; status element has `role="status" aria-live="polite"`; empty submit should show field-specific validation, focus the missing field, and make no fetch call.
- For submission-state checks, instrument/mock `window.fetch` so no request reaches `https://api.gainhelm.com/waitlist`; verify loading/disabled affordance, success status text, API/network error recovery, and restored form usability.
- For valid-submit UX, use a delayed mocked fetch and capture **both** pending and final states. Final success alone is insufficient: prove pending submit text/disabled state, `fetchCalls=1` against the mock, no real external request, then resolve the mock and prove success/restored state.
- For CTA-to-`#waitlist` checks on mobile landing pages, click the primary CTA and record post-click `location.hash`, `scrollY`, `scrollWidth`, waitlist heading/context/control rects, and Tab continuation focus; this caught/guarded anchor-spacing regressions better than static link checks.

## Git hygiene
- Before commit/push, inspect `git status --short`, `git diff --check`, and route-scoped diffs. Do not include downloaded design zips or local transient artifacts.
