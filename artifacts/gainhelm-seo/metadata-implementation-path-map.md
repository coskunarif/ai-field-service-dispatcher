# Gainhelm Metadata Implementation Path Map

Status: local-only. No live/public metadata was modified.

## Framework / serving pattern
- Source: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/package.json`
- Evidence: `"type": "module"` and `"start": "node server.js"`
- Source: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js`
- Evidence: Fastify serves HTML files directly from the repo root.
- Evidence: route map includes `/hvac-dispatch-software`, `/plumbing-dispatch-software`, and `/field-service-scheduling`.

## Per-page implementation locations
- `/hvac-dispatch-software` → `hvac-dispatch-software.html`
- `/plumbing-dispatch-software` → `plumbing-dispatch-software.html`
- `/field-service-scheduling` → `field-service-scheduling.html`

## Verified metadata evidence in source pages
- `/hvac-dispatch-software`
  - `<title>HVAC Dispatch App & Software for Scheduling Service Calls | Gainhelm</title>`
  - `<meta name="description" content="Gainhelm is HVAC dispatch app and software for scheduling service calls, assigning technicians, and keeping the board readable on iPad or mobile.">`
- `/plumbing-dispatch-software`
  - `<title>Plumbing Dispatch App & Software for Scheduling Service Calls | Gainhelm</title>`
  - `<meta name="description" content="Gainhelm is plumbing dispatch app and software for scheduling service calls, assigning plumbers, and keeping the board readable on iPad or mobile.">`
- `/field-service-scheduling`
  - `<title>Field Service Scheduling Software | Gainhelm</title>`
  - `<meta name="description" content="Gainhelm is field service scheduling software that helps teams book jobs, dispatch technicians, and keep work organized.">`

## Approved review targets from the snippet implementation instructions
- `artifacts/gainhelm-seo/snippet-implementation-instructions.md`
- `artifacts/gainhelm-seo/draft-hvac-meta-snippet.md`
- `artifacts/gainhelm-seo/draft-plumbing-meta-snippet.md`
- `artifacts/gainhelm-seo/draft-field-service-meta-snippet.md`

## Implementation note
- Because the site serves the HTML files directly, the metadata implementation path is the corresponding HTML file for each route.
- If a future build step or CMS is introduced, re-map these locations before any SEO execution.

## Approval gate
- Do not change any metadata until Arif explicitly approves SEO execution.
- This map is for review and handoff only.

## Verification checklist
1. Re-open each HTML file after any approved edit.
2. Confirm title and meta description still match the approved snippet.
3. Confirm the comparison sentence still exists in the page body/FAQ.
4. Confirm no unsupported claim was introduced.
5. Confirm no live/public page was modified before approval.

## No-live-change note
- Local-only map. No live/public Gainhelm page was modified or published.
