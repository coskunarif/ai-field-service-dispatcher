# SPEC: Local Contractor Leads Acquisition & Cold Outreach Generator

This specification outlines the requirements and implementation plan for the **Local Contractor Leads Acquisition and Cold Outreach Email Generator** feature. The goal is to acquire local trade contractor leads (HVAC, plumbing, electrical, locksmith, cleaning, landscaping, etc.) and generate personalized, high-conversion cold outreach email drafts ("nice human words, zero AI fluff") to increase waitlist registrations.

---

## Acceptance Criteria

### `[AC-1]` Database Schema & Table (`local_contractor_leads`)
- A database table named `local_contractor_leads` must exist in the PostgreSQL database.
- Column specifications:
  - `id`: `UUID`, primary key, defaults to `gen_random_uuid()`.
  - `company_name`: `TEXT`, not null.
  - `owner_name`: `TEXT`, nullable (owner's name for personalized greeting).
  - `email`: `TEXT`, unique, nullable.
  - `phone`: `TEXT`, nullable.
  - `website`: `TEXT`, nullable.
  - `city`: `TEXT`, nullable.
  - `state`: `TEXT`, nullable.
  - `trade`: `TEXT`, not null (e.g. `hvac`, `plumbing`, `electrical`, `locksmith`, `cleaning`, `landscaping`, `roofing`, `pest_control`, `restoration`, `handyman`, `tree_service`).
  - `status`: `VARCHAR(50)`, defaults to `'discovered'`. Permitted statuses: `'discovered'`, `'queued'`, `'email_sent'`, `'replied'`, `'ignored'`.
  - `cold_email`: `TEXT`, nullable (holds the generated email draft).
  - `created_at`: `TIMESTAMPTZ`, defaults to `NOW()`.
  - `updated_at`: `TIMESTAMPTZ`, defaults to `NOW()`.
- An index must exist on `email` to guarantee fast uniqueness checks.

### `[AC-2]` REST API Endpoints
- The backend server must support the following routes under the `/api/` prefix:
  1. `GET /api/contractors`:
     - Returns a JSON array of contractor leads.
     - Supports query parameters:
       - `trade`: filter by trade value.
       - `status`: filter by status value.
       - `city`: filter by city.
       - `sort`: options include `date_desc` (default), `date_asc`, and `company_name_asc`.
  2. `POST /api/contractors`:
     - Creates a new contractor lead or upserts on `email` conflict.
     - Performs backend validations:
       - `company_name` and `trade` are required and must be non-empty (returns `400 Bad Request` if missing).
       - If `email` is provided, it must validate against a standard email regex format (returns `400 Bad Request` if invalid).
     - Computes the initial `cold_email` if not explicitly supplied.
  3. `PATCH /api/contractors/:id`:
     - Updates a lead's `status` or `cold_email` content.
     - Validates that `status` is one of the valid statuses (`discovered`, `queued`, `email_sent`, `replied`, `ignored`), returning `400 Bad Request` on mismatch.
  4. `POST /api/contractors/discover`:
     - Runs the local contractor discovery algorithm.
     - Returns a JSON response with the count of newly discovered leads: `{ count: <number> }`.
- When PostgreSQL credentials/connection is absent, the endpoints must transparently fall back to an in-memory array (`inMemoryContractorLeads`) to enable offline testing.

### `[AC-3]` Contractor Discovery Script (`scripts/find-local-contractors.mjs`)
- Executed via `node scripts/find-local-contractors.mjs`.
- Queries a predefined list of local contractor business contacts (representing realistic contractors in target cities like Chicago, Seattle, Austin, etc.) or searches directories to pull high-intent lead details.
- For each lead, generates a personalized cold outreach email using a trade-specific pitch template:
  - **Tone**: Direct, conversational, warm, and professional. **Zero AI fluff** (no "hope this email finds you well", "our paradigm-shifting platform", etc.).
  - **Pain Points**: Directly references trade-specific headaches (e.g. phone tag, manual dispatching, technician friction with scheduling apps).
  - **Value**: Highlights Gainhelm's agent-first SMS-based workflow (no technician app download required).
  - **Call to Action**: A link to `https://gainhelm.com` encouraging them to join the waitlist.
- Commits findings to the database (or in-memory store) and generates a markdown report summary at `reports/local-contractors.md`.

### `[AC-4]` Contractor Leads UI Dashboard Page
- Served at `GET /tools/contractor-leads` rendering `tools-contractor-leads.html`.
- Styled according to the Gainhelm dark design system (Plus Jakarta Sans font, curated HSL color palette, smooth transitions).
- Features:
  - **Metrics Cards**: Displays total counts of leads in each status category (`discovered`, `queued`, `email_sent`, `replied`, `ignored`).
  - **Control Sidebar**:
    - Filter controls (by platform/trade, status) and sorting dropdowns.
    - An "Add Custom Lead" form with client-side form validations (validating required inputs and email formatting, displaying clear inline errors).
  - **List Container**:
    - Dynamically renders lead cards.
    - Card displays: Company Name, Trade, City/State, contact info (Email, Phone, Website), status badge.
    - Card actions:
      - Textarea showing the generated `cold_email` draft, allowing manual edits and autosaving on change.
      - "Copy Email" button copying email text to clipboard and displaying a temporary toast notification.
      - Status transition buttons: "Queue", "Mark as Sent", "Mark as Replied", "Ignore".
  - **Trigger Discovery**: A button in the header calling `POST /api/contractors/discover` and showing a toast notification with the number of discovered leads.

### `[AC-5]` Automated Verification (Playwright Tests)
- Located at `tests/contractor_leads.spec.js`.
- Must test:
  - Database schema integrity (skipping if DATABASE_URL is undefined).
  - REST API validation checks (missing fields, invalid email format, invalid status updates) and upsert operations.
  - Discovery script execution outputs.
  - E2E UI operations (filtering, sorting, status transitions, manual submission error handling, toast notifications).
- Plays nicely in headless/CI contexts (uses `workers: 1` as per `LESSONS.md`).

---

## Interface Contract

The Tester and Builder must adhere to these names, exports, and signatures:

### 1. Database Table
- Table name: `local_contractor_leads`
- Schema constraints: `email` is `UNIQUE`. `status` is default `'discovered'`.

### 2. Lead Object Type (JSON Signature)
```typescript
interface ContractorLead {
  id: string; // UUID
  company_name: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  trade: string; // "hvac" | "plumbing" | "electrical" | etc.
  status: 'discovered' | 'queued' | 'email_sent' | 'replied' | 'ignored';
  cold_email: string | null;
  created_at: string; // ISO Datetime
  updated_at: string; // ISO Datetime
}
```

### 3. Discovery Script Exports (`scripts/find-local-contractors.mjs`)
- `performContractorDiscovery(sql: any, inMemoryLeads: Array<any>): Promise<number>`
- `generateColdEmail(companyName: string, trade: string, city: string, ownerName: string | null): string`

### 4. API Endpoints
- `GET /api/contractors` -> returns `ContractorLead[]`
- `POST /api/contractors` -> accepts partial `ContractorLead` payload -> returns `ContractorLead`
- `PATCH /api/contractors/:id` -> accepts `{ status?: string, cold_email?: string }` -> returns `ContractorLead`
- `POST /api/contractors/discover` -> returns `{ count: number }`

---

## Out of Scope
- Integration with live email sending services (SMTP, SendGrid, Amazon SES). The status `email_sent` is set manually via the UI.
- Direct Google Maps / Places API integration (relies on curated mock dataset and search scraper fallback instead).

---

## Vertical Implementation Slices

### `[S-1]` Database Table & REST API Endpoints
- **Scope**:
  - Add schema definition of `local_contractor_leads` to `api/migrate.js` and server initialization.
  - Implement standard HTTP handlers in `server.js` matching Interface Contract endpoints.
  - Add `inMemoryContractorLeads` array fallback for database-less testing.
- **Files**: `server.js`, `api/migrate.js`
- **ACs**: `[AC-1]`, `[AC-2]`
- **Independent**: No (Core backend infrastructure)

### `[S-2]` Contractor Discovery & Pitch Email Script
- **Scope**:
  - Create `scripts/find-local-contractors.mjs` containing lead matching datasets and the zero-AI-fluff template generator.
  - Hook discovery execution into `POST /api/contractors/discover` in `server.js`.
  - Output results markdown at `reports/local-contractors.md`.
- **Files**: `scripts/find-local-contractors.mjs`
- **ACs**: `[AC-3]`
- **Independent**: Yes (Relies on S-1 endpoint structures)

### `[S-3]` Contractor Leads UI Dashboard
- **Scope**:
  - Implement `tools-contractor-leads.html` with metrics, custom adding form, lists, dynamic updates, and editing/copying controls.
  - Serve dashboard at `GET /tools/contractor-leads` in `server.js`.
- **Files**: `tools-contractor-leads.html`, `server.js`
- **ACs**: `[AC-4]`
- **Independent**: Yes (Relies on S-1 REST API)
