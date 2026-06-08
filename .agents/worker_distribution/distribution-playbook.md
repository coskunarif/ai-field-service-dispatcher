# Distribution & GEO Playbook

Purpose: historical and reusable distribution/GEO tactics, originally written for Shopify app distribution.
Retrieval policy: default yes for distribution strategy, but read `business-state` and `product-truth` first before choosing a product or channel.
Update policy: refresh when distribution focus, product focus, or channel evidence changes.
Last reviewed: 2026-06-01.
Default retrieval: allowed.

> Current-use note: much of this file is ProfitHelm/adspendguard-specific historical research. Do not revive parked products or apply Shopify-specific tactics to Coach Loop unless fresh `business-state` / `product-truth` evidence says that is the current mission. For the current distribution automation architecture, read `distribution-system`.

## GEO (Generative Engine Optimization)

**What**: Optimizing content to get cited in AI-generated answers (ChatGPT, Perplexity, Google AI Overviews).
**Why now**: 71% of Americans use AI search for purchases. LLMs cite only 2-7 domains per response — scarcer than Google's 10 blue links.

### Tactics That Work
- **Direct answer in first 40-60 words** — AI extracts the opening as summary
- **Fact every 150-200 words** — statistics increase citation frequency ~40% (Princeton/Stanford study)
- **Schema markup** — FAQPage, SoftwareApplication, HowTo, Article → 30% more clicks
- **llms.txt file** — emerging standard for AI discoverability
- **Original data** — publish benchmarks, studies, unique data points others will cite
- **Cross-channel brand consistency** — same messaging across site, social, forums, directories

### ProfitHelm GEO Actions
Historical examples for Shopify app work:
1. "Shopify Profitability Benchmarks" page with anonymized merchant data
2. FAQPage schema on docs ("What is a good Shopify profit margin?")
3. Comparison pages with structured data (vs BeProfit, vs TrueProfit)
4. SoftwareApplication schema on profithelm.com
5. Blog posts answering high-intent prompts: "How to calculate true COGS on Shopify"
6. Ensure AI crawlers can access site (check robots.txt)

## Shopify App Store SEO

### Ranking Factors (order of influence)
1. Average rating (very high)
2. Number of downloads (very high)
3. Number of reviews (high)
4. Keyword relevance — **5 hidden keyword slots are most controllable** (high)
5. Download velocity (medium-high)
6. User retention (medium)
7. App update frequency (medium)

### Feb 2025 Algorithm Update
- Factors merchant interaction data post-search
- Penalizes keyword stuffing
- Built-in mechanism for trending smaller apps (velocity matters)

### Listing Optimization (Because Intelligence case study)
- 100 → 1,000 stores in 3 months
- AIDA copy framework (Attention → Interest → Desire → Action)
- Lead with merchant pain points, not features
- Customer logos + before/after screenshots + GIF walkthrough
- **Sharp positioning beats broad** — Klaviyo-specific messaging showed 2x higher activation

### Keyword Slots
- ProfitHelm: profit tracker, profit analytics, COGS tracking, order profitability, shopify profit
- adspendguard: ad spend tracker, budget pacing, ad cost alerts, marketing spend, ROAS tracking

### Shopify Ads
- CPC $0.50-$2.00, CPI ~$50-60 (Because Intelligence benchmark)
- At ProfitHelm pricing ($4.99-$29.99), payback = 10-12 months
- **Not viable until activation is fixed and ARPA is higher**
- Exception: $5/day on 2-3 long-tail keywords for learning

## Distribution Channel Hierarchy (pre-revenue)

| Channel | Time to Results | Cost | Effectiveness |
|---------|----------------|------|---------------|
| Personal outreach / DMs | Days | Free | Very High |
| Reddit / Forums | Weeks | Free | High |
| Integration directories | Weeks | Free | High |
| Building in public (X/LinkedIn) | Months | Free | Medium-High |
| Partnerships / Affiliates | Weeks-Months | Rev share | Medium-High |
| Content / Blog SEO | 6-12 months | Free | Medium (delayed) |
| App Store organic | 3-6 months | Free | Medium (delayed) |
| Paid ads | Days | $$ | Low at $0 MRR |

### Reddit Tactics
- 200K impressions/week achievable with consistent engagement
- Reddit posts rank top 3 on Google (post-$60M licensing deal)
- 12% conversion rate vs 4% from ads (PhotoGov case study)
- Target: r/shopify, r/ecommerce, r/smallbusiness, r/entrepreneur
- Post helpful content about profit tracking, COGS, shipping costs — never pitch directly
- Build karma first, engage authentically for 2+ weeks before any product mention

### Partnerships
- Standard SaaS affiliate: 20-30% recurring commission
- Pallyy: 10x growth to $85K MRR through creator/agency partnerships
- For ProfitHelm: Shopify agencies, bookkeepers, ecommerce consultants

## Programmatic SEO

### Template Types for ProfitHelm
- "[Category] Profit Margins on Shopify" (clothing, jewelry, electronics, etc.)
- "[Competitor] vs ProfitHelm" (BeProfit, TrueProfit, Lifetimely)
- "How to Track [Cost Type] on Shopify" (shipping, COGS, transaction fees)
- "Shopify Profit Calculator for [Niche]" (dropshippers, POD, wholesale)

### Critical Warning
- G2 lost 80% SEO traffic from programmatic content penalties
- Each page MUST have unique, non-templated value
- Include real data points specific to each page
- Pages must genuinely answer the query, not just exist for ranking

## Priority Framework ($0 MRR)

Current-use note: verify current MRR, product focus, and parked-product rules in `business-state` before applying this framework.

### The Coupled Problem
Distribution AND activation are coupled. Research consensus: **activation first**.
- Time-to-value has 0.69 correlation with overall performance
- 43% same-day churn (ProfitHelm, was 57%) = distribution amplifies a leaky bucket
- All successful case studies fixed onboarding BEFORE scaling distribution

### The First 5 Minutes (Shopify Official + Founder Patterns)

Source: [Shopify Partners — App Onboarding](https://www.shopify.com/za/partners/blog/app-onboarding)

| Time | What Should Happen |
|------|-------------------|
| 0-30s | **Instant value demonstration** — show a number, not a tutorial |
| 1-2min | **Personalization** — "What matters most? Margin tracking / Cost reduction / Product profitability" |
| 2-3min | **First accomplishment** — merchant sees their actual profit data |
| 3-5min | **Premium teaser** — "Upgrade to track per-product margins and get daily alerts" |

**Key stat:** 80% of trial users never convert to paid. The fix is immediate value, not more features.

**ProfitHelm first 5 min should show:**
1. Instant profit snapshot (even rough: orders - estimated COGS - fees)
2. One surprise insight ("Your top revenue product is your 3rd most profitable")
3. Segmentation question for personalized dashboard

**adspendguard first 5 min should show:**
1. Current ad spend status ("$X spent today across Y campaigns")
2. One risk flag ("Campaign Z is 40% over daily pace")
3. Protection confirmation ("Budget guard is now active")

### Founder Patterns That Worked (learned 2026-02-14)

**Sleek.design → $10k MRR in 6 weeks, $0 marketing spend:**
Source: [Indie Hackers](https://www.indiehackers.com/post/tech/hitting-10k-mrr-in-six-weeks-with-an-ai-design-tool-pEvmU5qkWS6ny0AR9SUv)
- X post: strong hook + demo + "comment for early access" (algo loves comments)
- Content-first: share valuable output, never pitch. People ask "what tool?"
- Narrow ICP: mobile app builders without design skills (not "developers")
- Aggressive free limit: 1 free use, then $25/mo
- Had ~8k X followers at launch

**Leadmore → $30k MRR, Reddit marketing:**
Source: [Indie Hackers](https://www.indiehackers.com/post/tech/hitting-30k-mrr-with-an-ai-marketing-product-n59ORJCYjnZC61Q096UL)
- Validated with 50-100 user conversations BEFORE building
- Content ON the platform itself (Reddit tool → posts on Reddit)
- Refundable credits model (reduces friction)
- Retention-first formula: new users × conversion × retention

**Common pattern:** Both built content that demonstrated value independently of the product. People discovered the product by consuming the content.

### Staged Approach
1. **Weeks 1-4**: Fix activation → <30% same-day churn, first-value in 3 minutes (not 60)
2. **Weeks 5-8**: MVD (minimum viable distribution) → personal DMs, Reddit, listing optimization, review solicitation → target 10 reviews, 50 installs
3. **Weeks 9-16**: Scale → programmatic SEO pages, $5/day ads test, building in public → target 100 merchants, $500+ MRR
4. **Months 4-6**: Compound → content engine, partnerships, affiliates → target 250 merchants, $2K+ MRR

### The Flywheel
Better Listing → More Installs → More Reviews → Higher Ranking → More Visibility → repeat
**Activation is the flywheel's starting mechanism** — without retention, no reviews, no ranking.

### Reviews at Current Scale
- 1-3% of users leave reviews → 20 reviews needs 667-2000 installs
- At 14 merchants: personal outreach is the only viable path
- Ask after value moment (first profitable order tracked), not at install
- Include direct link to review page
- Goal: 10 reviews (realistic from 14 merchants if product delivers value)

## Full Research Document
`~/projects/social/content/research/distribution-geo-research-2025.md`
