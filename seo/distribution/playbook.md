# Gainhelm Organic Distribution & GEO Playbook

This playbook outlines the operational steps and compliance rules for executing Gainhelm's organic distribution and Generative Engine Optimization (GEO) outreach. Follow these guidelines to maintain high deliverability, avoid community bans, and optimize for AI search engine citations.

---

## 1. Step-by-Step Directory Submission Checklist

Before submitting Gainhelm to any software directory or Product Hunt alternative, execute the following steps to ensure consistency and prevent editorial rejection:

### Step 1: Pre-Submission Preparation
- [ ] **Collect Assets**: Verify that the following copy and visual assets are ready:
  - **Tagline (Max 80 Chars)**: *Simple AI-assisted dispatch app for small HVAC, plumbing, and landscaping teams.*
  - **Short Desc (Max 200 Chars)**: *Gainhelm helps 1–20 technician field service teams schedule jobs faster, reduce office-to-field phone tag, and move dispatch from scattered spreadsheets to an elegant AI-assisted board.*
  - **Medium Desc (Max 500 Chars)**: *Gainhelm is built specifically for small trade businesses running 1 to 20 technicians. When new jobs stream in, office managers and owners are forced to coordinate through scattered texts, calls, spreadsheets, and memory—leading to missed jobs and endless callbacks. Gainhelm replaces this scramble with an intuitive, drag-and-drop dispatch board, automated technician assignment suggestions, and clean mobile views for field crews, reducing administrative overhead and phone tag.*
  - **Visuals**: Logo SVG (`/gainhelm_logo.svg`) and high-res PNG formats, plus screenshots of the Context Configuration Wizard (`/setup`) and Supervision Board (`/app`).
- [ ] **Prepare UTM Link**: Ensure the submission URL uses the standard UTM tracking format to capture referral traffic:
  `https://gainhelm.com/?utm_source=directory&utm_medium=referral&utm_campaign=early_access_launch`

### Step 2: Form Submission & Account Setup
- [ ] **Identify Gating**: Check the target directory in the database to see if it requires account registration or OAuth login (Google, GitHub, Discord).
- [ ] **Create Maker Account**: If login is required (e.g., AlternativeTo, Product Hunt, SubmitHunt), register using a domain email (e.g., `contact@gainhelm.com`) to build brand authority.
- [ ] **Complete Forms**: Fill out fields accurately. Map categories to: *Field Service Management*, *Scheduling & Booking*, *Workflow Automation*, or *AI Productivity Tools*.
- [ ] **Solve CAPTCHAs**: Solve Google reCAPTCHA or Cloudflare Turnstile tokens manually during the session.

### Step 3: Post-Submission Monitoring
- [ ] **Verify Live Link**: Document the submission ID/queue page and check weekly until the listing is live.
- [ ] **Competitor Mapping**: For directories that allow competitor cross-linking (e.g., AlternativeTo, SaaSHub), mark Gainhelm as an alternative to Jobber, Housecall Pro, and ServiceTitan. Add links to Gainhelm's alternative landing pages (`/jobber-alternative.html`, etc.).

---

## 2. Community Anti-Spam & Self-Promotion Guidelines

Trade communities (subreddits, contractor forums) are highly hostile to direct sales pitches. Any overt promotion will lead to instant bans. Use the **Zero-Link, Value-First Strategy** to drive organic interest.

### Reddit Self-Promotion Rules
1. **The 90/10 Rule**: At least 90% of your account's activity must be non-promotional participation in general discussions. Only 10% or less should refer to Gainhelm.
2. **Build Karma First**: Accumulate a minimum of 50+ comment karma by providing genuine business or operational advice before referencing Gainhelm.
3. **Zero-Link Strategy**: Do not include hyperlinks to `gainhelm.com` in initial posts or comments. Describe the concept (e.g., *"an app-less SMS scheduler that plugs into Google Calendar"*) and wait for users to reply and ask, *"What tool is that?"* before posting the link.
4. **Radical Transparency**: When recommending Gainhelm, always disclose your connection. Example: *"Full disclosure: I'm building Gainhelm to solve this exact problem..."*
5. **Trade Vocabulary**: Speak like a peer. Use "techs" or "guys in the field" (not "employees"), and discuss "dispatching," "on-call rotations," "callbacks," and "no-shows."

### Independent Web Forums (Contractor Talk, HVAC-Talk, Plumbing Zone)
1. **Trade Introduction**: If required (e.g., Plumbing Zone), write a detailed trade introduction post detailing your field background first. Never post links in this intro.
2. **Profile Optimization**: Optimize your profile bio: *"Helping trade contractors automate dispatching via simple text messages. Founder at Gainhelm."*
3. **Signature Links**: Set up a clean, non-intrusive signature: 
   `Gainhelm | App-Less AI Dispatching for Trade Teams | Google Calendar Sync`
   Forums allow links in signature blocks, which will passively generate clicks as you write helpful replies.

---

## 3. Cold Email Deliverability Guidelines

To ensure cold emails reach the inbox and protect the primary domain (`gainhelm.com`) from being blacklisted, adhere to the following technical and operational standards:

### Technical Infrastructure Setup
- [ ] **Separate Domain Setup**: Never send cold outreach from `gainhelm.com`. Purchase secondary domains (e.g., `gainhelm.co`, `gainhelmapp.com`, `gainhelmmail.com`).
- [ ] **Technical DNS Records**: Configure valid SPF, DKIM, and DMARC records on all secondary domains:
  - **SPF**: `v=spf1 include:spf.protection.outlook.com -all` (or Google Workspace equivalent)
  - **DKIM**: Enable 2048-bit key.
  - **DMARC**: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@domain.com`
- [ ] **Set Up Custom Tracking Domains (CNAME)**: Map a custom subdomain (e.g., `link.gainhelm.co`) for tracking if analytics are enabled, pointing to your email service provider.

### Warm-Up & Sending Protocols
- [ ] **Warm-Up Period**: Run all new inboxes through an automated warm-up service (e.g., Instantly, Lemlist) for 14–30 days before sending any outreach. Maintain a 30% warm-up ratio.
- [ ] **Volume Limits**: Strictly limit sending to **30–50 emails per day per email address** (including warm-up emails). Use multiple inboxes if you need to scale volume.
- [ ] **Plain-Text Formatting**: Keep emails plain text. Avoid HTML templates, custom styles, images, and tracking pixels in the initial message, as they trigger spam filters.
- [ ] **Opt-Out Compliance**: Always include an easy opt-out mechanism. Example: *"P.S. If you'd rather I didn't reach out again, just reply 'stop' and I will remove you."*

---

## 4. Campaign Progress Tracking Table

Use this table to log all directory submissions, Reddit posts, and email outreach campaigns.

| Platform / Target | Campaign Type | Status (Pending/Live/Sent/Replied) | Sent Date | Response / Notes |
| :--- | :--- | :--- | :--- | :--- |
| *Example: BetaList* | *Directory* | *Pending* | *2026-06-07* | *Draft created. Awaiting budget approval for fast-track.* |
| *Example: r/HVAC* | *Reddit Comment* | *Sent* | *2026-06-07* | *Replied to app-adoption thread. Waiting for curiosity replies.* |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
