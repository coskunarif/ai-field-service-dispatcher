# Project: Gainhelm SEO/GEO Optimization

## Architecture
- Static landing pages: HTML files in the project root.
- Audit script: `scripts/gainhelm-seo-geo-audit.mjs`.
- E2E tests: Playwright suite in `tests/`.

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs / Agents |
|---|------|-------|-------------|--------|----------------------|
| 1 | Update Audit Script | Enhance `scripts/gainhelm-seo-geo-audit.mjs` to check for `FAQPage` blocks with >=3 questions/answers and matching `og:title`/`twitter:title` tags | None | DONE | Worker: d6dd88c0-d2a8-4c50-b748-c7fa73e15f50; Verifiers: 2c72be40, 54835cb6, fc4c02e1, ceb3d513, 319614c4 |
| 2 | SEO & Schema Fixes | Standardize FAQ schema and verify/fix social meta titles on remaining service pages | M1 | DONE | Worker: b744ad8f-ca22-4c5e-b854-3502e3883936; Verifiers: b9fe4687, 602f8bb2, e48ebc60, 0626b9ae, 6a5d2d93 |
| 3 | Final Verification | Run E2E tests and updated audit script to ensure 100% compliance | M2 | DONE | Worker: ff247ef7-317f-4a94-94a5-88142ecb819c; Auditor: 1aeb2d20-2dc5-4e9a-bd10-e237112b089a |

## Code Layout
- Service landing pages: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/*.html`
- Audit script: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/scripts/gainhelm-seo-geo-audit.mjs`
- Test files: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/*.js`
