# SPEC.md - Wizard Setup Session Resume Specification

## 1. Objective
Enable users to resume incomplete configuration wizard sessions to increase Setup Wizard Completion Rate (SWCR) and minimize drop-offs caused by accidental page refreshes, back-and-forth navigation, or transient session loss.

## 2. Acceptance Criteria (AC)

- **[AC-1] Auto-Save Wizard Draft**
  - When the user inputs, selects, or changes any field in the `/setup?email=...` form, or adds/removes technician rows, or navigates between steps, the page must automatically serialize the entire current wizard state and write it to browser `localStorage` keyed under the user's email: `gainhelm_wizard_draft_${email}`.
  - **Verification**: 
    1. Navigate to `/setup?email=test@example.com`.
    2. Add a dynamic technician, modify a phone number, select Standard shift, change the guidelines textarea, and click "Next Step" to proceed to Step 2.
    3. Open browser console and execute `localStorage.getItem('gainhelm_wizard_draft_test@example.com')`.
    4. Assert that the returned JSON string contains all updated values and `currentStep` is set to `2`.

- **[AC-2] Restore Wizard Draft**
  - On page load, if a serialized draft exists in `localStorage` for the current user's email, the client script must parse and restore all inputs:
    - Re-populate static fields: `timeout`, `pricing`, `rules` textarea, `calendar_url`, and `sandbox_mode`.
    - Clear and dynamically re-create all dynamic technician cards inside `#tech-list` using the saved array of technicians.
    - Set the active step to the saved `currentStep` and trigger `updateWizardUI()`.
  - **Verification**:
    1. Visit `/setup?email=persist-test@example.com`.
    2. Add technician named "Alice Cooper" with phone "+1 (555) 9999", trade "Electrical".
    3. Navigate to Step 2, change Timeout to "10", go to Step 3.
    4. Reload the page.
    5. Assert that the wizard immediately displays Step 3, the Timeout field is set to "10", and returning to Step 1 shows "Alice Cooper" intact.

- **[AC-3] Visual Resume Notification**
  - When a draft is successfully restored from `localStorage`, a styled resume banner (`#restore-banner`) must appear at the top of the wizard container (above the progress dots).
  - The banner must read: `"🔄 Resumed incomplete setup wizard session."` and contain a clear `[Start Fresh]` button/link.
  - **Verification**:
    1. Fill out any input on `/setup?email=banner-test@example.com` and refresh the page.
    2. Assert that the banner is visible and matches the theme of the page (Plus Jakarta Sans, brand colors, proper contrast).

- **[AC-4] Discard / Clear Draft**
  - Clicking "[Start Fresh]" inside the `#restore-banner` must remove the draft key from `localStorage` and reload the page, reverting the wizard to its default server-rendered context.
  - Submitting the wizard successfully (POST to `/setup` which redirects to `/app`) must clear the draft key from `localStorage` to prevent restoring stale drafts on future setup visits.
  - **Verification**:
    1. Restore a draft and verify the banner is shown.
    2. Click "[Start Fresh]" and assert that the page reloads, the banner is gone, and fields are reset to default database/server-rendered values.
    3. Fill out the wizard, submit the form to proceed to the Board (`/app`), then navigate back to `/setup?email=...`. Assert that no banner is shown and no draft is restored.

- **[AC-5] E2E Integration Verification**
  - The Playwright integration test suite must contain an end-to-end test confirming that a partially filled form survives page reloads, successfully restores steps, and clears state upon successful submission.
  - *Note*: Test writing is done by the Tester and must not be in implementation slices.

---

## 3. Performance KPIs

- **[KPI-1] Restore Initialization Latency**
  - Restoring form fields and dynamically re-creating technician rows from `localStorage` must complete in `< 15ms` from the `DOMContentLoaded` event to avoid visual flashing or layout shifting (CLS).
- **[KPI-2] Auto-Save Execution Overhead**
  - Serializing state and updating `localStorage` on form input/change events must execute in `< 5ms` to avoid input lag.
- **[KPI-3] Zero Server/Network Overhead**
  - Draft management must be client-side only; no autosave network calls or backend updates are permitted during editing (0ms server latency impact).

---

## 4. Interface Contract

### Target File
- `/home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js`

### Client-Side Functions to Add/Modify (Inside the inline `<script>` block in `renderSetupPage`)
```javascript
/**
 * Serializes the current form values, tech list array, and current step,
 * and saves to localStorage.
 */
function saveDraft();

/**
 * Checks for a saved draft for the current email query param.
 * If found, restores form values, recreates tech cards, updates currentStep,
 * displays the #restore-banner, and updates the wizard UI.
 */
function loadDraft();

/**
 * Removes the draft from localStorage for the current email.
 */
function clearDraft();

/**
 * Renders a new technician card in the DOM.
 * @param {Object} [data] - Optional technician details to prepopulate the card fields.
 */
function addTechRow(data);

/**
 * Removes a technician row card from the DOM and triggers saveDraft().
 * @param {HTMLElement} btn - The button element triggered.
 */
function removeTechRow(btn);
```

### Visual Layout Schema

```
+-----------------------------------------------------------------------------+
|                                  GAINHELM                                   |
+-----------------------------------------------------------------------------+
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   | 🔄 Resumed incomplete setup wizard session.            [Start Fresh] |   |  <-- #restore-banner
|   +---------------------------------------------------------------------+   |
|                                                                             |
|      (1) Team                 (2) Rules                (3) Launch           |
|      o------------------------o------------------------o                    |
|                                                                             |
|      ... Step Panel Content ...                                             |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### CSS Style Additions (To be placed inside the `<style>` block in `renderSetupPage`)
```css
#restore-banner {
  display: none; /* Controlled by loadDraft */
  align-items: center;
  justify-content: space-between;
  background: hsl(var(--brand) / 0.1);
  border: 1px dashed hsl(var(--brand) / 0.4);
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 24px;
  font-size: 0.88rem;
  color: #fff;
  font-family: inherit;
}
.btn-start-fresh {
  background: hsl(var(--surface-3));
  border: 1px solid hsl(var(--line));
  color: hsl(var(--text-2));
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}
.btn-start-fresh:hover {
  background: hsl(0 72% 51% / 0.1);
  color: hsl(0 100% 70%);
  border-color: hsl(0 72% 51% / 0.4);
}
```

---

## 5. Out of Scope

- Backend-side database draft synchronization, REST endpoints, or auto-save cron jobs (YAGNI).
- Multi-device or cross-browser draft syncing.
- Validation checks for technician phone/email formats during the draft save process (validation remains on step navigation).

---

## 6. Slices

### **[S-1] Setup Wizard State Serialization and Input Extender**
- **Description**: Add the `saveDraft()`, `clearDraft()`, and `removeTechRow(btn)` helper functions. Update `addTechRow(data)` to accept data arguments. Modify HTML rendering to bind technician card removal to `removeTechRow(this)` instead of `this.parentElement.remove()`. Attach input/change event listeners to the `#wizard-form` to invoke `saveDraft()`. Attach submit listener to clear the draft.
- **Independent**: Yes
- **Mapped ACs**: `[AC-1]`, `[AC-4]`
- **Files**: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js`

### **[S-2] Setup Wizard Restorer and Resume Banner UI**
- **Description**: Add the `#restore-banner` element and styles. Implement `loadDraft()` to fetch state from `localStorage` on page load, reconstruct technician cards using `addTechRow(data)`, restore other inputs/steps, and handle the "[Start Fresh]" button event.
- **Independent**: No (depends on `[S-1]`)
- **Mapped ACs**: `[AC-2]`, `[AC-3]`, `[AC-4]`
- **Files**: `/home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js`
