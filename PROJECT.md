# Project: Gainhelm UI/UX Enhancements

## Architecture
- Global stylesheet: `styles.css`
- Web Pages: 30+ static HTML landing pages mapping to various service sectors.
- Form handling: HTML forms posting to waitlist endpoints.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Design Guide | Analyze current styles and HTML structure | None | DONE |
| 2 | CSS Visual & Responsive Polish | Implement typography, transitions, responsive layout, glassmorphic headers | M1 | DONE |
| 3 | Automated & Manual Verification | Verify with Playwright test suite and check viewport scrolling/layout | M2 | DONE |
| 4 | Git Commit & Push | Commit and push visual changes to repository | M3 | PLANNED |
| 5 | Audit & Handover | Validate integrity with auditor and hand over | M4 | IN_PROGRESS (Conv ID: 77260d50-2e27-4dc8-b6ac-81d6d03a4b62) |

## Interface Contracts
- Standard HTML tags: Do not change class names or IDs that are used by JS, CSS, or test suite.
- Font family: Plus Jakarta Sans.
- Responsive design targets: Desktop (1440px), Tablet (768px), Mobile (320px).

## Code Layout
- CSS File: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/styles.css`
- Landing Pages: Root directory contains all HTML files (e.g. `index.html`, `hvac-dispatch-software.html`, etc.)
- Tests: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/gainhelm.spec.js`
