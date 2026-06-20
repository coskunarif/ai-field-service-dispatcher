# Dogfood Report: Gainhelm CTA Visibility Optimization

| Field | Value |
|-------|-------|
| **Date** | 2026-06-20 |
| **App URL** | http://localhost:3005/ |
| **Session** | localhost-3005-20260620-cta-visibility |
| **Scope** | Verify above-the-fold CTA waitlist forms on landing, alternative, and guide pages. |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 0 |
| **Total**| **0** |

## Findings

No functional or visual issues were discovered during testing. All 25+ landing pages feature the optimized above-the-fold waitlist form layout.

### Verification of ACs

1. **[AC-1] Above-the-Fold Waitlist Form Layout**:
   - Verification: Visual inspections on `/appliance-repair-dispatch-software` and other pages confirm exactly one waitlist form located above-the-fold inside the hero section. Lower sections do not contain duplicate forms.
   - Evidence screenshot: [appliance_repair_hero.png](screenshots/appliance_repair_hero.png)

2. **[AC-2] Below-Fold Redirect Card**:
   - Verification: The bottom region of landing pages now successfully features a standard call-out card and a button linking back to `#top`.
   - Evidence: Verified via Playwright automation and accessibility tree snapshots showing the `Join the Waitlist (Go to Top)` link.

3. **[AC-3] Waitlist Form Functionality & Input Contracts**:
   - Verification: Submitted form successfully with name, email, and company. The backend posts to `/waitlist` and returns `{ success: true }`. A dynamic success banner `#waitlist-status` appears with a link to `/setup?email=...`.
   - Evidence screenshot: [appliance_repair_submitted.png](screenshots/appliance_repair_submitted.png)

4. **[AC-4] Test Suite Coverage**:
   - Verification: Expanded Playwright test suite in `tests/seo_conversion.spec.js` runs with `--workers=1` and passes all 127 targeted test specs.
