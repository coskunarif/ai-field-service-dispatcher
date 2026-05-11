# Gainhelm traction + SEO/GEO analysis — 2026-05-11

## GSC status
Exact last-10-day Google Search Console extraction for 2026-05-01 to 2026-05-10 is currently blocked: the local service-account credentials return `sites: []` and `403 insufficient permission` for `sc-domain:gainhelm.com` across query, page, country, device, and searchAppearance dimensions. Evidence: `artifacts/gainhelm-seo/last-10-days-gsc-access-attempt-2026-05-11.txt`.

Latest usable cached GSC baseline is 2026-04-08 to 2026-05-06:
- `hvac dispatch app` → `/hvac-dispatch-software`: 61 impressions, 0 clicks, avg position ~72.1.
- `hvac dispatch software` → `/hvac-dispatch-software`: 15 impressions, 0 clicks, avg position ~79.3.
- `best hvac dispatch software`: 4 impressions, 0 clicks, avg position 57.5.
- `plumbing dispatch software` → `/plumbing-dispatch-software`: 13 impressions, 0 clicks, avg position ~83.5.
- `plumbing dispatch app` → `/plumbing-dispatch-software`: 3 impressions, 0 clicks, avg position 87.
- `/field-service-scheduling`: discovered, currently not indexed.

Interpretation: Gainhelm is getting early impressions in the right commercial category, but rankings are too low to produce clicks. The first growth constraint is not CTA conversion yet; it is getting target pages indexed and moving commercial pages from positions ~60–90 toward page 2/page 1.

## Current live SEO/GEO state
Live checks show `robots.txt`, `sitemap.xml`, and `llms.txt` return 200. The sitemap lists the core cluster pages. The llms.txt describes Gainhelm and core search terms for AI crawlers. All checked live pages return 200 with title, meta description, canonical, one H1, and JSON-LD.

Waitlist forms are present on:
- `/`
- `/hvac-dispatch-software`
- `/plumbing-dispatch-software`
- `/field-service-scheduling`
- `/mobile-dispatch-board`

Waitlist forms are absent on supporting article pages:
- `/hvac-dispatch-app-vs-spreadsheets`
- `/how-to-choose-hvac-dispatch-app`
- `/how-hvac-dispatch-apps-reduce-phone-tag`

## Recommended next actions, no feature implementation

| Priority | Action | Evidence source | Expected impact | Implementation complexity | Safe/deferred classification |
|---|---|---|---|---|---|
| P0 | Restore Search Console property access for the local service account, then rerun query/page/country/device/searchAppearance for 2026-05-01..2026-05-10. | `artifacts/gainhelm-seo/last-10-days-gsc-access-attempt-2026-05-11.txt` shows `sites: []` and 403 for all requested GSC dimensions. | Unlocks real last-10-day traction analysis and prevents optimizing from stale/cached data. | Low technically, but requires GSC owner/admin permission outside the repo. | Deferred / permission-gated; no product feature implementation. |
| P1 | Verify `/field-service-scheduling` indexing after GSC access is restored; request indexing if it is still discovered but not indexed. | Cached GSC baseline in this report and `artifacts/gainhelm-seo/current-gsc-baseline-fresh.md` show `/field-service-scheduling` as discovered but not indexed; live audit shows the page returns 200 with canonical/H1/JSON-LD/waitlist form. | High: getting a core commercial page indexed is a prerequisite for impressions/clicks on field-service scheduling terms. | Low once GSC access works; mostly URL inspection/indexing workflow. | Safe no-feature SEO operation, but deferred until GSC access is restored. |
| P1 | Improve topical depth on `/hvac-dispatch-software` and `/plumbing-dispatch-software` around service-call intake, technician assignment, route planning, phone-tag reduction, mobile/iPad board readability, and small-team dispatcher workflows. | Cached GSC baseline shows these pages already get target impressions but no clicks and weak positions: `hvac dispatch app` 61 impressions at ~72.1, `hvac dispatch software` 15 at ~79.3, `plumbing dispatch software` 13 at ~83.5. | Medium/high: strengthens pages Google already associates with the right commercial queries, aiming to move from positions ~60–90 toward higher visibility. | Medium content/SEO copy work; no app/backend feature required. | Safe no-feature SEO/content improvement; do not claim product capabilities not currently supported. |
| P1 | Add stronger conversion paths from supporting articles to the waitlist or relevant commercial pages. | `artifacts/gainhelm-seo/live-site-seo-waitlist-audit-2026-05-11.txt` shows waitlist forms on `/`, `/hvac-dispatch-software`, `/plumbing-dispatch-software`, `/field-service-scheduling`, and `/mobile-dispatch-board`, but no waitlist form/API on `/hvac-dispatch-app-vs-spreadsheets`, `/how-to-choose-hvac-dispatch-app`, or `/how-hvac-dispatch-apps-reduce-phone-tag`. | Medium: captures intent from informational pages and reduces leakage before publishing more content. | Low/medium static HTML CTA/link/form placement. | Safe no-feature funnel/SEO change; avoid building new product functionality. |
| P2 | Add or refine citation-ready GEO answer blocks on commercial pages: what Gainhelm is, who it is for, which workflow problem it solves, and early-access/waitlist status. | `seo-geo` skill audit workflow requires direct answer blocks, FAQ/schema, and self-contained GEO-ready content; live audit shows JSON-LD is present, so the next opportunity is stronger citation-ready page copy. | Medium: improves AI-search summarization/citation readiness and can also clarify organic snippets. | Medium copy/schema review; no app feature required. | Safe no-feature GEO/content improvement; keep claims conservative and evidence-backed. |
| P2 | Pursue niche mentions/backlinks from HVAC/plumbing/field-service communities, directories, founder/operator posts, and relevant blogs with anchors to `/hvac-dispatch-software` and `/plumbing-dispatch-software`. | Cached rankings around ~57–87 despite relevant pages and live technical SEO suggest authority is a constraint; `content-cluster.md` lists outreach/backlink targets. | Medium/long-term: improves authority and ranking potential for pages already receiving impressions. | Medium/high manual outreach and relationship work. | Safe no-feature distribution work; deferred where external posting/approval is needed. |

## What not to do yet
- Do not build app features from these signals yet; current GSC signal only validates category interest, not a specific product workflow demand.
- Do not create a large new content batch until GSC access is restored and `/field-service-scheduling` indexing is verified.
- Do not optimize for countries/devices/search appearances until those dimensions can be fetched from GSC.
