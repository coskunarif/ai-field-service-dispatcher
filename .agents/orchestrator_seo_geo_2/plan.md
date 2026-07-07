# Plan: Gainhelm SEO & GEO Performance Optimization

This plan details the steps required to optimize the Gainhelm website for traditional search engines (Google page 1) and AI engine citation (Generative Engine Optimization - GEO) across all field service categories.

## Milestones

### Milestone 1: Technical & On-Page SEO/GEO Audit
- **Objective**: Conduct a comprehensive audit of all sitemap routes, landing pages, alternative pages, and tools.
- **Actions**:
  - Run the audit script and examine existing page structures.
  - Review HTML metadata (title lengths, meta descriptions, H1 tags, canonical links).
  - Verify existing JSON-LD schemas (types, properties, dateModified, and author info).
  - Identify pages missing required SEO/GEO components.

### Milestone 2: Schema & Content Enhancement
- **Objective**: Update the target pages to conform to all GEO and SEO requirements.
- **Actions**:
  - Inject/verify valid `WebPage` author information ("Coskun Arif") and `dateModified` properties across HVAC, plumbing, and alternative pages.
  - Ensure all 11+ target pages have at least 3 trade-specific questions/answers in their FAQPage schemas.
  - Fix any missing fields in the JSON-LD schemas of tools pages (`tools-contractor-leads.html` and `tools-lead-queue.html`).
  - Optimize landing pages and alternatives for keywords and readability (first 60 words direct answers, author quotes, etc.).
  - Update `og:title` and `twitter:title` metadata tags on any remaining or newly optimized pages to align with page content.

### Milestone 3: AI Crawler Access & Sitemap/LLMs Asset Optimization
- **Objective**: Ensure search crawlers and AI crawlers have full access and accurate mapping.
- **Actions**:
  - Audit `robots.txt` to verify all required bots (GPTBot, ClaudeBot, PerplexityBot, GoogleOther, Amazonbot) are permitted.
  - Audit and update `llms.txt` to ensure all sitemap routes and target queries are mapped correctly with zero omissions.

### Milestone 4: E2E and Audit Script Verification
- **Objective**: Perform automated validation and regression tests.
- **Actions**:
  - Enhance `scripts/gainhelm-seo-geo-audit.mjs` to check for `WebPage` author details ("Coskun Arif") and `dateModified` on target/alternative pages.
  - Execute `npm run audit:seo-geo` and ensure it runs with zero errors and zero warnings.
  - Run the Playwright test suite (`npm test`) to verify no user flow regressions.
  - Perform Forensic Audit validation to ensure integrity.
