# SaaS Directory & Startup Platform Distribution Analysis — Gainhelm

## 1. Executive Summary
This report analyzes and compiles general SaaS software directories, Product Hunt alternatives, AlternativeTo, and startup listing platforms suitable for **Gainhelm** (`gainhelm.com`). Gainhelm is an **Agent-First, Context-Driven AI dispatcher** for small field service teams (HVAC, plumbing, electrical, locksmith, restoration, landscaping, and cleaning crews running 1–20 technicians). 

Because Gainhelm is currently positioned as an **early-access prototype landing page with a waitlist** (rather than a fully released production app with active customer accounts), its directory distribution strategy must be carefully staged. Many directories immediately reject waitlist pages or require domain email verification and login accounts. 

This analysis details **15 software directories/platforms** (including 8+ general SaaS directories and multiple AI/specialty directories), outlines asset requirements, and provides a step-by-step submission playbook based on real-world verification checks.

---

## 2. Directory & Platform Compilation

Below is the structured registry of SaaS directories, Product Hunt alternatives, and startup platforms analyzed for Gainhelm's organic distribution.

### General SaaS & Pre-Launch Platforms

| Platform Name | Verified URL | Est. Monthly Audience | Cost / Submission Model | Waitlist Friendly? | Verification Outcome & Blockers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BetaList** | `https://betalist.com` | ~150K–200K | Free (w/ queue) / Paid ($39–$299) | **Yes** (Dedicated pre-launch) | Draft created (`submissions/167383`). Final wizard step requires payment ($39 Lite, $99 Std, $299 Prem) or moderator approval. *Blocked on budget approval.* |
| **AlternativeTo** | `https://alternativeto.net` | ~6.0M+ | Free (Crowdsourced) | **Yes** (Needs manual review) | Excellent fit for positioning as an alternative to ServiceTitan, Jobber, Housecall Pro. Requires maker account. |
| **Uneed** | `https://uneed.best` | ~100K+ | Free (w/ queue) / Paid | **Yes** | Daily curated tool leaderboard. Fits early-access tech makers. |
| **Launching Next** | `https://launchingnext.com` | ~50K–100K | Free (w/ queue) / Paid ($99) | **Yes** | **Submitted 2026-05-26**. In free queue (est. wait 4 months). ID: `134920`. *Paid fast-track is optional.* |
| **SaaSHub** | `https://saashub.com` | ~3.5M+ | Free (Basic) | **No** (Strict released-only) | **Blocked/Unsupported Product**. Rejects waitlist pages. Requires domain-specific email verification. |
| **SaaSHunt AI** | `https://saashunt.ai` | ~50K+ | Free (Basic) | **Yes** | **Submitted 2026-05-26**. Success page received. Editorial review: 3–5 business days. No login required. |
| **ShowMySites** | `https://showmysites.com` | ~30K+ | Free (via contact form) | **Yes** | **Submitted 2026-05-26** via contact form. Returned success. *Direct add website requires account.* |
| **FirstUsers** | `https://firstusers.tech` | ~20K+ | Free (via Tally form) | **Yes** | **Submitted 2026-05-26** via Tally form. Network-accepted. Dedicated to early adopters. |

### AI-Specific & Productivity Directories

| Platform Name | Verified URL | Est. Monthly Audience | Cost / Submission Model | Waitlist Friendly? | Verification Outcome & Blockers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **The Next AI** | `https://thenextai.com` | ~120K+ | Free Basic / Paid ($199) | **Yes** | **Submitted 2026-05-26**. API macro returned success. No login required. |
| **SmartBizTools** | `https://smartbiztools.io` | ~50K+ | Free Editorial Review / Paid | **Yes** | **Submitted 2026-05-26**. Editorial queue is 2–6 weeks. No login/account required. |
| **FreeAIO** | `https://freeaio.com` | ~40K+ | Free (WPForms) | **Yes** | **Submitted 2026-05-26**. WPForms AJAX returned success. No login/CAPTCHA required. |
| **TopReviewed.ai** | `https://topreviewed.ai` | ~30K+ | Free (via contact form) | **Yes** | **Submitted 2026-05-26** via contact. Direct `/submit` route was 404, fallback contact used. |
| **Conversion Gems** | `https://conversiongems.com` | ~10K+ | Free (Webflow form) | **Yes** | **Submitted 2026-05-26**. Webflow API form returned HTTP 200 "ok". No login required. |
| **FieldSalesTools** | `https://fieldsalestools.com` | ~5K+ | Free (FormSubmit) | **Yes** | **Submitted 2026-05-26** via `/submit` FormSubmit honeypot form. Network-accepted. |

### Platform Access & Security Gate Blockers (Requires Action/Approval)

| Platform Name | Verified URL | Blocker Type | Detailed Blocker Description | Required Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Product Hunt** | `https://producthunt.com` | Login / Launch Kit | Requires active maker profile and comprehensive media kit (GIFs, screenshots, video). | Create Arif's founder profile; prepare visual launch assets. |
| **PitchWall / BetaPage** | `https://pitchwall.co` | Login-Gated | `/submit-startup` redirects to login page. Supports Google, GitHub, Microsoft, Discord OAuth. | Arif to approve OAuth account selection for submission. |
| **SubmitHunt** | `https://submithunt.com` | Login-Gated | `Continue with Google` login gate required before accessing submit form fields. | Arif to approve Google login session in submission browser. |
| **TheSaaSDir** | `https://thesaasdir.com` | Badge / Reciprocal Link | Free listing requires embedding a dofollow reciprocal link badge on Gainhelm's website. | Add badge to website footer, or approve $19 paid submission. |
| **SaaS Scanner** | `https://saasscanner.com` | Login-Gated | Submission requires registering an account or logging in with Google. | Approve Google/account signup for SaaS Scanner. |
| **ConTechFinder** | `https://contechfinder.com` | Turnstile CAPTCHA | Free queue submission form is gated behind Cloudflare Turnstile token verification. | Manual intervention to solve Turnstile during live browser run. |
| **Business-Software** | `https://business-software.com` | CAPTCHA | Add Product form is gated by an on-screen CAPTCHA verification code. | Manual CAPTCHA entry required. |
| **SoftwareWorld** | `https://softwareworld.co` | Paid / CAPTCHA | Registration requires Google reCAPTCHA and a lifetime listing fee of $99. | Skip (violates free-only and CAPTCHA boundaries). |
| **SaaS Browser** | `https://saasbrowser.com` | Cloudflare / Account | Cloudflare Turnstile gate at homepage; Add SaaS path requires account registration. | Skip or approve account creation. |
| **AppInsight** | `https://appinsight.co.uk` | CAPTCHA | Vendor contact/listing form uses Google reCAPTCHA. | Manual CAPTCHA entry required. |
| **True Recurring** | `https://truerecurring.com` | Account / Dashboard | Submit flow requires registering a founder account and dashboard profile. | Approve account creation. |

---

## 3. Submission Copy & Asset Specifications

To maintain cross-channel consistency and GEO (Generative Engine Optimization) alignment, all directory submissions must use the following approved copy and asset guidelines.

### Text Copy Assets
* **One-Liner / Tagline (Max 80 Characters)**:
  > Simple AI-assisted dispatch app for small HVAC, plumbing, and landscaping teams.
* **Short Description (Max 200 Characters)**:
  > Gainhelm helps 1–20 technician field service teams schedule jobs faster, reduce office-to-field phone tag, and move dispatch from scattered spreadsheets to an elegant AI-assisted board.
* **Medium Description (Max 500 Characters)**:
  > Gainhelm is built specifically for small trade businesses running 1 to 20 technicians. When new jobs stream in, office managers and owners are forced to coordinate through scattered texts, calls, spreadsheets, and memory—leading to missed jobs and endless callbacks. Gainhelm replaces this scramble with an intuitive, drag-and-drop dispatch board, automated technician assignment suggestions, and clean mobile views for field crews, reducing administrative overhead and phone tag.
* **Long Description (Max 1000 Characters)**:
  > Gainhelm is built specifically for small trade businesses (HVAC, plumbing, electrical, landscaping, and restoration crews) running 1 to 20 technicians. When new jobs stream in, office managers and owners are forced to coordinate through scattered texts, calls, spreadsheets, and memory—leading to missed jobs and endless callbacks. 
  > 
  > Gainhelm streamlines this dispatch scramble. It provides an intuitive, drag-and-drop dispatch board, automated technician assignment suggestions, and clean mobile views for field crews. By keeping office staff and field technicians aligned in real time, Gainhelm reduces administrative overhead, eliminates phone tag, and speeds up time-to-arrival. No enterprise bloat or credit card required to start—just clean, high-performance scheduling for small blue-collar operators.

### Visual Assets Checklist
* **Logo**: SVG format (Gainhelm logo is located at `/gainhelm_logo.svg`, size 415 bytes) and PNG formats (256x256 and 512x512 pixels).
* **Screenshots**: High-resolution PNG/JPG (1200x630 or 16:9 ratio) of the Context Configuration Wizard (`/setup`) and the Supervision Board (`/app`) showing SMS dispatch logs.
* **GIF Walkthrough**: A 10–15 second loop showing job intake in natural language, matching a technician, and the technician replying "Yes" via SMS.

### Metadata Categorization Mappings
* **Primary Categories**: *Field Service Management*, *Scheduling & Booking*, *Workflow Automation*, *AI Productivity Tools*, *Operations Software*.
* **Tags & Keywords**: `field service dispatch`, `technician scheduling`, `HVAC dispatch software`, `plumbing dispatch app`, `AI scheduling`, `small business software`, `landscaping dispatch`.
* **Competitor / Alternative Mappings**:
  * **Jobber** (Alternative page target: `/jobber-alternative.html`)
  * **Housecall Pro** (Alternative page target: `/housecallpro-alternative.html`)
  * **ServiceTitan** (Alternative page target: `/servicetitan-alternative.html`)
  * **FieldEdge** (Alternative page target: `/fieldedge-alternative.html`)
  * **BuildOps** (Alternative page target: `/buildops-alternative.html`)
  * **ServiceFusion** (Alternative page target: `/servicefusion-alternative.html`)

### UTM Tracking Framework
For all directory listings, use the following URL pattern to capture traffic source and conversion data in Google Analytics:
`https://gainhelm.com/?utm_source=directory&utm_medium=referral&utm_campaign=early_access_launch`

---

## 4. Step-by-Step Directory Submission Playbook

### Phase 1: Waitlist-Friendly Launch (Immediate Actions)
These directories do not require vendor accounts or paid plans and accept waitlist-stage products.
1. **Verify Live Submissions**: Confirm that the forms submitted during the 2026-05-26 run (Launching Next, SaaSHunt AI, The Next AI, SmartBizTools, FreeAIO, Conversion Gems, ShowMySites, FirstUsers, TopReviewed.ai, FieldSalesTools) are periodically monitored for live listing links.
2. **Resolve Turnstile / CAPTCHA Barriers**:
   * Access the CDP session or local browser.
   * Manually solve CAPTCHAs and Turnstile tokens on **ConTechFinder**, **Business-Software.com**, and **AppInsight** to complete their free submissions.

### Phase 2: Post-Launch & Vendor Accounts (After Product Release)
Once Gainhelm moves past the early-access waitlist to a public beta with active domain-based email verifications:
1. **SaaSHub Submission**: 
   * Register a vendor account using a domain email (e.g., `contact@gainhelm.com`).
   * Complete the product verification step.
   * Add competitors/alternatives (Jobber, ServiceTitan) to link to Gainhelm's comparison pages.
2. **AlternativeTo Profile Creation**:
   * Create an AlternativeTo account.
   * List Gainhelm as an app.
   * Map alternative relations to Jobber, Housecall Pro, and ServiceTitan. Add direct links to Gainhelm's alternative landing pages (`/jobber-alternative.html`, etc.) in the profile.
3. **Product Hunt Campaign**:
   * Set up founder profiles for Arif.
   * Create a launch page with active scheduling.
   * Launch on a Tuesday or Wednesday for maximum reach.
4. **G2 & Capterra (Gartner Digital Markets)**:
   * Register a free vendor listing via Gartner Digital Markets (populates Capterra, GetApp, and SoftwareAdvice).
   * Register a free vendor profile on G2.
   * Direct the first 5–10 beta customers to leave honest reviews.

---

## 5. Maintenance & Invalidation Conditions
This analysis should be updated or reassessed if any of the following conditions change:
* **Product Maturity Shift**: If Gainhelm launches a public sign-up or beta, waitlist rejections (such as SaaSHub's policy) are no longer blockers.
* **Domain Email Availability**: Re-evaluating directories requiring domain email verification once email accounts on `gainhelm.com` are created.
* **Pricing or Paid Budget Allocation**: If a marketing budget is allocated, paid directories/fast-tracks (such as BetaList standard queue or AlternativeTo sponsor slots) can be activated.
