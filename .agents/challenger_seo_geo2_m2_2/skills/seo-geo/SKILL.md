---
name: seo-geo
description: Complete SEO + GEO (Generative Engine Optimization) skill. Covers traditional
  technical SEO audits, content optimization for AI citation, and dual-track ranking
  strategy for Google and AI search engines.
aliases: [seo, search-ranking, google-ranking, generative-engine-optimization]
license: MIT
metadata:
  author: arif-coskun + jarvis
  version: 1.0.0
  sources:
  - https://github.com/AgriciDaniel/claude-seo
  - https://github.com/ReScienceLab/opc-skills
  - https://github.com/aaron-he-zhu/seo-geo-claude-skills
  - https://github.com/anthropics/knowledge-work-plugins
---


# SEO + GEO Skill

Dual-track optimization: **traditional SEO** (rank in Google) + **GEO** (get cited by ChatGPT, Perplexity, Google AI Overview, Claude). In 2026, being cited is the new ranking #1 — AI search engines don't rank pages, they cite sources.

---

## Project Context (auto-detect)

| Signal in conversation | Apply context |
|------------------------|---------------|
| "coach-os", "thecoachloop.com", "coaches" | → Coach-OS context |
| "ProfitHelm", "Shopify profit", "COGS" | → ProfitHelm context |

### coach-os (80% focus)
- **URL**: thecoachloop.com
- **Product**: AI back-office for independent coaches — session recording → transcript → AI recap → homework → SMS nudges → invoicing
- **Target queries**: "AI coaching tools", "automated session notes for coaches", "coaching practice management software", "AI session recap", "HIPAA coaching software"
- **Primary GEO targets**: ChatGPT Search, Perplexity (coaches use these to discover tools)
- **Schema priority**: SoftwareApplication, FAQPage, Organization, Review
- **E-E-A-T angle**: Coach productivity data, time saved, session quality improvements
- **Content gaps to fill**: Comparison vs manual note-taking, integration with Zoom/Google Meet, coach workflow guides

### ProfitHelm (20% focus)
- **URL**: ProfitHelm in Shopify App Store
- **Product**: Shopify profitability tracking — COGS, margins, product-level P&L
- **Target queries**: "track Shopify profit", "Shopify COGS calculator", "Shopify margin tracker", "Shopify profitability app"
- **Primary GEO targets**: Google AI Overview (merchants Google their questions), Perplexity
- **Schema priority**: SoftwareApplication, FAQPage, Review
- **Content angle**: Shopify merchants lose margin without tracking COGS — ProfitHelm fixes that

---

## Commands

```
/seo audit [url]          Full technical + GEO audit (100-point health score)
/seo geo [url or topic]   GEO-only — make content citable by AI engines
/seo content [topic]      Write or rewrite content with GEO + SEO baked in
/seo schema [page-type]   Generate JSON-LD schema markup
/seo competitor [url]     Competitive gap analysis
/seo plan [project]       Strategic roadmap (90-day)
/seo technical [url]      Deep technical audit only
```

---

## Core Framework

### Track 1 — Traditional SEO (rank in Google)

**Scoring weights** (from AgriciDaniel/claude-seo):

| Category | Weight | What to check |
|----------|--------|---------------|
| Technical | 25% | Crawlability, indexability, Core Web Vitals (INP), mobile, JS rendering |
| Content quality | 25% | E-E-A-T, depth, freshness, originality |
| On-page | 20% | Title, H1, meta description, URL structure, internal links |
| Schema | 10% | JSON-LD presence, validation, rich result eligibility |
| Performance | 10% | LCP < 2.5s, INP < 200ms, CLS < 0.1 |
| Images | 5% | Alt text, WebP/AVIF, lazy loading, file size |
| AI readiness | 5% | robots.txt allows AI crawlers, llms.txt present |

**Issue tiers:**
- 🔴 Critical — blocking indexing (fix immediately)
- 🟠 High — ranking impact (fix this sprint)
- 🟡 Medium — optimization (fix next sprint)
- low — backlog

### Track 2 — GEO (get cited by AI engines)

**9 Princeton-backed methods** (from ReScienceLab/opc-skills):

| Method | Visibility boost | How to apply |
|--------|-----------------|--------------|
| Source citations | +40% | Cite research, studies, stats inline with links |
| Statistics inclusion | +37% | Add specific numbers ("73% of coaches spend 2h/week on notes") |
| Expert quotations | +30% | Quote known coaches, industry figures |
| Authoritative tone | +25% | Definitive statements, not hedged language |
| Clarity optimization | +20% | Plain language, no jargon without definition |
| Technical terminology | +18% | Use domain-correct terms (AI, session notes, HIPAA, COGS) |
| Vocabulary diversity | +15% | Vary language, avoid repetition |
| Readability | +15–30% | Short paragraphs, question headings, lists/tables |
| Keyword stuffing | −10% | Never repeat target keyword unnaturally |

**Platform-specific strategies** (load `./references/platform-strategies.md`):

| Platform | What it favors |
|----------|---------------|
| ChatGPT Search | Branded domain authority, content updated <30 days ago |
| Perplexity | FAQ schema, PDFs, data-dense pages, listicles |
| Google AI Overview | E-E-A-T, structured data, 92% comes from top-10 ranked pages |
| Claude (Anthropic) | Brave Search index, data-dense, factual, cites sources |

**GEO technical requirements:**
- Allow AI crawlers in `robots.txt`: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `GoogleOther`, `Amazonbot`
- Add `/llms.txt` file describing content for AI systems
- Answer the target question in first 60 words of every page
- Use "X is..." definition blocks for key concepts
- Self-contained 134–167 word content blocks (AI cites at paragraph level)
- Author bio + publication date on every content page

---

## Audit Workflow

### `/seo audit [url]`

Run these in parallel, then synthesize into a unified 0–100 score:

**Phase 1 — Technical (25pts)**
```
- Fetch robots.txt → check AI crawler permissions
- Check sitemap.xml presence and validity
- Verify canonical tags in raw HTML (not JS-injected)
- Check HTTPS, redirect chains (max 1 hop)
- Mobile viewport meta tag
- Core Web Vitals proxy: page size, render-blocking resources
- llms.txt presence
```

**Phase 2 — On-Page (20pts)**
```
- Title tag: 50–60 chars, contains primary keyword, compelling
- Meta description: 140–160 chars, includes CTA
- H1: one only, matches search intent
- H2/H3: logical hierarchy, question-based where relevant
- URL: lowercase, hyphens, keyword-containing, max 60 chars
- Internal links: min 3 relevant, descriptive anchor text
- Image alt text: all images described
```

**Phase 3 — Content Quality / E-E-A-T (25pts)**
```
- Experience: first-hand data, original research, case studies
- Expertise: author credentials, depth, accuracy
- Authoritativeness: external citations, mentions
- Trustworthiness: About page, contact, privacy, HTTPS
- Freshness: publication + last-updated dates present
- Depth: covers topic comprehensively vs thin content
```

**Phase 4 — GEO Readiness (15pts)**
```
- Direct answer in first 60 words?
- Definition blocks using "X is..." pattern?
- Statistics with sources cited?
- Self-contained 134–167 word blocks?
- FAQ section present?
- Author bio present?
- Schema present (FAQPage, Article, SoftwareApplication)?
```

**Phase 5 — Schema (10pts)**
```
- JSON-LD present (not Microdata/RDFa)
- Types valid for 2026: Organization, SoftwareApplication, FAQPage, Article, Review
- No deprecated types: HowTo (Sept 2023), SpecialAnnouncement (Jul 2025), Dataset (late 2025)
- Server-rendered, not JS-injected (especially Product/Offer)
- Required properties present per type
```

**Output format:**
```
## SEO/GEO Audit: [URL]
Health Score: XX/100

Critical (fix now):
- [issue] → [fix]

High (this sprint):
- [issue] → [fix]

Medium (next sprint):
- [issue] → [fix]

GEO Score: XX/15
Top GEO win: [single highest-impact action]
```

---

## Google Search Console Workflow

Use `./references/search-console-cli.md` when the user asks about Google Search Console performance, impressions, clicks, queries, pages, indexing, crawl waste, or what to do next from web search data.

1. Verify the property and access.
2. Pull a recent performance window.
3. Compare queries and pages.
4. Inspect questionable URLs.
5. Decide the next action: optimize a live page, retire stale URLs, or add one distinct-intent page.

Do **not** use Google Play Console for web search data; Play Console is for app stores, not web search performance.

---

## Content Writing Workflow

### `/seo content [topic]`

1. **Identify search intent** — informational / commercial / navigational / transactional
2. **Extract target keywords** — primary (1), secondary (2–4), semantic variants
3. **Structure for GEO first**:
   - Answer in first 60 words
   - H2s as questions ("What is X?", "How does X work?", "Why do coaches use X?")
   - Every section: 134–167 word self-contained block
   - 2–3 statistics per 500 words, cited
   - FAQPage section at bottom
4. **Apply on-page SEO**:
   - Title: [Primary Keyword] — [Benefit] | [Brand]
   - Meta: includes primary keyword + CTA in 155 chars
   - URL slug: /primary-keyword
   - Internal links: 3+ to related pages

**For coach-os content** — use these angles:
- Problem framing: "Coaches spend 2+ hours per session on admin"
- Solution framing: "The Coach Loop automates the entire back-office"
- Trust signals: session count, coaches using, time saved data
- FAQ targets: "Is The Coach Loop HIPAA compliant?", "Does it work with Zoom?", "How much does it cost?"

**For ProfitHelm content** — use these angles:
- Problem framing: "Shopify shows revenue, not profit — merchants fly blind"
- Solution framing: "ProfitHelm shows real margin per product, per order"
- FAQ targets: "How to calculate COGS in Shopify?", "What's the best Shopify profit tracker?"

---

## Schema Generation

### `/seo schema [page-type]`

Load `./references/schema-templates.md` for full JSON-LD templates.

**Quick map:**

| Page | Schema type(s) |
|------|---------------|
| Homepage | Organization + WebSite + SoftwareApplication |
| Pricing | SoftwareApplication + FAQPage |
| Feature page | SoftwareApplication + FAQPage |
| Blog post | Article + BreadcrumbList |
| Comparison page | FAQPage + Article |
| Review/testimonial | AggregateRating + Review |

**Rules:**
- Always server-render JSON-LD in `<head>`
- Never include placeholder or unverified data
- Validate at schema.org/validator before deploying

---

## Competitor Analysis

### `/seo competitor [url]`

1. Use WebSearch to find competitor's ranking keywords
2. Check their schema markup (view-source or WebFetch)
3. Identify content gaps: what do they cover that we don't?
4. Identify GEO weaknesses: do they have FAQ schema? Author bios? Citations?
5. Check their AI crawler permissions (robots.txt)

**Output:**
```
## Competitor: [URL]
Ranking keywords (estimated): [list]
Content gaps we can own: [list]
GEO weaknesses: [list]
Schema they use: [list]
Our advantage: [1–2 sentences]
```

---

## 90-Day Roadmap

### `/seo plan [project]`

**Month 1 — Foundation**
- Technical audit → fix Critical + High issues
- Add/fix schema on all key pages
- Fix robots.txt AI crawler access
- Add llms.txt
- Set publication dates + author bios

**Month 2 — Content**
- Identify 5 high-value GEO content targets
- Write/rewrite with GEO methods (citations, stats, FAQ sections)
- Internal linking audit + fix
- Competitor gap content (2–3 pieces)

**Month 3 — Authority + Monitor**
- Build entity presence (Wikipedia, Wikidata mentions, Reddit threads)
- Get YouTube mentions (GEO signal: brand mentions correlate 3× more than backlinks for AI visibility)
- Set up rank tracking: SERP positions + AI response monitoring
- Measure: Perplexity citations (2–4 weeks), ChatGPT visibility (4–6 weeks)

---

## Key Reference Files

| File | Contents |
|------|---------|
| `./references/platform-strategies.md` | Full per-platform GEO tactics (ChatGPT, Perplexity, Google, Claude, Bing) |
| `./references/search-console-cli.md` | Google Search Console workflow: property checks, query/page pulls, URL inspection, and next-step triage |
| `./references/schema-templates.md` | JSON-LD templates for all schema types |
