# Handoff Report — FAQ Schema & OpenGraph Validation (Milestone 2)

## Observation
An audit of the current landing page HTML files was conducted by running the built-in SEO audit command:
```bash
npm run audit:seo-geo
```
This produced the following failures:
```
Failures:
- /: missing og:title
- /: missing twitter:title
- /: missing FAQPage block with trade-specific questions and answers
- /garage-door-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /roofing-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /locksmith-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /pool-service-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /commercial-facilities-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /septic-service-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /restoration-job-management-software: missing FAQPage block with trade-specific questions and answers
- /mobile-dispatch-board: missing FAQPage block with trade-specific questions and answers
- /handyman-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /carpet-cleaning-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /tree-service-dispatch-software: missing FAQPage block with trade-specific questions and answers
- /pressure-washing-dispatch-software: FAQPage has only 2 trade-specific Q&As, expected at least 3 (keywords: pressure-washing, pressure, washing, power)
- /junk-removal-dispatch-software: FAQPage has only 2 trade-specific Q&As, expected at least 3 (keywords: junk-removal, junk, removal, trash)
```

Additionally, there was a discrepancy in title metadata matching. In all 10 target trade-specific landing pages, the `<title>` tag utilizes a literal `&` (ampersand), whereas the corresponding OpenGraph (`og:title`) and Twitter Card (`twitter:title`) metadata tags use the HTML character entity `&amp;`. For example, in `garage-door-dispatch-software.html`:
```html
Line 6: <title>Garage Door Dispatch & Scheduling Software | Gainhelm</title>
Line 12: <meta property="og:title" content="Garage Door Dispatch &amp; Scheduling Software | Gainhelm">
Line 15: <meta name="twitter:title" content="Garage Door Dispatch &amp; Scheduling Software | Gainhelm">
```

## Logic Chain
1. **OpenGraph & Twitter Title Alignment**: The user request and sitemap audit script require that the `og:title` and `twitter:title` tags exactly match the main page `<title>` tag. This means we must replace `&amp;` with `&` in the metadata tags of the 10 landing pages.
2. **Missing Tags in Homepage**: `index.html` has no `og:title` or `twitter:title` tags. We must add them right after the description meta tag to match the `<title>` of the homepage exactly.
3. **FAQ Schema Inclusion**: The 10 trade landing pages, `mobile-dispatch-board.html`, and `index.html` do not have an `FAQPage` entity in their JSON-LD `@graph` arrays. We must append a new `FAQPage` block to their `@graph` schema.
4. **Trade-Specific Q&A Alignment**: The audit script enforces that each route must contain at least 3 Q&As where the combined question and answer text contains at least one trade-specific keyword defined in the audit script (e.g. `locksmith` for locksmiths, `septic` for septic services). Designing highly trade-specific Q&As referencing these keywords ensures compliance.
5. **Checking & Expanding Existing Q&As**: `pressure-washing-dispatch-software.html` and `junk-removal-dispatch-software.html` had 3 Q&As, but only 2 were classified as trade-specific because the general Q&As did not mention the specific keywords (like "pressure washing", "power", "junk", "removal"). Rewriting and expanding these Q&As to ensure all 3 contain the trade-specific keywords resolves the failure.

## Caveats
No caveats. All changes have been compiled, applied to temporary files, and verified to pass the audit script without errors.

## Conclusion
To implement these fixes, a unified patch file containing the exact line-by-line additions and replacements has been generated.

**Patch Location**: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_m2_3/changes.patch`

### Designed Trade-Specific Q&As Overview:
Here is a summary of the 3 trade-specific Q&As proposed for each file:

1. **garage-door-dispatch-software.html**
   - Q1: What is Gainhelm for garage door service teams?
   - Q2: How does Gainhelm help garage door technicians in the field?
   - Q3: Does Gainhelm replace specialized parts management or CRM software for garage door companies?
2. **roofing-dispatch-software.html**
   - Q1: What is Gainhelm for roofing contractors?
   - Q2: Can roofing crew leaders access job specifications on site?
   - Q3: Does Gainhelm handle roof repair emergency dispatch?
3. **locksmith-dispatch-software.html**
   - Q1: What is Gainhelm for locksmith companies?
   - Q2: How do locksmith dispatchers coordinate emergency lockouts?
   - Q3: Does Gainhelm store key codes or secure lock details for locksmiths?
4. **pool-service-dispatch-software.html**
   - Q1: What is Gainhelm for pool service teams?
   - Q2: Can pool service technicians see gate codes and pool equipment details?
   - Q3: Does Gainhelm track pool chemical readings or water testing history?
5. **commercial-facilities-dispatch-software.html**
   - Q1: What is Gainhelm for commercial facility maintenance?
   - Q2: How do commercial technicians coordinate with building managers using Gainhelm?
   - Q3: Can Gainhelm handle multi-site commercial scheduling?
6. **septic-service-dispatch-software.html**
   - Q1: What is Gainhelm for septic service teams?
   - Q2: Can septic technicians view tank size and location notes?
   - Q3: Does Gainhelm handle environmental compliance or dump manifest tracking?
7. **restoration-job-management-software.html**
   - Q1: What is Gainhelm for damage restoration teams?
   - Q2: How does Gainhelm assist with emergency restoration dispatch?
   - Q3: Does Gainhelm store moisture logs, equipment tracking, or insurance documentation for restoration jobs?
8. **handyman-dispatch-software.html**
   - Q1: What is Gainhelm for handyman services?
   - Q2: How do handyman technicians track their daily schedule using Gainhelm?
   - Q3: Is Gainhelm suitable for managing material lists or client estimates for handyman jobs?
9. **carpet-cleaning-dispatch-software.html**
   - Q1: What is Gainhelm for carpet cleaning businesses?
   - Q2: Can carpet cleaning technicians access customer room details and cleaning requirements?
   - Q3: Does Gainhelm manage equipment maintenance or chemical inventory for carpet cleaning teams?
10. **tree-service-dispatch-software.html**
    - Q1: What is Gainhelm for tree service companies?
    - Q2: How do tree service crews coordinate heavy equipment needs?
    - Q3: Does Gainhelm handle permits or tree risk assessment documentation?
11. **mobile-dispatch-board.html**
    - Q1: What is the Gainhelm mobile dispatch board?
    - Q2: Do field technicians need to access the mobile dispatch board?
    - Q3: Can I manage multiple dispatchers on the mobile board?
12. **index.html**
    - Q1: What is Gainhelm's app-less dispatch software?
    - Q2: How does the SMS simulator work?
    - Q3: What field service industries are supported by Gainhelm?
13. **pressure-washing-dispatch-software.html** (Expanded to ensure 3 trade-specific Q&As)
    - Q1: What is Gainhelm for pressure washing crews?
    - Q2: Can Gainhelm handle scheduling for multi-man pressure washing crews?
    - Q3: How does Gainhelm help pressure washing dispatchers handle last-minute weather updates?
14. **junk-removal-dispatch-software.html** (Expanded to ensure 3 trade-specific Q&As)
    - Q1: What is Gainhelm for junk removal teams?
    - Q2: Can junk removal crews update job details or volume estimates in Gainhelm?
    - Q3: How does Gainhelm simplify scheduling for multiple junk removal truck crews?

## Verification Method
An independent verification of these proposed changes can be completed with:
1. Apply the patch to the workspace:
   ```bash
   git apply .agents/explorer_m2_3/changes.patch
   ```
2. Run the local SEO audit script:
   ```bash
   npm run audit:seo-geo
   ```
3. Run the Playwright test suite:
   ```bash
   npx playwright test
   ```
4. Verify the output displays `PASS: Gainhelm SEO/GEO route audit passed` and all browser tests pass successfully.
