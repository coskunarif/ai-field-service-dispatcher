# Challenger Report — visual and responsiveness layout check

## Challenge Summary

**Overall risk assessment**: HIGH

Through systematic automated verification of all 31 Gainhelm landing pages across Desktop (1440px), Tablet (768px), and Mobile (320px) viewports using Playwright, we identified one critical page-level horizontal overflow bug and several responsive layout breakages (visual clipping) affecting comparison tables on mobile viewports.

---

## Challenges

### [High] Challenge 1: Page-level Horizontal Overflow on `/hvac-dispatch-app-vs-spreadsheets`
- **Assumption challenged**: All pages are perfectly responsive with zero horizontal scrolling at 320px.
- **Attack scenario**: When loading `/hvac-dispatch-app-vs-spreadsheets` on a Mobile (320px) viewport, a comparison table (`<table class="compare">`) is rendered directly under `<main>` without a width-constraining container or scroll wrapper. Because of cell content lengths, the table's minimum content width is 384px.
- **Blast radius**: The entire page extends to 384px wide (scrollWidth = 384px), introducing a horizontal scrollbar. This breaks the mobile viewport layout, causing the headers and footers to stretch and float awkwardly, and ruins the mobile swipe-to-scroll user experience.
- **Mitigation**: Wrap the `<table class="compare">` in a responsive overflow wrapper like `<div class="comparison-table-wrapper">` with `overflow-x: auto;` in `styles.css`. This is already correctly implemented on `/hvac-dispatch-software.html`.

### [Medium] Challenge 2: Visual Table Clipping (Cut-off Layout) on Alternative Pages
- **Assumption challenged**: Tables are accessible and readable on mobile viewports.
- **Attack scenario**: On the 6 alternative pages (`/servicetitan-alternative`, `/jobber-alternative`, `/housecallpro-alternative`, `/servicefusion-alternative`, `/buildops-alternative`, `/fieldedge-alternative`), the comparison tables also use `<table class="compare">` and are 400px wide. Because they are placed inside `<section class="section">`, and `section:not(.hero):not(.form-section)` has `overflow: hidden` in `styles.css`, they do not cause page-level scrolling. However, the rightmost columns of the table (containing the comparison data for Gainhelm) are completely clipped and inaccessible to mobile users.
- **Blast radius**: Mobile users on 320px viewports cannot view or read the comparison table content past the 320px limit (the Gainhelm column is cut off by up to 80px).
- **Mitigation**: Similar to Challenge 1, wrap these comparison tables in a container with `overflow-x: auto;` (e.g. `.comparison-table-wrapper` with `.comparison-table` styling), ensuring they are horizontally scrollable on mobile.

---

## Stress Test Results

| Viewport | Target Width | Pages Checked | Passed | Failed | Offending Pages / Details |
|---|---|---|---|---|---|
| **Desktop** | 1440px | 31 | 31 | 0 | None |
| **Tablet** | 768px | 31 | 31 | 0 | None |
| **Mobile** | 320px | 31 | 30 | 1 | `/hvac-dispatch-app-vs-spreadsheets` (scrollWidth = 384px) |

### Page-by-Page Mobile (320px) Visual Analysis

1. **`/hvac-dispatch-app-vs-spreadsheets`**:
   - **Status**: FAIL (Horizontal Overflow)
   - **scrollWidth**: 384px (innerWidth: 320px)
   - **Offending elements**:
     - `TABLE.compare` (width=384px, left=0px, right=384px)
     - `A` "How it works" link (width=105px, left=300px, right=405px) — shifted due to full page stretching.

2. **Alternative Pages** (`/servicetitan-alternative`, `/jobber-alternative`, `/housecallpro-alternative`, `/servicefusion-alternative`, `/buildops-alternative`, `/fieldedge-alternative`):
   - **Status**: PASS (0 Page-level Overflow), but HAS visual clipping.
   - **scrollWidth**: 320px (innerWidth: 320px)
   - **Clipped elements**:
     - `TABLE.compare` (width=400px, left=28px, right=428px) — extends 108px past the viewport.
     - `TD` & `TH` cells inside table (rightmost column elements have `right: 428px`).

3. **Other Service Pages** (e.g., `/plumbing-dispatch-software`, `/electrical-dispatch-software` etc.):
   - **Status**: PASS (0 Page-level Overflow)
   - **Clipped elements**: Only the mobile scrollable navigation bar links (e.g. `<a href="#how-it-works">` at `right: 405px`), which is the expected behavior for a scrollable horizontal menu wrapper (`.nav` has `overflow-x: auto` and `scrollbar-width: none`).

---

## Unchallenged Areas

- **SUPERVISION BOARD / Wizard flow `/setup` and `/app`**: These dynamic/wizard screens require database setup or mock configurations and form completions that were outside the core scope of static page responsiveness. However, they were verified visually to fit within standard viewports when using their target wizard controls.
