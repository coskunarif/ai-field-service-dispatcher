# Specification: Waitlist Conversion & GSC Traction Optimization

Objective: Increase landing page waitlist conversion rate and Google Search Console click volume by replacing passive above-fold CTAs with inline forms, resolving missing homepage waitlist forms, and mitigating late-stage waitlist forms.

## 🖼️ Design Mockup
Below is the modern, premium glassmorphic hero design with an inline, above-the-fold waitlist form:

![Hero Waitlist Form Mockup](/home/ubuntuadmin/.gemini/antigravity-cli/brain/98eb23ef-90de-4dd2-b8b8-571104e3d579/hero_waitlist_form_1781885683246.jpg)

---

## 🎯 Acceptance Criteria

- **[AC-1] Above-Fold Landing Page Forms**: Every target trade-specific landing page (listed in `tests/seo_conversion.spec.js`) must feature an inline waitlist form (`<form id="waitlist-form">`) located in the above-the-fold hero copy column, replacing the old `hero-actions` links.
- **[AC-2] Above-Fold Homepage Form**: The homepage (`index.html`, source component `redesign-temp/src/components/Hero.tsx`) must feature an inline waitlist form (`<form id="waitlist-form">`) in the hero section above the fold, resolving the SEO audit warnings for `/`.
- **[AC-3] Form Input Fields & Validation**: Every waitlist form must contain the following fields with matching IDs:
  - Full Name (`<input id="name">`)
  - Work Email (`<input id="email">`)
  - Company Name (`<input id="company">`)
  Forms must enforce validation (required name/email, valid email format) inline and prevent submission of incomplete details.
- **[AC-4] Action-Oriented CTA & Instant Simulator Link**: The submit button must use the text `Join Waitlist & Try Simulator`. On successful submission, the form must display a helper/success block (`#waitlist-status`) containing the standard success message and a prominent link pointing to the interactive simulator: `/setup?email=[USER_EMAIL]` (URL-encoded).
- **[AC-5] Local SEO/GEO Audit & Playwright Test Green**: The local SEO audit script (`npm run audit:seo-geo`) and Playwright test suite (`npm test`) must pass with zero failures and zero warnings (the `/` no inline form warning must be resolved).

---

## 📊 Performance KPIs

- **[KPI-1] DomContentLoaded Latency**: Under 150ms on all landing pages and the homepage under simulated Fast 3G throttling.
- **[KPI-2] HTML Bundle Size**: The compiled homepage single-file bundle (`index.html`) must remain under 450 KB.

---

## 🔌 Interface Contract

The Builder and Tester must adhere to the following shared selectors, files, and variables:

### Target Files to Modify
- **Styles**: [styles.css](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/styles.css)
- **Homepage Source**: [Hero.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/Hero.tsx)
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
- Form Element ID: `waitlist-form`
- Name Input ID: `name`
- Email Input ID: `email`
- Company Input ID: `company`
- Submit Button Class: `form-submit`
- Success Message ID: `waitlist-status`
- Success/Simulator Anchor Link class: `waitlist-setup-link`

---

## 🚫 Out of Scope

- Modifying database schemas or rewriting Fastify server routes/controllers in [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js).
- Implementing CRM integrations or analytics tracking pixels beyond the local form fields and simulator redirection.

---

## 🙋 Critic Objections
- *No design or technical objections raised yet.*

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
- **Description**: Migrate the waitlist form from the footer section to the above-the-fold hero section in `hvac-dispatch-software.html`. Ensure the footer section is replaced by a simple "Join Waitlist (Scroll to Top)" helper button/card linking back to `#top`.
- **Type**: Refinement
- **Independent**: No
- **Files**: [hvac-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-software.html)
- **AC Coverage**: `[AC-1]`, `[AC-3]`, `[AC-4]`

### `[S-3]` Above-Fold Forms on Remaining Landing Pages
- **Description**: Replicate the above-fold form migration across the remaining 17 industry landing pages.
- **Type**: Refinement
- **Independent**: Yes
- **Files**: Remaining landing page HTML files in the project root.
- **AC Coverage**: `[AC-1]`, `[AC-3]`, `[AC-4]`

### `[S-4]` Homepage Hero Component Waitlist Form
- **Description**: Implement the waitlist form state, rendering, and API submission flow in `redesign-temp/src/components/Hero.tsx`. Show the success state with the encoded simulator link.
- **Type**: Refinement
- **Independent**: Yes
- **Files**: [Hero.tsx](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/redesign-temp/src/components/Hero.tsx)
- **AC Coverage**: `[AC-2]`, `[AC-3]`, `[AC-4]`

### `[S-5]` Vite Compilation & Single-File Synchronization
- **Description**: Execute Vite build in `redesign-temp`, copy `redesign-temp/dist/index.html` to root `index.html`, and confirm sitemap-wide audit pass.
- **Type**: Refinement
- **Independent**: No
- **Files**: [index.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/index.html)
- **AC Coverage**: `[AC-5]`
