# Specification: Above-the-Fold Waitlist CTA Optimization

## Acceptance Criteria
- **[AC-1] Above-Fold Waitlist Form Migration:** On all 20 listed landing pages, the waitlist form (`#waitlist-form`) must be migrated from the bottom section (e.g. `section.form-section`) into the hero section above the fold.
- **[AC-2] Single Form Instance & Duplicate Removal:** Each modified page must contain exactly one form with `id="waitlist-form"`. The duplicate form in the bottom/footer section must be removed.
- **[AC-3] Back to Top CTA Card:** The bottom waitlist section (`#waitlist`) must be replaced with a simplified call-out card containing a standard link/button `Join the Waitlist (Go to Top)` pointing to `#top` (or `#top` anchor in the hero).
- **[AC-4] Form Validation & Action wiring:** The inputs in the migrated form must remain correctly wired to the page's client-side javascript validation and submission event listeners.
- **[AC-5] Safe Redirection URL Construction:** Upon successful submission, the script must update the status element with the success message and a link to `/setup?email=[encoded_email]` built safely using the URL API (or proper encodeURIComponent).
- **[AC-6] SEO/GEO Audit Compliance:** Running `npm run audit:seo-geo` (which executes `scripts/gainhelm-seo-geo-audit.mjs`) must pass with zero failures and warnings for all modified pages.

## Performance KPIs
- **[KPI-1] Hero Render Performance / LCP:** Above-the-fold form elements must not block page rendering, maintaining Largest Contentful Paint (LCP) < 1.2s.
- **[KPI-2] Visual Responsiveness:** Form controls must render properly across target viewport widths: Desktop (1440px), Tablet (768px), and Mobile (320px) without content clipping or layout shifts.

## Interface Contract
- **Form HTML markup:**
  ```html
  <form id="waitlist-form" action="/waitlist" method="post" data-api-url="/waitlist" novalidate>
    <!-- Inputs for name, email, company, and submit button -->
  </form>
  ```
- **Success status link:**
  The status link constructed dynamically by JS must have class `waitlist-setup-link` and redirect to `/setup?email=...` with the URL-encoded email value.
- **Form wrapper selector in CSS:**
  The form must match the selectors `.hero #waitlist-form` and `.hero-layout #waitlist-form` defined in `styles.css`.

## Out of Scope
- Modifications to pages that already have forms above the fold (`/hvac-dispatch-software`, `/plumbing-dispatch-software`, `/electrical-dispatch-software`, `/locksmith-dispatch-software`, `/septic-service-dispatch-software`, `/emergency-restoration-dispatch-software`, `/carpet-cleaning-dispatch-software`, `/tree-service-dispatch-software`, `/field-service-scheduling`).
- Homepage `/` (`index.html`) modifications.
- The runner-up task: Implementing an interactive simulator to increase homepage CTA clicks.

## Objections
- **Critic Objections:** None.
- **Resolution:** Proceeding with standard layout migration for all 20 target pages.

## Slices
### [S-1] Migrate Waitlist Form Above-the-Fold on 10 Service Landing Pages
- **Description:** For the 10 service landing pages, move the `#waitlist-form` block, `#waitlist-status`, and `#waitlist-help` elements to the hero copy block (replacing the `.hero-actions` div). Replace the bottom `#waitlist` section content with a call-out card and a button/link `Join the Waitlist (Go to Top)` pointing to `#top`.
- **Target Files:**
  - `appliance-repair-dispatch-software.html`
  - `cleaning-dispatch-software.html`
  - `commercial-facilities-dispatch-software.html`
  - `garage-door-dispatch-software.html`
  - `handyman-dispatch-software.html`
  - `landscaping-dispatch-software.html`
  - `pest-control-dispatch-software.html`
  - `pool-service-dispatch-software.html`
  - `restoration-job-management-software.html`
  - `roofing-dispatch-software.html`
- **ACs Mapped:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`, `[AC-6]`
- **[Independent: Yes]**

### [S-2] Migrate Waitlist Form Above-the-Fold on 6 Competitor Alternative Pages
- **Description:** Move `#waitlist-form` and status/help blocks into the hero copy block on alternative landing pages. Replace bottom `#waitlist` content with the `Join the Waitlist (Go to Top)` call-out card.
- **Target Files:**
  - `buildops-alternative.html`
  - `fieldedge-alternative.html`
  - `housecallpro-alternative.html`
  - `jobber-alternative.html`
  - `servicefusion-alternative.html`
  - `servicetitan-alternative.html`
- **ACs Mapped:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`, `[AC-6]`
- **[Independent: Yes]**

### [S-3] Migrate Waitlist Form Above-the-Fold on 4 Guide & Comparison Pages
- **Description:** Move `#waitlist-form` and status/help blocks into the hero copy block on remaining guide/comparison pages. Replace bottom `#waitlist` content with the `Join the Waitlist (Go to Top)` call-out card.
- **Target Files:**
  - `how-hvac-dispatch-apps-reduce-phone-tag.html`
  - `how-to-choose-hvac-dispatch-app.html`
  - `hvac-dispatch-app-vs-spreadsheets.html`
  - `mobile-dispatch-board.html`
- **ACs Mapped:** `[AC-1]`, `[AC-2]`, `[AC-3]`, `[AC-4]`, `[AC-5]`, `[AC-6]`
- **[Independent: Yes]**
