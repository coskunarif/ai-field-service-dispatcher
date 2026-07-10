# Feature Evolution Ledger

## Status

state: DONE # SCOUT | INTAKE | SPEC | TEST | BUILD | VERIFY | DONE
mode: CONTINUOUS
creativity: 1.0 # 0.0 (strict compliance) to 1.0 (autonomous ideation)
target_feature: seo/google-search-console-analyzer
rejections: 0
budget: 3

## Completed Features

- `supervision/manual-dispatch`
- `supervision/route-optimization-eta`
- `supervision/customer-live-tracking`
- `seo/google-search-console-analyzer`

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

#### 6. supervision/customer-live-tracking: Integration Plan

- **Decoupled Service Layer**: Introduce `live-tracking-service.js` containing state maps `dispatchLogsStore` (UUID -> log) and `pendingNotes` (UUID -> notes list) to decouple the HTML rendering, backend state management, and DB note persistence for live tracking.
- **Route Integration in server.js**:
  - Implement `GET /app/track/:id` (serves the custom tracking page via the service).
  - Implement `POST /app/track/:id/note` (accepts note payload, persists to DB/fallback map, and updates `pendingNotes`).
  - Implement `GET /app/poll-notes` (returns pending notes and clears them).
  - Update `/app/log-dispatch` and `/app/manual-dispatch` to generate and return a unique UUID.
- **Client Dashboard Integration**:
  - Save the returned UUID to `activeLogId` on simulation completion or manual override.
  - Update audit trail rendering (initial rendering in `renderAuditTrailHtml` and dynamic in `appendAuditTrailRow`) to display a tracking link button targeting `/app/track/${id}`.
  - Set up 2s polling interval for `GET /app/poll-notes?id=${activeLogId}`. Upon receiving notes, trigger `addPhoneSMS` and `logEvent`.
- **Risks & Mitigations**:
  - _DB Unreachability_: Mitigation is the `dispatchLogsStore` fallback map.
  - _Polling Overhead_: Clear the poll interval when starting a new simulation.

---

## Interface Contract

### 1. Client-Side Library: `route-optimizer.js`

- **Class**: `RouteOptimizer`
- **Method Signatures**:
  - `static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number`
    - _Calculates distance in miles._
    - _Returns_: `number` (rounded to 2 decimal places).
  - `static calculateETA(distanceMiles: number, trafficMultiplier: number): number`
    - _Calculates duration in minutes._
    - _Formula_: `Math.max(1, Math.round((distanceMiles / 30) * 60 * trafficMultiplier))` (assumes 30 mph baseline speed).
    - _Returns_: `number` (integer).
  - `static animateMarker(marker: L.Marker, routePolyline: L.Polyline, startCoords: [number, number], endCoords: [number, number], durationMs: number): void`
    - _Animates marker position using requestAnimationFrame._
    - _Saves animation frame ID to `window.activeRouteAnimationId` to enable cancellation._

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

### 5. supervision/customer-live-tracking: Interface Contract

#### Backend Service: `live-tracking-service.js`

- **State variables**:
  - `dispatchLogsStore`: `Map<string, object>` (in-memory UUID to dispatch details mapping)
  - `pendingNotes`: `Map<string, string[]>` (in-memory UUID to list of pending notes mapping)
- **Functions**:
  - `getTrackingDetails(id: string, sql: any): Promise<object | null>`
    - Fetches the dispatch record from the database. Fallback to `dispatchLogsStore.get(id)` if database is null or query fails.
  - `saveNote(id: string, note: string, sql: any): Promise<void>`
    - Parses current `step_logs` from the record, appends `📱 Customer sent entry note: ${note}`, and writes back to DB or `dispatchLogsStore`.
    - Appends note to `pendingNotes` map for `id`.
  - `pollNotes(id: string): string[]`
    - Returns all pending notes for `id` and deletes the entry from `pendingNotes`.
  - `renderTrackingPage(dispatch: object, context: object | null): string`
    - Generates dark-theme Leaflet tracking page HTML. Includes map, technician details, Dynamic ETA card, and Note Submission form.

#### REST APIs

- **GET `/app/track/:id`**
  - _Path parameter_: `id` (UUID string)
  - _Returns_: HTML (tracking page) or 404 user-friendly message.
- **POST `/app/track/:id/note`**
  - _Path parameter_: `id` (UUID string)
  - _Payload_: `{ note: string }` (maximum 250 characters)
  - _Returns_: `{ success: true }` or `{ error: string }`
- **GET `/app/poll-notes`**
  - _Query parameter_: `id` (UUID string)
  - _Returns_: `{ success: true, notes: string[] }`

#### Updated APIs

- **POST `/app/log-dispatch` & `/app/manual-dispatch`**
  - _Payload_: Same as existing contracts.
  - _Returns_: `{ success: true, id: string }`

---

## Feature Definition: supervision/customer-live-tracking (Customer-Facing Live Tracking Share Portal)

### Core Philosophy

Provide a customer-facing public share page (`/app/track/:id`) representing the dispatch status. Once a technician accepts a simulated job or is force-assigned by the dispatcher, the Supervision Board displays a shareable tracking link in the audit trail. When a customer opens this link, they see an interactive Leaflet map featuring a real-time animated technician marker travelling from their simulated origin to the job site. The customer is presented with the technician's details, dynamic traffic-based ETA, and a text box to submit gate codes or delivery notes. Notes entered by the customer are persisted in PostgreSQL, printed to the dispatcher's live feed, and trigger a simulated SMS notification alert on the technician's phone emulator.

### User Flows

1. **Access Share Link**
   - **Trigger**: A dispatcher clicks the "Track Link" button on any completed dispatch card in the audit trail, copying `/app/track/:id` to their clipboard.
   - **Action**: Opening this link retrieves the dispatch details (technician, job description, coordinates, current status) from PostgreSQL.
   - **Outcome**: Renders a dark-theme customer tracking portal with the job pin and technician marker.
2. **Technician Animation & Dynamic ETA**
   - **Trigger**: Customer loads the tracking page.
   - **Action**:
     - Calculates route parameters using `RouteOptimizer` math.
     - Animates the technician marker moving along the route towards the job pin.
     - Displays dynamic ETA remaining and traffic density badge.
3. **Submit Entry Instructions**
   - **Trigger**: Customer fills the "Notes for Technician" field and clicks "Send Note".
   - **Action**:
     - Sends a POST request to `/app/track/:id/note`.
     - Appends the note to the postgres record's `step_logs`.
     - Broadcasts the note to the owner's active log feed and technician's emulator in the `/app` dashboard.
   - **Outcome**: A message appears in the technician's phone emulator: "Customer Note: [Note content]" and a log entry is added: "📱 Customer sent entry note: [Note content]".

### Input Validation Constraints

- **ID Verification**: The track URL must contain a valid UUID that exists in the `gainhelm_dispatch_logs` table.
- **Note Content**: Notes must be text strings and restricted to a maximum of 250 characters.

### Edge Cases & Unhappy Paths

- **Invalid/Expired ID**: If the log ID is not found in the database, the server returns a user-friendly 404 page displaying "Tracking Link Not Found or Expired".
- **Off Duty / Cancelled Dispatch**: If the technician status changed or the job status is escalated, the tracking map displays the last known position with a status message: "Appointment Completed or Cancelled".
- **No Technician Assigned**: If the tracking link is opened for an escalated dispatch with no technician, a warning banner is shown stating: "Searching for available technicians".

---

## Feature Definition: seo/google-search-console-analyzer (Google Search Console Search Performance Analyzer)

### Core Philosophy

Gainhelm already generates programmatic SEO/GEO landing pages and runs a static compliance audit. To break onto Google's first page, we need data-driven iteration. This feature adds a small command-line analyzer that pulls real search performance data from Google Search Console (GSC), surfaces underperforming queries, low-CTR pages, and ranking-position opportunities, and emits an actionable Markdown + JSON report that the team can use to prioritize content and meta-data improvements.

### User Flows

1. **Authenticate and Run Analysis**
   - **Trigger**: A maintainer runs `npm run analyze:gsc` (or `node scripts/gsc-analyzer.mjs`).
   - **Pre-condition**: Environment variables `GSC_SERVICE_ACCOUNT_JSON` and `GSC_SITE_URL` are configured (or a `gsc-service-account.json` file is present).
   - **Action**:
     - The script reads the service account credentials.
     - It fetches the last 90 days of search analytics from the GSC API (`searchanalytics/query`).
     - It aggregates top queries, top pages, average CTR, average position, and total impressions/clicks.
     - It identifies low-CTR opportunities (high impressions, low CTR), position-improvement candidates (position 4-20), and top movers (rising/falling queries vs. previous period).
     - It writes `reports/gsc-analysis.json` and `reports/gsc-analysis.md`.
   - **Outcome**: A human-readable report is generated with specific recommendations for the next SEO/GEO edits.

2. **Review Recommendations**
   - **Trigger**: The maintainer opens `reports/gsc-analysis.md`.
   - **Action**: The report ranks recommendations by impact and includes page-level mappings to existing landing pages where possible.
   - **Outcome**: The team can feed the findings into the existing `optimize-seo-geo-pages.mjs` workflow or manual content updates.

### Input Validation Constraints

- **Service Account Credentials**: Must be a valid Google service account JSON with `client_email`, `private_key`, and `token_uri`.
- **Site URL**: Must match a GSC property format such as `sc-domain:gainhelm.com` or `https://gainhelm.com/`.
- **Date Range**: Default to last 90 days; minimum 7 days, maximum 16 months (GSC API limit).
- **Output Paths**: Must be writable paths under `reports/`.

### Edge Cases & Unhappy Paths

- **Missing Credentials**: The script exits with a clear error message listing the required environment variables.
- **GSC API Unavailable**: If the API returns an error or rate-limit response, the script surfaces the HTTP status and response body, exits non-zero, and does not write a stale report.
- **Empty Site Data**: If the site has no search data yet, the report still generates with a "No data available" section and general starter recommendations.
- **Invalid Service Account JSON**: JSON parsing errors are caught and reported without leaking the private key.

---

## Integration Plan

### Blast Radius Analysis

#### 1. New Dependency

- **Target**: `package.json` dependencies
- **Action**: Add `google-auth-library` (Google's official lightweight auth helper) to obtain access tokens from a service account. Use Node.js built-in `fetch` for the actual GSC API calls to keep the dependency footprint minimal.
- **Risk**: Low. The dependency is widely maintained and only used in the CLI script path.

#### 2. New CLI Script

- **File**: `scripts/gsc-analyzer.mjs`
- **Purpose**: Modular analyzer that exposes pure functions for credential validation, data fetching, analysis, and report generation, plus a thin CLI wrapper.
- **Responsibilities**:
  - Load service account credentials from env var/file path.
  - Exchange credentials for a Google access token.
  - Call `POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`.
  - Transform API rows into actionable metrics.
  - Write JSON and Markdown reports to `reports/`.

#### 3. Test Coverage

- **File**: `tests/gsc-analyzer.spec.js`
- **Approach**: Mock `google-auth-library` and global `fetch` so tests run offline and without credentials. Cover happy path, missing credentials, API errors, and empty-data handling.

#### 4. npm Script Hook

- **File**: `package.json`
- **Action**: Add `"analyze:gsc": "node scripts/gsc-analyzer.mjs"` to the scripts section so the analyzer is discoverable and consistent with other audit scripts (`audit:seo-geo`, `find-leads`).

#### 5. Documentation / Runbook

- **File**: `EVOLUTION_LEDGER.md` (this file) and `scripts/gsc-analyzer.mjs` inline comments.
- **Action**: Document required env vars and how to create a GSC service account. Never commit credentials or service-account JSON files.

#### 6. Integration / Regression Risks

- **Credential Leakage**: The script must never log the private key or full credential object. Only `client_email` may be logged for debugging.
- **Report Overwrites**: Existing `reports/gsc-analysis.*` files will be overwritten on each run. This is intentional (latest report is the source of truth).
- **No Runtime Impact**: The script is isolated from the Fastify server and marketing pages; it cannot introduce regressions in page rendering or dispatch logic.

---

## Interface Contract

### 1. CLI Script: `scripts/gsc-analyzer.mjs`

- **Environment Variables**:
  - `GSC_SERVICE_ACCOUNT_JSON` (string): Either a file path to a service-account JSON file or the raw JSON string. Optional if `gsc-service-account.json` exists in the project root.
  - `GSC_SITE_URL` (string): The GSC property URL, e.g. `sc-domain:gainhelm.com` or `https://gainhelm.com/`.
  - `GSC_DAYS` (number, optional): Number of days to analyze (default `90`, min `7`, max `487`).
  - `GSC_OUT_DIR` (string, optional): Output directory for reports (default `reports`).
- **Exit Codes**:
  - `0`: Analysis completed and reports written.
  - `1`: Credential/config error or GSC API failure.
- **Output Files**:
  - `{GSC_OUT_DIR}/gsc-analysis.json`: Full structured data (raw metrics, aggregates, recommendations).
  - `{GSC_OUT_DIR}/gsc-analysis.md`: Human-readable summary and prioritized action list.

### 2. Exported Functions (testable surface)

- `loadCredentials(input?: string): ServiceAccountCredentials`
  - Parses a file path or JSON string into `{ client_email, private_key, token_uri }`.
  - Throws clear errors on missing/invalid input.
- `buildGscQuery(siteUrl: string, days: number): object`
  - Returns the POST body for the GSC `searchAnalytics/query` endpoint with `startDate`, `endDate`, `dimensions: ['query', 'page']`, and `rowLimit: 25000`.
- `analyze(rows: GscRow[]): AnalysisResult`
  - Computes totals, averages, top queries, top pages, low-CTR opportunities, position-improvement candidates, and rising/falling movers.
- `generateMarkdownReport(result: AnalysisResult): string`
  - Returns Markdown text with headers, tables, and recommendation bullets.
- `main(): Promise<void>`
  - CLI entry point that orchestrates the above and writes report files.

### 3. GSC API Contract

- **Endpoint**: `POST https://www.googleapis.com/webmasters/v3/sites/{encodedSiteUrl}/searchAnalytics/query`
- **Authorization**: `Bearer <access_token>` from `google-auth-library` service account flow.
- **Request Body**:
  ```json
  {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "dimensions": ["query", "page"],
    "rowLimit": 25000
  }
  ```
- **Response Body**:
  ```json
  {
    "rows": [
      {
        "keys": ["query text", "/page-path"],
        "clicks": 0,
        "impressions": 0,
        "ctr": 0.0,
        "position": 0.0
      }
    ]
  }
  ```
