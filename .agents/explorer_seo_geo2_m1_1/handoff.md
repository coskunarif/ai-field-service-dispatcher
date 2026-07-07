# SEO/GEO Audit Handoff Report

## 1. Observation
- Run of `npm run audit:seo-geo` completes with `PASS: Gainhelm SEO/GEO route audit passed` (meaning sitemap routes match files, `llms.txt` covers all routes, and key trade pages pass basic structure).
- Audit results for tools pages (`tools-contractor-leads.html` and `tools-lead-queue.html`) extracted via python BS4 parser:
  - Both lack `og:title` and `twitter:title` tags entirely.
  - `tools-contractor-leads.html` title tag is `"Contractor Leads Dashboard | Gainhelm"` (37 characters).
  - `tools-lead-queue.html` title tag is `"Social Lead Queue & Dispatch Tracker | Gainhelm"` (47 characters).
  - `tools-contractor-leads.html` meta description is `"Acquire and track local contractor business leads with conversion drafts. Free dashboard tool by Gainhelm. Try the simulator today."` (131 characters).
  - Both files have a single JSON-LD block in `<head>` corresponding to:
    ```json
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": "https://gainhelm.com/tools/contractor-leads#webpage",
          "url": "https://gainhelm.com/tools/contractor-leads",
          "name": "Contractor Leads Dashboard | Gainhelm",
          "description": "...",
          "isPartOf": {
            "@id": "https://gainhelm.com/#website"
          }
        }
      ]
    }
    ```
    This schema block does not contain `author` (e.g. `"Coskun Arif"`) or `dateModified` properties.
  - Both tools pages have **0 FAQs** in their JSON-LD.
- All alternative pages (e.g. `servicetitan-alternative.html`) and trade pages (e.g. `hvac-dispatch-software.html`) contain `"author": {"name": "Coskun Arif"}` and `"dateModified": "2026-06-26"` in their JSON-LD schemas.
- `robots.txt` has stanzas for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `GoogleOther`, and `Amazonbot`, but does not mention `OAI-SearchBot`.

---

## 2. Logic Chain
- **Step 1:** The JSON-LD schema search for `WebPage` objects in `tools-contractor-leads.html` and `tools-lead-queue.html` shows they only contain `url`, `name`, `description`, and `isPartOf` (see Observation). Therefore, these pages lack the author information ("Coskun Arif") and the `dateModified` properties.
- **Step 2:** The FAQ extraction parser traversed all JSON-LD schemas and found 0 `FAQPage` blocks or entries for `tools-contractor-leads.html` and `tools-lead-queue.html`. Therefore, these pages have 0 trade-specific FAQs.
- **Step 3:** Metatag inspection shows `og:title` and `twitter:title` values are empty for `/tools/contractor-leads` and `/tools/lead-queue` (see Observation), indicating missing tags. Title lengths of 37 and 47 characters fall below the SEO threshold of 50–60 characters.
- **Step 4:** Comparing the sitemap routes with `llms.txt` indicates full sync (36 routes mapped), while `robots.txt` leaves out specialized search agents like `OAI-SearchBot`, which limits ChatGPT Search visibility.

---

## 3. Caveats
- Checked local files only; did not run audits against a live environment (though baseline checks indicate local files represent the current main branch state).
- Assumed standard SEO thresholds (50–60 characters for titles, 140–160 characters for descriptions) as the target criteria for "incorrect" lengths.

---

## 4. Conclusion
- The landing and alternative pages are fully optimized under existing schema standards.
- The two tools pages (`tools-contractor-leads.html` and `tools-lead-queue.html`) require updating to include missing metadata (`og:title`, `twitter:title`), correct title lengths, and schema enhancements (`WebPage` author, `dateModified`, and at least 3 trade-specific FAQs).
- Adding the `OAI-SearchBot` stanza to `robots.txt` is recommended for maximum GEO coverage.
- Specific copywriting changes (definition blocks, statistics, and founder quotes) will optimize the pages for AI agent citations.

---

## 5. Verification Method
1. To verify sitemap, robots, and LLM mapping integrity:
   ```bash
   npm run audit:seo-geo
   ```
2. To inspect the specific content of `/tools/contractor-leads` and `/tools/lead-queue` for schemas and title metadata, inspect the files:
   - `/home/ubuntuadmin/projects/ai-field-service-dispatcher/tools-contractor-leads.html`
   - `/home/ubuntuadmin/projects/ai-field-service-dispatcher/tools-lead-queue.html`
3. Run the following python command to parse and verify metadata locally:
   ```bash
   python3 /tmp/seo_checker.py
   ```
   Check `/tmp/audit_results.json` output for verification details.
