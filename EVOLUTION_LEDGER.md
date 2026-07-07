# Feature Evolution Ledger

## Status
state: DONE             # SCOUT | INTAKE | SPEC | TEST | BUILD | VERIFY | DONE
creativity: 0.5          # 0.0 (strict compliance) to 1.0 (autonomous ideation)
target_feature: seo/geo
rejections: 0
budget: 3

## Integration Plan
- Blast Radius: 
  - `server.js`: Hardcoded `pages` route map needs dynamic fallback or directory scanning to pick up new files without manual code changes.
  - `llms.txt`: Programmatic appends required for AI context ingestion.
  - `sitemap.xml`: XML node insertion for new pages.
  - Root directory: New `*-dispatch-software.html` files will be written here. Risk of file overwriting if `service_type` collides with existing files.
- Interface Contract:
  - File: `seo/geo-generator.mjs` (New module)
  - Signatures:
    ```javascript
    /**
     * @typedef {Object} PageMetadata
     * @property {string} service_type
     * @property {string[]} keywords
     * @property {string} title
     * @property {string} url
     * @property {string} description
     * @property {string} file_path
     */

    /**
     * @param {string} service_type
     * @param {string[]} keywords
     * @returns {Promise<PageMetadata>}
     */
    export async function page_generator(service_type, keywords) {}

    /**
     * @param {PageMetadata} page_metadata
     * @returns {Promise<boolean>}
     */
    export async function llms_txt_updater(page_metadata) {}
    ```

## Feature Definition: seo/geo (LLM SEO & Generative Engine Optimization)

### Core Philosophy
Adapt the existing programmatic SEO architecture to cater directly to Generative AI engines (e.g., Perplexity, Google AI Overviews, Claude, ChatGPT). This involves optimizing `llms.txt`, embedding structured data (Schema markup), and structuring page content to provide direct, authoritative, and concise answers to common prompt-based queries (query-to-answer vs query-to-list).

### User Flows
**1. Admin/Marketing Flow: Programmatic Page Creation**
- **Trigger:** Administrator defines a new service category or target query (e.g., "HVAC dispatch app for small teams").
- **Action:** The system generates a landing page that includes:
  - Direct, conversational answers to prompt-like questions.
  - Machine-readable structured data (JSON-LD schema).
  - High-signal context (authoritative data, comparison metrics).
- **Outcome:** Page is published, and `llms.txt` and `sitemap.xml` are automatically updated to register the new context.

**2. AI Agent Flow: Context Ingestion**
- **Trigger:** An AI crawler or agent (e.g., Anthropic, OpenAI, Perplexity) accesses the site.
- **Action:** The agent reads `robots.txt` and is directed to `llms.txt` or a programmatic landing page.
- **Outcome:** The agent easily parses the exact capabilities, integrations, and target audience of Gainhelm, seamlessly ingesting the "Agentic & LLM Harness Compatibility" rules.

### Input Validation Constraints
- **Keywords/Queries:** Must conform to expected industry terms (regex for safe alphanumeric/hyphens to prevent injection in URLs or JSON-LD).
- **Service Types:** Must be validated against a predefined list of supported trades (HVAC, plumbing, electrical, etc.) to ensure accurate routing and context.
- **Structured Data:** Generated JSON-LD must strictly validate against Schema.org standards (e.g., `SoftwareApplication`, `FAQPage`, `WebPage`).

### Edge Cases & Unhappy Paths
- **Conflicting/Duplicate Intent:** Multiple pages targeting identical prompt structures could confuse RAG models. Need a fallback to canonicalize the primary entity.
- **AI Crawler Rate Limiting/Blocking:** Misconfigured `robots.txt` or aggressive WAF (Web Application Firewall) blocking could prevent LLMs from reading `llms.txt`.
- **Malformed llms.txt Generation:** If the programmatic updater fails or generates invalid markdown, LLMs may fail to parse the site context. 
- **Stale Context:** Deleting or modifying a landing page without updating `llms.txt` could result in AI models hallucinating outdated features.
