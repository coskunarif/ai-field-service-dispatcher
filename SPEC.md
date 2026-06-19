# Specification: Waitlist Conversion & GSC Traction Optimization

Objective: Increase landing page waitlist conversion rate and Google Search Console click volume by replacing passive above-fold CTAs with inline forms, resolving missing homepage waitlist forms, and mitigating late-stage waitlist forms.

## 🖼️ Design Mockup
Below is the modern, premium glassmorphic hero design with an inline, above-the-fold waitlist form:

![Hero Waitlist Form Mockup](/home/ubuntuadmin/gemini/antigravity-cli/brain/98eb23ef-90de-4dd2-b8b8-571104e3d579/hero_waitlist_form_1781885683246.jpg)

---

## 🎯 Acceptance Criteria

- **[AC-1] Above-Fold Landing Page Forms (Unique ID)**: Every target trade-specific landing page (listed in `tests/seo_conversion.spec.js`) must feature an inline waitlist form (`<form id="waitlist-form">`) located in the above-the-fold hero copy column, replacing the old `hero-actions` links. The old duplicate footer forms must be replaced with a standard call-out card and a button linking back to `#top`, ensuring only a single `#waitlist-form` exists on the page.
- **[AC-2] Above-Fold Homepage Form (Single Instance)**: The homepage (`index.html`, source component `redesign-temp/src/components/Hero.tsx`) must feature an inline waitlist form (`<form id="waitlist-form">`) in the hero section above the fold. The duplicate form inside the `<CTA />` component must be deprecated and replaced with a button that scrolls back to the top/hero form, resolving the SEO audit warnings for `/` and preventing DOM ID duplication.
- **[AC-3] Form Input Fields, Validation & Sanitization**: Every waitlist form must contain the following fields with matching IDs:
  - Full Name (`<input id="name">`)
  - Work Email (`<input id="email">`)
  - Company Name (`<input id="company">`)
  Forms must enforce strict client-side validation (regex check `^[^\s@]+@[^\s@]+\.[^\s@]+$`) and input sanitization before processing.
- **[AC-4] Action-Oriented CTA & Sanitized Simulator Link**: The submit button must use the text `Join Waitlist & Try Simulator`. On successful submission, the form must display a success status (`#waitlist-status`). The simulator link inside the success block must be constructed safely using the browser's `URL` API and `searchParams.set()` to prevent protocol injection: `/setup?email=[USER_EMAIL]`.
- **[AC-5] Transient DB Resilience & Test Passes**:
  - The Fastify `/waitlist` POST handler must handle postgres queries gracefully, catching any connection errors and falling back automatically to the in-memory store so that transient database restarts or drops do not cause 500 server errors or lead loss.
  - The local SEO audit script (`npm run audit:seo-geo`) and Playwright test suite (`npm test`) must pass with zero failures.

---

## 📊 Performance KPIs

- **[KPI-1] DomContentLoaded Latency**: Under 150ms on all landing pages and the homepage under simulated Fast 3G throttling.
- **[KPI-2] HTML Bundle Size**: The compiled homepage single-file bundle (`index.html`) must remain under 450 KB.

---

## 🔌 Interface Contract

The Builder and Tester must adhere to the following shared selectors, files, and variables:

### Target Files to Modify
- **Styles**: [styles.css](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/styles.css)
- **Homepage Components**:
  - [Hero.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/Hero.tsx)
  - [CTA.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/CTA.tsx)
- **Backend Routing**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js)
- **Target Landing Pages**: All static HTML files in the root folder, including:
  - [hvac-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-software.html)
  - [plumbing-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/plumbing-dispatch-software.html)
  - [electrical-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/electrical-dispatch-software.html)
  - [septic-service-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/septic-service-dispatch-software.html)
  - [tree-service-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tree-service-dispatch-software.html)
  - [carpet-cleaning-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/carpet-cleaning-dispatch-software.html)
  - [locksmith-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/locksmith-dispatch-software.html)
  - [emergency-restoration-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/emergency-restoration-dispatch-software.html)
  - [field-service-scheduling.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/field-service-scheduling.html)

### HTML/DOM Selector Contracts
- Form Element ID: `waitlist-form` (strictly one per page)
- Name Input ID: `name`
- Email Input ID: `email`
- Company Input ID: `company`
- Submit Button Class: `form-submit`
- Success Message ID: `waitlist-status`
- Success/Simulator Anchor Link class: `waitlist-setup-link`

### Playwright Locator Isolation Rule
To ensure robust, non-flaky test assertions:
- All input interactions (`#name`, `#email`, `#company`) and click events must be scoped explicitly under the `#waitlist-form` locator (e.g. `page.locator('#waitlist-form').locator('#email')`).

---

## 🚫 Out of Scope

- Modifying database schemas or writing sync scripts to migrate memory leads to postgres outside of simple runtime exception fallbacks.

---

## 🙋 Critic Objections & Resolutions

- **OBJ-1: DOM ID Duplication on Homepage (Hero vs. CTA)**
  * *Resolution*: Deprecate the form fields and submission state inside [CTA.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/CTA.tsx). Replace them with a simple text layout and an amber CTA button/link that scrolls the user back up to the hero waitlist form (`#top` or focus on email input), guaranteeing a single `#waitlist-form` instance on the page.
- **OBJ-2: Unsanitized Redirection Parameter (`/setup?email=[USER_EMAIL]`)**
  * *Resolution*: Enforce email validity via frontend regex. Construct redirect links using the browser's `URL` API (`new URL('/setup', window.location.origin)`) and set query params via `searchParams.set()`, guaranteeing safe output formats and preventing protocol injection.
- **OBJ-3: Flaky/Ambiguous Playwright Test Locators**
  * *Resolution*: Standardized contextual element isolation in the Interface Contract. The test suite will locate inputs inside `page.locator('#waitlist-form')` specifically.
- **OBJ-4: Transient Database Disconnects during Waitlist Submission**
  * *Resolution*: Update the `/waitlist` POST route in `server.js` with a robust try/catch around SQL insertions. If SQL execution fails due to network issues or database downtime, catch the error, log a warning, fall back to in-memory tracking `inMemoryLeads.push(...)`, and return a successful `200` response to the client.
- **OBJ-5: Single-File Compilation Size Limits and Vite Asset Bundling**
  * *Resolution*: Explicitly import individual `lucide-react` icons (e.g. `import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right'`) to enable Vite's tree-shaking mechanism, ensuring the final compiled bundle remains well under the 450 KB ceiling.

---

## 🍰 Vertical Slices

Slices represent implementation code only. Verification tests are handled by the Tester.

### `[S-1]` CSS & Stylesheet Rules for Above-Fold Forms
- **Description**: Add CSS rules in `styles.css` to accommodate inline waitlist forms in the hero columns. Ensure form elements stack on mobile and span dual columns neatly on desktop.
- **Type**: Refinement
- **Independent**: Yes
- **Files**: [styles.css](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/styles.css)
- **AC Coverage**: `[AC-1]`, `[AC-3]`

### `[S-2]` HVAC Landing Page Above-Fold Migration (Spike Slice)
- **Description**: Migrate the waitlist form from the footer section to the above-the-fold hero section in `hvac-dispatch-software.html`. Replace the footer form with a card containing a button/link scrolling back to the top of the page. Integrate strict client-side regex check and safe URL parameter building.
- **Type**: Refinement
- **Independent**: No
- **Files**: [hvac-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-software.html)
- **AC Coverage**: `[AC-1]`, `[AC-3]`, `[AC-4]`

### `[S-3]` Above-Fold Forms on Remaining Landing Pages
- **Description**: Replicate the above-fold form migration across the remaining target industry landing pages, replacing duplicate footer forms with scroll-to-top links.
- **Type**: Refinement
- **Independent**: Yes
- **Files**: Remaining landing page HTML files in the project root.
- **AC Coverage**: `[AC-1]`, `[AC-3]`, `[AC-4]`

### `[S-4]` Homepage Hero & CTA Components Waitlist Form
- **Description**: Implement the above-fold waitlist form state, rendering, and API submission flow in `redesign-temp/src/components/Hero.tsx`. Deprecate the form fields inside `redesign-temp/src/components/CTA.tsx`, replacing them with a scroll-to-top button.
- **Type**: Refinement
- **Independent**: Yes
- **Files**:
  - [Hero.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/Hero.tsx)
  - [CTA.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/CTA.tsx)
- **AC Coverage**: `[AC-2]`, `[AC-3]`, `[AC-4]`

### `[S-5]` Transient Database Fallback in server.js
- **Description**: Update the Fastify `/waitlist` POST route in `server.js` to catch database runtime connection exceptions and fall back to in-memory lead logging.
- **Type**: Refinement
- **Independent**: Yes
- **Files**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js)
- **AC Coverage**: `[AC-5]`

### `[S-6]` Vite Compilation & Single-File Synchronization
- **Description**: Execute Vite build in `redesign-temp`, copy `redesign-temp/dist/index.html` to root `index.html`, and confirm sitemap-wide audit pass.
- **Type**: Refinement
- **Independent**: No
- **Files**: [index.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/index.html)
- **AC Coverage**: `[AC-5]`
