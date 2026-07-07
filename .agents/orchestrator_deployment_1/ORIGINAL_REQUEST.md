# Original User Request

## 2026-06-28T22:48:47Z

Redeploy the Gainhelm field service dispatcher application to Google Cloud Run and verify that the website (https://gainhelm.com) is fully accessible and passing all E2E tests.

Working directory: /home/ubuntuadmin/projects/ai-field-service-dispatcher
Integrity mode: development

## Requirements

### R1. Re-deploy to Google Cloud Run
Re-deploy the current codebase to Google Cloud Run (`gainhelm-web` in project `profithelm-477200`, region `us-central1`) using the deployment command or `gcloud run deploy` command.

### R2. Verify Deployment Accessibility
Verify that both the custom domain `https://gainhelm.com/` and the direct Cloud Run service URL return `200 OK` responses and load content correctly.

### R3. Run End-to-End Tests
Execute the Playwright test suite against the live deployed URL to confirm that all routes, redirects, forms, and wizard flows work perfectly.

## Acceptance Criteria

### HTTP Access Check
- [ ] curl/HTTP requests to `https://gainhelm.com/` return HTTP 200 OK.
- [ ] curl/HTTP requests to the direct Cloud Run URL (`https://gainhelm-web-250134012801.us-central1.run.app/`) return HTTP 200 OK.

### E2E Testing
- [ ] Running Playwright tests (`npx playwright test --config=playwright.config.js`) against the deployed URL completes successfully with all tests passing.
