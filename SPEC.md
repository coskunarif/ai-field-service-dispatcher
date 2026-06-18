# Specification: SEO/GEO Optimization & Lead Conversion Boost

## Background & Rationale
Analysis of the Google Search Console (GSC) query performance reveals high impressions for target niche trade categories (such as HVAC, plumbing, electrical, locksmith, septic) but low/zero click-through rates. To move organic search clicks, the title tags and meta descriptions must be optimized to target exact high-intent query phrases. Furthermore, to move waitlist signups and lead conversion rates, waitlist form submissions on the landing pages should immediately link users to the fully functional interactive SMS dispatch simulator page (`/setup?email=...`) rather than showing a generic success message, providing instant product value.

---

## Acceptance Criteria

### [AC-1]: Metadata Optimization for Target Landing Pages
The HTML `<title>` and `<meta name="description">` tags on key trade landing pages must be updated to target high-intent search terms based on Search Console CLI data.
- **Title requirements:** Must be <= 70 characters and contain the exact high-intent target query phrase.
- **Description requirements:** Must be between 120 and 180 characters.
- **Specific targets:**
  1. `/hvac-dispatch-software`
     - Title: `Best HVAC Dispatch Software | Gainhelm`
     - Description: `Gainhelm helps HVAC teams schedule calls, assign technicians, and keep the board readable on iPad or mobile.`
  2. `/plumbing-dispatch-software`
     - Title: `Plumbing Dispatch Software for Service Calls | Gainhelm`
     - Description: `Gainhelm helps plumbing teams schedule service calls, assign plumbers, and keep the day organized.`
  3. `/field-service-scheduling`
     - Title: `Field Service Scheduling Software | Gainhelm`
     - Description: `Gainhelm helps field service teams book jobs, dispatch technicians, and keep work organized.`
  4. `/tree-service-dispatch-software`
     - Title: `Tree Service Dispatch Software | Gainhelm`
     - Description: `Gainhelm helps tree service crews schedule jobs, assign arborists, and manage work orders.`
  5. `/septic-service-dispatch-software`
     - Title: `Septic Service Dispatch & Scheduling Software | Gainhelm`
     - Description: `Gainhelm helps septic teams schedule pumpings, dispatch technicians, and coordinate tank cleanings.`
  6. `/carpet-cleaning-dispatch-software`
     - Title: `Carpet Cleaning Dispatch & Scheduling Software | Gainhelm`
     - Description: `Gainhelm helps carpet cleaning teams schedule service calls, coordinate crews, and dispatch technicians.`
  7. `/emergency-restoration-dispatch-software`
     - Title: `Emergency Restoration Dispatch & Job Software | Gainhelm`
     - Description: `Gainhelm helps disaster restoration teams schedule emergency calls, dispatch technicians, and manage jobs.`
  8. `/locksmith-dispatch-software`
     - Title: `Locksmith Dispatch & Scheduling Software | Gainhelm`
     - Description: `Gainhelm helps locksmith teams dispatch locksmiths, schedule jobs, and track work orders.`
  9. `/electrical-dispatch-software`
     - Title: `Electrical Contractor Scheduling & Dispatch Software | Gainhelm`
     - Description: `Gainhelm helps electrical contractors schedule jobs, dispatch technicians, and coordinate service calls.`

### [AC-2]: Structured Data & Schema Consistency
- H1 headers, canonical links, and JSON-LD application schema schemas on optimized landing pages must be consistent with the updated metadata.
- Running `npm run audit:seo-geo` must pass with zero failures and warnings (excluding any acceptable warning for `/` homepage).

### [AC-3]: Interactive Onboarding Playground Integration
- When the waitlist form (`#waitlist-form`) on any landing page is successfully submitted via fetch, the status element (`#waitlist-status`) must display a success message containing the string `"Thanks! You're on the waitlist. We'll be in touch soon."` AND a prominent link pointing to the interactive simulator setup page at `/setup?email=[USER_EMAIL]`.
- The user's input email must be URL-encoded in the query parameter (e.g. `/setup?email=john%40company.com`).
- The link must be highly visible and clearly styled.

### [AC-4]: Waitlist Form UX Enhancement
- The waitlist submit button on landing pages must have an action-oriented call-to-action text: `"Join Waitlist & Try Simulator"`.
- A small helper text or sublabel must indicate that signing up provides instant access to the interactive SMS simulator.

### [AC-5]: Offline Test Resilience (Fastify Server DB Fallback)
- In `/server.js`, if the Postgres `sql` client is null or unconnected, the `/waitlist` POST route must store the lead in the `inMemoryLeads` array and return `{ success: true }`, rather than failing or trying to call the external `WAITLIST_API_URL` which fails in offline/headless test runs.

---

## Interface Contract

The following identifiers must be strictly adhered to:
- **Files to modify:**
  - Niche HTML trade pages: `hvac-dispatch-software.html`, `plumbing-dispatch-software.html`, `electrical-dispatch-software.html`, etc.
  - Core web server: `server.js`
- **Waitlist Form Selectors:**
  - Form: `#waitlist-form`
  - Status Container: `#waitlist-status`
  - Inputs: `#name`, `#email`, `#company`
  - Submit Button: `.form-submit` or `#waitlist-form button[type="submit"]`
- **Onboarding/Setup Route:**
  - Path: `/setup?email=[encoded-email]`

---

## Out of Scope
- Modifying or rebuilding the compiled React code inside `/index.html`.
- Adding any new backend endpoints or physical database tables.

---

## Slices

### [S-1]: Metadata and Structured Data Optimization
- **Files:** `hvac-dispatch-software.html`, `plumbing-dispatch-software.html`, `field-service-scheduling.html`, `tree-service-dispatch-software.html`, `locksmith-dispatch-software.html`, `septic-service-dispatch-software.html`, `carpet-cleaning-dispatch-software.html`, `emergency-restoration-dispatch-software.html`, `electrical-dispatch-software.html`
- **AC Mappings:** `[AC-1]`, `[AC-2]`
- **Strategy:** Additive. Update titles, descriptions, canonical links, and JSON-LD schema blocks in place. Run `npm run audit:seo-geo` to verify compliance.

### [S-2]: Waitlist Form UI & Interactive Link Integration
- **Files:** All trade-specific and alternative landing pages containing waitlist forms (e.g., `hvac-dispatch-software.html`, etc.).
- **AC Mappings:** `[AC-3]`, `[AC-4]`
- **Strategy:** Refinement. Update waitlist scripts in each page to extract the submitted email value and insert a prominent CTA link to `/setup?email=[encoded_email]` into the success message of `#waitlist-status`. Update the button text to `"Join Waitlist & Try Simulator"`.

### [S-3]: Offline Server Resilience Fallback
- **Files:** `server.js`
- **AC Mappings:** `[AC-5]`
- **Strategy:** Refinement. In the `/waitlist` route handler, check if `sql` is null. If it is null, append the lead to `inMemoryLeads` and return `{ success: true }` immediately, bypassing the external API fetch.
