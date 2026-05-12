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
   - local route returns HTTP 200, e.g. `/hvac-dispatch-software`
   - HTML assertions for one H1, canonical, JSON-LD, key SEO/GEO copy, waitlist form/API, and CTA
   - grep/assertions showing risky unbuilt-feature terms are absent or justified
   - mobile screenshot/snapshot artifact when copy/layout changed
6. Commit only intentional source/artifact changes and show `git log --stat` plus clean tracked diff/status proof.

## Proven evidence pattern

The 2026-05-11 HVAC update used this workflow and passed review after adding direct tool-visible proof for the scenario frontier, tests, visual artifacts, no-feature wording, waitlist preservation, and commit/clean-status evidence.
