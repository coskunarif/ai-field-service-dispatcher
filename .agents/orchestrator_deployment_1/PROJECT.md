# Project: Gainhelm Deployment & E2E Verification

## Architecture
- Codebase structure is a Fastify web server (`server.js`) serving static/rendered HTML pages.
- Deployment environment: Google Cloud Run service `gainhelm-web` in project `profithelm-477200` in region `us-central1`.
- DNS/Routing: Direct Cloud Run URL and the custom domain `https://gainhelm.com/`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Re-deploy to Cloud Run | Deploy current codebase using gcloud run deploy command | none | DONE |
| 2 | Verify Deployment Accessibility | Verify custom domain and direct URL load and return 200 OK | M1 | IN_PROGRESS (3cda1fdb-37b0-4948-8d16-4114bd20eff7) |
| 3 | Run E2E Tests | Run Playwright test suite against deployed URL | M2 | PLANNED |

## Interface Contracts
### Codebase ↔ Cloud Run
- Deploy method: `gcloud run deploy gainhelm-web --source . --project profithelm-477200 --region us-central1 --allow-unauthenticated --set-env-vars="WAITLIST_API_URL=https://gainhelm-api-250134012801.us-central1.run.app/waitlist"`
- Environment variables: `WAITLIST_API_URL` must point to the waitlist API.

## Code Layout
- `server.js` — Core application server.
- `Dockerfile` — Defines the container image build.
- `playwright.config.js` — E2E test configuration.
- `tests/` — Directory containing Playwright test specifications.
