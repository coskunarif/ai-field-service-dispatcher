# Gainhelm UI runtime verification

Use this when validating gainhelm.com UI/UX changes in `ai-field-service-dispatcher`.

## Local server
- From repo root: `PORT=<free-port> npm start` (equivalent to `node server.js`). Port 3000 may already be occupied.
- Static pages are served as clean routes. Core UI/UX surfaces: `/`, `/hvac-dispatch-software`, `/plumbing-dispatch-software`, `/field-service-scheduling`, `/mobile-dispatch-board`, `/how-to-choose-hvac-dispatch-app`, `/how-hvac-dispatch-apps-reduce-phone-tag`, `/hvac-dispatch-app-vs-spreadsheets`.
- Page/asset verification does not need `DATABASE_URL`. Since 2026-05-25, web `server.js` falls back to `WAITLIST_API_URL || https://api.gainhelm.com/waitlist` when local `DATABASE_URL` is absent; verify this path locally with a mock HTTP API before deployment.
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
- For “all routes” missions, derive the full route set from `server.js` instead of the core list above; the 2026-05-22 run found 21 canonical `pages` routes.
- Recovery UX is also source-backed in `server.js`: verify `routeRedirects` aliases and `legacyGonePaths` 410 pages, not only canonical pages. The 2026-05-22 redirect pass derived 32 aliases and checked each returned `301` to the expected canonical route, final `200`, retained waitlist CTA, and avoided dead-end text.
- Favicon is intentionally served by `server.js` at `/favicon.ico` as inline SVG (`image/svg+xml`); verify with `curl -D - /favicon.ico` before treating favicon errors as missing files.

## Browser/runtime checks
- For mobile UX, run local server and use headless Chrome/CDP at `390x844`; also spot-check `320x568`, landscape `667x375`, tablet `768/1024`, and high zoom when nav/header layout is touched.
- Verify concrete DOM/runtime evidence rather than narrative claims: route loaded, `document.documentElement.scrollWidth <= innerWidth`, CTA/form dimensions, active element sequence, computed focus styles, and live-region text.
- Waitlist form baseline: labels for `name`, `email`, `company`; visible required affordance for required fields; `email` has `aria-describedby="waitlist-help"`; status element has `role="status" aria-live="polite"`; empty submit should show field-specific validation, focus the missing field, and make no fetch call.
- For submission-state checks, instrument/mock `window.fetch` so no request reaches `https://api.gainhelm.com/waitlist`; verify loading/disabled affordance, success status text, API/network error recovery, and restored form usability.
- Do not rely on `agent-browser network route '**/waitlist'` to block native document form submissions; the 2026-05-25 production run showed it did not intercept a native POST. Use local/mock-server verification or get explicit approval for exactly one production test identity before valid-submit testing.
- For valid-submit UX, use a delayed mocked fetch and capture **both** pending and final states. Final success alone is insufficient: prove pending submit text/disabled state, `fetchCalls=1` against the mock, no real external request, then resolve the mock and prove success/restored state.
- For CTA-to-`#waitlist` checks on mobile landing pages, click the primary CTA and record post-click `location.hash`, `scrollY`, `scrollWidth`, waitlist heading/context/control rects, and Tab continuation focus; this caught/guarded anchor-spacing regressions better than static link checks.

## Live deploy/cache verification
- Production `gainhelm.com` is Railway project `ai-field-service-dispatcher`, service `web`, custom domain `gainhelm.com`, backed by `coskunarif/ai-field-service-dispatcher` on `main`; committing/pushing/deploying is an external write and needs explicit user approval.
- After CSS changes, verify the exact stylesheet URL referenced by live HTML across all canonical routes. The 2026-05-22 deploy found intermittent stale responses from unversioned `/styles.css`; updating all 21 pages to `/styles.css?v=20260522-nav` fixed mobile nav CTA parity. The 2026-05-25 mobile service waitlist touch-target fix shipped with `/styles.css?v=20260525-waitlist`; the 2026-05-26 UI/waitlist polish shipped with `/styles.css?v=20260526-polish` and markers `.nav a.nav-cta`, `.waitlist-status.pending`, `.compact-waitlist`, `scrollbar-width: none`.
- Live all-route stylesheet parity check: derive root `*.html` routes that reference the current versioned stylesheet, fetch each `https://gainhelm.com/<route>` with `curl -A 'Mozilla/5.0'`, assert HTTP 200, the expected stylesheet href, no previous version, and no unversioned `/styles.css`; then fetch the versioned CSS and confirm expected markers. Python `urllib.request.urlopen` returned 403 across live routes in the 2026-05-26 pass, while browser-like curl succeeded, so treat urllib 403 as a client/WAF nuance before calling it a deploy failure.
- Post-deploy mobile proof should use real `https://gainhelm.com` at 390x844 on `/`, `/hvac-dispatch-software`, and any touched service routes: nav CTA visible, no page-level horizontal overflow, click the CTA, confirm expected hash, sticky-header-safe waitlist heading/form/input rects, and no real submission. The 2026-05-26 run verified Electrical and Appliance older-route waitlist parity this way after adding status/form feedback.

## Git hygiene
- Before commit/push, inspect `git status --short`, `git diff --check`, and route-scoped diffs. Do not include downloaded design zips or local transient artifacts.
