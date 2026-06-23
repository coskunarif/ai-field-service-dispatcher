# SPEC.md: Bulk SEO Metadata Optimization

This specification outlines the acceptance criteria, performance KPIs, interface contract, and implementation slices for bulk-optimizing page titles, meta descriptions, and rich snippets across all 31 programmatic landing pages to maximize organic search acquisition.

## Objective
Optimize programmatic landing pages to capture high-intent search queries from trade contractors looking for dispatch/scheduling solutions or competitor alternatives, improving SERP visibility and click-through rates (CTR).

---

## Acceptance Criteria

- **[AC-1] Optimized Page Titles:** Every target landing page has an optimized title (strictly $\le$ 70 characters) incorporating exact-match GSC trade queries and Gainhelm's value proposition ("App-less", "SMS/WhatsApp", "Google Calendar").
- **[AC-2] Optimized Meta Descriptions:** Every target landing page has an optimized meta description (strictly between 120 and 180 characters) emphasizing the value proposition and containing a compelling call-to-action (CTA) to click.
- **[AC-3] Metadata & Schema Consistency:** For all 31 pages:
  - Page title matches `<title>`, `<meta property="og:title">`, `<meta name="twitter:title">`, and the JSON-LD `WebPage` entity's `name` property exactly.
  - Page description matches `<meta name="description">`, `<meta property="og:description">`, `<meta name="twitter:description">`, and the JSON-LD `WebPage` entity's `description` property exactly.
  - The JSON-LD schema parsed from each page contains a valid `WebPage` entity matching the canonical URL of the route.
- **[AC-4] Local SEO Audit Passes:** Running the local audit script `node scripts/gainhelm-seo-geo-audit.mjs` returns `PASS` with 0 failures and 0 warnings (excluding the pre-configured homepage form warning if applicable).
- **[AC-5] Playwright Test Suite Passes:** The updated target mapping is integrated into `tests/seo_conversion.spec.js` and running the test suite (`npx playwright test tests/seo_conversion.spec.js`) passes with 0 failures.

---

## Performance KPIs

- **[KPI-1] Audit Script Latency:** Running `node scripts/gainhelm-seo-geo-audit.mjs` locally must complete execution in under 2.0 seconds.
- **[KPI-2] File Size Overhead:** Total file size increase per HTML file due to metadata updates must not exceed 500 bytes (protecting page load speed and Core Web Vitals).

---

## Interface Contract

The Tester and Builder must share the exact expected titles and descriptions for all 31 pages to avoid drift. The mapping is defined below:

| Route / File | Target Title | Target Description |
| :--- | :--- | :--- |
| `/` <br> `index.html` | Gainhelm \| App-Less AI Dispatch Software for Field Services | Tired of complex field service apps techs hate using? Gainhelm offers 100% app-less SMS/WhatsApp AI dispatching integrated with Google Calendar. Join the waitlist today. |
| `/hvac-dispatch-software` <br> `hvac-dispatch-software.html` | Best HVAC Dispatch App & Software for iPad \| Gainhelm | Tired of complex HVAC dispatch apps techs hate? Gainhelm offers 100% app-less SMS/WhatsApp AI scheduling for iPad & mobile. Try the free dispatch simulator now. |
| `/plumbing-dispatch-software` <br> `plumbing-dispatch-software.html` | Plumbing Dispatch Software & App for Plumbers \| Gainhelm | Looking for lightweight dispatch software for plumbing? Gainhelm provides 100% app-less SMS scheduling integrated with Google Calendar. Try the plumbing simulator. |
| `/electrical-dispatch-software` <br> `electrical-dispatch-software.html` | Electrician Scheduling & Dispatch Software \| Gainhelm | Looking for electrician dispatch software? Gainhelm offers app-less SMS technician scheduling & electrical service coordination via Google Calendar. Try the simulator. |
| `/field-service-scheduling` <br> `field-service-scheduling.html` | Field Service Scheduling & Dispatch Software \| Gainhelm | Streamline daily field service scheduling. Gainhelm coordinates dispatching with your techs over SMS/WhatsApp—no app downloads required. Try the dispatch simulator. |
| `/tree-service-dispatch-software` <br> `tree-service-dispatch-software.html` | Tree Service Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps tree service crews schedule jobs and coordinate arborists using 100% app-less SMS dispatching. Integrate with Google Calendar. Try the simulator. |
| `/septic-service-dispatch-software` <br> `septic-service-dispatch-software.html` | Septic Service Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps septic teams schedule pumpings and dispatch technicians using simple app-less SMS. Connects directly to Google Calendar. Try the septic simulator. |
| `/carpet-cleaning-dispatch-software` <br> `carpet-cleaning-dispatch-software.html` | Carpet Cleaning Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps carpet cleaning teams schedule service calls and dispatch crews via simple SMS/WhatsApp text messaging. Google Calendar integrated. Try the simulator. |
| `/emergency-restoration-dispatch-software` <br> `emergency-restoration-dispatch-software.html` | Emergency Restoration Dispatch & Job Software \| Gainhelm | Gainhelm helps disaster restoration teams schedule emergency calls and coordinate field crews via app-less SMS/WhatsApp text messages. Try the dispatch simulator. |
| `/locksmith-dispatch-software` <br> `locksmith-dispatch-software.html` | Locksmith Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps locksmith teams schedule emergency jobs and dispatch locksmiths via app-less SMS text messages. Connects with Google Calendar. Try the simulator. |
| `/appliance-repair-dispatch-software` <br> `appliance-repair-dispatch-software.html` | Appliance Repair Dispatch & Scheduling Software \| Gainhelm | Looking for appliance repair dispatch software? Gainhelm offers 100% app-less SMS technician scheduling & Google Calendar coordination. Try the repair simulator. |
| `/pest-control-dispatch-software` <br> `pest-control-dispatch-software.html` | Pest Control Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps pest control teams schedule service requests and dispatch technicians using simple app-less SMS. Integrated with Google Calendar. Try the simulator. |
| `/garage-door-dispatch-software` <br> `garage-door-dispatch-software.html` | Garage Door Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps garage door teams coordinate scheduling and dispatch technicians using 100% app-less SMS/WhatsApp. Google Calendar sync. Try the garage simulator. |
| `/cleaning-dispatch-software` <br> `cleaning-dispatch-software.html` | Cleaning Dispatch & Maid Scheduling Software \| Gainhelm | Gainhelm helps cleaning and maid service teams schedule jobs and dispatch cleaners via app-less SMS/WhatsApp text messages. Google Calendar sync. Try the simulator. |
| `/landscaping-dispatch-software` <br> `landscaping-dispatch-software.html` | Landscaping Dispatch & Lawn Care Scheduling \| Gainhelm | Gainhelm helps landscaping and lawn care crews schedule service calls and dispatch technicians via 100% app-less SMS. Connects to Google Calendar. Try the simulator. |
| `/roofing-dispatch-software` <br> `roofing-dispatch-software.html` | Roofing Dispatch & Crew Scheduling Software \| Gainhelm | Gainhelm helps roofing contractor crews schedule service calls and dispatch technicians via 100% app-less SMS/WhatsApp. Google Calendar sync. Try the simulator. |
| `/pool-service-dispatch-software` <br> `pool-service-dispatch-software.html` | Pool Service Dispatch & Scheduling Software \| Gainhelm | Gainhelm helps pool service teams organize jobs and dispatch technicians via 100% app-less SMS/WhatsApp messaging. Google Calendar integrated. Try the simulator. |
| `/commercial-facilities-dispatch-software` <br> `commercial-facilities-dispatch-software.html` | Commercial Facilities Dispatch & Job Software \| Gainhelm | Gainhelm helps facilities maintenance teams schedule service requests and dispatch technicians using app-less SMS text messages. Connects with Google Calendar. |
| `/restoration-job-management-software` <br> `restoration-job-management-software.html` | Restoration Job Management & Dispatch Software \| Gainhelm | Gainhelm helps restoration teams manage job intake, crew scheduling, and technician dispatch via 100% app-less SMS/WhatsApp messages. Try the dispatch simulator. |
| `/handyman-dispatch-software` <br> `handyman-dispatch-software.html` | Handyman Dispatch & Job Scheduling Software \| Gainhelm | Looking for handyman dispatch software? Gainhelm offers 100% app-less SMS technician scheduling & Google Calendar coordination. Try the handyman simulator now. |
| `/servicetitan-alternative` <br> `servicetitan-alternative.html` | Lightweight ServiceTitan Alternative for Small Trades \| Gainhelm | Looking for a ServiceTitan alternative? Gainhelm offers small trades teams lightweight app-less SMS scheduling & Google Calendar integration. Try the simulator. |
| `/jobber-alternative` <br> `jobber-alternative.html` | Lightweight Jobber Alternative for Small Contractors \| Gainhelm | Looking for a lightweight Jobber alternative? Gainhelm gives small contractor teams simple app-less SMS dispatch scheduling without expensive user licensing. |
| `/housecallpro-alternative` <br> `housecallpro-alternative.html` | Lightweight Housecall Pro Alternative for Trades \| Gainhelm | Looking for a Housecall Pro alternative? Gainhelm provides a simple, lightweight dispatch scheduling board & app-less SMS routing. Try the free simulator. |
| `/servicefusion-alternative` <br> `servicefusion-alternative.html` | Lightweight Service Fusion Alternative for Trades \| Gainhelm | Looking for a Service Fusion alternative? Gainhelm offers a simple, lightweight dispatch scheduling board and app-less SMS routing. Try the free simulator. |
| `/buildops-alternative` <br> `buildops-alternative.html` | Lightweight BuildOps Alternative for Service Trades \| Gainhelm | Looking for a BuildOps alternative? Gainhelm gives small service trades teams clear scheduling and app-less SMS dispatch board routing. Try the free simulator. |
| `/fieldedge-alternative` <br> `fieldedge-alternative.html` | Lightweight FieldEdge Alternative for Service Trades \| Gainhelm | Looking for a FieldEdge alternative? Gainhelm gives small service trades teams clear scheduling and app-less SMS dispatch board routing. Try the free simulator. |
| `/hvac-dispatch-app-vs-spreadsheets` <br> `hvac-dispatch-app-vs-spreadsheets.html` | HVAC Dispatch App vs Spreadsheets: Which is Better? \| Gainhelm | Compare an HVAC dispatch app vs spreadsheets for service-call scheduling, technician assignment, mobile updates, and phone-tag reduction. Try the simulator. |
| `/how-to-choose-hvac-dispatch-app` <br> `how-to-choose-hvac-dispatch-app.html` | How to Choose the Best HVAC Dispatch App for Techs \| Gainhelm | A practical guide to choosing the best HVAC dispatch app for your service business: key features, app-less workflows, and how to avoid tech adoption failure. |
| `/how-hvac-dispatch-apps-reduce-phone-tag` <br> `how-hvac-dispatch-apps-reduce-phone-tag.html` | How HVAC Dispatch Apps Stop Office Phone Tag Chaos \| Gainhelm | Learn how an HVAC dispatch app eliminates office-to-field phone tag, automates technician assignments via SMS text messages, and keeps scheduling simple. |
| `/mobile-dispatch-board` <br> `mobile-dispatch-board.html` | HVAC Dispatch Software for iPad & Mobile Boards \| Gainhelm | Discover how HVAC dispatch software works on iPad and tablets: mobile scheduling boards, app-less SMS/WhatsApp updates for technicians, and zero dispatch friction. |
| `/tools/facebook-post-generator` <br> `tools-facebook-post-generator.html` | Free Facebook Post Generator for Trades & Services \| Gainhelm | Generate high-converting Facebook posts for HVAC, plumbing, electrical, and landscaping businesses in seconds with our free AI social media post generator. |

---

## Out of Scope
1. Modifying page design, layout, or visual elements (CSS/HTML body layouts).
2. Adding new pages or creating new body content/sections.
3. Modifying backend server logic (`server.js`) or database routing.

---

## Implementation Slices

Vertical slices focus strictly on updating HTML file titles, descriptions, and JSON-LD schema blocks. *Test implementation/updating is handled separately by the Tester and is excluded from these implementation slices.*

### `[S-1]` Core Cluster Landing Pages
- **Description:** Optimize metadata and JSON-LD schema block on the 4 primary core cluster landing pages. Serves as the implementation and QA validation baseline for the remaining slices.
- **Target Files:**
  - [hvac-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-software.html)
  - [plumbing-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/plumbing-dispatch-software.html)
  - [electrical-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/electrical-dispatch-software.html)
  - [field-service-scheduling.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/field-service-scheduling.html)
- **Mapped ACs:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`
- **Independent:** No

### `[S-2]` Competitor Alternative Pages
- **Description:** Optimize metadata and JSON-LD schema blocks across the 6 competitor alternative comparison pages.
- **Target Files:**
  - [servicetitan-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/servicetitan-alternative.html)
  - [jobber-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/jobber-alternative.html)
  - [housecallpro-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/housecallpro-alternative.html)
  - [servicefusion-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/servicefusion-alternative.html)
  - [buildops-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/buildops-alternative.html)
  - [fieldedge-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/fieldedge-alternative.html)
- **Mapped ACs:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`
- **Independent:** Yes

### `[S-3]` Supporting Content & Blog Pages
- **Description:** Optimize metadata and JSON-LD schema blocks across the 4 supporting content/blog pages.
- **Target Files:**
  - [hvac-dispatch-app-vs-spreadsheets.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-app-vs-spreadsheets.html)
  - [how-to-choose-hvac-dispatch-app.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/how-to-choose-hvac-dispatch-app.html)
  - [how-hvac-dispatch-apps-reduce-phone-tag.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/how-hvac-dispatch-apps-reduce-phone-tag.html)
  - [mobile-dispatch-board.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/mobile-dispatch-board.html)
- **Mapped ACs:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`
- **Independent:** Yes

### `[S-4]` Niche Trade Pages, Tools, and Homepage
- **Description:** Optimize metadata and JSON-LD schema blocks on the remaining niche trade landing pages, tools pages, and the homepage.
- **Target Files:**
  - [index.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/index.html)
  - [tools-facebook-post-generator.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tools-facebook-post-generator.html)
  - [appliance-repair-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/appliance-repair-dispatch-software.html)
  - [pest-control-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/pest-control-dispatch-software.html)
  - [garage-door-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/garage-door-dispatch-software.html)
  - [cleaning-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/cleaning-dispatch-software.html)
  - [landscaping-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/landscaping-dispatch-software.html)
  - [roofing-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/roofing-dispatch-software.html)
  - [locksmith-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/locksmith-dispatch-software.html)
  - [pool-service-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/pool-service-dispatch-software.html)
  - [commercial-facilities-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/commercial-facilities-dispatch-software.html)
  - [septic-service-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/septic-service-dispatch-software.html)
  - [emergency-restoration-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/emergency-restoration-dispatch-software.html)
  - [restoration-job-management-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/restoration-job-management-software.html)
  - [handyman-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/handyman-dispatch-software.html)
  - [carpet-cleaning-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/carpet-cleaning-dispatch-software.html)
  - [tree-service-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tree-service-dispatch-software.html)
- **Mapped ACs:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`
- **Independent:** Yes
