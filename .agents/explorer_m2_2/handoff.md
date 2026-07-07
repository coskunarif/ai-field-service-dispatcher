# Handoff Report — FAQ & Meta Title Alignment (Milestone 2)

## 1. Observation
We inspected the 14 landing pages specified in the user request and found:
- **Missing OG & Twitter Titles**: `index.html` had no Open Graph or Twitter metadata tags at all.
- **Incorrect/Escaped Entities in Meta Titles**: The 10 trade landing pages (`garage-door`, `roofing`, `locksmith`, `pool-service`, `commercial-facilities`, `septic-service`, `restoration-job-management`, `handyman`, `carpet-cleaning`, `tree-service`) had `<title>... & ...</title>` but used `content="... &amp; ..."` in their `<meta property="og:title">` and `<meta name="twitter:title">` tags, representing a mismatch.
- **Valid Reference Pages**: Reference pages `hvac-dispatch-software.html` and `plumbing-dispatch-software.html` used raw `&` characters in both the title and the meta tag content attributes, and included comprehensive FAQPage JSON-LD schemas.
- **No FAQPage JSON-LD**: 12 of the target pages lacked any `FAQPage` blocks in their `application/ld+json` schemas.
- **Existing FAQPage**: `pressure-washing-dispatch-software.html` and `junk-removal-dispatch-software.html` already possessed exactly 3 trade-specific questions and answers inside their JSON-LD blocks, matching the page-specific content format. No modifications were needed for these two pages.

## 2. Logic Chain
- To achieve absolute title-to-meta parity, all occurrences of `&amp;` in `og:title` and `twitter:title` content attributes on landing pages must be replaced with `&` to match `<title>` character-for-character, matching the standard set by reference pages (e.g. `hvac-dispatch-software.html` line 12 and 15).
- For `index.html`, full metadata blocks for Open Graph and Twitter must be injected to match the page's primary title: `Gainhelm | App-Less AI Dispatch Software for Field Services`.
- To increase SEO trust and indexing relevance, `FAQPage` JSON-LD blocks with 3 trade-specific questions and answers must be appended to the `@graph` array inside the `<script type="application/ld+json">` tag on the 12 target pages currently lacking them.

## 3. Caveats
- No caveats. The modifications have been tested on file copies and successfully validated against Python’s standard `json` parser and `BeautifulSoup`.

## 4. Conclusion
We have generated a precise, git-compatible unified patch file `milestone2_fixes.patch` in our folder. Applying this patch will align the metadata titles and add/validate the FAQPage JSON-LD structures on all 14 pages without affecting surrounding markup or layout styling.

The exact proposed changes are captured in `milestone2_fixes.patch`.

## 5. Verification Method
1. Inspect the patch file `milestone2_fixes.patch` in `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_m2_2/milestone2_fixes.patch`.
2. Apply the patch to the workspace files using:
   ```bash
   git apply .agents/explorer_m2_2/milestone2_fixes.patch
   ```
3. Run the validation script `/tmp/verify_json_ld.py` on the workspace directory to verify all changes:
   ```bash
   python3 /tmp/verify_json_ld.py
   ```
   Confirm that no `[ERROR]` lines are logged.
