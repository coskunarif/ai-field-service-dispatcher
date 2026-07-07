# Original User Request

## 2026-07-03T18:39:35Z

Improve SEO and GEO (Generative Engine Optimization) performance for the Gainhelm AI Field Service Dispatcher website to increase organic traffic and rank on page 1 of Google and in AI search engine responses across all field service categories.

## Requirements

### R1. Technical and On-Page SEO Optimization
Audit and optimize landing pages and alternative pages for target trade keywords (HVAC, plumbing, electrical, locksmith, septic, restoration, etc.) based on Search Console impressions and local audit findings. Ensure all optimized pages conform to SEO best practices, including title tag lengths, unique meta descriptions, single H1 tags, correct canonical tags, and aligned OG/Twitter titles.

### R2. GEO (Generative Engine Optimization) Content Enhancement
Enhance the citation readiness of optimized pages for AI search engines (like ChatGPT, Perplexity, and Claude) by adding direct answers within the first 60 words, structured FAQs, and realistic trade statistics or expert authority quotes (e.g., Coskun Arif). Ensure valid, server-rendered JSON-LD schema markup (including FAQPage and WebPage author details) exists on all target pages.

### R3. AI Crawler Access and Directory Mapping
Maintain and optimize site-wide indexing assets, specifically ensuring that `robots.txt` explicitly allows AI crawlers and that `llms.txt` is updated to accurately map all sitemap routes and target queries.

### R4. Automated Testing and Validation
Run local validation suites to ensure no regressions in SEO/GEO standards or user flows.

## Acceptance Criteria

### SEO/GEO Performance & Compliance
- [ ] Running `npm run audit:seo-geo` passes successfully with zero errors and zero warnings.
- [ ] High-potential pages (such as HVAC and plumbing software landing pages, and alternatives) have valid JSON-LD schemas featuring `WebPage` author information ("Coskun Arif") and dateModified properties.
- [ ] Target pages contain at least 3 trade-specific questions and answers in their FAQPage schema.

### Regression Testing
- [ ] Running `npm test` (Playwright test suite) passes successfully.
