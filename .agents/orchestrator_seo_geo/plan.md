# Plan - Gainhelm SEO/GEO Optimization

## Objective
Standardize FAQ schema, align title tags across landing pages, and update the automated SEO/GEO audit script to ensure compliance.

## Steps

### Milestone 1: Update Audit Script
1. Spawn an Explorer agent to analyze `scripts/gainhelm-seo-geo-audit.mjs` and understand how to check for:
   - Presence of `FAQPage` JSON-LD block with at least 3 trade-specific questions and answers.
   - Presence of `og:title` and `twitter:title` metadata tags on all landing pages and that they match the main `<title>` tag.
2. Spawn a Worker agent to modify `scripts/gainhelm-seo-geo-audit.mjs` to add these checks.
3. Spawn Reviewer and Challenger agents to verify the updated script does not crash and correctly reports failures on non-compliant files.

### Milestone 2: SEO & Schema Fixes
1. Spawn an Explorer agent to compile/generate standard FAQ questions/answers (at least 3 per page) for the remaining 11 target pages, and identify any misaligned `og:title` or `twitter:title` tags.
   Target pages:
   - `garage-door-dispatch-software.html`
   - `roofing-dispatch-software.html`
   - `locksmith-dispatch-software.html`
   - `pool-service-dispatch-software.html`
   - `commercial-facilities-dispatch-software.html`
   - `septic-service-dispatch-software.html`
   - `restoration-job-management-software.html`
   - `handyman-dispatch-software.html`
   - `carpet-cleaning-dispatch-software.html`
   - `tree-service-dispatch-software.html`
   - `mobile-dispatch-board.html`
2. Spawn a Worker agent to insert the `FAQPage` JSON-LD blocks and update/fix the `og:title` and `twitter:title` tags on those pages.
3. Spawn Reviewer and Challenger agents to verify the HTML pages look correct, have valid JSON-LD structure, and pass manual inspection.

### Milestone 3: Final Verification
1. Spawn a Worker agent to run the updated audit script `node scripts/gainhelm-seo-geo-audit.mjs` and Playwright tests `npx playwright test`.
2. Spawn a Forensic Auditor to perform integrity validation.
3. Confirm clean pass and present the final results.
