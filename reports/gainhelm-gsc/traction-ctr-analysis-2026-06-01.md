# Gainhelm Search Console traction and CTR analysis

Date: 2026-06-01
Property: `sc-domain:gainhelm.com`
Primary window: 2026-05-04 to 2026-05-31
Available final daily rows through: 2026-05-30

## Summary

Gainhelm is getting real discovery growth, but CTR is not the main standalone problem yet. The site is mostly ranking in positions 60-80 for the highest-impression HVAC and plumbing queries, so the path to more clicks is:

1. Improve ranking and intent match on the two pages already receiving impressions.
2. Get the mobile/iPad support page indexed because `hvac dispatch software ipad` is the strongest near-term opportunity.
3. Build/earn external signals from legitimate software directories and field-service list pages.
4. Only then tune snippets for CTR at scale.

## Current traction

Recent Search Console totals by device for 2026-05-04 to 2026-05-31:

| Device  | Clicks | Impressions |   CTR | Avg position |
| ------- | -----: | ----------: | ----: | -----------: |
| Desktop |      3 |       1,786 | 0.17% |         69.7 |
| Mobile  |      0 |         379 | 0.00% |         67.4 |
| Tablet  |      0 |          24 | 0.00% |         60.0 |
| Total   |      3 |       2,189 | 0.14% |        ~69.3 |

Weekly impression trend from date rows:

| Week ending | Clicks | Impressions | Notes                                                           |
| ----------- | -----: | ----------: | --------------------------------------------------------------- |
| 2026-05-16  |      0 |         308 | Early baseline after page work started showing more impressions |
| 2026-05-23  |      1 |         746 | 142% more impressions than prior week                           |
| 2026-05-30  |      2 |         955 | 28% more impressions than prior week                            |

Country split:

| Country       | Clicks | Impressions |   CTR | Avg position |
| ------------- | -----: | ----------: | ----: | -----------: |
| USA           |      3 |       1,550 | 0.19% |         71.8 |
| Australia     |      0 |         348 | 0.00% |         66.0 |
| Great Britain |      0 |         176 | 0.00% |         61.5 |
| Canada        |      0 |          99 | 0.00% |         57.3 |

Interpretation: impressions are accelerating, especially in the final reported week. The weak CTR is expected at current average positions; a snippet rewrite alone will not move CTR much while most impressions are far below page 1.

## Top page evidence

| Page                                 | Clicks |                Impressions |   CTR | Avg position | Index status                                   |
| ------------------------------------ | -----: | -------------------------: | ----: | -----------: | ---------------------------------------------- |
| `/plumbing-dispatch-software`        |      1 |                      1,267 | 0.08% |         74.8 | Submitted and indexed; last crawled 2026-05-22 |
| `/hvac-dispatch-software`            |      1 |                        937 | 0.11% |         63.8 | Submitted and indexed; last crawled 2026-05-31 |
| `/how-to-choose-hvac-dispatch-app`   |      0 |                         63 | 0.00% |         58.7 | Submitted and indexed; last crawled 2026-05-26 |
| `/hvac-dispatch-app-vs-spreadsheets` |      0 |                         61 | 0.00% |         59.8 | Not inspected in this pass                     |
| `/septic-service-dispatch-software`  |      0 |                         46 | 0.00% |         74.0 | Not inspected in this pass                     |
| `/mobile-dispatch-board`             |      0 | not surfaced as a page row |   n/a |          n/a | Discovered, currently not indexed              |

Sitemap status:

- `https://gainhelm.com/sitemap.xml`
- Last submitted: 2026-05-28
- Last downloaded: 2026-05-28
- Warnings: 0
- Errors: 0

## Query opportunities

Highest-impression recent queries:

| Query                              | Clicks | Impressions |   CTR | Avg position | Current page                     |
| ---------------------------------- | -----: | ----------: | ----: | -----------: | -------------------------------- |
| `hvac dispatch app`                |      0 |         193 | 0.00% |         65.5 | Mostly `/hvac-dispatch-software` |
| `hvac dispatch software ipad`      |      0 |         147 | 0.00% |         22.9 | Mostly `/hvac-dispatch-software` |
| `plumber scheduling software`      |      0 |         133 | 0.00% |         78.5 | `/plumbing-dispatch-software`    |
| `plumbing scheduling software`     |      0 |         113 | 0.00% |         78.6 | `/plumbing-dispatch-software`    |
| `plumbing dispatch software`       |      0 |         106 | 0.00% |         74.7 | `/plumbing-dispatch-software`    |
| `plumbing scheduling app`          |      0 |         102 | 0.00% |         75.3 | `/plumbing-dispatch-software`    |
| `dispatch software for plumbing`   |      0 |          77 | 0.00% |         73.4 | `/plumbing-dispatch-software`    |
| `plumbing dispatching software`    |      0 |          77 | 0.00% |         79.9 | `/plumbing-dispatch-software`    |
| `hvac dispatch software`           |      1 |          74 | 1.35% |         80.9 | `/hvac-dispatch-software`        |
| `scheduling software for plumbers` |      0 |          72 | 0.00% |         80.2 | `/plumbing-dispatch-software`    |

Best near-term target:

- `hvac dispatch software ipad`: 147 impressions, average position 22.9.
- This is much closer to page 1 than the core HVAC/plumbing software head terms.
- The dedicated `/mobile-dispatch-board` page is not indexed yet, so Google is currently ranking the HVAC pillar for this tablet/iPad intent.

## What likely requires work

### 1. Get `/mobile-dispatch-board` indexed

Why: the iPad/tablet query is the strongest reachable opportunity. If the support page gets indexed and is internally linked with the exact intent, it can either rank itself or strengthen the HVAC page's topical coverage.

Recommended actions:

- Update `sitemap.xml` lastmod for `/mobile-dispatch-board` after any content refresh.
- Add a short, unique section near the top of `/mobile-dispatch-board` that explicitly answers: "What should HVAC dispatch software on iPad show?"
- Add one stronger contextual in-body link from `/hvac-dispatch-software` and `/plumbing-dispatch-software` using anchors like `HVAC dispatch software for iPad` and `plumbing dispatch app for tablets`.
- Keep the page conservative: do not claim a shipped native iPad app unless product evidence supports it. Position it as web/tablet-readable dispatch workflow.
- After deploy, request/monitor recrawl in Search Console UI if available; the CLI only inspected status in this pass.

### 2. Rebalance HVAC page around the queries Google already shows

Why: `/hvac-dispatch-software` has 937 impressions, but average position is 63.8. It ranks for many variants, which means Google understands the topic but not enough authority/intent strength yet.

Recommended actions:

- Keep the current URL and canonical.
- Do not over-rotate the title; the page already includes `HVAC Dispatch App` and `Scheduling Software`.
- Add concise comparison blocks for the exact clusters Search Console shows: `dispatch programs for HVAC`, `HVAC service dispatch software`, `HVAC scheduling and dispatch`, and `best HVAC dispatch software`.
- Add one table showing "spreadsheet/manual board vs dispatch app" with small-team decision criteria.
- Preserve early-access/no-feature safety. Current copy mentions auto-assigning technicians; verify this is an allowed product claim before any future CTR push.

### 3. Rebalance plumbing page around scheduling-app intent

Why: `/plumbing-dispatch-software` has the most impressions but weak positions. It has multiple related clusters, all landing on the same page.

Recommended actions:

- Add a stronger above-fold phrase for `plumber scheduling software` and `plumbing scheduling app`; those are two of the largest query families.
- Add an FAQ or short section for `plumbing dispatcher script` because that query has a relatively better average position (28.2) and signals an informational intent that could win earlier.
- Improve internal links from related restoration/emergency pages to the plumbing page with anchors around `plumbing dispatch software` and `plumber scheduling software`.
- Avoid creating thin separate variants for every plumbing query until one support intent clearly grows.

### 4. Add authority signals before expecting CTR gains

Why: current average positions are too low for snippet work to have much effect. Legitimate directories and field-service list pages are the likely external lever.

Recommended actions from the prior SERP pass:

- Continue directory/listing work where not blocked by login or billing: Capterra/GetApp, G2, SourceForge, SaaSHub, BetaList, AlternativeTo, SaaSworthy, SoftwareSuggest.
- Prioritize review/directory pages that rank for `hvac dispatch software ipad`, `plumbing scheduling app`, and `managebystats alternative`.
- For community/forum placements, only answer directly relevant live threads with affiliation disclosure. Do not bulk-post links.
- Outreach targets already found in prior report: TryCentral, SaaSworthy, Fourlane, MyQuoteIQ, FieldBoss, BDR, FieldPathPro, CompanyCam, Thryv.

### 5. CTR-specific snippet work should be second-pass

Why: only one high-impression query is near enough to the top results to care immediately about snippet CTR.

Recommended snippet priorities:

- For `hvac dispatch software ipad`, make the visible title/meta and first paragraph line up with "iPad/tablet readable dispatch board" once `/mobile-dispatch-board` is indexed.
- For HVAC/plumbing head terms, test less hypey title descriptions after rankings improve. The current "AI" and "Save 3+ hours daily" wording may be too strong for early access and could reduce trust if the SERP snippet appears beside established competitors.
- Keep snippets specific to small teams and early access: "small HVAC teams", "small plumbing shops", "readable board", "fewer phone-tag handoffs".

## Priority order

1. Index and strengthen `/mobile-dispatch-board`.
2. Add GSC-query-matched blocks to `/hvac-dispatch-software` and `/plumbing-dispatch-software`.
3. Continue legitimate directory/listing/backlink work.
4. Monitor weekly: impressions, average position, and page/query split for iPad/mobile and plumbing scheduling terms.
5. Tune titles/metas only after at least one query group reaches average position 15 or better.

## Commands used

```bash
google-search-console-cli sites
google-search-console-cli site sc-domain:gainhelm.com --format json
google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-05-04 --end-date 2026-05-31 --dimensions query --aggregation-type byProperty --all --format json
google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-05-04 --end-date 2026-05-31 --dimensions page --aggregation-type byPage --all --format json
google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-05-04 --end-date 2026-05-31 --dimensions query,page --aggregation-type auto --all --format json
google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-05-04 --end-date 2026-05-31 --dimensions device --aggregation-type byProperty --all --format json
google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-05-04 --end-date 2026-05-31 --dimensions country --aggregation-type byProperty --all --format json
google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-03-03 --end-date 2026-05-31 --dimensions date --aggregation-type byProperty --all --format json
google-search-console-cli inspect sc-domain:gainhelm.com https://gainhelm.com/hvac-dispatch-software --format json
google-search-console-cli inspect sc-domain:gainhelm.com https://gainhelm.com/plumbing-dispatch-software --format json
google-search-console-cli inspect sc-domain:gainhelm.com https://gainhelm.com/how-to-choose-hvac-dispatch-app --format json
google-search-console-cli inspect sc-domain:gainhelm.com https://gainhelm.com/mobile-dispatch-board --format json
google-search-console-cli sitemaps sc-domain:gainhelm.com --format json
npm run audit:seo-geo
```
