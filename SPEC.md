# SPEC.md: Google Calendar Integration Link Validation

## Overview
Small trade contractors frequently enter restricted, personal, or invalid Google Calendar URLs in Step 3 of the context configuration setup wizard. This leads to silent dispatch booking failures.
This specification details the frontend and backend changes required to validate calendar URLs during onboarding, preventing users from submitting the wizard with non-functional integration links.

---

## Test Strategy
- **Type**: Additive (new feature)
- **Approach**: Tests first (TDD). The Tester will write/update Playwright tests to cover the ACs before implementation.

---

## Acceptance Criteria

### `[AC-1]`: Backend validation endpoint `POST /api/validate-calendar`
- **Path**: `/api/validate-calendar`
- **Method**: `POST`
- **Request Body**:
  ```json
  { "calendar_url": "https://..." }
  ```
- **Response Format (Valid)**:
  ```json
  { "valid": true }
  ```
- **Response Format (Invalid/Restricted)**:
  ```json
  { "valid": false, "error": "Reason description" }
  ```
- **Validation Logic**:
  1. Parse input as a valid URL. If parsing fails, return `valid: false` with appropriate error.
  2. The hostname must resolve to `calendar.google.com`. Otherwise, return `valid: false`.
  3. Send an HTTP request (fetch) to the calendar URL:
     - Follow redirects automatically.
     - If the request fails (network error, DNS resolution error), return `valid: false`.
     - If the response status code is not in the `2xx` range (e.g., `404`, `403`), return `valid: false`.
     - If the response URL redirects to `accounts.google.com` or contains login parameters (e.g. login prompt indicating a private/restricted URL), return `valid: false` with error message `"Restricted calendar URL. Please check calendar public sharing settings."`
  4. **Testing Bypass**: If `calendar_url` includes `/test` (e.g., `https://calendar.google.com/test`), or if `process.env.NODE_ENV === 'test'`, bypass external fetch and return `{ valid: true }`.

### `[AC-2]`: Wizard Step 3 UI Validation Component
- Add a "Verify Link" button next to the Google Calendar URL input field.
- Add a status badge/message element below the input to display connection state.
- **Visual Design & Micro-interactions**:
  - The status message should support four distinct states:
    - **Not Verified**: `⚠️ Connection not verified.` (Muted orange, default/initial state)
    - **Verifying**: `⏳ Verifying calendar link...` (Pulsing animation)
    - **Verified**: `✅ Calendar integration verified.` (Vibrant green `#10b981`, success state)
    - **Error**: `❌ Integration failed: <reason>` (Vibrant red `#ef4444`, error state with dynamic detail)
  - Provide a helper link below the verification badge: `[How do I make my calendar link public?]` pointing to a help guide or modal detailing Google Calendar public sharing options.

```
+-------------------------------------------------------------+
| Google Calendar Integration Link                            |
| [ https://calendar.google.com/calendar/embed?src=... ] [Verify Link] |
|                                                             |
| ⚠️ Connection not verified.                                 |
| Need help? How do I make my calendar link public?           |
+-------------------------------------------------------------+
```

### `[AC-3]`: Verification Form Submission Guard
- The wizard submit button (`#btn-submit` - "Save & Launch Board") is disabled or form submission is intercepted and blocked until verification succeeds (`isCalendarVerified` state is true).
- If the user edits the calendar URL input field, reset verification status to "Not Verified", requiring a fresh verify call.
- Playwright tests must assert:
  - Submitting wizard blocks if URL is not verified.
  - Verification with an invalid URL shows error.
  - Verification with a valid URL enables submission.

### `[AC-4]`: Persistence of Verification State in Drafts
- The `localStorage` draft schema (`gainhelm_wizard_draft_${email}`) must store the `calendarConfig.is_verified` boolean flag.
- When restoring a draft on page load, if `is_verified` is true, display the verified badge and enable `#btn-submit` if the current step is 3.

---

## Performance KPIs
- **`[KPI-1]` Backend response latency**: Response time for mocked/bypassed URLs must be < 50ms, and external fetches must be < 1500ms under standard network conditions.
- **`[KPI-2]` Frontend micro-interaction**: Transition from "Verify Link" click to "Verifying" loading state must occur in < 16ms.
- **`[KPI-3]` Bundle/file size growth**: Incremental file size increase in `server.js` must be < 10KB.

---

## Interface Contract
- **File to Modify**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js)
- **New API Route**:
  - URL: `/api/validate-calendar`
  - Method: `POST`
  - Content-Type: `application/json`
  - Payload: `{ calendar_url: String }`
  - Response: `{ valid: Boolean, error?: String }`
- **Draft Schema Updates**:
  - `draft.calendarConfig.calendar_url` (existing)
  - `draft.calendarConfig.sandbox_mode` (existing)
  - `draft.calendarConfig.is_verified`: Boolean (new field to preserve verification status in `localStorage`)

---

## Out of Scope
- No external OAuth or Google Calendar API authentication/login flows. Validation is purely URL-reachability and public-access verification.
- No editing of dispatching engine logic or Twilio SMS gateway configurations.

---

## Slices

### `[S-1]`: Backend Calendar Verification Endpoint
- **Description**: Add `/api/validate-calendar` POST route in `server.js` with hostname validation, HTTP request dispatching, redirect checks, and test-bypass overrides.
- **Independent**: Yes
- **ACs**: `[AC-1]`
- **Files**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js)

### `[S-2]`: Setup Wizard Frontend Verification UI & Guard
- **Description**: Implement "Verify Link" button, verification status badge with states/styles, client-side input reset logic, submission guard blocking `#btn-submit` until verified, and localStorage draft serialization/restoration.
- **Independent**: No
- **ACs**: `[AC-2]`, `[AC-3]`, `[AC-4]`
- **Files**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js)
