---
name: gainhelm-seo-geo-copy
description: Use when improving Gainhelm landing-page SEO/GEO copy, crawl surfaces, metadata, internal links, Search Console checks, or conservative no-feature-claim marketing copy.
---

# Gainhelm SEO/GEO copy updates

Use this when improving Gainhelm landing-page SEO/GEO copy without implementing product features.

## Workflow

1. Start with workspace grounding:
   - `vault --help`
   - `vault read file="workspace-map" --compact`
   - focused Vault searches for Gainhelm, SEO/GEO, Search Console, waitlist, and relevant project skills/docs.
2. Locate the page and funnel in this repo before editing:
   - page source such as `hvac-dispatch-software.html`, `plumbing-dispatch-software.html`, or `field-service-scheduling.html`
   - `server.js` route behavior
   - waitlist form/CTA code (`#waitlist`, `waitlist-form`, and `https://api.gainhelm.com/waitlist`)
3. Write a compact scenario frontier before changes. Cover:
   - search intent/query family
   - citation-ready GEO answer block
   - no-feature-claim safety
   - waitlist CTA/form/API preservation
   - responsive/mobile readability
   - title/meta/canonical/JSON-LD/one-H1 preservation
4. Keep claims conservative. Do not add public claims for unbuilt product scope such as payments, CRM, route optimization, technician app, or broad route-planning unless current product evidence explicitly supports it.
5. Verify with tool-visible evidence after edits:
   - `node --check server.js`
   - `npm run audit:seo-geo` for local sitemap/robots/llms/canonical/H1/JSON-LD/waitlist/Twitter-card checks
   - optional live parity after deploy: `BASE_URL=https://gainhelm.com npm run audit:seo-geo`
   - local route returns HTTP 200, e.g. `/hvac-dispatch-software`
   - targeted HTML assertions for the changed route's key SEO/GEO copy, waitlist form/API, CTA, and risky unbuilt-feature claims
   - mobile screenshot/snapshot artifact when copy/layout changed
6. For internal-link SEO support, prefer one contextual in-body link from a relevant support page to the target page; keep nav/card links unchanged. Proven examples:
   - `/hvac-dispatch-app-vs-spreadsheets` -> `/hvac-dispatch-software` with anchor `HVAC dispatch software`
   - `/field-service-scheduling` -> `/hvac-dispatch-software` with anchor `HVAC dispatch software`
7. Commit only intentional source/artifact changes and show `git log --stat` plus clean tracked diff/status proof.

## Fast crawl-surface audit

This repo has a reusable audit command extracted from the 2026-05-20 live SEO/GEO Objective Loop run, where agents repeatedly hand-wrote Python checks for sitemap routes, robots, llms.txt coverage, metadata, JSON-LD, and waitlist-form preservation.

```bash
npm run audit:seo-geo
BASE_URL=https://gainhelm.com npm run audit:seo-geo  # post-deploy/live parity
```

Use it before manual page-by-page review. It intentionally fails on crawl blockers and warns on softer snippet/intent issues; follow with route-specific checks only for pages you changed.

## Deployment path

Gainhelm production web is Railway-backed and auto-deploys from GitHub `origin main` for repo `coskunarif/ai-field-service-dispatcher`.

Proven deploy workflow:
1. Get explicit approval for the exact files and public change.
2. Preflight: `git status --short`, route-scoped `git diff`, `git diff --check -- <files>`, `node --check server.js`, and static HTML assertions for changed routes.
3. Commit only approved files; keep local/untracked design artifacts such as `redesign-gainhelm-landing-page.zip` out of scope.
4. After approval, `git push origin main` triggers Railway auto-deploy. In the 2026-05-19 Objective Loop run, push succeeded from commit `f5c165a` and live content appeared after about 19 seconds; still treat push/deploy as an explicit approval boundary and stop if the harness blocks it.
5. Public verification with `curl`/Python requests against `https://gainhelm.com/<route>` and `https://gainhelm.com/sitemap.xml`; confirm 200, live target phrases, canonical, robots `index,follow`, one H1, JSON-LD, and waitlist form/API.

Known deploy evidence from 2026-05-19: GitHub `origin main` (`coskunarif/ai-field-service-dispatcher`) auto-deploys Gainhelm web to Railway; live URL `https://gainhelm.com`.

Crawlability recovery gotcha: if `https://gainhelm.com/` or SEO routes return JSON 404s, check Railway is serving repo root, not `api/`. The SEO web service needs `railway.json`/`railway.toml` root `.` with `node server.js`; `api/server.js` only serves the waitlist API and will 404 pages/sitemap/robots. Preserve waitlist by using the root `/waitlist` handler and same-origin form posts when deploying root web.

## SERP/rank checks

Use the local Search Console CLI first; default auth can query Gainhelm's domain property:

```bash
google-search-console-cli query sc-domain:gainhelm.com --start-date YYYY-MM-DD --end-date YYYY-MM-DD --dimensions query,page --row-limit 100 --format json
google-search-console-cli inspect sc-domain:gainhelm.com https://gainhelm.com/hvac-dispatch-software --format json
google-search-console-cli sitemaps sc-domain:gainhelm.com --format json
```

If Search Console is unavailable, use grounded Google Search as a fallback baseline and label it as such. In the 2026-05-19 run, GSC inspection showed `/hvac-dispatch-software` and `/plumbing-dispatch-software` were submitted/indexed, robots allowed, canonical matched, FAQ rich result passed, but last crawl predated the just-pushed copy, so the next step was monitoring or approval-gated indexing request rather than source edits.

## Promotion-channel shortlist

For Gainhelm's current early-access/waitlist posture, use BetaList first and Uneed as fallback before software directories that require mature public offers/screenshots.
- BetaList fit: accepts pre-launch/recently launched startups with own domain, clear value prop, good design, and early-user-feedback goal; `/submit` redirects to sign-in, so login/account creation and final submission are approval boundaries. Use regular/free review unless paid priority is explicitly approved.
- Uneed fallback: supports pre-launch pages to collect emails and a free `Join the line` route; paid skip-the-line was $29.99 in the 2026-05-19 evidence and needs separate approval.
- Stop before submitting if a form requires screenshots/logo/assets that are not approved.

## Proven evidence pattern

The 2026-05-11 HVAC update used this workflow and passed review after adding direct tool-visible proof for the scenario frontier, tests, visual artifacts, no-feature wording, waitlist preservation, and commit/clean-status evidence. The 2026-05-19 run additionally proved the GitHub-main -> Railway auto-deploy path and the one-link support-page workflow.
