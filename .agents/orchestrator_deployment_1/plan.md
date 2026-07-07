# Execution Plan: Gainhelm Redeployment and Verification

## Milestone 1: Re-deploy to Google Cloud Run
- **Objective**: Deploy the current codebase to Google Cloud Run service `gainhelm-web` in project `profithelm-477200`.
- **Steps**:
  1. Dispatch `teamwork_preview_worker` to run the `gcloud run deploy` command.
  2. Verify the command completes successfully and output contains the direct URL.
- **Verification**: Exit code 0, service URL returned.

## Milestone 2: Verify Deployment Accessibility
- **Objective**: Ensure that both `https://gainhelm.com/` and the direct Cloud Run service URL return `200 OK`.
- **Steps**:
  1. Dispatch `teamwork_preview_worker` to perform `curl -Is https://gainhelm.com/` and check for HTTP 200.
  2. Perform similar check for the direct service URL.
- **Verification**: Direct response starts with `HTTP/1.1 200` or `HTTP/2 200`.

## Milestone 3: Run Playwright E2E Tests
- **Objective**: Confirm that the full Playwright E2E test suite passes when targeted at the live site.
- **Steps**:
  1. Dispatch `teamwork_preview_worker` to run `BASE_URL=https://gainhelm.com npx playwright test --config=playwright.config.js`.
  2. Capture the test results and report them.
- **Verification**: Playwright reports 100% tests passed.
