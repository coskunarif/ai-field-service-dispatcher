# Scout Dogfooding Report

- **Date**: 2026-06-20
- **Run ID**: scout-20260620
- **Target URL/Command**: http://localhost:3012 (Local server), `npm test` (Playwright suite), `npm run audit:seo-geo` (SEO/GEO audit tool)
- **Summary of Findings**: 
  The Gainhelm application is extremely stable: the entire Playwright E2E suite passes successfully, and the core user configuration wizard (/setup) and real-time dispatcher board (/app) work reliably. However, our systematic exploration and offline SEO/GEO audit identified minor gaps in SEO metadata consistency, onboarding state persistence, and legacy routing clutter. Addressing these will improve search traffic conversion (North Star) and code hygiene.

---

## Issues Found

### 1. Minor: SEO Meta Description Length Warnings
- **Description**: 10 trade-specific and cluster landing pages have meta descriptions shorter or longer than the optimal SEO/GEO standard of 120-180 characters (ranging from 89 to 108 characters). This can reduce Search Engine Result Page (SERP) click-through rate (CTR) and click conversions.
- **Reproduction Steps**:
  1. Run `npm run audit:seo-geo` inside the project root.
  2. Observe the warnings for `/hvac-dispatch-software`, `/plumbing-dispatch-software`, `/electrical-dispatch-software`, etc.
- **Evidence**:
  - Captured in the terminal output of `npm run audit:seo-geo`.
  - Landing pages references: [hvac-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-software.html), [plumbing-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/plumbing-dispatch-software.html), [electrical-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/electrical-dispatch-software.html)

### 2. Minor: Lack of Setup Wizard Draft State Persistence
- **Description**: The `/setup` multi-step configuration wizard does not persist user drafts in `localStorage` or session cache. If an owner is typing their technicians or business rules and accidentally closes or refreshes the tab, all configuration data is lost, causing onboarding friction and waitlist drop-offs.
- **Reproduction Steps**:
  1. Navigate to `/setup?email=test@example.com`
  2. Fill in technician details in Step 1.
  3. Refresh the page.
  4. Notice the input fields are cleared.
- **Evidence**:
  - [setup-step1.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/scout-20260620/screenshots/setup-step1.png)
  - [setup-step1-filled.png](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/dogfood-output/scout-20260620/screenshots/setup-step1-filled.png)

### 3. Minor: Dead Code & Routing Clutter (Legacy 410 Routes)
- **Description**: `server.js` maintains routing and E2E test coverage for legacy Amazon FBA seller comparisons (e.g. `/managebystats-alternative`, `/tools/amazon-fba-fees-calculator`) which return 410 route recoveries. Because Gainhelm is exclusively a field service dispatch assistant, these obsolete routes are dead weight that clutters server configurations and the test suite.
- **Reproduction Steps**:
  1. Inspect `server.js` lines 86-95 for `legacyGonePaths`.
  2. Inspect `tests/gainhelm.spec.js` lines 63-72 and 112-124.
- **Evidence**:
  - Defined in [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js#L86-L95) and [gainhelm.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/gainhelm.spec.js#L63-L72)
