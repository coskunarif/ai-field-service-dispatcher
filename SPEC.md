# SPEC.md - Trade Landing Pages Persuasion & Meta Optimizations

## Objective
Optimize the titles, meta descriptions (search snippets), H1 headings, and hero copy of all 9 target trade landing pages to make them highly persuasive, click-enticing, and direct for contractor trade owners. Ensure all changes maintain local SEO/GEO audit compliance, pass E2E visual/functional tests, and stay within strict file size change limits.

## Acceptance Criteria
- **[AC-1] Persuasive Titles & Descriptions**: Update `<title>`, `<meta name="description">` (and matching OpenGraph `og:title`/`og:description`, Twitter `twitter:title`/`twitter:description` tags) in the target landing page HTML files and their JSON-LD schema blocks. The descriptions must be between 120 and 180 characters, and copies must be tailored directly to contractor trade owners to maximize click-through rate.
  *Verification*: Read HTML tags and verify titles/descriptions match the Interface Contract. Run `npm run audit:seo-geo` and ensure no length warnings are triggered.
- **[AC-2] Persuasive H1 & Hero Copy**: Update `<h1>` headings and hero copy (subtitle/lede paragraph text) to highlight Gainhelm's unique value proposition for tradesmen (automated SMS coordination, zero app installs for technicians, Google Calendar synchronization, and eliminating phone tag).
  *Verification*: Inspect H1 and hero paragraphs on all 9 routes to confirm copies match the Interface Contract.
- **[AC-3] Test Compliance**: Ensure the Playwright E2E test suite passes successfully. The expected metadata mappings in `tests/seo_conversion.spec.js` must be updated by the Tester to align with the Interface Contract before building.
  *Verification*: Run `npx playwright test --workers=1` and ensure all tests pass.
- **[AC-4] File Size Constraints**: Maintain the modified HTML file sizes within less than 1KB difference from the original baseline files to avoid bloat.
  *Verification*: Compare file sizes in bytes using `stat` or `wc -c` before and after changes; difference must be <= 1024 bytes per page.

## Performance KPIs
- **[KPI-1] File Size Delta**: HTML document size change for each landing page must be `< 1024` bytes (1KB) from the git baseline.
- **[KPI-2] Visual Verification**: Page rendering and first-contentful paint remains unaffected, with zero visual layout shifts (CLS).
- **[KPI-3] Audit Execution**: The local SEO/GEO audit script runs in `< 3s`.

## Interface Contract
The target files to modify are:
- `hvac-dispatch-software.html`
- `plumbing-dispatch-software.html`
- `field-service-scheduling.html`
- `tree-service-dispatch-software.html`
- `septic-service-dispatch-software.html`
- `carpet-cleaning-dispatch-software.html`
- `emergency-restoration-dispatch-software.html`
- `locksmith-dispatch-software.html`
- `electrical-dispatch-software.html`

The exact metadata mappings that must be shared between the Tester (for test specs) and the Builder (for HTML files) are:

```json
{
  "/hvac-dispatch-software": {
    "title": "AI-First HVAC Dispatch Software & SMS Scheduling | Gainhelm",
    "description": "Stop playing phone tag. Gainhelm automates HVAC dispatching and scheduling via headless SMS. Coordinates techs, syncs calendars, and runs on autopilot. Try simulator."
  },
  "/plumbing-dispatch-software": {
    "title": "AI-First Plumbing Dispatch Software & SMS Scheduling | Gainhelm",
    "description": "Stop wasting time on manual plumber scheduling. Gainhelm dispatches plumbing calls via automated SMS, tracks technician acceptance, and syncs Google Calendar."
  },
  "/field-service-scheduling": {
    "title": "AI-First Field Service Scheduling & SMS Dispatching | Gainhelm",
    "description": "Ditch complex field service dashboards. Gainhelm dispatches jobs to field technicians via 100% headless SMS and keeps your Google Calendar updated on autopilot."
  },
  "/tree-service-dispatch-software": {
    "title": "AI-First Tree Service Dispatch Software & SMS Scheduling | Gainhelm",
    "description": "Coordinate tree service crews on autopilot. Gainhelm dispatches arborist crews via automated text messages, handles schedule changes, and syncs Google Calendar."
  },
  "/septic-service-dispatch-software": {
    "title": "AI-First Septic Service Dispatch & SMS Scheduling | Gainhelm",
    "description": "Automate septic pumping dispatching. Gainhelm schedules tank cleanings, dispatches septic crews via headless SMS, and keeps customer job details organized."
  },
  "/carpet-cleaning-dispatch-software": {
    "title": "AI-First Carpet Cleaning Dispatch & SMS Scheduling | Gainhelm",
    "description": "Stop wasting hours scheduling carpet cleaning crews. Gainhelm dispatches booking requests via automated SMS and syncs cleanings directly with Google Calendar."
  },
  "/emergency-restoration-dispatch-software": {
    "title": "AI-First Emergency Restoration Dispatch & SMS Job App | Gainhelm",
    "description": "Fast-track emergency dispatching. Gainhelm dispatches disaster restoration crews via automated SMS, handles urgent job confirmations, and syncs Google Calendar."
  },
  "/locksmith-dispatch-software": {
    "title": "AI-First Locksmith Dispatch Software & SMS Scheduling | Gainhelm",
    "description": "Automate emergency locksmith dispatching. Gainhelm schedules locksmiths, dispatches urgent jobs via headless text messages, and updates calendars in real-time."
  },
  "/electrical-dispatch-software": {
    "title": "AI-First Electrical Dispatch Software & SMS Scheduling | Gainhelm",
    "description": "Ditch the phone tag. Gainhelm dispatches electrician service calls and updates contractor schedules via automated text messages. Syncs with Google Calendar."
  }
}
```

The corresponding H1 headings and Hero Copy for each page are defined as:

1. **HVAC**:
   - **H1**: `Automate HVAC Dispatching & Keep Techs on the Road Without App Bloat`
   - **Hero Copy**: `Tired of chasing technicians? Gainhelm schedules HVAC service calls, dispatches jobs via text message, and updates your Google Calendar automatically—no apps to download.`
2. **Plumbing**:
   - **H1**: `Automate Plumber Scheduling & Stop Playing Telephone with Your Crew`
   - **Hero Copy**: `Stop chasing plumbers for job updates. Gainhelm schedules plumbing calls, dispatches technicians via simple text messages, and updates your office calendar on autopilot.`
3. **Field Service**:
   - **H1**: `Streamline Field Service Scheduling with Headless SMS Dispatching`
   - **Hero Copy**: `Tired of screen-tapping bulky field service apps? Gainhelm coordinates scheduling and technician dispatching entirely in natural language via text. 100% app-free for techs.`
4. **Tree Service**:
   - **H1**: `Dispatch Tree Crews & Coordinate Arborists Without Complex App Logins`
   - **Hero Copy**: `Stop playing phone tag with crews in the field. Gainhelm dispatches tree service work orders via SMS, tracks arborist confirmations, and syncs your calendar automatically.`
5. **Septic**:
   - **H1**: `Automate Septic Dispatching & Pumping Schedules with Headless SMS`
   - **Hero Copy**: `Tired of manually coordinating pumping routes? Gainhelm dispatches septic technicians via simple text messages, tracks job acceptance, and updates your calendar instantly.`
6. **Carpet Cleaning**:
   - **H1**: `Automate Carpet Cleaning Dispatching & Keep Booking Calendars Full`
   - **Hero Copy**: `Ditch manual calendars and endless texting. Gainhelm coordinates carpet cleaning jobs via headless SMS, dispatches crews instantly, and syncs calendar updates automatically.`
7. **Emergency Restoration**:
   - **H1**: `Automate Emergency Restoration Dispatching for Rapid Job Responses`
   - **Hero Copy**: `Restoration calls are high-stakes. Gainhelm dispatches disaster restoration technicians via headless SMS instantly, handles rapid confirmation, and coordinates crews 24/7.`
8. **Locksmith**:
   - **H1**: `Dispatch Emergency Locksmiths and Coordinate Crews on Autopilot`
   - **Hero Copy**: `Stop playing phone tag during emergency lockouts. Gainhelm dispatches locksmith technicians via automated SMS, tracks technician acceptance, and syncs Google Calendar.`
9. **Electrical**:
   - **H1**: `Automate Electrician Dispatching & Coordinate Service Calls via SMS`
   - **Hero Copy**: `No more manual scheduling or text tag. Gainhelm coordinates electrical service calls, dispatches electrician teams via headless text, and updates Google Calendar automatically.`

## Out of Scope
- Optimizing pages other than the 9 trade landing pages (e.g. `/` homepage, `/tools/facebook-post-generator`, alternative comparisons, spreadsheets guide).
- Modifying styling rules (`styles.css`), layout assets, or page structures (like forms, buttons, inputs).
- Modifying backend server logic, routing handlers, database structures, or setup wizards.

## Objections
- Critic Objections: None raised.

## Slices
Task type: **refinement** (test strategy: update/snapshot tests).

- **[S-1] HVAC, Plumbing, and Electrical Updates**: Update titles, meta tags (including OpenGraph/Twitter), H1 headings, hero paragraph copies, and JSON-LD schema blocks in HVAC, Plumbing, and Electrical landing page files.
  - Files: `hvac-dispatch-software.html`, `plumbing-dispatch-software.html`, `electrical-dispatch-software.html`
  - ACs: `[AC-1]`, `[AC-2]`, `[AC-4]`
  - `[Independent: Yes]`
- **[S-2] Field Service, Locksmith, and Septic Updates**: Update titles, meta tags (including OpenGraph/Twitter), H1 headings, hero paragraph copies, and JSON-LD schema blocks in Field Service, Locksmith, and Septic landing page files.
  - Files: `field-service-scheduling.html`, `locksmith-dispatch-software.html`, `septic-service-dispatch-software.html`
  - ACs: `[AC-1]`, `[AC-2]`, `[AC-4]`
  - `[Independent: Yes]`
- **[S-3] Carpet Cleaning, Emergency Restoration, and Tree Service Updates**: Update titles, meta tags (including OpenGraph/Twitter), H1 headings, hero paragraph copies, and JSON-LD schema blocks in Carpet Cleaning, Emergency Restoration, and Tree Service landing page files.
  - Files: `carpet-cleaning-dispatch-software.html`, `emergency-restoration-dispatch-software.html`, `tree-service-dispatch-software.html`
  - ACs: `[AC-1]`, `[AC-2]`, `[AC-4]`
  - `[Independent: Yes]`
