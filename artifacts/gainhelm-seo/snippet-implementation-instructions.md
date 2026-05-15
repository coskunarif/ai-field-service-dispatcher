# Gainhelm SEO Snippet Implementation Instructions

Status: local-only, SEO-only review. No live/public changes.

## Approved review targets
- HVAC: `https://gainhelm.com/hvac-dispatch-software`
  - Title: `Best HVAC Dispatch Software | Gainhelm`
  - Description: `Gainhelm helps HVAC teams schedule calls, assign technicians, and keep the board readable on iPad or mobile.`
  - Draft source: `artifacts/gainhelm-seo/draft-hvac-meta-snippet.md`
- Plumbing: `https://gainhelm.com/plumbing-dispatch-software`
  - Title: `Plumbing Dispatch Software for Service Calls | Gainhelm`
  - Description: `Gainhelm helps plumbing teams schedule service calls, assign plumbers, and keep the day organized.`
  - Draft source: `artifacts/gainhelm-seo/draft-plumbing-meta-snippet.md`
- Field service scheduling: `https://gainhelm.com/field-service-scheduling`
  - Title: `Field Service Scheduling Software | Gainhelm`
  - Description: `Gainhelm helps field service teams book jobs, dispatch technicians, and keep work organized.`
  - Draft source: `artifacts/gainhelm-seo/draft-field-service-meta-snippet.md`
  - Exact draft text: `Field Service Scheduling Software | Gainhelm` / `Gainhelm helps field service teams book jobs, dispatch technicians, and keep work organized.`

## Exact draft quote check
- HVAC draft exact text: `Best HVAC Dispatch Software | Gainhelm` / `Gainhelm helps HVAC teams schedule calls, assign technicians, and keep the board readable on iPad or mobile.`
- Plumbing draft exact text: `Plumbing Dispatch Software for Service Calls | Gainhelm` / `Gainhelm helps plumbing teams schedule service calls, assign plumbers, and keep the day organized.`
- Field service draft exact text: `Field Service Scheduling Software | Gainhelm` / `Gainhelm helps field service teams book jobs, dispatch technicians, and keep work organized.`

## Where the implementation would go
- Project evidence points to the rendered HTML pages and the campaign log:
  - `artifacts/gainhelm-seo/campaign-log.md`
  - `artifacts/gainhelm-seo/final-evidence.md`
  - `artifacts/gainhelm-seo/current-rendered-proof.md`
- Likely implementation surface: the page HTML files named in those artifacts:
  - `hvac-dispatch-software.html`
  - `plumbing-dispatch-software.html`
  - `field-service-scheduling.html`
- Canonical draft source paths:
  - `artifacts/gainhelm-seo/draft-hvac-meta-snippet.md`
  - `artifacts/gainhelm-seo/draft-plumbing-meta-snippet.md`
  - `artifacts/gainhelm-seo/draft-field-service-meta-snippet.md`
- If a live source file path is unclear for implementation, leave that live path as `unknown yet` until Arif/developer confirms it.

## Approval gate
- Do not change anything until Arif explicitly approves SEO execution.
- This document is only for review and handoff.

## Post-implementation verification checklist
1. Re-open `hvac-dispatch-software.html`, `plumbing-dispatch-software.html`, and `field-service-scheduling.html` after any approved edit.
2. Confirm each file still shows the approved title/description text.
3. Confirm the supporting comparison sentence is still present in the page body/FAQ.
4. Confirm no unsupported iPad/mobile/readable-board claim was introduced beyond the approved draft.
5. Confirm the live/public Gainhelm page was modified only after Arif approval.

## Actions not taken
- No live/public Gainhelm page was modified.
- No SEO publish/test action was performed.

## No-live-change note
- Local-only instructions. This does not authorize publishing or editing.
