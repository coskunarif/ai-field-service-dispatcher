# SPEC: Optimize CTA Visibility on Landing Pages

## Objective
Increase waitlist conversion rates by moving waitlist forms above-the-fold inside the hero section on all remaining 25+ landing pages, aligning them with the patterns of the 9 already optimized landing pages.

---

## Acceptance Criteria

### [AC-1] Above-the-Fold Waitlist Form Layout
Every HTML landing page in the repository must feature exactly one waitlist form located above-the-fold inside the hero section (`.hero-layout`, `.hero-copy`, or `.hero`). Any duplicate or secondary forms in the lower/footer sections of the page must be removed.

### [AC-2] Below-Fold Redirect Card
The lower part of every landing page (where the form was originally located) must now feature a standard call-out card and a button/link pointing back to `#top` (e.g., `<a href="#top" class="cta-primary">Back to Sign-Up Form</a>` or similar) to guide users back to the sign-up form.

### [AC-3] Waitlist Form Functionality & Input Contracts
The waitlist forms must support standard input validation and successfully post to the `/waitlist` endpoint. After submission, a successful status block (`#waitlist-status`) must be displayed containing a link directing the user to `/setup?email=...`.

### [AC-4] Test Suite Coverage
The Playwright test suites (specifically `tests/seo_conversion.spec.js`) must be expanded to include all optimized landing pages in the above-the-fold forms test targets, and all tests must pass sequentially with a single worker (`--workers=1`).

---

## Performance KPIs

### [KPI-1] Bundle Size & DOM footprint
Moving the forms above the fold must not increase individual HTML page size by more than 5KB.

### [KPI-2] Visual Load Time
Above-the-fold content load time must remain under 200ms with zero blocking third-party scripts.

---

## Interface Contract

- **Form Element ID**: `#waitlist-form`
- **Input Fields**:
  - `#name` (text, required/optional as per existing page pattern)
  - `#email` (email, required, strict client-side validation check)
  - `#company` (text, optional)
- **Status Container**: `#waitlist-status` (with standard styling classes like `success`, `error`, `pending`)
- **Backend API Endpoint**: `POST /waitlist`
- **Setup Redirection Link Target**: `/setup?email=...`

---

## Out of Scope
- Redesigning the home page (`/`) layout or style rules inside `styles.css`.
- Backend modifications or new database tables.
- Adding third-party tracking pixels or script tags.

---

## Objections
- **Critic Objection**: "Editing 25+ files manually can lead to typos or structural drift."
  - **Resolution**: We will use a script or very precise replacement chunks to ensure layout consistency across all files.

---

## Slices

### [S-1] Optimize Trade-Specific Landing Pages
- **Description**: Move waitlist forms to the hero section, replace footer forms with back-to-top links, and update script bindings on all remaining trade-specific pages.
- **Files**:
  - [appliance-repair-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/appliance-repair-dispatch-software.html)
  - [pest-control-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/pest-control-dispatch-software.html)
  - [garage-door-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/garage-door-dispatch-software.html)
  - [cleaning-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/cleaning-dispatch-software.html)
  - [landscaping-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/landscaping-dispatch-software.html)
  - [roofing-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/roofing-dispatch-software.html)
  - [pool-service-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/pool-service-dispatch-software.html)
  - [commercial-facilities-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/commercial-facilities-dispatch-software.html)
  - [restoration-job-management-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/restoration-job-management-software.html)
  - [handyman-dispatch-software.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/handyman-dispatch-software.html)
- **ACs Mapped**: `[AC-1]`, `[AC-2]`, `[AC-3]`
- **Independent**: Yes

### [S-2] Optimize Competitor Alternative Pages
- **Description**: Move waitlist forms to the hero section, replace footer forms with back-to-top links, and update script bindings on all competitor alternative pages.
- **Files**:
  - [servicetitan-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/servicetitan-alternative.html)
  - [jobber-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/jobber-alternative.html)
  - [housecallpro-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/housecallpro-alternative.html)
  - [servicefusion-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/servicefusion-alternative.html)
  - [buildops-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/buildops-alternative.html)
  - [fieldedge-alternative.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/fieldedge-alternative.html)
- **ACs Mapped**: `[AC-1]`, `[AC-2]`, `[AC-3]`
- **Independent**: Yes

### [S-3] Optimize Guides and Informational Pages
- **Description**: Move waitlist forms to the hero section, replace footer forms with back-to-top links, and update script bindings on guides and other sub-pages.
- **Files**:
  - [hvac-dispatch-app-vs-spreadsheets.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/hvac-dispatch-app-vs-spreadsheets.html)
  - [how-to-choose-hvac-dispatch-app.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/how-to-choose-hvac-dispatch-app.html)
  - [how-hvac-dispatch-apps-reduce-phone-tag.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/how-hvac-dispatch-apps-reduce-phone-tag.html)
  - [mobile-dispatch-board.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/mobile-dispatch-board.html)
  - [tools-facebook-post-generator.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tools-facebook-post-generator.html)
  - [tools-contractor-leads.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tools-contractor-leads.html)
  - [tools-lead-queue.html](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/tools-lead-queue.html)
- **ACs Mapped**: `[AC-1]`, `[AC-2]`, `[AC-3]`
- **Independent**: Yes
