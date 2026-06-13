# Specification: App Directory Distribution

Establish referring domain backlinks and search impressions by distributing GainHelm application listings to high-authority software, startup, and AI directories.

## Acceptance Criteria

- **[AC-1] Tracker Update**: The CSV file `reports/gainhelm-gsc/submission-tracker.csv` must be updated to include the following target directories with their initial/correct status:
  - SaaSHub (`https://www.saashub.com/submit`)
  - BetaList (`https://betalist.com/submit`)
  - Futurepedia (`https://www.futurepedia.io/submit-a-tool`)
  - Toolify.ai (`https://www.toolify.ai/submit`)
  - There’s An AI For That (`https://theresanaiforthat.com/submit/`)
  - DevHunt (`https://devhunt.org/`)
  - Startup Buffer (`https://startupbuffer.com/site/submit`)
  - Indie Hackers (`https://www.indiehackers.com/product/gainhelm`)
  *Check method:* Verify the CSV contains these rows and has no duplicate entries.

- **[AC-2] Semi-Automated Playwright Script**: A Node.js script `scripts/directory_submitter.js` must be implemented. It must:
  - Load the product metadata (Product: GainHelm, URL: https://gainhelm.com, descriptions, categories) from `reports/gainhelm-gsc/gainhelm-listing-kit.md`.
  - Launch a headed or interactive Playwright browser session.
  - Automate the navigation and input-filling for SaaSHub, BetaList, Futurepedia, Toolify.ai, There’s An AI For That, DevHunt, and Startup Buffer.
  - Implement a terminal prompt pause (e.g., using `readline`) at critical CAPTCHA, Turnstile challenge, or authentication steps to allow manual human resolution before proceeding.
  *Check method:* Run the script in a test mode or dry-run execution to confirm fields are populated correctly.

- **[AC-3] Submission Evidence**: The script must take screenshot evidence for each of the 7 target platforms (pre-submit state or post-submit confirmation screen) and save them under `reports/gainhelm-gsc/evidence/` with descriptive names (e.g., `reports/gainhelm-gsc/evidence/saashub-submitted.png`).
  *Check method:* Confirm the existence of the 7 PNG files in the specified directory.

- **[AC-4] Status Verification**: Following submission runs, the final statuses for the target directories in `reports/gainhelm-gsc/submission-tracker.csv` must be updated from `needs-account` or `needs-human` to `submitted`, `listed`, or `attempted-unclear` based on the execution result.
  *Check method:* Inspect the CSV columns for post-run status updates.

## Out of Scope

- Paid or premium directory placement requiring subscription or transaction fees.
- Automating bypass of Cloudflare Turnstile, Google reCAPTCHA, or OAuth registration forms.
- Creating physical phone number or SMS verification workarounds.

## Slices

- **[S-1] Tracker and Schema Alignment**: Update the CSV directory registry `reports/gainhelm-gsc/submission-tracker.csv` with the target directories and correct attributes.
  - **Files:** `/home/ubuntuadmin/projects/ai-field-service-dispatcher/reports/gainhelm-gsc/submission-tracker.csv`
  - **ACs:** `[AC-1]`

- **[S-2] Automation Utility implementation**: Code the Playwright workflow and interactive runner in `scripts/directory_submitter.js` extracting product details from the listing kit.
  - **Files:** `/home/ubuntuadmin/projects/ai-field-service-dispatcher/scripts/directory_submitter.js`
  - **ACs:** `[AC-2]`

- **[S-3] Submission Execution & Tracking**: Execute the semi-automated runner across target platforms, record screenshot evidence in `reports/gainhelm-gsc/evidence/`, and update the CSV statuses.
  - **Files:** `/home/ubuntuadmin/projects/ai-field-service-dispatcher/reports/gainhelm-gsc/submission-tracker.csv`, `/home/ubuntuadmin/projects/ai-field-service-dispatcher/reports/gainhelm-gsc/evidence/*`
  - **ACs:** `[AC-3]`, `[AC-4]`

## Test Strategy
- **Additive Task:** The Tester will write tests first to verify that the submission tracker holds the expected entries and that the required screenshot files/updated status rows exist post-execution.
