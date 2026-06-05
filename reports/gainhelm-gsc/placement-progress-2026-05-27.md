# GainHelm link placement progress — 2026-05-27

## Completed

- Google Search Console CLI authenticated and property verified: `sc-domain:gainhelm.com` owner.
- Pulled 90-day query and query/page data.
- Used Docker Chrome Google session (`docker-chrome-3`, `coskun.arf@gmail.com`) to visually/DOM-check 41 GSC search terms in Google.
- Built outputs:
  - `reports/gainhelm-gsc/serp-results.ndjson`
  - `reports/gainhelm-gsc/serp-opportunities.csv`
  - `reports/gainhelm-gsc/link-placement-action-plan.md`

## Direct placement attempts

### Gartner Digital Markets / Capterra / GetApp

URL reached: `https://app.g2digitalmarkets.com/get-listed/start`

Filled initial product listing form:
- Business email: `arif.coskun@profithelm.com`
- Product name: `GainHelm`
- Product website: `https://gainhelm.com/`

Result: form returned inline error:

> We could not complete your product listing request. Try signing in instead.

Status: blocked pending vendor account login or support route.

Notes:
- Correct vendor landing page is `https://www.capterra.com/vendors/`.
- It states approved listings publish on Capterra first and can be added to GetApp and Software Advice later.

### G2

URL reached: `https://www.g2.com/products/new`

Result: blocked by DataDome verification/CAPTCHA. No bypass attempted.

Status: manual verification or logged-in vendor account required.

### SourceForge

URL reached: `https://sourceforge.net/software/vendors/new`

Result: Cloudflare human verification challenge.

Status: manual verification required before submission.

### Reddit

Checked top HVAC thread:
`https://www.reddit.com/r/HVAC/comments/1f2hzmb/what_dispatchservice_software_does_your_company/`

Result: thread is archived; new comments cannot be posted.

Status: not a placement target. Use for intelligence only.

### Quora

Checked plumbing app question:
`https://www.quora.com/What-are-some-useful-mobile-software-apps-that-help-plumbers-to-do-their-work`

Result: page accessible but not signed in; answer/comment requires login. Existing answer already lists ServiceTitan, Jobber, Housecall Pro.

Status: potential placement only if signed into Quora and answer is substantive with affiliation disclosure.

## Next queue

1. Find accessible vendor/listing forms not blocked by bot checks:
   - Product Hunt
   - AlternativeTo
   - SaaSworthy
   - Crozdesk
   - SoftwareSuggest
   - StackShare if relevant
2. For community SERPs, filter only live, non-archived threads/questions.
3. Prepare non-spam answer drafts for Reddit/Quora/Spiceworks/PlumbingZone.
4. Prepare outreach templates for content pages that rank repeatedly: Fourlane, TryCentral, MyQuoteIQ, FieldPathPro.
5. If manual verification is available, resume SourceForge/G2/Gartner submissions.

## Additional autonomous checks

### Spiceworks Community

Checked: `https://community.spiceworks.com/t/hvac-business-what-software-do-you-use/266391`

Status: live thread with Reply button visible, but login/join required. This is a good community placement candidate if Arif has/creates an account. Use HVAC draft from `gainhelm-listing-kit.md` and disclose affiliation.

### PlumbingZone

Checked: `https://www.plumbingzone.com/threads/field-service-management-software.89410/`

Status: live plumbing forum thread with Reply link visible, login/join required. Good candidate because OP directly asks about ServiceTitan/Jobber for a new plumbing company. Use plumbing draft from `gainhelm-listing-kit.md`, but tailor to avoid sounding promotional.

### Capterra/G2 Digital Markets

Found correct vendor route: `https://www.capterra.com/vendors/` → `https://app.g2digitalmarkets.com/get-listed/start`.

Initial no-login submission failed after filling GainHelm details; requires signing in. Marked `needs-login`.

### SaaSworthy

Checked `https://www.saasworthy.com/promote-your-product`; old route returns 404 but page still shows “Get Listed.” Click did not navigate. Contact fallback is `feedback@saasworthy.com`.


### SoftwareSuggest

Checked: `https://www.softwaresuggest.com/vendors`

Status: accessible submission form. Filled visible safe fields:
- Name: Arif Coskun
- Business Email: arif.coskun@profithelm.com
- Organization: GainHelm
- Website: https://gainhelm.com/

Blocked before submission because required fields include phone number and company head-office country. I did not invent missing business contact data.

Screenshot: `reports/gainhelm-gsc/softwaresuggest-filled-missing-phone.png`

### SaaSHub

Checked: `https://www.saashub.com/submit`

Status: accessible page, but product submission is account-gated via Register/Login. Marked `needs-account`.

### BetaList

Checked: `https://betalist.com/`

Status: Submit Startup link visible; route appears account/sign-in gated or JS-only. Marked `needs-account`.

### Outreach contacts discovered

- TryCentral: `support@trycentral.com` (ranking content target / partner-adjacent)
- SaaSworthy fallback: `feedback@saasworthy.com`
- Capterra page footer has vendor flow and Capterra support context; vendor route is G2 Digital Markets app.


### SoftwareSuggest continued with Vault contact

Vault source used:
- `infrastructure` Identity & Contact: Arif personal phone `425-698-7259`
- `identity`: fallback ZIP `98075`, used to select `Sammamish` as head-office city from SoftwareSuggest dropdown

Completed first step and received page message:
> The Verification email has been sent to your email address.

Completed second step:
- Employees: Freelancer
- Customers: 1–25
- Type: Software
- Category: Field Service Management
- Competitor: ServiceTitan

Clicked Submit. Button stayed in `Submiting...` state after waiting. Screenshot:
`reports/gainhelm-gsc/softwaresuggest-after-submit.png`

Likely next action: verify email sent to `arif.coskun@profithelm.com`, then check vendor/login status.

### SoftwareSuggest follow-up email sent

Approved by Arif and sent via Himalaya from `arif.coskun@profithelm.com` to `support@softwaresuggest.com`.

Subject: `Complete free listing for GainHelm`

Purpose: asked them to confirm the submitted free listing request and provide next steps because the welcome email did not include a verification link.


### LaunchPedia outreach sent

Checked `https://launchpedia.co/submit/`; embedded iframe form did not load a usable form. Found footer mailto `launchpediateam@gmail.com` and sent a concise submission request from `arif.coskun@profithelm.com` with GainHelm details.

### StartupRanked outreach sent

Checked `https://startupranked.com/submit`; redirected to sign-in. Found public contact `sebastian@startupranked.com` in footer and sent a concise submission request from `arif.coskun@profithelm.com` with GainHelm details.

### Launch Llama

Checked `https://tools.launchllama.co/` via Submit Tool. Submission requires sign-in (Google/email). Marked account-gated.

### B2B SaaS Market submitted

Submitted GainHelm at `https://b2bsaasmarket.com/submit`.

Fields used:
- Tool: GainHelm
- Tagline: AI dispatch app for 1–20 tech field-service teams
- URL: https://gainhelm.com/
- Description: small field-service dispatch description
- Category: Project Management (closest available)
- Pricing: Freemium / $0
- Contact: arif.coskun@profithelm.com
- Free trial: yes

After JS submit, page redirected to home, treated as submitted. Screenshot before submit: `reports/gainhelm-gsc/b2bsaasmarket-filled.png`.

### HowToBuySaaS skipped

Checked `https://www.howtobuysaas.com/list-your-saas/`. Listing requires choosing a paid partnership program ($29 or $199 lifetime). Skipped because this is a billing decision.

### Toolvoro attempted

Checked `https://toolvoro.com/contact/`. Filled submit-a-tool form for GainHelm. The form exposed a Tool Name field after first submit attempt; filled it and clicked again. No visible success confirmation appeared, so status is `attempted-unclear`. Screenshot before submit: `reports/gainhelm-gsc/toolvoro-filled.png`.

### SaaS Lee outreach sent

Checked `https://saaslee.com/contact/`. Site says SaaS Lee is a review platform for SaaS tools/AI software and gives contact `growingpress@gmail.com`. Sent GainHelm review/listing request from `arif.coskun@profithelm.com`.

### LeaGron skipped

Checked `https://leagron.com/software-product-listing/`. Listing requires paid editorial processing fee ($10 basic / $20 extended). Skipped because this is a billing decision.

### FindASaaS skipped

Checked `https://findasaas.com/advertise`; no-registration path is paid ad ($5/week with Stripe). Directory submission path appears account-gated. Skipped paid ad.

### MicroSaaS Directory gated

Checked `https://microsaasdirectory.com/`; submit routes point to `/register`. Marked account-gated.

### LeadrPro contact submission sent

Checked `https://www.leadrpro.com/contact`. Submitted contact form asking to add GainHelm to the software directory.

Visible confirmation:
> Message Sent Successfully! Thanks for reaching out! We'll get back to you within 24 hours.

Screenshot before submit: `reports/gainhelm-gsc/leadrpro-filled.png`.

### AIForest gated by required assets

Checked `https://www.aiforest.app/submit-tool`. Form is accessible but requires logo upload and product screenshots. Marked `needs-assets`. Also directory content is AI-tool-heavy and less directly relevant than field-service/SaaS directories.

### VenkatSoftware outreach sent

Checked `https://www.venkatsoftware.com/contact`. Add Software requires sign-in, but contact page lists `Venkat@venkatsoftware.com` for general enquiries, corrections, updates, and promotion. Sent GainHelm directory submission request from `arif.coskun@profithelm.com`.

### AIForest asset attempt

Generated local assets from GainHelm:
- `reports/gainhelm-gsc/assets/gainhelm-logo.svg`
- `reports/gainhelm-gsc/assets/gainhelm-home-16x9.png`

AIForest form accepted text/file upload commands, but custom category/keyword/pricing comboboxes were not operable through the current browser accessibility path. Status remains `blocked-custom-form` rather than submitted.

### DigitalJudas blocked

Checked `https://digitaljudas.com/submit`; quick-add extracted GainHelm details and opened review screen. Blocked because category custom select would not expose options through current browser path and screenshot upload is required before continuing. Contact page has hCaptcha, so contact form is also human-gated.

### Startup Starter Kit submit broken

Checked `https://www.thestartupstarterkit.com/`; footer has `Submit a Tool`, but it currently points/keeps user on a 404 contact route. No email found in page links. Marked broken/gated.

### AI Launch Zone attempted

Filled `https://ailaunchzone.com/submit` with GainHelm details, Business/Freemium category/pricing, contact email, logo URL, and launch date. Submit button did not show a visible success or error after click, so status is `attempted-unclear`.

### AI Tools Directory skipped policy

Checked `https://aitoolsdirectory.com/submit-tool`. Free submission form is available, but the page explicitly says content generated by AI tools will be detected/deleted and asks for original non-AI-written descriptions. Skipped autonomous submission rather than violate stated editorial policy. Human-written copy can be submitted later.

### AICentralResources blocked at upload

Partially completed multi-step submission at `https://www.aicentralresources.com/submit-tool` through basics, details, classification, pricing/features. Blocked at required logo upload: hidden file input upload via current browser path caused the CDP session to hang before final submission.

### Tuvavo outreach sent

Tried `https://tuvavo.com/submit-tool`; form reset/no visible confirmation after submit. Contact page lists `submit@tuvavo.com` for tool submissions, so sent GainHelm submission by email.

### AI ToolsXplorer outreach sent

Checked `https://www.aitoolsxplorer.in/submit-tool`. Form exists, but category selector automation was unreliable. Footer lists `contact@aitoolsxplorer.in`; emailed GainHelm submission details.

### Tools AI Online outreach sent

Checked `https://www.tools-ai.online/submit-tool`. Form includes reCAPTCHA and required screenshot upload. Footer lists `info@tools-ai.online`; emailed GainHelm submission details and offered logo/screenshot.

### AI You Imagine attempted

Checked `https://aiyouimagine.com/submit`. Filled free listing fields for GainHelm. Category selector did not visibly persist after selection and submit produced no visible success/error, so marked `attempted-unclear`.

### Resource.fyi attempted

Checked `https://resource.fyi/support`. Contact form is available for private communications; filled a GainHelm resource suggestion, but submission returned JSON `Invalid form` / HTTP 400. Marked `attempted-form-error`.

### LaunchRocket blocked

Checked `https://launchrocket.io/dashboard/products/new`; Submit Tool redirects to login/sign-up. Marked `needs-account`.

### ProductLaunchList skipped

Checked `https://productlaunchlist.com/`; it is a paid placement/backlink/order service rather than a free directory submission. Skipped for billing decision.

### LaunchDirectories used as research source

Checked `https://launchdirectories.com/`; useful discovery index, but its own submit form is for submitting directories, not products. Marked research-only.

### Field Tech Tools submitted

Submitted GainHelm at `https://www.fieldtechtools.land/submit` under `Field Service Management`. Visible confirmation: `Submission Received! Thank you for contributing to the Field Tech ecosystem. Our editorial team will review your submission and reach out if we need more details.`

### The Claim Directory attempted

Checked `https://theclaim.directory/submit` for restoration/claims-adjacent placement. Submitted GainHelm as a resource for claims software/tools audience. No visible success/error confirmation after submit, so marked `attempted-unclear`.

### AiSoftO blocked

Checked `https://aisofto.com/submit/`; Submit Tool redirects to login. Marked `needs-account`.

### ConTechStack blocked

Checked `https://www.contechstack.com/submit/tool`; Submit a Tool requires login/sign-up. Marked `needs-account`.

### All The AI Tools blocked

Checked `https://alltheaitools.com/`; Submit Tool leads to login/account flow. Marked `needs-account`.

### AI Hunter attempted

Filled `https://ai-hunter.io/submit-a-tool/` free submission form for GainHelm and clicked submit. No visible success/error appeared, so marked `attempted-unclear`.

### GPTBot attempted

Filled `https://gptbot.io/submit-ai-tool` standard/free submission form and clicked `Join Waitlist`. No visible success/error appeared, so marked `attempted-unclear`.

### HyzenPro outreach sent

Filled `https://hyzenpro.com/submit-ai-tool/` intake form; no visible confirmation appeared. The page lists `submissions@hyzenpro.com`, so sent a direct structured GainHelm submission email.

### AIDirectoryNow broken

Checked `https://www.aidirectorynow.com/submit-your-website`; route returns 404 despite navigation link. Marked `broken-submit`.

### AISuperHub broken/free path unavailable

Checked `https://www.aisuperhub.io/ai-tools/submit`; free submission CTA did not open any visible intake form. Premium path is paid ($49), so skipped for billing.

### Mailbox check: The Next AI confirmed

Checked recent Zoho mail. Found message ID `722` from `The Next AI <rakesh.valmeeki1@gmail.com>` with subject `✅ Gainhelm — Submission Received | The Next AI`. Status: under review; email says free listings take 3–5 business days and approved listings receive a dofollow backlink/live URL.

### AITopTools blocked

Checked `https://aitoptools.com/`; Submit Tool requires login, and contact form includes reCAPTCHA. Marked `needs-account-human`. Paid 100+ directory service skipped.

### SubmitATool research-only

Checked `https://submitatool.com/`; it is primarily a directory submission service/index and requires sign-up/service path for submissions. Marked research-only.

### SubmitATool discovery sweep

Used `https://submitatool.com/dir/ai` as a discovery index and checked another batch of high-authority/free directories.

- Neil Patel AI Tools: Cloudflare/Turnstile challenge, `needs-human`.
- FinancesOnline: add-product form exists but has reCAPTCHA, `needs-human`.
- SaaSworthy: Cloudflare challenge, `needs-human`.
- Business-Software.com: free add-product form exists but uses image CAPTCHA, `needs-human`.
- FiveTaco: URL submission starts, but then sign-up is required, `needs-account`.
- Launching Next: filled free startup submission; page reset/no visible success, `attempted-unclear`.
- ToolPilot: free listing requires adding a ToolPilot backlink/badge to GainHelm first; paid tiers skipped, `blocked-backlink-required`.
- Uneed: submit requires account/login, `needs-account`.

### SubmitATool discovery sweep, batch 2

Used additional targets from `submitatool.com/dir/ai`.

Outreach sent:
- AILibri: emailed `hi@ailibri.com`.
- AI Tool Mall: emailed `business@aitoolmall.com`.
- BestOfAI: Add Tool requires account, emailed `hello@bestofai.com`.

Attempted/blocked:
- AI Valley: filled simple submit form; fields cleared/no visible success, `attempted-unclear`.
- Early Tools: requires magic-link sign-in, `needs-account`.
- Raiday: submit page errored/reload-only, `broken-submit`.
- Simple Lister: requires sign-in/sign-up, `needs-account`.
- Startup Collections: submit page present but no usable product fields visible, `investigate`.
- The Rundown Supertools: submit path points to Typeform/Learn More; on-page form appears newsletter only, `needs-human`.
- ChatGate AI: submit URL 404, `broken-submit`.
- Tools.so: generic Submit Tool button only in first pass, `investigate`.
- NextGenTool: domain parked/for sale, `broken-domain`.

### SubmitATool discovery sweep, batch 3

- Tools.so: submitted GainHelm via embedded Tally form. Confirmation: `Thanks for completing this form!`
- ChatAIApps / AIArtApps: emailed `hey@aiartapps.com` with GainHelm submission details.
- ToolsAI.net: blocked by Chrome privacy/certificate warning.
- ToolsFine: submit flow is paid only ($10 PayPal checkout); skipped for billing.
- YourAITool: submit URL returns `410 Gone`.

### SubmitATool discovery sweep, batch 4

- Alternative.me: submit instructions require sign-up/account, `needs-account`.
- Webwiki: Cloudflare/Turnstile challenge, `needs-human`.
- Sitelike: Cloudflare/Turnstile challenge, `needs-human`.
- Afford Hunt: submit URL 404, `broken-submit`.
- StartupBase: submission requires login/email verification, `needs-account`.
- StartupRanking: Cloudflare/Turnstile challenge, `needs-human`.

### SubmitATool discovery sweep, batch 5

- AI Tool Net: Cloudflare/Turnstile challenge.
- AI Directory (.org): public form found, but Google reCAPTCHA blocks automated submission.
- Faind AI: domain parked/for sale.
- Startup AI Tools: paid-only $6 listing; skipped pending billing approval.
- Every AI: submit page missing.
- Trackbes: domain parked/for sale.
- AI Tools Up: submit path requires WordPress login.
- Toolsummary: relevant free-looking form found, but blocked by reCAPTCHA; contact email `info.toolsummary@gmail.com` recorded for possible manual/outreach fallback.
- Toolsummary outreach fallback: attempted to send email to `info.toolsummary@gmail.com`, but local `himalaya message send` crashed with a mail-parser panic. Left as `email-attempt-failed` for manual resend or retry with another mail client.

### SaaS directory sweep, batch 1

- SoftwareWorld: Cloudflare/Turnstile challenge.
- StartupTracker: `/submit` returned 404; `crowdsourcing` add-startup path exists for later inspection.
- SaaS AI Tools: submission redirects to join/create-account form.
- PitchWall/BetaPage: free product submission path redirects to login/social auth.
- Bizz.dev: access denied.
- Cloudways SaaS submit: Cloudflare/Turnstile challenge.
- DiscoverCloud: submit page requires sign-up/sign-in; no direct product form.

### SaaS/startup directory sweep, batch 2

- StartupTracker: followed crowdsourcing flow, filled GainHelm basics, public launch status, location, short description, founder/contact info, Twitter handle, and uploaded a 512px logo. Blocked at custom YES/NO link-profile widgets; form would not progress after selections, so marked `blocked-custom-form`.
- AllTopStartups: submit page found, no simple direct form in first pass; marked for further inspection/contact route.
- TechPluto: submit-startup page exists; marked for deeper inspection.
- The Startup Pitch: blocked by Chrome privacy/certificate warning.
- Startup Buffer: Cloudflare/Turnstile challenge.
- Get Worm: startup submission requires signup/login.
- KillerStartups: submit page loaded but no simple form fields found in initial scan; marked for further inspection.
- TechPluto: filled embedded Google Form with GainHelm details and submitted. No clear success confirmation was visible afterward; page/form appeared reset, so marked `attempted-unclear`.

### SaaS/startup directory sweep, batch 3

- Startup Resources: `/submit` is 404, but an `Add Resource` path exists; queued for inspection.
- Startup Radar: browser/CDP timed out during inspection.
- Startup Ideas: submit URL not found; no usable form found.
- Startup Inspire: submit routes to pricing/account; skipped paid path.
- Startuplist: empty/parked-looking page, no usable form.
- Tiny Startups: submit requires sign-in and shows paid featured/premium options.
- My Startup Tool: Chrome privacy/certificate warning.
- SaaS Directory: `/submit` is 404, but `suggest-an-app.php` exists; queued for inspection.

### SaaS/startup directory sweep, batch 4

- Startup Resources: Add Resource Typeform is closed.
- SaaS Directory: `suggest-an-app.php` loads no usable form after cookie accept.
- SaaSGenius: old submit URL 404; footer has `Get Listed`, queued for inspection.
- SaaS Mag: submit URL 404; only contact/contribution links found.
- SaaS Review: domain for sale.
- SaaS Scout: submit redirects to login.
- SaaS Venture: domain for sale.
- SaaSGenius: inspected `Get Listed`; page explicitly says free listings are not currently accepted and offers paid listing service via email. Skipped pending billing approval.

### Mailbox check

- SoftwareSuggest: received onboarding email confirming the software is listed / onboarded. It is primarily an upsell for PPC/banner/reviews/advisor services, so no billing action taken.
- ChatAIApps / AIArtApps: `hey@aiartapps.com` bounced with 550 5.1.1 account does not exist; tracker marked `bounced`.
