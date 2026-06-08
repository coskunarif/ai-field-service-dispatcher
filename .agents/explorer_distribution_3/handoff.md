# Handoff Report — Outreach Copywriting Researcher (Explorer 3)

## 1. Observation
We observed the following parameters, guidelines, and definitions across the source files:
- **Gainhelm Features**: In `/home/ubuntuadmin/projects/ai-field-service-dispatcher/APP_DESCRIPTION.md`, the app is described as:
  - "100% headless. Technicians receive and accept dispatch offers via native text messages (SMS/WhatsApp) without downloading or logging into any app."
  - "The dispatcher reads the company's rules, matches incoming requests to the best technician, sends an automated SMS, and books the response into the owner's Google Calendar."
- **Distribution Hierarchy & Strategy**: In `/home/ubuntuadmin/projects/knowledge/distribution-playbook.md`, personal outreach and Reddit/Forums are highlighted:
  - "Personal outreach / DMs | Days | Free | Very High"
  - "Reddit / Forums | Weeks | Free | High"
  - Reddit tactic: "Post helpful content... never pitch directly... build karma first, engage authentically for 2+ weeks before any product mention."
- **Target Profile & Layout**: In `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_distribution/PROJECT.md`, target profiles are specified:
  - "targeting small trade business owners (HVAC, plumbing, electrical, locksmith, restoration, cleaning)."

## 2. Logic Chain
1. **Technician Pain Point Identification**: Field service workers resist traditional FSM software due to mobile app setup friction, login issues, and screen-tapping. Therefore, the core hook for technicians in outreach copy must emphasize "100% app-less SMS/WhatsApp dispatching" (Observation: `APP_DESCRIPTION.md`).
2. **Owner Pain Point Identification**: Small business owners waste 2-3 hours daily acting as scheduling middlemen (Observation: `APP_DESCRIPTION.md`). Therefore, outreach emails and DMs must highlight automation, calendar sync, and time saved.
3. **Google Calendar Leverage**: Many target trade business owners use Google Calendar and resist migrating to bloated FSM suites. Highlighting that Gainhelm works on top of Google Calendar addresses this migration barrier.
4. **Reddit Compliance**: Because subreddits have strict self-promotion filters, we must use a value-first, zero-link commenting and storytelling strategy to build authority and ranking (Observation: `distribution-playbook.md`).
5. **Cold Email Infrastructure**: High volume cold emails on a main domain run high risks of blacklisting. Thus, we must separate cold email domains, set up proper DNS records (SPF, DKIM, DMARC), and warm up inboxes.

## 3. Caveats
- No code was modified, and no outreach lists were verified, as this is a read-only investigation.
- Copywriting performance is highly dependent on target list segmentation, subject line variations, and individual subreddit moderators' strictness.

## 4. Conclusion
We have compiled a comprehensive copywriting and anti-spam playbook in `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_distribution_3/analysis.md`. It provides:
- Core messaging angles mapped to owner and technician pain points.
- 3 cold email templates targeting trade business owners.
- 3 Reddit post/comment templates addressing scheduling issues.
- 2 LinkedIn/forum DM templates.
- Strict anti-spam rules for Reddit self-promotion, email deliverability (DKIM/SPF/DMARC), and DM throttling.

This analysis is ready for the Worker agent to implement in `/home/ubuntuadmin/projects/ai-field-service-dispatcher/seo/distribution/templates.md` and `playbook.md`.

## 5. Verification Method
Verify by inspecting `/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_distribution_3/analysis.md`. It must contain:
1. Analysis of Gainhelm's value proposition.
2. 3 Cold Email templates with placeholders (e.g., `{{Owner Name}}`).
3. 3 Reddit/Forum posting templates with trade-specific terminology.
4. 2 DM outreach templates.
5. Guidelines for Reddit self-promotion, email infrastructure setup (SPF/DKIM/DMARC), and DM volume limits.
