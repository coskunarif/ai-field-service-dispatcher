# SEO/GEO FAQ Schema and Metadata Title Alignments Report

This report outlines the changes made to standardise the FAQ JSON-LD Schema blocks and align metadata titles across 14 HTML landing pages.

## Modifications

1. **Metadata Title Alignment**:
   - For 10 pages containing HTML-escaped `&amp;` in their `og:title` and `twitter:title` content attributes, updated them to match the main page `<title>` tag exactly (using literal `&` instead of `&amp;`):
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
   - For `index.html`, added missing metadata tags under `<head>` with correct literal `&`.
   - Verified that `mobile-dispatch-board.html`, `pressure-washing-dispatch-software.html`, and `junk-removal-dispatch-software.html` already used literal `&` correctly.

2. **FAQ Schema Standardisation**:
   - Added standard `FAQPage` JSON-LD schema blocks to the following 12 pages that lacked FAQ schema:
     - `index.html`
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
   - Updated the FAQPage schema blocks in `pressure-washing-dispatch-software.html` and `junk-removal-dispatch-software.html` to contain at least 3 highly trade-specific Q&As.

## Verification

1. **SEO/GEO Audit**:
   - Ran `node scripts/gainhelm-seo-geo-audit.mjs` and verified that the audit passes successfully with zero failures or warnings.
2. **Title Consistency Check**:
   - Ran a validation script to verify that `<title>`, `og:title`, and `twitter:title` match exactly in all 14 HTML pages. All matched perfectly.
3. **Playwright Tests**:
   - Ran the full E2E test suite via `npx playwright test`.
