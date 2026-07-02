# Original User Request

## 2026-06-07T11:38:26Z

Enhance the UI/UX design of all 30+ static SEO landing pages for Gainhelm by polishing the global stylesheet (`styles.css`) to be highly premium, responsive, and visually cohesive, without introducing new features.

Working directory: /home/ubuntuadmin/projects/ai-field-service-dispatcher
Integrity mode: benchmark

## Requirements

### R1. Refine Global CSS Styling & Aesthetics
Polish the global stylesheet (`styles.css`) to implement premium web design aesthetics. This includes typography hierarchy, clean responsive grids/flex containers, smooth micro-animations/transitions for interactive elements (buttons, links, form inputs), subtle gradients, and glassmorphic headers, matching a modern SaaS standard.

### R2. Ensure Fully Responsive Layout & Readability
All landing pages must be perfectly responsive and readable across mobile, tablet, and desktop viewports. The layout must have zero horizontal overflow/scrolling, proper line heights for text readability, and consistent spacing between sections.

### R3. Maintain Functional & Technical Integrity
Do not alter the HTML structures or add new javascript features unless absolutely necessary for layout bugs. All existing routes, forms (especially waitlist submissions), and redirects must remain fully functional.

## Verification Resources
- **Playwright Test Suite**: The existing test suite located at `tests/gainhelm.spec.js` checks page response codes, SEO element presence, redirects, form actions, and wizard setups. These must all pass.

## Acceptance Criteria

### Visual & Layout Polish
- [ ] No horizontal scrollbars or layout breakage occurs on mobile (320px), tablet (768px), or desktop (1440px) viewports.
- [ ] Typography uses a consistent modular scale (Plus Jakarta Sans) with readable line-heights (1.5 - 1.7) and appropriate letter-spacing for headers.
- [ ] Interactive elements (buttons, inputs, links, details blocks) feature smooth focus/hover transitions.

### Technical & Functional Compliance
- [ ] Running the test command `npx playwright test` completes successfully with all tests passing.
- [ ] Waitlist form input fields (name, email, company) and status feedback containers (success/error states) remain functional and are styled cohesively.
- [ ] SEO-critical HTML tags (H1, meta descriptions, canonical links) are untouched and remain valid.

## Follow-up — 2026-06-07T11:43:04Z

The user has requested: "please commit and push the changes when the mission is completed." Once your team successfully completes the task and passes all checks, please commit the changes and push them to the remote repository.

## 2026-06-07T20:11:58Z

Establish Gainhelm's initial organic distribution channels by implementing direct outreach systems, forum marketing campaigns (Reddit/communities), and listing the app in relevant software directories as outlined in the Distribution Playbook.

Working directory: /home/ubuntuadmin/projects/ai-field-service-dispatcher/seo/distribution
Integrity mode: benchmark

## Requirements

### R1. Target Directory & Community Database
Identify and compile a structured database of at least 15 target platforms, general SaaS directories (e.g., AlternativeTo, ProductHunt alternatives), and trade-specific communities (specifically HVAC, plumbing, locksmith, and small business subreddits or forums). The database must include submission links, audience size metrics, rules, and guidelines for each entry.

### R2. Tailored Outreach & Forum Templates
Draft a set of customized templates (including cold emails, Reddit posts/comments, and DM templates) designed specifically for trade business owners, showcasing Gainhelm's core value proposition (agent-first SMS coordination, no app install required) in an authentic, value-first manner.

### R3. Execution Playbook
Produce a detailed execution guide outlining the step-by-step process for performing manual outreach, submitting to directories, tracking progress, and avoiding spam flags or compliance issues.

## Reference Materials
- [Distribution Playbook](file:///home/ubuntuadmin/projects/knowledge/distribution-playbook.md)
- [App Description](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/APP_DESCRIPTION.md)

## Acceptance Criteria

### R1. Target Directory & Community Database Verification
- [ ] Database contains at least 15 verified target listings in a structured markdown table.
- [ ] At least 5 target entries are specific to home services, contractor trades, or small business owners.
- [ ] Each entry has Name, URL, Type, Estimated Audience Size, and Posting/Submission Guidelines.

### R2. Tailored Outreach & Forum Templates Verification
- [ ] At least 3 distinct cold email outreach templates targeting trade business owners.
- [ ] At least 3 distinct Reddit post/comment templates addressing scheduling pain points.
- [ ] At least 2 DM templates for direct messaging on social/professional networks.
- [ ] All templates highlight Gainhelm's app-less, agent-first value proposition without sounding like spam.

### R3. Execution Playbook Verification
- [ ] Includes a step-by-step submission checklist for directories.
- [ ] Includes guidelines to avoid spam flags and comply with community rules (especially Reddit's self-promotion rules).
- [ ] Contains a blank markdown tracking table for logging campaign progress (Platform, Status, Sent Date, Response).

## 2026-06-27T22:32:33Z

Enhance the SEO and GEO (Generative Engine Optimization) performance across the Gainhelm website to improve ranking for core keywords and increase citability by AI search engines.

Working directory: /home/ubuntuadmin/projects/ai-field-service-dispatcher
Integrity mode: development

## Requirements

### R1. Standardize FAQ Schema
Add missing `FAQPage` JSON-LD blocks containing relevant questions and answers for all remaining service trade/industry pages (including garage-door, roofing, locksmith, pool-service, commercial-facilities, septic-service, restoration-job-management, handyman, carpet-cleaning, tree-service) and the mobile dispatch board page.

### R2. Verify Social Meta Tags
Audit and correct `og:title` and `twitter:title` metadata tags on all landing pages to ensure they correctly match the page's service trade focus and do not list incorrect or mismatched trades.

### R3. Update Verification Suite
Update the automated SEO/GEO audit script (`scripts/gainhelm-seo-geo-audit.mjs`) to verify that all trade-specific landing pages and key route pages have valid FAQPage structured JSON-LD data and consistent OG/Twitter title tags.

## Verification & Acceptance Criteria

### Technical Audits
- Every trade-specific landing page and key route page has a valid JSON-LD structure including a `FAQPage` block with at least 3 trade-specific questions and answers.
- Every landing page has matching `og:title` and `twitter:title` properties that correctly correspond to its main page title.
- Running `node scripts/gainhelm-seo-geo-audit.mjs` completes successfully with a `PASS` status, containing no errors or warnings.

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
