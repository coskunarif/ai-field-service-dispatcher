# Feature Evolution Ledger

## Status
state: DONE           # SCOUT | INTAKE | SPEC | TEST | BUILD | VERIFY | DONE
mode: CONTINUOUS
creativity: 1.0          # 0.0 (strict compliance) to 1.0 (autonomous ideation)
target_feature: null
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

## Feature Definition: supervision/route-optimization-eta (Real-Time Route Optimization & ETA Simulator)

### Core Philosophy
Provide a visual routing optimizer and traffic condition simulator on the Supervision Board (`/app`). The AI agent utilizes geodesic calculations (Haversine formula) to calculate distance between technician coordinates and the job site, dynamically modifying travel ETA based on selected traffic factors (Normal, Rush Hour, Accident/Gridlock). When dispatch is simulated, the map renders a simulated route and animates the technician marker to the destination. The dynamic ETA and route details are injected into the technician's SMS dispatch notification and logged to PostgreSQL.

### User Flows
1. **Modify Traffic Density & Speed Settings**
   - **Trigger**: A dispatcher interacts with the new "Traffic & Route Settings" control panel on the Supervision Board dashboard.
   - **Action**: Adjusting the Traffic multiplier (Normal: 1.0x, Rush Hour: 1.8x, Accident: 3.0x) instantly updates the calculated ETA for the route.
2. **Dynamic Route Dispatch**
   - **Trigger**: A dispatcher initiates a simulated job request.
   - **Action**: 
     - Calculates Haversine distance from the assigned technician to the job.
     - Computes the travel ETA.
     - Shows a customized SMS notification containing the dynamic ETA (e.g. "ETA: 14 mins under Rush Hour traffic").
     - Animates the technician marker along a simulated route polyline to the job pin on the Leaflet map.
     - Persists distance, duration, and traffic multiplier parameters via POST `/app/log-dispatch` to PostgreSQL.
3. **Manual Dispatch Integration**
   - **Trigger**: Dispatcher clicks "Assign" to manually override dispatch.
   - **Action**: Instantly recomputes distance and travel ETA for the chosen technician, drawing a green polyline and animating the marker.

### Input Validation Constraints
- **Technician & Job Coordinates**: Must be valid numeric latitude (-90 to 90) and longitude (-180 to 180) coordinates. Fallbacks must be defined for invalid inputs.
- **Traffic Multiplier**: Limited to values between 1.0 and 5.0.

### Edge Cases & Unhappy Paths
- **Leaflet Map Unavailable**: If the Leaflet library fails to load, coordinates mapping is bypassed, travel ETA is computed mathematically, and logs/SMS are updated normally.
- **Identical Locations**: If a technician's marker is at the job site, distance defaults to 0 miles and travel ETA is set to 1 minute, preventing math errors.
- **Simultaneous Dispatches**: If a new job is dispatched while an animation is active, the system terminates the running animation, clears the routing layer, and starts fresh.

---

## Integration Plan

### Blast Radius Analysis

#### 1. Database Upgrade
- **Target Table**: `gainhelm_dispatch_logs`
- **Action**: Add optional columns `distance_miles`, `duration_mins`, and `traffic_multiplier` using SQL `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` at server startup (in [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js) initialization block).
- **Risk**: None. Retroactive fields default to `NULL`, maintaining compatibility with prior dispatch records.

#### 2. Backend Routes & Controllers
- **File**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js)
- **Asset Serving**: Update lines 199–205 in [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js) to serve `route-optimizer.js` from the project root. Ensure correct MIME type (`application/javascript`) is returned for files ending with `.js`.
- **POST `/app/log-dispatch` & `/app/manual-dispatch`**:
  - Update payload parsing to extract optional route parameters (`distance_miles`, `duration_mins`, `traffic_multiplier`).
  - Update raw `INSERT` SQL queries to map request parameters to their respective DB columns.

#### 3. Client-Side Decoupled Layer
- **File**: `route-optimizer.js` (to be created at project root)
- **Purpose**: Modular client-side javascript library containing geodesic computation math and Leaflet marker animation. Decouples math and UI animation logic from the backend HTML rendering logic.

#### 4. Frontend UI & Simulation Orchestration
- **File**: [server.js](file:///home/ubuntuadmin/projects/ai-field-service-dispatcher/server.js) (inside template `renderAppPage`)
- **Script Loading**: Inject `<script src="/route-optimizer.js"></script>` in HTML header.
- **Control Panel**: Insert a "Traffic & Route Settings" block inside the "Simulate Dispatch Request" sidebar form (specifically below the job time select input).
- **SMS Template**: Update dispatch SMS template in simulation flow to format text showing dynamic ETA and distance miles.
- **Leaflet Map Animation**: Use `RouteOptimizer` logic to animate the technician marker from their current location to the job site. Manage animation state cancellation (`cancelAnimationFrame`) on new triggers.

#### 5. Integration / Regression Risks
- **Leaflet Offline**: Guard animation calls against `typeof L === 'undefined'`.
- **Concurrent Overrides**: Clear previous active animations when drawing new paths.

---

## Interface Contract

### 1. Client-Side Library: `route-optimizer.js`
- **Class**: `RouteOptimizer`
- **Method Signatures**:
  - `static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number`
    - *Calculates distance in miles.*
    - *Returns*: `number` (rounded to 2 decimal places).
  - `static calculateETA(distanceMiles: number, trafficMultiplier: number): number`
    - *Calculates duration in minutes.*
    - *Formula*: `Math.max(1, Math.round((distanceMiles / 30) * 60 * trafficMultiplier))` (assumes 30 mph baseline speed).
    - *Returns*: `number` (integer).
  - `static animateMarker(marker: L.Marker, routePolyline: L.Polyline, startCoords: [number, number], endCoords: [number, number], durationMs: number): void`
    - *Animates marker position using requestAnimationFrame.*
    - *Saves animation frame ID to `window.activeRouteAnimationId` to enable cancellation.*

### 2. Served Assets List
- **Route**: `GET /route-optimizer.js`
- **Response**: File stream from root directory, MIME type: `application/javascript`.

### 3. Database Schema Migration
- **SQL Execution**:
  ```sql
  ALTER TABLE gainhelm_dispatch_logs ADD COLUMN IF NOT EXISTS distance_miles NUMERIC;
  ALTER TABLE gainhelm_dispatch_logs ADD COLUMN IF NOT EXISTS duration_mins NUMERIC;
  ALTER TABLE gainhelm_dispatch_logs ADD COLUMN IF NOT EXISTS traffic_multiplier NUMERIC;
  ```

### 4. REST APIs
- **POST `/app/log-dispatch`**
  - **Payload**:
    ```typescript
    interface LogDispatchPayload {
      email: string;
      jobDescription: string;
      trade: string;
      simulatedTime: string;
      dispatchedToName?: string;
      dispatchedToPhone?: string;
      status: string;
      stepLogs: string | string[];
      distance_miles?: number;
      duration_mins?: number;
      traffic_multiplier?: number;
    }
    ```
  - **Response**: `{ success: boolean }`

- **POST `/app/manual-dispatch`**
  - **Payload**:
    ```typescript
    interface ManualDispatchPayload {
      email: string;
      jobDescription: string;
      trade: string;
      simulatedTime: string;
      technicianName: string;
      technicianPhone?: string;
      stepLogs: string | string[];
      distance_miles?: number;
      duration_mins?: number;
      traffic_multiplier?: number;
    }
    ```
  - **Response**: `{ success: boolean }`
