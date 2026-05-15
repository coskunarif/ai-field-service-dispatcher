# Gainhelm SEO Snippet Continuity Checklist

Use this before any publish/test decision on a new snippet draft.

## Pass/fail criteria
- Query phrase is exact or near-exact to the target intent.
- Title includes the query phrase and the Gainhelm brand.
- Description is short and only claims what the page already says.
- Claims are supported by exact rendered-page or proof-artifact quotes.
- No unsupported iPad/mobile/readable-board or other new benefits.
- No live/public page was modified.

## What to verify
1. `draft-*.md` contains the target page, target query, title, description, and no-publish note.
2. `rendered-*.html` or proof artifact contains matching support for each meaningful claim.
3. If the draft uses a comparison phrase, the page must already say that intent or close equivalent.
4. If a claim cannot be quoted from local evidence, remove it from the draft.
5. Confirm continuity passes in a separate check artifact before any future publish/test consideration.

## Source examples
- HVAC: `artifacts/gainhelm-seo/hvac-snippet-continuity-check.md`
- Plumbing: `artifacts/gainhelm-seo/plumbing-snippet-continuity-check.md`
- Field service: `artifacts/gainhelm-seo/field-service-snippet-continuity-check.md`

## Reusable rule
- Query promise in snippet -> same promise or equivalent support in above-the-fold page content.
- One short benefit sentence -> one exact supporting quote.
- Unsupported claim -> remove or rewrite locally.

## Local-only note
- This checklist is for draft review only. It does not approve production publishing.
