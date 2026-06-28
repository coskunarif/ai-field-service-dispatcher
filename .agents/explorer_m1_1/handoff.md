# Handoff Report — SEO/GEO Audit Update Proposal

## 1. Observation

During the read-only investigation, the codebase and existing automated audit script were analyzed:

- **Audited File Path:** `/home/ubuntuadmin/projects/ai-field-service-dispatcher/scripts/gainhelm-seo-geo-audit.mjs`
- **Sitemap Configured Paths:** 34 routes configured in `/home/ubuntuadmin/projects/ai-field-service-dispatcher/sitemap.xml`.
- **Existing Main Audit Loop (Lines 90-122):**
  ```javascript
  for (const p of paths) {
    const html = await textFor(p);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const desc = meta(html, 'description');
    const canonical = href(html, 'canonical');
    const robotsMeta = meta(html, 'robots');
    const h1s = [...html.matchAll(/<h1\b/gi)].length;
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const form = html.match(/<form[^>]+id=["']waitlist-form["'][^>]*>/i)?.[0] || '';
    const card = meta(html, 'twitter:card');
    const body = strip(html).slice(0, 220);

    if (!title || title.length > 70) errors.push(`${p}: missing/long title (${title.length})`);
    if (!desc || desc.length < 120 || desc.length > 180) warnings.push(`${p}: meta description outside 120-180 chars (${desc.length})`);
    ...
  ```

A dry-run test of the proposed auditing rules on the current landing page files reveals the following **16 failures**:
- `/`: missing og:title
- `/`: missing twitter:title
- `/`: missing FAQPage block with trade-specific questions and answers
- `/garage-door-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/roofing-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/locksmith-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/pool-service-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/commercial-facilities-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/septic-service-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/restoration-job-management-software`: missing FAQPage block with trade-specific questions and answers
- `/mobile-dispatch-board`: missing FAQPage block with trade-specific questions and answers
- `/handyman-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/carpet-cleaning-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/tree-service-dispatch-software`: missing FAQPage block with trade-specific questions and answers
- `/pressure-washing-dispatch-software`: FAQPage has only 2 trade-specific Q&As, expected at least 3 (keywords: pressure-washing, pressure, washing, power)
- `/junk-removal-dispatch-software`: FAQPage has only 2 trade-specific Q&As, expected at least 3 (keywords: junk-removal, junk, removal, trash)

---

## 2. Logic Chain

1. **Observation 1:** Key route pages (`/` and `/mobile-dispatch-board`) and several trade landing pages (e.g. `garage-door-dispatch-software`) completely lack the schema type `"FAQPage"` inside their JSON-LD scripts.
   - **Inference:** A filter logic is needed to isolate target pages (key routes & trade landing pages ending in `-dispatch-software` or `-job-management-software`), then scan the JSON-LD `@graph` arrays to locate the `FAQPage` block.
2. **Observation 2:** The trade landing pages `pressure-washing` and `junk-removal` have `FAQPage` blocks but include generic questions/answers that fail to use their trade-specific keywords.
   - **Inference:** The validator must dynamically extract keywords based on the route name (e.g., `pressure`, `washing`, `power` for `pressure-washing-dispatch-software`) and verify that at least 3 Q&A pairs contain at least one page-specific keyword in either the question or answer text.
3. **Observation 3:** The homepage (`/` / `index.html`) has no `og:title` or `twitter:title` tags at all.
   - **Inference:** The script must verify both tags are present.
4. **Observation 4:** Other pages encode characters like `&` as `&amp;` in meta attributes, whereas the `<title>` tag contains raw `&` characters.
   - **Inference:** Comparing them directly will lead to false mismatches. The titles must be normalized by decoding HTML entities (e.g. `&amp;` -> `&`, `&#39;` -> `'`) before validation.

---

## 3. Caveats

- **Assumptions:** It is assumed that sitemap routes consistently match standard layout structures. If live fetching is used, HTML entity encodings are assumed to be consistent with local file parses.
- **Scope:** The Explorer is restricted to a read-only investigation. No source files or landing pages have been modified; the implementation of code changes and the resolution of the 16 page-level failures are left to the Implementer.

---

## 4. Conclusion

The script `scripts/gainhelm-seo-geo-audit.mjs` can be updated cleanly using a set of helper functions for target route recognition, keyword extraction, JSON-LD traversal, and HTML entity decoding. This ensures 100% compliance with local/remote testing of both title tags and `FAQPage` schemas.

### Proposed Code Changes for `scripts/gainhelm-seo-geo-audit.mjs`

#### A. Add Helper Functions (Insert after line 70, after `strip(html)`)

```javascript
// Decodes common HTML entities for accurate title comparisons
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Determines if page is a trade-specific landing page or key route page
function isTargetPage(p) {
  const keyRoutes = ['/', '/field-service-scheduling', '/mobile-dispatch-board'];
  if (keyRoutes.includes(p)) return true;
  if (p.endsWith('-dispatch-software') || p.endsWith('-job-management-software')) return true;
  return false;
}

// Maps trade pages and key routes to their respective trade keywords
const TRADE_KEYWORDS = {
  'hvac': ['hvac', 'heating', 'air conditioning', 'ac', 'cooling'],
  'plumbing': ['plumbing', 'plumber'],
  'electrical': ['electrical', 'electrician'],
  'appliance-repair': ['appliance', 'repair'],
  'pest-control': ['pest', 'exterminator'],
  'garage-door': ['garage', 'door'],
  'cleaning': ['cleaning', 'cleaner'],
  'landscaping': ['landscaping', 'landscaper', 'lawn', 'mowing'],
  'roofing': ['roofing', 'roofer'],
  'locksmith': ['locksmith'],
  'pool-service': ['pool', 'spa'],
  'commercial-facilities': ['commercial', 'facilities', 'facility'],
  'septic-service': ['septic'],
  'emergency-restoration': ['restoration', 'emergency', 'mitigation'],
  'restoration-job-management': ['restoration', 'water damage'],
  'handyman': ['handyman', 'handyperson'],
  'carpet-cleaning': ['carpet', 'rug', 'cleaning'],
  'tree-service': ['tree', 'arborist'],
  'painting': ['painting', 'painter'],
  'pressure-washing': ['pressure', 'power', 'washing'],
  'junk-removal': ['junk', 'trash', 'removal']
};

function getPageTradeKeywords(p) {
  const keyRoutes = {
    '/': ['field service', 'dispatch', 'scheduling', 'waitlist', 'technician'],
    '/field-service-scheduling': ['field service', 'scheduling', 'dispatch', 'technician'],
    '/mobile-dispatch-board': ['mobile', 'dispatch', 'board', 'ipad', 'tablet', 'technician']
  };
  if (keyRoutes[p]) return keyRoutes[p];

  const tradeMatch = p.match(/^\/([a-z-]+)-(?:dispatch-software|job-management-software)$/);
  if (tradeMatch) {
    const tradeSlug = tradeMatch[1];
    const words = tradeSlug.split('-');
    const extraKeywords = TRADE_KEYWORDS[tradeSlug] || [];
    return Array.from(new Set([tradeSlug, ...words, ...extraKeywords]));
  }
  return [];
}

// Recursively finds all FAQPage blocks within a JSON-LD object/graph
function findFAQPages(obj) {
  const faqPages = [];
  function traverse(item) {
    if (!item || typeof item !== 'object') return;
    if (Array.isArray(item)) {
      item.forEach(traverse);
      return;
    }
    if (item['@type'] === 'FAQPage') {
      faqPages.push(item);
    }
    if (item['@graph'] && Array.isArray(item['@graph'])) {
      item['@graph'].forEach(traverse);
    }
  }
  traverse(obj);
  return faqPages;
}
```

#### B. Update the Auditing Loop (Inside `for (const p of paths)` loop)

```javascript
    // Proposed Check 2: Verify og:title and twitter:title properties
    const ogTitle = meta(html, 'og:title');
    const twitterTitle = meta(html, 'twitter:title');

    const normTitle = decodeEntities(title).replace(/\s+/g, ' ').trim();
    const normOgTitle = decodeEntities(ogTitle).replace(/\s+/g, ' ').trim();
    const normTwitterTitle = decodeEntities(twitterTitle).replace(/\s+/g, ' ').trim();

    if (title) {
      if (!ogTitle) {
        errors.push(`${p}: missing og:title`);
      } else if (normOgTitle !== normTitle) {
        errors.push(`${p}: og:title mismatch (expected "${normTitle}", found "${normOgTitle}")`);
      }

      if (!twitterTitle) {
        errors.push(`${p}: missing twitter:title`);
      } else if (normTwitterTitle !== normTitle) {
        errors.push(`${p}: twitter:title mismatch (expected "${normTitle}", found "${normTwitterTitle}")`);
      }
    }
```

*(Place the FAQPage check inside the loop as well:)*

```javascript
    // Proposed Check 1: Verify FAQPage structure and trade-specific questions
    if (isTargetPage(p)) {
      let maxTradeSpecificFaqs = 0;
      const kws = getPageTradeKeywords(p);

      for (const [i, m] of jsonLd.entries()) {
        try {
          const parsed = JSON.parse(m[1]);
          const faqPages = findFAQPages(parsed);
          for (const faq of faqPages) {
            let tradeSpecificFaqs = 0;
            if (faq.mainEntity && Array.isArray(faq.mainEntity)) {
              for (const qa of faq.mainEntity) {
                const qText = qa.name || '';
                const aText = qa.acceptedAnswer?.text || '';
                
                const isTradeSpec = kws.some(kw => {
                  const kwLower = kw.toLowerCase();
                  return qText.toLowerCase().includes(kwLower) || aText.toLowerCase().includes(kwLower);
                });
                
                if (isTradeSpec) {
                  tradeSpecificFaqs++;
                }
              }
            }
            if (tradeSpecificFaqs > maxTradeSpecificFaqs) {
              maxTradeSpecificFaqs = tradeSpecificFaqs;
            }
          }
        } catch (e) {
          // JSON parsing errors are already handled by baseline checks
        }
      }

      if (maxTradeSpecificFaqs === 0) {
        errors.push(`${p}: missing FAQPage block with trade-specific questions and answers`);
      } else if (maxTradeSpecificFaqs < 3) {
        errors.push(`${p}: FAQPage has only ${maxTradeSpecificFaqs} trade-specific Q&As, expected at least 3 (keywords: ${kws.join(', ')})`);
      }
    }
```

---

## 5. Verification Method

- **Dry-run Test Execution:**
  To independently run and verify the new proposed checks against the codebase:
  ```bash
  node .agents/explorer_m1_1/test-audit.mjs
  ```
  This script executes the exact proposed auditing logic locally and details the 16 current page-level validation errors.
- **Failures to Address:**
  When the Implementer fixes the HTML files, re-running `node .agents/explorer_m1_1/test-audit.mjs` must yield:
  ```
  PASS: All proposed checks passed!
  ```
