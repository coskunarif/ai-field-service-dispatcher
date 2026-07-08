# AI Agent Playbook: Testing Architecture & Guidelines

Welcome! To keep the Gainhelm codebase stable, maintainable, and regression-free, you **must** follow the testing rules and architecture described below. Do not create test files in ad-hoc folders or place them next to source code.

---

## 1. Directory Structure

All test files must reside in the centralized test directory at the project root. Do not create ad-hoc test folders or place testing scripts within operational directories.

```text
ai-field-service-dispatcher/ (Project Root)
├── tests/                              <-- Centralized Playwright Test Root
│   ├── calendar_validation.spec.js     <-- Calendar API validations & Wizard Step 3 UI tests
│   ├── sandbox_simulator.spec.js       <-- E2E Dual-screen Dispatch Simulator (Happy path, Decline/Reroute, Retry)
│   ├── gainhelm.spec.js                <-- Page load checks, error routes (404/410), waitlist, setup forms
│   ├── geo-generator.spec.js           <-- Integration tests for page generation & llms.txt updates
│   ├── wizard_resume.spec.js           <-- Auto-save, restore, and visual resume notification tests (Step 1-3)
│   ├── seo_conversion.spec.js          <-- Assertions for specific metadata across all landing pages
│   ├── directory_listings.spec.js      <-- Tests for directory listings page structure and footer routes
│   └── verify-seo-audit-robustness.js  <-- Robustness check for the SEO/GEO audit script
│
├── scripts/                            <-- Command Line Utilities & Auditing Scripts
│   ├── gainhelm-seo-geo-audit.mjs      <-- Script for SEO & GEO compliance check (run via npm run audit:seo-geo)
│   ├── find-social-leads.mjs           <-- Social lead finder utility (run via npm run find-leads)
│   └── optimize-seo-geo-pages.mjs      <-- CLI script for page optimization
│
├── seo/                                <-- SEO & Generative Engine Optimization logic
│   └── geo-generator.mjs               <-- Programmatic page generator modules
│
├── server.js                           <-- Fastify Web Server
├── playwright.config.js                <-- Playwright Configuration File
└── package.json                        <-- Node.js Dependencies & Scripts
```

---

## 2. Test Types: Why, How, and When

### 📊 Quick Comparison: Test Types & Replicated Components

| Test Type | Replicated / Real Components | Mocked / Simulated Components | Run Environment | Ideal For |
| :--- | :--- | :--- | :--- | :--- |
| **Unit & Module Integration Tests** | SEO/GEO generator module (`geo-generator.mjs`), `llms_txt_updater`, URL parsing helper logic, input validation filters. | Filesystem writes (safely unlinked or git checkout restored), external network fetches, Fastify server router. | Command Line (Playwright Runner / Node) | Generative SEO metadata validation, regex validation, and security sanitization for path injection. |
| **API & UI State Integration Tests** | Fastify endpoint handler (`/api/validate-calendar`), Wizard Step 3 state transitions, localStorage draft persistence, form submit button guard logic. | Google Calendar server API (using validation rules and local fallback patterns instead of calling live Google APIs). | Playwright Browser Test (Chromium) / Local Fastify Server | Multi-step setup wizard verification, UI responsiveness (pulsing connection animations, success colors), draft saving. |
| **E2E Sandbox Simulations** | Dual-screen layout, SMS text reception simulation interface, simulated phone UI, terminal logs feed, calendar scheduling updates, routing/dispatch algorithms. | Twilio/WhatsApp API gateway (simulated locally via UI elements & virtual phone simulator), real external calendar writes (routed to local sandbox view). | Playwright Browser Test (Chromium) / Local Fastify Server | Technician dispatch acceptance/decline flow, escalation/re-routing rules (e.g. Sarah declines, routes to Dave), retry loops on unparsable response. |
| **SEO & GEO Crawlability Audits** | Main landing pages (`/hvac-dispatch-software`, etc.), competitor alternative pages, `llms.txt`, `sitemap.xml`, `robots.txt`, structured data JSON-LD validation. | None (runs against fully generated pages and local files). | Node.js CLI script / Playwright page crawls | Ensuring every landing page has single `<h1>`, canonical links, non-empty meta description, and matches the XML sitemap exactly. |

---

## 3. Test Types Breakdown

### 💡 Unit & Module Integration Tests (`tests/geo-generator.spec.js`)
*   **Why:** To verify isolated generation algorithms, input validation sanitizers, sitemap node additions, and markdown generation logic.
*   **When:** Write a unit/module test when adding new trades, modifying keyword safety verification, or changing structured schema markup generation.
*   **How:**
    *   Mock out external database or server requests.
    *   Clean up any side effects (e.g. restore modified `sitemap.xml` or generated pages using Git checkout or automated unlinking).
    *   Verify input/output boundary constraints.
    *   *Example:* [geo-generator.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/geo-generator.spec.js)

### 💡 API & UI State Integration Tests (`tests/calendar_validation.spec.js`)
*   **Why:** To ensure that multi-step wizard state correctly serializes to browser storage, validates calendar urls according to safety filters, and guards forms against invalid configurations.
*   **When:** Write an integration test when adding setup fields, modifying calendar connection feedback, changing the localStorage serializing logic, or modifying API parameters.
*   **How:**
    *   Use Playwright's browser context to navigate to `/setup`.
    *   Mock external API endpoints where appropriate, or utilize sandbox bypass mechanisms.
    *   Assert that UI badge indicators change colors (`#10b981` for success, `#ef4444` for error) and text during transitions.
    *   *Example:* [calendar_validation.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/calendar_validation.spec.js) and [wizard_resume.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/wizard_resume.spec.js)

### 💡 End-to-End Sandbox Simulations (`tests/sandbox_simulator.spec.js`)
*   **Why:** To test the core dispatch engine including trade classification, technician lookup, SMS dispatch messaging, accept/decline responses, escalation, and calendar bookings in a fully integrated environment.
*   **When:** Write an E2E simulator test when modifying technician dispatch priority, updating conversation replies, changing timeout escalation rules, or adding support for new quick reply choices.
*   **How:**
    *   Trigger scenarios from the virtual UI panel, monitor the simulated terminal logs for key milestones, and interact with the virtual technician's mobile phone mockup.
    *   Avoid introducing external network dependencies (e.g. Twilio gateways or live Google API writes) by routing requests through sandbox simulated interfaces.
    *   *Example:* [sandbox_simulator.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/sandbox_simulator.spec.js)

### 💡 SEO & GEO Compliance Audits (`tests/gainhelm.spec.js`)
*   **Why:** To enforce absolute compliance with SEO best practices and Generative Engine Optimization (GEO/LLMO). This prevents search engine indexing penalties and ensures RAG scrapers (ClaudeBot, GPTBot, PerplexityBot) parse product details flawlessly.
*   **When:** Write or update SEO tests when adding landing pages, modifying shared headers/footers, or updating metadata configurations.
*   **How:**
    *   Verify exact h1 uniqueness (exactly 1 h1 per page), canonical matching, meta description presence, and XML sitemap alignments.
    *   *Example:* [gainhelm.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/gainhelm.spec.js) and [seo_conversion.spec.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tests/seo_conversion.spec.js)

---

## 4. Mandatory Verification Checklist for Agents

Before completing any task, you must run the following checks:
1.  **Stop Stale Processes:** Ensure no stale processes are running on port `3005` (e.g., `kill $(lsof -t -i:3005) 2>/dev/null || true`).
2.  **Targeted Playwright Tests:** Run the spec file related to your changes (e.g., `npx playwright test tests/calendar_validation.spec.js`) and confirm it passes.
3.  **Full Test Suite:** Run `npm run test` to verify no regressions were introduced elsewhere in the application.
4.  **SEO & GEO Compliance Audit:** Run `npm run audit:seo-geo` (which executes [gainhelm-seo-geo-audit.mjs](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/scripts/gainhelm-seo-geo-audit.mjs)) to guarantee HTML templates, sitemaps, and `llms.txt` match all validation rules.
5.  **Clean State Check:** Verify that temporary test artifacts have been cleaned up and that `git status` shows no untracked generated files.

---

## 5. Avoiding the Integration Gap (Lessons Learned)

To maintain codebase stability, keep in mind these project-specific lessons learned:

### 1. Element Locator Collisions in Playwright
*   **Avoid duplicate semantic tags:** When rendering layout structures (such as lists of alternative service providers or footer links), do not wrap them in duplicate semantic tags like `<footer>`. 
*   **Use descriptive container IDs:** Wrap SEO link grids in a `<div>` with a unique ID (e.g., `<div id="seo-footer-links">`). This allows crawlers to navigate the site tree while preventing Playwright strict-mode locator exceptions when targeting `page.locator('footer')`.

### 2. Strict Protocol Enforcement for External Links
*   **Validate input protocols early:** When processing user inputs like calendar subscription URLs, validate that the protocol is explicitly `http` or `https` before running hostname parsing or network fetches. This avoids server crashes on unsupported protocols like `ftp://`.

### 3. Word Boundaries in Validation Checks
*   **Enforce precise keyword matching:** When implementing bypass or match validation (e.g., letting testing keywords through rules), always use boundary markers `/\btest\b/i` rather than simple string checks like `.includes('test')`. Substring matches will mistakenly match unrelated values (such as "contest" or "pretest") leading to security bypasses or routing bugs.

### 4. Port Conflict and Test Server Re-use
*   **Kill background listeners:** Playwright is configured to run tests by starting the application on port `3005`. If a test suite run fails or is terminated prematurely, the Fastify process can remain bound to the port. Always terminate any background listeners before executing a test.

### 5. Sorting Faulty Property Defaults
*   **Define fallback numeric values:** When sorting objects dynamically in API responses (such as sorting leads by `intent_score`), ensure you provide a valid numeric default (e.g., `lead.intent_score || 0`). Missing property values can lead to `NaN` comparison errors, breaking the list rendering entirely.

### 6. HTML Above-Fold Comment Rules
*   **Keep style declarations out of SEO text content:** Inlined CSS blocks placed at the top of templates can be incorrectly processed as visible body text. When including keywords to satisfy above-fold SEO-GEO checks, wrap them inside CSS comments to avoid polluting user layouts while satisfying crawler logic.

---

## 6. Core Testing Principles for AI Agents

To maintain 100% codebase stability, all AI agents must write and verify code using the following core principles:

### 1. The Isolation Principle (Clean Slate)
*   Every test suite must guarantee hermetic isolation.
*   Always clear draft local storage entries (e.g., clearing `gainhelm_wizard_draft_${email}` after tests run) and restore files modified during sitemap or document generation.
*   *Why:* Cascading state pollution leads to flaky tests and false positives.

### 2. The Verification Loop Principle (Hypothesis First)
*   Operate in strict cycles: Analyze the bug, write a failing integration test, implement the fix, run code quality scripts, and audit.
*   Do not submit code modifications without providing a corresponding test that asserts the exact bug behavior.

### 3. The Anti-Flakiness Principle (State Sync)
*   Never use hardcoded delays (`sleep`, `setTimeout`).
*   Always use state-based synchronization helpers like Playwright's `await expect(locator).toContainText()` with appropriate timeouts.
*   Use stable accessibility labels and `id` locators instead of visual coordinates or relative position classes.

### 4. The Real-Data Principle (Integration Gating)
*   When validating routing logic, time offsets, and database interactions, ensure that inputs mirror real-world technician schedules and database schemas.
*   Run the audit scripts against fully rendered files to prevent layout breaking or malformed JSON-LD metadata from reaching production.
