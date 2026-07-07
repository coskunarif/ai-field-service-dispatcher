## 2026-07-03T18:48:39Z

You are a Worker subagent tasked with implementing SEO and GEO optimizations across the Gainhelm codebase. Your working directory is `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/worker_seo_geo_1`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please execute the following tasks:

1. Update `scripts/gainhelm-seo-geo-audit.mjs`:
   - Enhance the `isTargetPage(p)` function (or the main audit loop) to ensure all 36 sitemap routes in `sitemap.xml` are validated (including alternatives, tools, and guide pages).
   - Ensure the audit script verifies that `og:title` and `twitter:title` exist and match the `<title>` tag exactly on all pages.
   - Audit that the JSON-LD schema of all pages has `WebPage` author information ("Coskun Arif") and `dateModified` properties.
   - Update `getPageTradeKeywords(p)` to return trade-specific or category-specific keywords for alternative pages and tools pages:
     - For alternatives (e.g., `servicetitan-alternative`, `jobber-alternative`, etc.): return `['alternative', 'dispatch', 'scheduling', 'field service', 'technician', 'contractor', 'software', 'servicetitan', 'jobber', 'housecall', 'servicefusion', 'buildops', 'fieldedge']`.
     - For tools (e.g., `tools-contractor-leads`, `tools-lead-queue`, `tools-facebook-post-generator`): return `['tool', 'leads', 'queue', 'generator', 'marketing', 'facebook', 'contractor', 'dispatch', 'scheduling']`.
     - For guides (e.g., `how-hvac-dispatch-apps-reduce-phone-tag`, `how-to-choose-hvac-dispatch-app`, `hvac-dispatch-app-vs-spreadsheets`): return `['hvac', 'dispatch', 'scheduling', 'app', 'software', 'spreadsheets', 'phone tag', 'techs']`.
   - Ensure the audit script verifies that all pages have a `FAQPage` schema containing at least 3 trade/category-specific Q&As.

2. Modify `tools-contractor-leads.html`:
   - Update `<title>` to: `Free Contractor Leads Dashboard & AI Outreach Tool | Gainhelm`
   - Update meta description to: `Track local contractor business leads and generate high-conversion email drafts with Gainhelm's free Contractor Leads Dashboard tool. Try the simulator.`
   - Add `<meta property="og:title" content="Free Contractor Leads Dashboard & AI Outreach Tool | Gainhelm">` and `<meta name="twitter:title" content="Free Contractor Leads Dashboard & AI Outreach Tool | Gainhelm">` in the `<head>`.
   - Inject `"author"` ("Coskun Arif", jobTitle: "Field Service Expert") and `"dateModified"` ("2026-07-03") to the `WebPage` object in its JSON-LD schema.
   - Append a `FAQPage` schema containing 3 trade-specific questions/answers (e.g., about AI templates, direct dispatch, supported trades).
   - Append an HTML section at the bottom of the page displaying these 3 FAQs to the user.
   - Add a direct answer paragraph, trade statistics, and founder quote in the page body above the tool container.

3. Modify `tools-lead-queue.html`:
   - Update `<title>` to: `Contractor Social Lead Queue & Dispatch Simulator | Gainhelm`
   - Update meta description to: `Free contractor tool: Track incoming local service leads in real-time and simulate SMS dispatch workflows. Boost speed-to-lead and technician assignments today.`
   - Add `<meta property="og:title" content="Contractor Social Lead Queue & Dispatch Simulator | Gainhelm">` and `<meta name="twitter:title" content="Contractor Social Lead Queue & Dispatch Simulator | Gainhelm">` in the `<head>`.
   - Inject `"author"` ("Coskun Arif", jobTitle: "Field Service Expert") and `"dateModified"` ("2026-07-03") to the `WebPage` object in its JSON-LD schema.
   - Append a `FAQPage` schema containing 3 trade-specific questions/answers (e.g., about social lead queue, app adoption, free simulator).
   - Append an HTML section at the bottom of the page displaying these 3 FAQs to the user.
   - Add a direct answer paragraph, trade statistics, and founder quote in the page body above the tool container.

4. Modify HVAC guide pages (`how-hvac-dispatch-apps-reduce-phone-tag.html`, `how-to-choose-hvac-dispatch-app.html`, and `hvac-dispatch-app-vs-spreadsheets.html`):
   - Optimize titles and OG/Twitter titles to fit within 50-60 characters.
   - Append `FAQPage` schemas containing at least 3 trade-specific questions/answers.
   - Append corresponding FAQ HTML sections to the page bodies.

5. Modify competitor alternative pages (`buildops-alternative.html`, `fieldedge-alternative.html`, `jobber-alternative.html`, `servicetitan-alternative.html`):
   - Shorten titles and OG/Twitter titles to be within 50-60 characters (e.g., `Lightweight ServiceTitan Alternative Board | Gainhelm`, `Lightweight Jobber Alternative for Trades | Gainhelm`, etc.).
   - Ensure they have the correct `author` ("Coskun Arif") and `dateModified` properties in JSON-LD.

6. Modify `robots.txt`:
   - Add the specialized ChatGPT Search assistant stanza:
     ```txt
     User-agent: OAI-SearchBot
     Allow: /
     ```

7. Run `npm run audit:seo-geo` and `npm test` locally to verify that the audit script passes with ZERO errors and ZERO warnings, and Playwright tests pass successfully.

Provide a detailed handoff report when complete.
