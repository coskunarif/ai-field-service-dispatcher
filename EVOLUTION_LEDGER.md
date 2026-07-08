# Feature Evolution Ledger

## Status
state: DONE            # SCOUT | INTAKE | SPEC | TEST | BUILD | VERIFY | DONE
creativity: 1.0          # 0.0 (strict compliance) to 1.0 (autonomous ideation)
target_feature: supervision/manual-dispatch
rejections: 0
budget: 3

## Feature Definition: supervision/manual-dispatch (Manual Dispatch Override)

### Core Philosophy
Provide a visual, real-time manual override mechanism on the Supervision Board. If the AI agent is in the middle of a dispatch search/timeout, or has escalated a job due to no matching technicians, a human dispatcher can take instant control. They can manually force-assign any on-duty technician to the job, instantly scheduling it in the calendar, updating the map routing polyline to a solid green path, and logging the event in PostgreSQL.

### User Flows
1. **Initiate Force Assign**
   - **Trigger**: A dispatcher clicks "Assign" next to an On Duty technician in the roster, or clicks a technician map marker and clicks "Force Assign" in the popup.
   - **Pre-condition**: A simulated dispatch request must be active (`activeJob` is set). If not, the system alerts: "Please initiate a dispatch request first so there is a job to assign."
   - **Action**: 
     - Cancels the active simulation step loops (sets `currentStep` to `2` to halt future timeouts).
     - Hides the technician phone SMS quick reply panel.
     - Draws a solid green routing polyline (`#10b981`) on the Leaflet map from the technician's marker to the job pin.
     - Triggers the simulated Google Calendar slide-in notification on the phone emulator ("Scheduled successfully").
     - Records a POST request to `/app/manual-dispatch` on the server and appends the new manually assigned row to the recent dispatches audit trail.
   - **Outcome**: The job is instantly scheduled to the chosen technician, override status is persisted, and visual assets reflect confirmation.

### Input Validation Constraints
- **Technician Roster Existence**: The manual assignment technician name must exist in the context's technician array.
- **On Duty Status**: Only technicians who are "active" (On Duty) can be force-assigned. The "Assign" action is hidden or disabled for Off Duty technicians.

### Edge Cases & Unhappy Paths
- **Leaflet Offline/CDN Blocked**: If Leaflet fails to load, `typeof L === 'undefined'` check must handle the bypass gracefully. Map routing updates are skipped, but the terminal logs, phone simulator, and database post still run flawlessly.
- **Multiple Override Attempts**: If the user clicks "Assign" multiple times, the state updates are debounced or ignored if `currentStep` is already in a completed state (`currentStep === 2`).

---

## Integration Plan

### Blast Radius Analysis
- **`server.js`**:
  - Add POST route handler `/app/manual-dispatch`.
  - Modify `renderAppPage` template to include "Assign" buttons in the technician cards list and Leaflet popups.
  - Implement `forceAssignTech(techName)` inside the client-side script of `renderAppPage`.
- **`tests/manual_dispatch.spec.js`**:
  - Create a new Playwright test suite to verify the manual override buttons, local overrides, and database persistence.
- **Regressions**:
  - Zero impact on landing SEO/GEO pages.
  - Does not modify existing simulation scripts except by cleanly intercepting loops via the step check.

---

## Interface Contract

### POST `/app/manual-dispatch`
- **Method**: `POST`
- **Request Body**:
  ```typescript
  interface ManualDispatchPayload {
    email: string;
    jobDescription: string;
    trade: string;
    simulatedTime: string;
    technicianName: string;
    technicianPhone: string;
    stepLogs: string[];
  }
  ```
- **Response**: `{ success: boolean }`

### Client-Side JavaScript
- **Function**: `forceAssignTech(techName: string)`
  - Looks up the technician object in `technicians`.
  - Validates `activeJob` exists and technician status is `active`.
  - Sets `activeTech = tech`.
  - Sets `currentStep = 2`.
  - Removes active polylines and draws green solid polyline.
  - Shows calendar alert.
  - Sends POST request to `/app/manual-dispatch`.
