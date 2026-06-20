# SPEC.md - Landing Page Search CTR & Position Optimization

## Objective
Increase landing page search click-through rates (CTR) and average search positions by optimizing meta descriptions to fit the 120-180 character standard and supporting local SEO/GEO audit overrides.

## Acceptance Criteria
- **[AC-1]**: Update meta descriptions in the target landing page HTML files and their JSON-LD schema blocks to be between 120 and 180 characters, using high-impact keywords to maximize CTR and search position. The target pages are:
  - `hvac-dispatch-software.html`
  - `plumbing-dispatch-software.html`
  - `electrical-dispatch-software.html`
  - `locksmith-dispatch-software.html`
  - `septic-service-dispatch-software.html`
  - `emergency-restoration-dispatch-software.html`
  - `field-service-scheduling.html`
  - `carpet-cleaning-dispatch-software.html`
  - `tree-service-dispatch-software.html`
  *Verification method*: Run `npm run audit:seo-geo` and verify no length warnings are printed for these routes.
- **[AC-2]**: Implement a local SEO audit configuration system in `scripts/gainhelm-seo-geo-audit.mjs` that reads `seo-audit-config.json` and supports route-specific overrides and ignore rules for errors/warnings.
  *Verification method*: Verify `npm run audit:seo-geo` runs with `/` (homepage) warnings silenced when config ignore rule is set. Add a test route to config to check overriding behavior.
- **[AC-3]**: Ensure the Playwright E2E suite (`npm test`) passes successfully after updating the page metadata, including updating the targets mapping in `tests/seo_conversion.spec.js`.
  *Verification method*: Run `npm test` and verify all tests pass without errors. (Note: Tester will update the tests).

## Performance KPIs
- **[KPI-1]**: The local SEO/GEO audit script execution time must be `< 3s` when running offline against local files.
- **[KPI-2]**: HTML document size change for each landing page must be `< 1KB` from the original.

## Interface Contract
Tester and Builder must strictly share this targets mapping:
```json
{
  "/hvac-dispatch-software": {
    "title": "Best HVAC Dispatch Software | Gainhelm",
    "description": "Gainhelm helps HVAC teams schedule service calls, assign technicians, cut phone tag, and keep the dispatch board readable on iPad or mobile. Join the waitlist today."
  },
  "/plumbing-dispatch-software": {
    "title": "Plumbing Dispatch Software for Service Calls | Gainhelm",
    "description": "Gainhelm helps plumbing teams schedule service calls, assign plumbers, streamline dispatching, and keep the scheduling board organized on mobile. Join our waitlist."
  },
  "/electrical-dispatch-software": {
    "title": "Electrical Contractor Scheduling & Dispatch Software | Gainhelm",
    "description": "Gainhelm helps electrical contractors schedule jobs, dispatch technicians, coordinate service calls, and eliminate office-to-field phone tag. Try the dispatch simulator."
  },
  "/locksmith-dispatch-software": {
    "title": "Locksmith Dispatch & Scheduling Software | Gainhelm",
    "description": "Gainhelm helps locksmith teams dispatch locksmiths, schedule emergency jobs, track work orders, and coordinate field technicians in real-time. Join the waitlist."
  },
  "/septic-service-dispatch-software": {
    "title": "Septic Service Dispatch & Scheduling Software | Gainhelm",
    "description": "Gainhelm helps septic teams schedule pumpings, dispatch technicians, coordinate tank cleanings, and keep customer service histories organized in one place."
  },
  "/emergency-restoration-dispatch-software": {
    "title": "Emergency Restoration Dispatch & Job Software | Gainhelm",
    "description": "Gainhelm helps disaster restoration teams schedule emergency calls, dispatch technicians, manage jobs, and coordinate field crews during high-stress projects."
  },
  "/field-service-scheduling": {
    "title": "Field Service Scheduling Software | Gainhelm",
    "description": "Gainhelm helps field service teams book jobs, dispatch technicians, streamline scheduling workflows, and keep customer updates organized in one dashboard."
  },
  "/carpet-cleaning-dispatch-software": {
    "title": "Carpet Cleaning Dispatch & Scheduling Software | Gainhelm",
    "description": "Gainhelm helps carpet cleaning teams schedule service calls, coordinate crews, dispatch technicians, and manage booking calendars in one simple interface."
  },
  "/tree-service-dispatch-software": {
    "title": "Tree Service Dispatch Software | Gainhelm",
    "description": "Gainhelm helps tree service crews schedule jobs, assign arborists, manage work orders, and coordinate dispatch schedules on iPad or mobile devices. Join now."
  }
}
```

The configuration file `seo-audit-config.json` structure must be:
```json
{
  "overrides": {
    "/": {
      "ignoreWarnings": ["no-inline-waitlist-form"]
    }
  }
}
```

## Out of Scope
- Modifying design layout, styling, or adding new routes to `sitemap.xml`.
- Modifying database schemas or Fastify server routing endpoints.

## Objections
- Critic Objections: None raised.

## Slices
Task type: **refinement** (test strategy: update/snapshot tests).

- **[S-1]**: Implement configurable overrides and ignore rules support in `scripts/gainhelm-seo-geo-audit.mjs` and create `seo-audit-config.json` ignoring `/`'s waitlist form warning.
  - Files: `scripts/gainhelm-seo-geo-audit.mjs`, `seo-audit-config.json`
  - ACs: `[AC-2]`
  - [Independent: Yes]
- **[S-2]**: Update the meta descriptions and JSON-LD structured data blocks inside all 9 target landing page HTML files to match the optimized descriptions specified in the interface contract.
  - Files:
    - `hvac-dispatch-software.html`
    - `plumbing-dispatch-software.html`
    - `electrical-dispatch-software.html`
    - `locksmith-dispatch-software.html`
    - `septic-service-dispatch-software.html`
    - `emergency-restoration-dispatch-software.html`
    - `field-service-scheduling.html`
    - `carpet-cleaning-dispatch-software.html`
    - `tree-service-dispatch-software.html`
  - ACs: `[AC-1]`
  - [Independent: Yes]
