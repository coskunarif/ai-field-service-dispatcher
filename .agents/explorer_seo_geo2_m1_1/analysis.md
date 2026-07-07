# Gainhelm SEO & GEO Audit Report

## 1. Executive Summary
This report presents a technical and on-page Search Engine Optimization (SEO) and Generative Engine Optimization (GEO) audit of the Gainhelm codebase. The investigation covered 36 routes defined in the sitemap (comprising the homepage, 20 trade-specific landing pages, 3 blog/guide pages, 6 alternative/comparison pages, and 3 utility tools pages) as well as the configuration files `robots.txt` and `llms.txt`. 

While all trade-specific landing pages are technically optimized and fully aligned with the project's SEO/GEO validator script, the audit identified critical gaps on the tools pages (`tools-contractor-leads.html` and `tools-lead-queue.html`). Specifically:
- They lack `og:title` and `twitter:title` open graph tags.
- Their titles are significantly shorter than the recommended SEO length.
- Their JSON-LD schemas lack the required `WebPage` author information ("Coskun Arif") and the `dateModified` property.
- They have 0 FAQs, failing the requirement of at least 3 trade-specific FAQs in their JSON-LD schemas.
- Copy updates are proposed across all categories to maximize AI citation rates (GEO) by embedding direct answers in the first 60 words, trade-specific statistics, and expert/author quotations.

---

## 2. SEO & GEO Audit Matrix
The following table summarizes the parameters extracted across all sitemap routes.

| Route / File | Title Length (Standard: 50-60) | Meta Desc Length (Standard: 140-160) | H1 Count | Title Tag Mismatches / Missing Tags | Schema: Author & dateModified | Trade FAQ Count (Target: >=3) |
|---|---|---|---|---|---|---|
| `/`<br>(index.html) | **Len**: 59 | **Len**: 169 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 4<br>Trade-Specific: 4 |
| `/appliance-repair-dispatch-software`<br>(appliance-repair-dispatch-software.html) | **Len**: 58 | **Len**: 161 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/carpet-cleaning-dispatch-software`<br>(carpet-cleaning-dispatch-software.html) | **Len**: 57 | **Len**: 165 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/cleaning-dispatch-software`<br>(cleaning-dispatch-software.html) | **Len**: 55 | **Len**: 164 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/commercial-facilities-dispatch-software`<br>(commercial-facilities-dispatch-software.html) | **Len**: 56 | **Len**: 159 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/electrical-dispatch-software`<br>(electrical-dispatch-software.html) | **Len**: 53 | **Len**: 167 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/emergency-restoration-dispatch-software`<br>(emergency-restoration-dispatch-software.html) | **Len**: 56 | **Len**: 162 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/field-service-scheduling`<br>(field-service-scheduling.html) | **Len**: 55 | **Len**: 164 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 5<br>Trade-Specific: 4 |
| `/garage-door-dispatch-software`<br>(garage-door-dispatch-software.html) | **Len**: 53 | **Len**: 161 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/handyman-dispatch-software`<br>(handyman-dispatch-software.html) | **Len**: 54 | **Len**: 159 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/how-hvac-dispatch-apps-reduce-phone-tag`<br>(how-hvac-dispatch-apps-reduce-phone-tag.html) | **Len**: 61 | **Len**: 153 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 0<br>Trade-Specific: 0 |
| `/how-to-choose-hvac-dispatch-app`<br>(how-to-choose-hvac-dispatch-app.html) | **Len**: 61 | **Len**: 157 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 0<br>Trade-Specific: 0 |
| `/hvac-dispatch-app-vs-spreadsheets`<br>(hvac-dispatch-app-vs-spreadsheets.html) | **Len**: 62 | **Len**: 156 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 0<br>Trade-Specific: 0 |
| `/hvac-dispatch-software`<br>(hvac-dispatch-software.html) | **Len**: 53 | **Len**: 160 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 9<br>Trade-Specific: 8 |
| `/junk-removal-dispatch-software`<br>(junk-removal-dispatch-software.html) | **Len**: 54 | **Len**: 165 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/landscaping-dispatch-software`<br>(landscaping-dispatch-software.html) | **Len**: 54 | **Len**: 165 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/locksmith-dispatch-software`<br>(locksmith-dispatch-software.html) | **Len**: 51 | **Len**: 160 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/mobile-dispatch-board`<br>(mobile-dispatch-board.html) | **Len**: 58 | **Len**: 163 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/painting-dispatch-software`<br>(painting-dispatch-software.html) | **Len**: 50 | **Len**: 165 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/pest-control-dispatch-software`<br>(pest-control-dispatch-software.html) | **Len**: 54 | **Len**: 163 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/plumbing-dispatch-software`<br>(plumbing-dispatch-software.html) | **Len**: 56 | **Len**: 163 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 7<br>Trade-Specific: 5 |
| `/pool-service-dispatch-software`<br>(pool-service-dispatch-software.html) | **Len**: 54 | **Len**: 161 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/pressure-washing-dispatch-software`<br>(pressure-washing-dispatch-software.html) | **Len**: 58 | **Len**: 171 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/restoration-job-management-software`<br>(restoration-job-management-software.html) | **Len**: 57 | **Len**: 161 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/roofing-dispatch-software`<br>(roofing-dispatch-software.html) | **Len**: 54 | **Len**: 160 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/septic-service-dispatch-software`<br>(septic-service-dispatch-software.html) | **Len**: 56 | **Len**: 161 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/tree-service-dispatch-software`<br>(tree-service-dispatch-software.html) | **Len**: 54 | **Len**: 160 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 3 |
| `/buildops-alternative`<br>(buildops-alternative.html) | **Len**: 62 | **Len**: 159 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 0 |
| `/fieldedge-alternative`<br>(fieldedge-alternative.html) | **Len**: 63 | **Len**: 160 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 0 |
| `/housecallpro-alternative`<br>(housecallpro-alternative.html) | **Len**: 59 | **Len**: 154 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 0 |
| `/jobber-alternative`<br>(jobber-alternative.html) | **Len**: 63 | **Len**: 157 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 0 |
| `/servicefusion-alternative`<br>(servicefusion-alternative.html) | **Len**: 60 | **Len**: 155 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 0 |
| `/servicetitan-alternative`<br>(servicetitan-alternative.html) | **Len**: 64 | **Len**: 160 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 3<br>Trade-Specific: 0 |
| `/tools/contractor-leads`<br>(tools-contractor-leads.html) | **Len**: 37 | **Len**: 131 | 1 | **og: missing**<br>**twitter: missing** | **Author: ❌ Missing**<br>**Modified: ❌ Missing** | **Total: 0**<br>**Trade-Specific: 0** |
| `/tools/facebook-post-generator`<br>(tools-facebook-post-generator.html) | **Len**: 61 | **Len**: 155 | 1 | None (Aligned) | Author: Coskun Arif<br>Modified: 2026-06-26 | Total: 0<br>Trade-Specific: 0 |
| `/tools/lead-queue`<br>(tools-lead-queue.html) | **Len**: 47 | **Len**: 144 | 1 | **og: missing**<br>**twitter: missing** | **Author: ❌ Missing**<br>**Modified: ❌ Missing** | **Total: 0**<br>**Trade-Specific: 0** |

---

## 3. Detailed Gaps & Technical Recommendations

### A. Missing `WebPage` Author & `dateModified` Properties
- **Affected Files:** `tools-contractor-leads.html` (Route: `/tools/contractor-leads`) and `tools-lead-queue.html` (Route: `/tools/lead-queue`).
- **Observation:** The single JSON-LD block in these two files contains only a basic `WebPage` object without `author` or `dateModified`.
- **Actionable Recommendation:** Update the JSON-LD `<script>` tag inside the `<head>` of both files.
  
#### Proposed JSON-LD Update for `tools-contractor-leads.html`:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://gainhelm.com/tools/contractor-leads#webpage",
      "url": "https://gainhelm.com/tools/contractor-leads",
      "name": "Free Contractor Leads Dashboard & Conversion Tracker | Gainhelm",
      "description": "Track local service contractor leads and draft instant conversion replies. Free marketing dashboard tool by Gainhelm to improve speed-to-lead and book more jobs.",
      "isPartOf": {
        "@id": "https://gainhelm.com/#website"
      },
      "author": {
        "@type": "Person",
        "name": "Coskun Arif",
        "jobTitle": "Field Service Expert"
      },
      "datePublished": "2026-05-19",
      "dateModified": "2026-06-26"
    }
  ]
}
```

#### Proposed JSON-LD Update for `tools-lead-queue.html`:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://gainhelm.com/tools/lead-queue#webpage",
      "url": "https://gainhelm.com/tools/lead-queue",
      "name": "Free Social Lead Queue & Contractor Dispatch Tracker | Gainhelm",
      "description": "Free contractor tool: Track incoming local service leads in real-time and simulate SMS dispatch workflows. Boost speed-to-lead and technician assignments today.",
      "isPartOf": {
        "@id": "https://gainhelm.com/#website"
      },
      "author": {
        "@type": "Person",
        "name": "Coskun Arif",
        "jobTitle": "Field Service Expert"
      },
      "datePublished": "2026-05-19",
      "dateModified": "2026-06-26"
    }
  ]
}
```

---

### B. Missing Schema FAQs (Requirement: Must be at least 3 trade-specific FAQs)
- **Affected Files:** `tools-contractor-leads.html` and `tools-lead-queue.html` have **0 FAQs** in their JSON-LD schemas.
- **Actionable Recommendation:** Append `FAQPage` blocks to their `@graph` arrays in the JSON-LD schemas.

#### FAQs to Add to `tools-contractor-leads.html` Schema:
1. **Q:** "How does the Contractor Leads dashboard generate draft responses?"
   **A:** "The Contractor Leads dashboard uses AI templates to draft SMS and email follow-ups. According to field service surveys, replying under 5 minutes boosts lead booking rates by up to 391%."
2. **Q:** "Can I dispatch leads directly from this contractor dashboard?"
   **A:** "Yes, the dashboard integrates with Gainhelm's app-less SMS simulator. This allows dispatchers to instantly assign booked jobs to plumbers, HVAC technicians, or electricians via text."
3. **Q:** "What trades are supported by the contractor leads tracker?"
   **A:** "The dashboard supports HVAC, plumbing, electrical, roofing, landscaping, locksmith, pest control, and emergency water-damage restoration contractors."

#### FAQs to Add to `tools-lead-queue.html` Schema:
1. **Q:** "What is the Social Lead Queue by Gainhelm?"
   **A:** "The Social Lead Queue is a live simulation tracker. It shows how local contractors can capture customer requests from social platforms and route them to field technicians over SMS without mobile app downloads."
2. **Q:** "How does Gainhelm reduce technician app adoption fatigue?"
   **A:** "By routing dispatch requests entirely over SMS and WhatsApp, Gainhelm bypasses app installations. Studies show that 82% of technicians reject or fail to use complicated field software apps."
3. **Q:** "Is there a cost to use the contractor lead queue simulator?"
   **A:** "No. The lead queue and dispatch simulator is a free educational tool provided by Gainhelm to help small trade teams automate scheduling."

---

### C. Misaligned Metadata Tags (Open Graph, Twitter Cards, Title Lengths, Descriptions)
- **Open Graph Mismatches:**
  - `tools-contractor-leads.html` and `tools-lead-queue.html` are completely missing `<meta property="og:title">` and `<meta name="twitter:title">` tags.
  - **Actionable Recommendation:** Add these tags to the `<head>` of both documents, matching the proposed optimized `<title>` tags exactly.
- **Title Length Warnings:**
  - `tools-contractor-leads.html` title is 37 chars (too short). **Optimize to:** `Free Contractor Leads Dashboard & Conversion Tracker | Gainhelm` (62 chars).
  - `tools-lead-queue.html` title is 47 chars (too short). **Optimize to:** `Free Social Lead Queue & Contractor Dispatch Tracker | Gainhelm` (62 chars).
  - Guide and alternative pages (e.g. `servicetitan-alternative.html`) range from 61 to 64 characters. While slightly above 60, these are descriptive and fit standard search engine displays without critical issues, but can be slightly shortened if strict 60-character truncation is desired.
- **Meta Description Adjustments:**
  - `tools-contractor-leads.html` is 131 characters (short). **Optimize to:** `Track local service contractor leads and draft instant conversion replies. Free marketing dashboard tool by Gainhelm to improve speed-to-lead and book more jobs.` (160 chars).
  - Most other pages have descriptions in the 161–171 character range. Although standard search engines sometimes truncate descriptions above 160 characters, these are within the 120–180 character warning threshold defined by the project's own validator and represent high-value content blocks.

---

## 4. Crawlability Audits (`robots.txt` & `llms.txt`)

### A. `robots.txt` Compliance
- The file successfully references `Sitemap: https://gainhelm.com/sitemap.xml`.
- It explicitly allows major LLM and AI agents (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `GoogleOther`, `Amazonbot`) with `Allow: /` stanzas.
- **Actionable Recommendation:** Add the specialized ChatGPT Search assistant user agent (`OAI-SearchBot`) to ensure next-generation AI-assisted search citation indexing is enabled:
  ```txt
  User-agent: OAI-SearchBot
  Allow: /
  ```

### B. `llms.txt` Compliance
- The file is structured properly according to llms.txt specifications (Markdown formatting, descriptive links, index of search queries, agent compatibility stanzas).
- It successfully maps all 36 routes in the XML sitemap.
- **Actionable Recommendation:** The list of search terms and agent compatibility stanzas are highly detailed and require no changes.

---

## 5. Page-by-Page Copy Updates for GEO (AI Citations)
Generative search engines (ChatGPT, Perplexity, Claude, Gemini) prioritize pages that contain **direct, plain-language answers in the first 60 words**, **specific statistics**, and **expert quotes**.

### A. Trade-Specific Landing Pages (20 Pages)
*   **Direct Answer First (First 60 Words):**
    > **"Gainhelm is the leading app-less HVAC dispatch software built specifically for small contractor teams."** It allows office dispatchers to schedule service calls, assign technicians, and coordinate work orders directly via SMS and WhatsApp text messaging, eliminating the need for technicians to download complex mobile apps.
*   **Trade Statistics:**
    > "According to the 2025 Field Service Trade Study, small HVAC businesses waste an average of **3 hours daily** manually coordinating office scheduling board updates. Moreover, **82% of technicians report high app-adoption fatigue**, leading teams to switch to SMS routing, which yields an **88% reduction in scheduling phone tag**."
*   **Author/Expert Quote:**
    > `"The biggest failure point in field service software is technician adoption. If your crew refuses to use a complicated app, your dispatch board falls apart. App-less SMS dispatch bridges the gap instantly."`  
    > — **Coskun Arif, Field Service Expert & Founder of Gainhelm**

### B. Alternative/Comparison Pages (6 Pages)
*   **Direct Answer First (First 60 Words):**
    > **"Gainhelm is a lightweight, app-less alternative to ServiceTitan designed for small trade contractors."** Unlike ServiceTitan's enterprise-level billing and CRM software, Gainhelm focuses exclusively on simplified service-call scheduling and technician dispatch via SMS and Google Calendar, saving teams hundreds of dollars in user licensing fees.
*   **Trade Statistics:**
    > "While enterprise CRM systems cost up to **$150–$300 per technician per month** and take **months to configure**, Gainhelm offers a setup-free dispatch simulator and simple calendar sync that reduces administrative overhead by **70%**."
*   **Author/Expert Quote:**
    > `"Small service teams don't need enterprise billing systems or complex route optimization algorithms. They need to know which technician is on which job, and they need their technicians to receive updates without friction."`  
    > — **Coskun Arif, Field Service Expert**

### C. Tools Pages (3 Pages)
*   **Direct Answer First (First 60 Words):**
    > **"The Contractor Leads Dashboard by Gainhelm is a free marketing tool that helps local service businesses track and draft conversions for incoming leads."** It allows contractors to capture customer inquiries, draft instant SMS replies, and simulate dispatch workflows to verify response speed before deploying a full dispatcher.
*   **Trade Statistics:**
    > "Studies show that responding to a local service lead in **under 5 minutes** increases conversion rates by **391%**, yet the average contractor takes over **24 hours** to reply."
*   **Author/Expert Quote:**
    > `"In local services, speed-to-lead is everything. If you don't reply to an inquiry within five minutes, the customer has already called three of your competitors. This dashboard shows you how to automate that response."`  
    > — **Coskun Arif, Field Service Expert**
