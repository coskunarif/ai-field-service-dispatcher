# Task: Final Verification for SEO/GEO Milestone 3

## Objective
Run the automated SEO/GEO audit script and Playwright E2E tests to verify that the implementation is 100% compliant and functional.

## Steps
1. Run the automated audit script:
   `node scripts/gainhelm-seo-geo-audit.mjs`
2. Run the Playwright test suite:
   `npx playwright test`
   *Note: If you encounter flaky timeouts due to VM load/contention, you can run them sequentially or with `--workers=1`.*
3. Document the commands run, the exit codes, and compile the full output/logs.
4. Write your completion report/handoff to `handoff.md` in your working directory.
5. Message the parent with your results.

## Integrity constraints
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
