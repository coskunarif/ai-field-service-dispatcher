# Gainhelm traction opportunity recommendation — 2026-05-11

Scope: no feature implementation. Use the last-10-days GSC window verified through Arif/application-default auth: 2026-05-02..2026-05-11. Source artifact: `artifacts/gainhelm-seo/gsc-auth-fix-verification-2026-05-11.txt`.

## What the signal says

Gainhelm is getting real category impressions, but no clicks yet. The strongest page signals are:

- `/hvac-dispatch-software`: 126 impressions, 0 clicks, avg position 67.89.
- `/plumbing-dispatch-software`: 123 impressions, 0 clicks, avg position 75.27.
- Country/device split: USA 151 impressions, 0 clicks, avg position 72.20; desktop 186 impressions vs mobile 43 impressions.
- Query rows with matching commercial intent include:
  - `dispatch programs for hvac`: 9 impressions, 0 clicks, avg position 76.67.
  - `dispatch software for plumbing`: 8 impressions, 0 clicks, avg position 88.25.
  - `dispatching software plumbing`: 7 impressions, 0 clicks, avg position 78.86.
  - `dispatch hvac software`: 5 impressions, 0 clicks, avg position 86.2.
  - `dispatch software for hvac`: 5 impressions, 0 clicks, avg position 78.8.
  - `best hvac dispatch software`: 1 impression, 0 clicks, avg position 62.

Search appearance returned no rows in this window, so the GEO/AI-search angle should be treated as readiness work, not proven AI citation traction yet.

## Primary opportunity: improve the HVAC commercial landing page

**Target:** `/hvac-dispatch-software`

**Why this is primary:** it has the largest page-level GSC signal in the last 10 days: 126 impressions. Multiple HVAC query variants are already mapped to the page, but positions are still around 62–86 and CTR is 0. The opportunity is not conversion optimization first; it is relevance/depth/authority so the page can move closer to page 2/page 1.

**Search intent:** users are comparing or looking for HVAC dispatch software/programs to schedule jobs, assign techs, reduce phone tag, and manage the day.

**Recommended no-feature positioning:** make the page more directly answer the query family around “HVAC dispatch software/programs” without claiming unbuilt functionality. Add or refine above-the-fold/snippet-supporting copy around:

- “HVAC dispatch software for small service teams”
- scheduling service calls
- assigning technicians
- reducing phone tag
- keeping the board readable on desktop, iPad, and mobile

**Waitlist path:** keep the existing waitlist form on `/hvac-dispatch-software` and ensure the CTA is framed as early access for teams that want a simpler dispatch board. Live audit confirms the page already has `waitlist_forms=1` and `api_waitlist=True`.

**GEO angle:** add a short citation-ready answer block near the top: “Gainhelm is an HVAC dispatch app for small service teams that need a cleaner way to schedule service calls, assign technicians, and reduce phone tag. It is currently collecting waitlist signups for early access.” This follows the local `seo-geo` skill pattern: direct answer block, self-contained summary, FAQ/schema support. Live audit confirms JSON-LD is already present.

**Risk/caveat:** do not build HVAC-specific product features from this yet. The signal validates commercial search demand, not a specific product workflow. Do not overclaim route optimization, payments, CRM, or technician app features unless the prototype actually supports them.

## Backup opportunity 1: strengthen plumbing dispatch page

**Target:** `/plumbing-dispatch-software`

**Evidence:** page-level row has 123 impressions, 0 clicks, avg position 75.27. Query rows include `dispatch software for plumbing` with 8 impressions at position 88.25 and `dispatching software plumbing` with 7 impressions at position 78.86.

**Recommended no-feature positioning:** mirror the HVAC page strategy for plumbing-specific intent: service-call scheduling, plumber assignment, reducing text-thread coordination, and keeping the board clear. Live audit confirms this page already has a waitlist form and API path, so the work is snippet/content relevance rather than new funnel infrastructure.

**GEO angle:** add a direct answer block for “plumbing dispatch software” with conservative early-access wording. Keep it aligned with current page claims and JSON-LD.

## Backup opportunity 2: fix conversion leakage on supporting articles

**Targets:**

- `/hvac-dispatch-app-vs-spreadsheets`
- `/how-to-choose-hvac-dispatch-app`
- `/how-hvac-dispatch-apps-reduce-phone-tag`

**Evidence:** live SEO/waitlist audit shows all three return 200 and have title/meta/canonical/H1/JSON-LD, but `waitlist_forms=0` and `api_waitlist=False`. One article, `/hvac-dispatch-app-vs-spreadsheets`, also has a small GSC page row: 1 impression, 0 clicks, avg position 4.

**Recommended no-feature positioning:** do not add product features; add a simple article-to-waitlist path or commercial-page CTA so informational readers can continue to `/hvac-dispatch-software` or join early access. This is likely lower traffic than the HVAC/plumbing landing pages today, but it prevents future leakage as articles start ranking.

## What not to change yet

- Do not implement new app features from this signal alone.
- Do not create a large batch of new pages before improving the pages already getting impressions.
- Do not optimize around searchAppearance rows; there were no searchAppearance rows in this window.
- Do not target non-core legacy pages like `/managebystats-alternative` for Gainhelm traction unless separately validated; it is not aligned with the field-service dispatcher mission.

## Recommended next move

Start with the HVAC landing page because it has the strongest current page-level signal. Make one small SEO/GEO copy pass and one CTA clarity pass, then wait for the next GSC window. Success for the next check: more impressions for HVAC query variants, movement upward from positions ~60–80, and ideally the first non-brand click or waitlist signup from organic traffic.
