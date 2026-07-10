---
name: qa-backend
description: >
  QA tests for the Gainhelm backend API. Covers the waitlist signup endpoint and Firestore
  data persistence. Uses curl for direct API calls against the local backend server.
---

# QA: Gainhelm Backend API

## Testing Target

The backend app lives in the `api/` directory. When testing a PR branch, start the local
backend server from the checked-out code.

1. Start the backend server: `cd api && npm start`
2. Poll `http://localhost:3000` until the server responds (timeout: 60 seconds)
3. Use `http://localhost:3000` as the base URL for all API tests

If the backend server fails to start, report ALL backend tests as BLOCKED with the stderr
output. Do NOT fall back to the production backend URL for PR testing.

For manual smoke testing against production, use `https://gainhelm-api-250134012801.us-central1.run.app`
only if the user explicitly requests it.

## Authentication

The backend `/waitlist` endpoint has CORS protection for origins
`https://gainhelm.com` and `https://www.gainhelm.com`. For local testing, send requests
without an `Origin` header or with `Origin: http://localhost:3005`.

No API key or token is required for the waitlist endpoint.

## Environment Variables

The backend reads these env vars:

- `PORT` -- defaults to 3000 if not set
- `GOOGLE_APPLICATION_CREDENTIALS` -- path to a Firestore service account key (CI provides this)

These are provided by the CI workflow via GitHub secrets or by the local environment. The
agent does NOT need to log in interactively.

## Menu of Available Test Flows

### Flow 1: Waitlist Signup

Scope: any change to `api/server.js`, `api/server.ts`, Firestore interactions, or the
`/waitlist` endpoint.

Steps:

1. Start the backend server
2. Send a POST request to `/waitlist` with a valid JSON body:
   ```json
   {
     "name": "QA Test",
     "email": "qa+backend_{RUN_ID}@gainhelm.com",
     "company": "Gainhelm QA"
   }
   ```
3. Verify response is `200 OK` with `{ success: true }`
4. Verify the document was created in Firestore by sending the same request again
5. Verify the duplicate request returns `400 Bad Request` with `{ error: "Email already registered" }`

Personas: N/A (API endpoint)

Success criteria: new signup succeeds, duplicate signup returns a clear error.

### Flow 2: CORS Behavior

Scope: any change to CORS headers or the `allowedOrigins` set.

Steps:

1. Send a POST to `/waitlist` with `Origin: https://gainhelm.com`
2. Verify the response includes `Access-Control-Allow-Origin: https://gainhelm.com`
3. Send a POST with `Origin: https://untrusted-site.com`
4. Verify the response does NOT include the CORS allow-origin header
5. Send an `OPTIONS` preflight request and verify it returns `204 No Content`

Personas: N/A (API endpoint)

Success criteria: allowed origins get CORS headers, disallowed origins do not.

### Flow 3: Server Health & Startup

Scope: any change to the backend server startup, dependencies, or Docker configuration.

Steps:

1. Start the backend server with `cd api && npm start`
2. Poll `http://localhost:3000` until it returns a response (any status is fine for health check)
3. Verify the process logs show it is listening on the expected port

Personas: N/A (API endpoint)

Success criteria: server starts and listens on the configured port.

## Error Handling & Negative Tests

Common negative scenarios to include:

- Missing `email` field returns `400 Bad Request`
- Invalid email format returns `400 Bad Request`
- Duplicate email returns `400 Bad Request` with `Email already registered`
- Disallowed origin does not receive CORS headers
- Malformed JSON body returns `400 Bad Request`

## Known Failure Modes

1. **Firestore emulator not running.** If `GOOGLE_APPLICATION_CREDENTIALS` is not set and the
   Firestore emulator is not running, the backend will fail to connect. Provide either a test
   project credential or start the emulator (`gcloud emulators firestore start`).
2. **Port 3000 already in use.** Terminate stale listeners before starting the backend server.
3. **CORS preflight failure.** If the web frontend is tested on a different origin, ensure the
   backend CORS allow-list includes that origin.
4. **Compiled vs source drift.** The backend runs `api/server.js`, which is compiled from
   `api/server.ts`. If the `.ts` file changed but the `.js` file was not rebuilt, tests will
   run against stale code. Run `cd api && npm run build` before `npm start` when the TypeScript
   source changed.
