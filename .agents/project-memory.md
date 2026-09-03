# ai-field-service-dispatcher (Gainhelm) Project Memory

> Primary active SaaS product (50% focus). AI field service dispatching software & platform.

## Stack & Architecture
- **Backend & Web**: Fastify Web Server + Playwright E2E Sandbox Simulator.
- **SEO/GEO**: Automated landing page generator (`geo-generator.mjs`), `llms.txt`, `sitemap.xml`.
- **API**: Companion backend in `ai-field-service-dispatcher-api/`.

## Verification Oracles
- Fast Check: `npx vitest run` (or `npx playwright test tests/<spec_file>.spec.js`)
- Baseline Tests: `npm run test`
- SEO & GEO Audit: `npm run audit:seo-geo`
- Lint: `npm run lint`

## Critical Invariants
1. **Port 3005 Discipline**: Clean stale listeners before/after runs (`kill $(lsof -t -i:3005) 2>/dev/null || true`).
2. **Hermetic E2E Sandbox**: Never trigger live Twilio SMS or external Google Calendar writes in tests (`tests/sandbox_simulator.spec.js`).
3. **100% LLMO & SEO Health**: Exactly one `<h1>`, valid JSON-LD schema, non-empty meta description, matches `sitemap.xml` and `llms.txt`.
4. **Draft Persistence**: Setup wizard state must serialize to `localStorage` and recover across browser reloads.
