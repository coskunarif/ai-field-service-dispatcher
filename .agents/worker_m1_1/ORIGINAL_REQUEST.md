## 2026-06-27T22:36:20Z
You are Worker 1. Your working directory is: /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/worker_m1_1

Your task is to modify the automated SEO/GEO audit script: `scripts/gainhelm-seo-geo-audit.mjs`.
Based on the Explorer reports in `.agents/explorer_m1_1/handoff.md`, `.agents/explorer_m1_2/handoff.md`, and `.agents/explorer_m1_3/handoff.md`, implement:
1. A robust HTML entity decoder helper function to normalize titles (`title`, `og:title`, `twitter:title`) before comparison.
2. Logic to detect target/landing pages: key routes (`/`, `/field-service-scheduling`, `/mobile-dispatch-board`) and trade pages ending in `-dispatch-software` or `-job-management-software`.
3. Validation that every target/landing page has `og:title` and `twitter:title` metadata tags, and that they match the decoded main page `<title>` tag.
4. Validation that every target/landing page has a valid `FAQPage` block in JSON-LD structure with at least 3 trade-specific or page-specific questions and answers containing trade-specific keywords.
5. Make sure the audit script exits with code 1 if there are failures, and prints out clear diagnostic messages detailing the errors.

After modifying the audit script, run it:
`node scripts/gainhelm-seo-geo-audit.mjs`
And verify that it fails by reporting the expected 16 (or 14-16) validation errors on the current landing pages. Document the execution output and command results.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please write your handoff report to `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/worker_m1_1/handoff.md` and use send_message when completed.
