# BRIEFING — 2026-07-03T12:51:00-07:00

## Mission
Improve SEO and GEO performance for the Gainhelm website to increase organic traffic and rank on page 1 of Google and in AI search engines across all field service categories.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_seo_geo_2
- Original parent: parent
- Original parent conversation ID: 4f64dcf2-cb24-4bcc-80fd-d28f153eff8a

## 🔒 My Workflow
- **Pattern**: Project Pattern
- **Scope document**: /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_seo_geo_2/PROJECT.md
1. **Decompose**: Split into milestones targeting Audit script enhancement, Page content and Schema optimization, Robots/LLMs asset mapping, and E2E/Audit validation.
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: Direct standard cycle: Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns. Write handoff.md, spawn successor, exit.
- **Work items**:
  1. Initialize BRIEFING.md, ORIGINAL_REQUEST.md, plan.md, and progress.md [done]
  2. Milestone 1: Technical & On-Page SEO/GEO Audit [pending]
  3. Milestone 2: Schema & Content Enhancement (WebPage author, dateModified, FAQs) [pending]
  4. Milestone 3: AI Crawler Access & Sitemap/LLMs Asset Optimization [pending]
  5. Milestone 4: E2E and Audit Script Verification [pending]
- **Current phase**: 1
- **Current focus**: Planning and initializing project metadata

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh

## Current Parent
- Conversation ID: 4f64dcf2-cb24-4bcc-80fd-d28f153eff8a
- Updated: not yet

## Key Decisions Made
- Use Project Pattern to structure the SEO/GEO optimization milestones.
- Keep PROJECT.md inside the orchestrator folder to strictly follow workspace write constraints.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| Explorer 1 | teamwork_preview_explorer | Audit sitemap and files | completed | b5876845-c67b-412b-ad4b-6a4821adbdf1 |
| Explorer 2 | teamwork_preview_explorer | Audit sitemap and files | failed | 68500a7c-1065-44b2-b0a7-f740895e301e |
| Explorer 3 | teamwork_preview_explorer | Audit sitemap and files | completed | fe1f4ebe-8c10-4d96-a091-009455a0f6d7 |
| Worker 1 | teamwork_preview_worker | Apply SEO/GEO optimizations | completed | 4f31d453-c1bd-40e0-b2df-fa228de71e89 |
| Reviewer 1 | teamwork_preview_reviewer | Review optimizations | in-progress | f9b4cb58-d06b-4348-aeef-7ae1877ae4ca |
| Reviewer 2 | teamwork_preview_reviewer | Review optimizations | in-progress | 8dd4e77d-6e77-4386-9b16-ec3ac3298fc4 |
| Challenger 1 | teamwork_preview_challenger | Verify correctness | in-progress | 779c42aa-369d-41f7-ab0c-12fdec4f3bba |
| Challenger 2 | teamwork_preview_challenger | Verify correctness | in-progress | 9d3eaa71-3426-4738-930d-a2883b3c27be |
| Auditor | teamwork_preview_auditor | Forensic integrity audit | in-progress | a9a7cd26-27c7-4483-8437-957eb2268c31 |

## Succession Status
- Succession required: no
- Spawn count: 9 / 16
- Pending subagents: f9b4cb58-d06b-4348-aeef-7ae1877ae4ca, 8dd4e77d-6e77-4386-9b16-ec3ac3298fc4, 779c42aa-369d-41f7-ab0c-12fdec4f3bba, 9d3eaa71-3426-4738-930d-a2883b3c27be, a9a7cd26-27c7-4483-8437-957eb2268c31
- Predecessor: none
- Successor: not yet spawned
- Successor generation: gen1

## Active Timers
- Heartbeat cron: f2a198ca-473b-4a01-b54b-4c117015d2dd/task-83
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_seo_geo_2/ORIGINAL_REQUEST.md — Verbatim user request copy
- /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_seo_geo_2/progress.md — progress tracker
- /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_seo_geo_2/plan.md — action plan
- /home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/orchestrator_seo_geo_2/PROJECT.md — project scope and milestone layout
