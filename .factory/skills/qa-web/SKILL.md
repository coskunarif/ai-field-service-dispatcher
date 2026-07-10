---
name: qa-web
description: >
  QA tests for the Gainhelm web app. Covers landing pages, waitlist signup, setup wizard,
  supervision board, sandbox dispatch simulator, customer live tracking, lead tools, and
  SEO/GEO compliance. Uses agent-browser for real browser interaction against the local
  dev server.
---

# QA: Gainhelm Web App

## Testing Target

This project does **not** use Vercel or Netlify preview deployments. When testing a PR
branch, the agent must test the actual branch code by starting the local dev server.

1. Start the web server: `PORT=3005 npm start`
2. Poll `http://localhost:3005` until it returns HTTP 200 (timeout: 60 seconds)
3. Use `http://localhost:3005` as the base URL for all browser tests

If the dev server fails to start, report ALL web tests as BLOCKED with the stderr output.
Do NOT fall back to `https://gainhelm.com` for PR testing -- the deployed site runs different
code and produces meaningless results for the PR.

For manual smoke testing against production, use `https://gainhelm.com` only if the user
explicitly requests it.

## Authentication & Personas

Gainhelm has no formal login. Access is controlled by the email query parameter and the
waitlist state in PostgreSQL.

- **new_user**: email not in `waitlist_leads`. Can access landing pages, can sign up for the
  waitlist, and should be denied access to `/setup` if they try a random email.
- **restricted_user**: email in `waitlist_leads` but no `gainhelm_contexts` row. Can access
  `/setup` and see the empty-context wizard. After completing setup, they become an owner.
- **owner**: email in `waitlist_leads` with a `gainhelm_contexts` row. Can access `/setup` and
  `/app`.

For each run, use unique QA emails:

- `qa+newuser_{RUN_ID}@gainhelm.com`
- `qa+restricted_{RUN_ID}@gainhelm.com`
- `qa+owner_{RUN_ID}@gainhelm.com`

If the database is not connected, the app falls back to in-memory `contextStore` and allows
any `@example.com` email. Do NOT rely on this bypass for real QA; always connect a
DATABASE_URL.

## Environment Variables

The web app reads these env vars from the process environment or a `.env` file:

- `DATABASE_URL` -- PostgreSQL connection string for the test database
- `WAITLIST_API_URL` -- external backend waitlist endpoint (defaults to a local fallback if unset)
- `PORT` -- defaults to 3000 if not set; QA uses 3005
- `ZEPTOMAIL_TOKEN`, `ZEPTOMAIL_FROM_EMAIL`, `ZEPTOMAIL_FROM_NAME` -- only needed for outreach scripts

These are provided by the CI workflow via GitHub secrets or by the local `.env` file. The
agent does NOT need to log in interactively.

## Menu of Available Test Flows

### Flow 1: Landing Pages & Waitlist Signup

Scope: any change to `*.html`, landing page JS, `/waitlist` endpoint, or waitlist form.

Steps:

1. Navigate to `http://localhost:3005/`
2. Verify the page loads, single `<h1>` exists, and meta description is present
3. Scroll to the waitlist form and fill in name, email, and company
4. Submit the form
5. Verify the success message or redirect contains a confirmation
6. For negative test: submit with an invalid email and verify client-side validation

Personas: **new_user** (primary), **owner** (can sign up again to verify duplicate handling)

Success criteria: landing page renders, waitlist submission succeeds, confirmation shown.

### Flow 2: Setup Wizard Access & Context Loading

Scope: any change to `/setup`, `/onboarding`, setup form, technician rows, calendar validation,
or `gainhelm_contexts` schema.

Steps:

1. As **new_user**, navigate to `/setup?email=qa+newuser_{RUN_ID}@gainhelm.com`
2. Verify access is denied or the page prompts to join the waitlist
3. As **restricted_user**, first seed the waitlist (via `/waitlist` or directly in DB), then
   navigate to `/setup?email=qa+restricted_{RUN_ID}@gainhelm.com`
4. Verify the setup wizard renders with default technician rows
5. Modify technician details, add a new technician row, set business rules and pricing
6. Enter a valid Google Calendar URL in the calendar field
7. Submit the form and verify redirect to `/app?email=...`
8. As **owner**, navigate to `/setup?email=qa+owner_{RUN_ID}@gainhelm.com`
9. Verify the wizard loads the previously saved context (resume behavior)
10. Verify the resume banner appears if setup was incomplete

Personas: **new_user**, **restricted_user**, **owner**

Success criteria: access control works, context saves and resumes, form validation succeeds.

### Flow 3: Calendar URL Validation

Scope: any change to `/api/validate-calendar` or calendar validation logic.

Steps:

1. Open the setup wizard
2. Enter a valid public Google Calendar URL
3. Verify the validation endpoint returns `{ valid: true }` and the UI shows success state
4. Enter an invalid URL (e.g., `ftp://...`, non-Google hostname, or a restricted calendar)
5. Verify the endpoint returns `{ valid: false, error: ... }` and the UI shows error state

Personas: **owner** or **restricted_user**

Success criteria: valid URLs accepted, invalid protocols/hostnames/restricted URLs rejected.

### Flow 4: Supervision Board

Scope: any change to `/app`, `/app/toggle-technician`, `/app/log-dispatch`, or supervision UI.

Steps:

1. As **owner**, navigate to `/app?email=qa+owner_{RUN_ID}@gainhelm.com`
2. Verify the supervision board renders with the configured technicians and recent dispatch logs
3. Toggle a technician's on/off status via the board controls
4. Verify the API returns the updated status and the UI reflects it
5. Verify the dispatch log list displays the last 10 entries
6. For negative test: as **new_user**, navigate to `/app` without a context and verify redirect to `/setup`

Personas: **owner** (primary), **new_user** (negative test)

Success criteria: board renders, technician toggle persists, unauthorized access redirects.

### Flow 5: Sandbox Dispatch Simulator

Scope: any change to `/sandbox`, `/onboarding`, dispatch logic, SMS simulation, or route optimizer.

Steps:

1. As **owner**, navigate to `/sandbox?email=qa+owner_{RUN_ID}@gainhelm.com&trade=HVAC&tech_count=3&phone=...`
2. Verify the dual-screen layout loads: simulator panel, terminal log feed, and virtual phone
3. Trigger a dispatch scenario (e.g., accept flow, decline/reroute flow, retry flow)
4. Verify the terminal logs show key milestones: matching technician, sending SMS, response,
   booking to Google Calendar
5. Verify the virtual phone UI shows the expected SMS and confirmation message
6. For negative test: trigger an invalid scenario and verify the retry/escalation behavior

Personas: **owner**

Success criteria: simulator runs end-to-end, SMS messages appear, terminal logs show correct flow.

### Flow 6: Customer Live Tracking Share Portal

Scope: any change to `/app/track/:id`, `/app/track/:id/note`, `/app/poll-notes`, or
`live-tracking-service.js`.

Steps:

1. Create a dispatch log via the simulator or by directly calling `/app/log-dispatch`
2. Note the returned log UUID
3. Navigate to `/app/track/{uuid}` as a customer (no login required)
4. Verify the tracking page renders with job details, status, and a map/location pin
5. Submit a note via the note form or API
6. Verify the note appears on the page without a full reload (polling works)
7. For negative test: use an invalid UUID and verify the 404 page renders

Personas: **new_user** (customer-facing, no auth)

Success criteria: tracking page renders, notes submit and poll, invalid UUID returns 404.

### Flow 7: Lead Queue & Contractor Leads Tools

Scope: any change to `/tools/lead-queue`, `/tools/contractor-leads`, or the `/api/leads` and
`/api/contractors` endpoints.

Steps:

1. Navigate to `/tools/lead-queue`
2. Verify the tool UI loads and the discover/refresh action works
3. Navigate to `/tools/contractor-leads`
4. Verify contractor search/listing works and displays results
5. For negative test: submit an empty form and verify validation

Personas: **new_user** or **owner**

Success criteria: tool pages load, data fetching works, validation rejects bad input.

### Flow 8: SEO/GEO Landing Page Compliance

Scope: any change to `*.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, or the SEO audit script.

Steps:

1. Run `npm run audit:seo-geo`
2. Verify the audit passes with no critical errors
3. Spot-check several landing pages for: single `<h1>`, canonical link, meta description,
   JSON-LD structured data, and presence in the sitemap
4. For negative test: temporarily remove a required file and verify the audit reports the failure
   (restore the file afterward)

Personas: N/A (crawlability audit)

Success criteria: audit passes, landing pages have required SEO/GEO elements.

## Error Handling & Negative Tests

Common negative scenarios to include:

- Invalid email format in waitlist or setup forms
- Access denied for `/setup` when email is not on the waitlist
- Access denied for `/app` when no context exists
- Invalid Google Calendar URL (wrong protocol, wrong hostname, restricted)
- Missing required fields in setup form
- Invalid UUID for customer tracking page
- Duplicate waitlist signup handling

## Known Failure Modes

1. **Port 3005 already in use.** A previous `npm start` or Playwright webServer may still be
   bound. Terminate stale listeners before starting QA (`kill $(lsof -t -i:3005) 2>/dev/null || true`).
2. **Database not connected.** If `DATABASE_URL` is missing, the app uses in-memory fallback.
   Some tests will behave differently. Always provide a dedicated test DATABASE_URL for QA.
3. **Waitlist gate blocks setup access.** QA must seed the `waitlist_leads` table before trying
   to access `/setup` as `restricted_user` or `owner`.
4. **Google Calendar validation may fail for restricted calendars.** Use a genuinely public
   calendar URL for positive tests, or mock the fetch in a local-only test environment.
5. **Playwright webServer reuse.** If the local dev server is already running, Playwright may
   reuse it unexpectedly. Use `reuseExistingServer: false` in CI mode.
6. **CSS/JS cache busting.** Some static assets use query-string cache busting (e.g., `styles.css?v=...`).
   If styles look stale, force a hard refresh.
