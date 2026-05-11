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
1. Restore Search Console access first. Add the service account represented by `artifacts/gainhelm-searchconsole-cli-key.json` as a restricted/full user on the `sc-domain:gainhelm.com` property, then rerun query/page/country/device/searchAppearance for 2026-05-01..2026-05-10. Without this, we cannot honestly call the last-10-days traction analysis complete.

2. Treat `/field-service-scheduling` indexing as the highest SEO fix. It is a core target page and was previously discovered but not indexed. After access is restored, run URL inspection and request indexing if still not indexed. This is likely higher leverage than adding new pages because the page already exists and targets a core commercial term.

3. Keep optimizing the pages already receiving impressions: `/hvac-dispatch-software` and `/plumbing-dispatch-software`. The cached GSC signal proves Google understands these as relevant pages, but positions are weak. Improve topical depth around concrete field-service workflows: service-call intake, technician assignment, route planning, phone-tag reduction, iPad/mobile board readability, and small-team dispatcher workflows.

4. Add stronger conversion paths on supporting article pages before producing more content. Three supporting articles currently have no waitlist form. At minimum, they should route readers to a relevant commercial page or waitlist CTA. This is not a new product feature; it is funnel hygiene for pages intended to attract search traffic.

5. GEO improvements should focus on citation-ready blocks, not generic AI text. For each commercial page, include a short self-contained answer block near the top: what Gainhelm is, who it is for, what workflow problem it solves, and the waitlist/early-access status. Keep FAQ and SoftwareApplication/Organization schema server-rendered.

6. Distribution/backlinks are needed because rankings at ~60–90 suggest authority is weak. Prioritize niche mentions over broad SaaS directories: HVAC/plumbing operator blogs, field-service communities, comparison directories, and founder/operator posts that link to `/hvac-dispatch-software` or `/plumbing-dispatch-software` with descriptive anchors.

## What not to do yet
- Do not build app features from these signals yet; current GSC signal only validates category interest, not a specific product workflow demand.
- Do not create a large new content batch until GSC access is restored and `/field-service-scheduling` indexing is verified.
- Do not optimize for countries/devices/search appearances until those dimensions can be fetched from GSC.
