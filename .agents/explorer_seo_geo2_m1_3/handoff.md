# Handoff Report: Technical & On-Page SEO/GEO Audit

This report transfers findings and analytical recommendations for the technical and on-page SEO/GEO audit of the Gainhelm codebase to the receiving agent.

---

## 1. Observation
We examined all 36 static HTML files and tools pages, along with `robots.txt`, `llms.txt`, and the project's build-time validation script `scripts/gainhelm-seo-geo-audit.mjs`. The following specific details were observed:

1. **Missing Author & Modified Date in JSON-LD**:
   * **`tools-contractor-leads.html`** (JSON-LD script starts at line 10) lacks `"author"` and `"dateModified"` properties inside its `WebPage` schema.
   * **`tools-lead-queue.html`** (JSON-LD script starts at line 10) lacks `"author"` and `"dateModified"` properties inside its `WebPage` schema.
   * *Example text from `tools-contractor-leads.html` (lines 14-22)*:
     ```json
     {
       "@type": "WebPage",
       "@id": "https://gainhelm.com/tools/contractor-leads#webpage",
       "url": "https://gainhelm.com/tools/contractor-leads",
       "name": "Contractor Leads Dashboard | Gainhelm",
       "description": "Acquire and track local contractor business leads with conversion drafts. Free dashboard tool by Gainhelm.",
       "isPartOf": {
         "@id": "https://gainhelm.com/#website"
       }
     }
     ```

2. **FAQ Schema Counts**:
   * Exactly **5 pages** fail the requirement of having at least 3 trade-specific FAQs in their JSON-LD schemas (they contain 0 FAQs):
     * `tools-contractor-leads.html` (0 FAQs)
     * `tools-lead-queue.html` (0 FAQs)
     * `how-hvac-dispatch-apps-reduce-phone-tag.html` (0 FAQs)
     * `how-to-choose-hvac-dispatch-app.html` (0 FAQs)
     * `hvac-dispatch-app-vs-spreadsheets.html` (0 FAQs)

3. **Metadata Alignment & Lengths**:
   * **`tools-contractor-leads.html`** and **`tools-lead-queue.html`** completely lack `<meta property="og:title">` and `<meta name="twitter:title">` tags in their `<head>` section, causing total misalignment (missing tags).
   * **Title Length Violations** (<50 or >60 chars) exist on 9 pages:
     * `tools-contractor-leads.html` (37 chars)
     * `tools-lead-queue.html` (47 chars)
     * `how-hvac-dispatch-apps-reduce-phone-tag.html` (61 chars)
     * `how-to-choose-hvac-dispatch-app.html` (61 chars)
     * `hvac-dispatch-app-vs-spreadsheets.html` (62 chars)
     * `buildops-alternative.html` (62 chars)
     * `fieldedge-alternative.html` (63 chars)
     * `jobber-alternative.html` (63 chars)
     * `servicetitan-alternative.html` (64 chars)
   * **Meta Description Length Violations** (<140 or >160 chars) exist on 19 pages (e.g., `index.html` at 169 chars; `tools-contractor-leads.html` at 131 chars).
   * **H1 tag compliance**: 100% compliant (exactly 1 non-empty H1 tag per page).

4. **Crawler Compliance**:
   * `robots.txt` explicitly allows major AI/search bots and links to the sitemap and `rsl.xml`.
   * `llms.txt` maps all 36 sitemap routes and contains the 45 target keywords.
   * `scripts/gainhelm-seo-geo-audit.mjs` passes locally (`PASS: Gainhelm SEO/GEO route audit passed`) because its `isTargetPage(p)` filter (line 92) bypasses tools, alternatives, and guide pages, creating a verification false-positive.

---

## 2. Logic Chain
1. By examining the JSON-LD schemas in `tools-contractor-leads.html` and `tools-lead-queue.html`, we verified that neither file contains an `"author"` field defining "Coskun Arif" or a `"dateModified"` field, while other pages do.
2. By executing `validate.py` on the parsed JSON-LD blocks, we verified that the 3 HVAC guides and 2 tools pages contain 0 entries in their `mainEntity` list of `FAQPage`, failing the 3-FAQ minimum.
3. By analyzing the raw HTML content of `tools-contractor-leads.html` and `tools-lead-queue.html`, we observed that there are no elements matching `og:title` or `twitter:title` metadata tags, causing structural misalignment.
4. By checking the string length of `<title>` tags and `<meta name="description">` content across all HTML files, we verified that 9 pages violate title lengths and 19 pages violate description lengths.
5. By cross-referencing `robots.txt`, `llms.txt`, and `sitemap.xml`, we verified that all static routes match and are mapped correctly.
6. By tracing `isTargetPage(p)` in `scripts/gainhelm-seo-geo-audit.mjs`, we determined that the script's scope filter ignores `/tools/lead-queue` and `/tools/contractor-leads` which is why the baseline audit passed despite these critical issues.

---

## 3. Caveats
* We assumed that the live web server handles clean URL rewriting (e.g. routing `https://gainhelm.com/tools/lead-queue` to `tools-lead-queue.html` and removing `.html` extensions from landing pages). If the server does not handle clean URLs, then the sitemap links themselves represent broken routes (HTTP 404), which would affect indexing.
* We did not run actual browser rendering or Core Web Vitals profiling, focusing purely on raw code, metadata, and JSON-LD schema parsing.

---

## 4. Conclusion
The Gainhelm codebase is largely technical-SEO compliant on vertical landing pages but has significant SEO/GEO gaps in its comparison pages, guides, and tools pages:
1. The two tools pages (`tools-contractor-leads.html` and `tools-lead-queue.html`) represent severe vulnerabilities: they lack `WebPage` author, modified date, Open Graph title cards, and FAQs.
2. The 3 HVAC guides lack `FAQPage` schemas entirely, missing opportunities for AI citations.
3. Title tag lengths (9 pages) and meta description lengths (19 pages) must be shortened/extended to prevent SERP truncation and align with search console rules.
4. The project's built-in audit script (`scripts/gainhelm-seo-geo-audit.mjs`) contains a filtering bug that ignores tool/alternative/guide routes, creating a false sense of compliance. It must be updated to validate all pages in `sitemap.xml`.

Detailed copywriting updates (first 60 words, trade stats, and founder quotes) have been compiled page-by-page in `analysis.md` to optimize for ChatGPT/Perplexity citation boosts (+20% to +40% visibility).

---

## 5. Verification Method
To independently verify these findings:
1. **Metadata and Schema Parser**: Run `python3 .agents/explorer_seo_geo2_m1_3/audit.py` to parse all HTML pages, followed by `python3 .agents/explorer_seo_geo2_m1_3/summarize.py` to view the non-compliance reports.
2. **Review Codebase Tool Head Elements**:
   * Run `head -n 25 tools-contractor-leads.html` to confirm the lack of `og:title` and `twitter:title` metadata and missing author/modified date in the JSON-LD script block.
3. **Trace Audit Script Bug**:
   * Inspect lines 92–97 of `scripts/gainhelm-seo-geo-audit.mjs` to see that it restricts alignment/FAQ validation strictly to vertical landing pages and homepage.
