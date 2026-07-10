# GainHelm GSC + SERP Link Opportunity Pass

Date: 2026-05-27
Property: `sc-domain:gainhelm.com`
Window: 2026-02-24 to 2026-05-24

## Access status

Google Search Console CLI is now working via gcloud ADC after enabling the Search Console API on project `mindball-b6ac7`.

Verified property access:

- `sc-domain:gainhelm.com` — `siteOwner`

Raw exports:

- `reports/gainhelm-gsc/queries-2026-02-24_2026-05-24.json`
- `reports/gainhelm-gsc/query-pages-2026-02-24_2026-05-24.json`
- `reports/gainhelm-gsc/top_queries.csv`

## GSC summary

Total query rows: 104

Main clusters by impressions:

| Cluster                      | Impressions | Query count | Best avg position |
| ---------------------------- | ----------: | ----------: | ----------------: |
| HVAC dispatch/scheduling     |         868 |          23 |              30.7 |
| Plumbing dispatch/scheduling |         776 |          48 |              15.0 |
| ManageByStats alternative    |          25 |           1 |               9.6 |
| Amazon seller fees/profit    |          11 |           8 |              12.0 |
| FieldHive comparison         |           9 |           1 |              46.6 |

Top individual queries:

| Query                             | Impressions | Clicks | Avg position |
| --------------------------------- | ----------: | -----: | -----------: |
| hvac dispatch app                 |         203 |      0 |         70.4 |
| hvac dispatch software ipad       |         131 |      0 |         30.7 |
| plumbing scheduling app           |          76 |      0 |         78.4 |
| hvac dispatch                     |          71 |      0 |         70.4 |
| dispatch software for plumbing    |          70 |      0 |         79.0 |
| plumbing dispatch software        |          70 |      0 |         82.4 |
| plumber scheduling software       |          70 |      0 |         82.4 |
| hvac dispatch software            |          66 |      0 |         83.5 |
| plumbing scheduling software      |          57 |      0 |         83.2 |
| hvac service dispatch software    |          52 |      0 |         83.3 |
| plumbing dispatching software     |          51 |      0 |         84.3 |
| hvac service dispatching software |          48 |      0 |         77.2 |
| hvac scheduling and dispatch      |          48 |      0 |         81.9 |
| scheduling software for plumbers  |          48 |      0 |         87.0 |
| dispatch programs for hvac        |          40 |      0 |         71.0 |

## SERP check notes

Attempted real Google browser query with `agent-browser` for `hvac dispatch app`, but Google returned the unusual-traffic CAPTCHA page. Snapshot saved at:

- `reports/gainhelm-gsc/google-hvac-dispatch-app.snapshot.txt`

For this initial pass, SERP platform discovery used grounded Google search results via the web search tool instead of bypassing CAPTCHA.

## Top platforms found in SERPs

### HVAC dispatch app / HVAC dispatch software iPad

Repeated top domains/platforms:

- `servicetitan.com`
- `buildops.com`
- `fieldedge.com`
- `servicetrade.com`
- `housecallpro.com`
- `getjobber.com`
- `arrivy.com`
- Apple App Store (`apple.com`)

Likely link opportunities:

- Apple App Store listing if GainHelm has/ships an iOS app.
- SaaS directories and review platforms where these competitors are listed.
- Comparison pages targeting `ServiceTitan alternative`, `Jobber alternative`, `Housecall Pro alternative`, `BuildOps alternative`.
- Outreach to blogs listing “best HVAC dispatch apps/software.”

### Plumbing scheduling / dispatch software

Repeated top domains/platforms:

- `servicetitan.com`
- `getjobber.com`
- `housecallpro.com`
- `servicefusion.com`
- `buildops.com`
- `fieldpulse.com`/similar FSM vendors
- `fieldproxy.ai`
- `timeero.com`
- `dataforma.com`

Likely link opportunities:

- Plumbing software directory/listicle outreach.
- Alternative/comparison content against ServiceTitan, Jobber, Housecall Pro, Service Fusion.
- Community answers only when directly relevant; avoid spam comments.

### ManageByStats alternative

Top domains/platforms:

- `novadata.io`
- `landingcube.com`
- `m2ecloud.com`
- `commercecaffeine.com`
- `aihello.com`
- `scaleinsights.com`
- Carbon6 / ManageByStats ecosystem

This is currently the most promising query by position: avg position 9.6, but only 25 impressions. It may be easier to capture clicks with on-page optimization than external links.

## Recommended next actions

1. **Do not start with random link drops.** The biggest signal is that GainHelm is appearing for HVAC/plumbing terms at positions 70–85. Links help, but the target pages likely need stronger topical match first.
2. **Create/strengthen two pages:**
   - `/hvac-dispatch-software` targeting HVAC dispatch app/software/iPad.
   - plumbing equivalent targeting plumbing dispatch/scheduling software.
3. **Build comparison pages** for competitor-intent searches:
   - GainHelm vs ServiceTitan
   - GainHelm vs Jobber
   - GainHelm vs Housecall Pro
   - GainHelm vs Service Fusion
4. **Submit/list GainHelm on legitimate SaaS directories/review platforms** before community posting.
5. **For each SERP top page, classify:** competitor, directory/listicle, community, marketplace, unreachable. Only pursue directories/listicles/community pages where a relevant, allowed contribution is possible.

## Next work queue

- Pull 28-day and 7-day data to detect fresh movers.
- Use a clean browser/session or lower-volume manual SERP checks for the top 20 query clusters.
- Build `serp-opportunities.csv` with columns: query, impressions, position, result URL, platform type, link method, priority, suggested copy, status.
