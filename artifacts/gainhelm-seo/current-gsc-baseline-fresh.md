# Fresh GSC baseline

Date range: 2026-04-08 to 2026-05-06
Property: sc-domain:gainhelm.com

## Reproducible commands
- `google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-04-08 --end-date 2026-05-06 --dimensions query --aggregation-type byProperty --all`
- `google-search-console-cli query sc-domain:gainhelm.com --start-date 2026-04-08 --end-date 2026-05-06 --dimensions page --aggregation-type byPage --all`
- `google-search-console-cli inspect sc-domain:gainhelm.com https://gainhelm.com/field-service-scheduling`

## Target query rows
- best hvac dispatch software → /hvac-dispatch-software — 4 impressions, 0 clicks, CTR 0, avg position 57.5
- hvac dispatch app → /hvac-dispatch-software — 61 impressions, 0 clicks, CTR 0, avg position 72.08196721311475
- hvac dispatch app → /plumbing-dispatch-software — 21 impressions, 0 clicks, CTR 0, avg position 84.0952380952381
- hvac dispatch software → /hvac-dispatch-software — 15 impressions, 0 clicks, CTR 0, avg position 79.33333333333333
- plumbing dispatch app → /plumbing-dispatch-software — 3 impressions, 0 clicks, CTR 0, avg position 87
- plumbing dispatch software → /plumbing-dispatch-software — 13 impressions, 0 clicks, CTR 0, avg position 83.53846153846153

## Page rows
- /hvac-dispatch-software — 191 impressions, avg position 74.82198952879581
- /plumbing-dispatch-software — 138 impressions, avg position 78.8913043478261

## Indexing status
- /field-service-scheduling — Discovered - currently not indexed

## First-page verdict
- Verified only where avg position <= 10: none of the target rows qualify.
- Therefore first-page ranking is not yet verified.

## Out of scope
- managebystats alternative
- /managebystats-alternative
