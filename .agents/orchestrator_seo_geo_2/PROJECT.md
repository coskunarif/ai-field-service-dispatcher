# Project: Gainhelm SEO/GEO Performance Optimization

## Architecture
- Static landing pages: HTML files in the project root.
- Audit script: `scripts/gainhelm-seo-geo-audit.mjs`.
- E2E tests: Playwright suite in `tests/`.

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs / Agents |
|---|------|-------|-------------|--------|----------------------|
| 1 | Technical & On-Page SEO/GEO Audit | Auditing all sitemap routes and identifying gaps | None | DONE | b5876845, fe1f4ebe |
| 2 | Schema & Content Enhancement | Injecting/verifying WebPage author info, dateModified, FAQs, and content tweaks | M1 | DONE | Worker: 4f31d453 |
| 3 | AI Crawler Access & Asset Optimization | Verifying robots.txt and sitemap/llms.txt mapping | M2 | DONE | Worker: 4f31d453 |
| 4 | E2E and Audit Script Verification | Enhancing audit script, running local audit and Playwright tests | M3 | DONE | f9b4cb58, 8dd4e77d, 779c42aa, 9d3eaa71, a9a7cd26 |

## Code Layout
- Service landing pages: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/*.html`
- Alternatives pages: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/*-alternative.html`
- Audit script: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/scripts/gainhelm-seo-geo-audit.mjs`
- Test files: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/*.js`
