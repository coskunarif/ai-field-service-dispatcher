---
name: workspace-orientation
description: "Use when you need to understand the live workspace, discover canonical truth in Vault, inventory available skills/CLIs, and choose the right execution path before acting. Use whenever a user asks to understand the workspace, prime context, explore skills, check Vault, or you need a fresh orientation for a new task in this repo or system."
aliases: ["vault-orientation", "workspace-primer", "workspace-prime", "context-orientation"]
---

# Workspace Orientation

Use this skill when the task is to understand the live workspace before doing anything else.
It exists to turn vague requests like "understand my workspace", "explore the skills", or "what should I use here?" into a grounded, current, tool-backed orientation.

## What this skill does

This skill helps you:
- find the current source of truth in Vault
- identify the relevant project, skill, or CLI for a task
- separate durable workspace truth from live runtime evidence
- avoid guessing when the workspace has multiple possible execution paths
- hand off browser-session tasks to native Chrome/agent-browser when browser automation is needed

## When to use it

Use this skill when the user:
- asks to understand the workspace, vault, or project landscape
- asks which skill or CLI should be used for a task
- wants a fresh orientation before acting on a new request
- mentions browser-session work, authenticated browser containers, or noVNC/CDP ports and you need to map the right path
- asks to "explore the skills" or build an overview of the system

## Operating principle

Do not narrate from memory. Read the live workspace.
If a fact can be verified from Vault, a registry, or a current tool output, verify it there.
If the request is ambiguous, resolve the ambiguity before acting.

## Orientation protocol

### 1) Start with Vault
Read the workspace gateway first:
- `vault --help`
- `vault read file="workspace-map" --compact`

Then read the routing and tool reference when needed:
- `vault read file="workspace-clis" --compact`
- `vault read file="trust-map" --compact`
- `vault read file="operating-constraints" --compact`

### 2) Inventory the available capabilities
Use Vault inventory and search to find the exact skill or CLI that fits the request:
- `vault list --compact --brief`
- `vault search query="<task>" --compact`
- `vault search query="<project> project memory" --compact --type doc`

Prefer the smallest relevant skill.
If an existing skill already covers the task, use it instead of inventing a new procedure.

### 3) Check live project truth when the task touches a specific project
When a project matters, read its current memory and registry truth before you act.
Useful evidence sources include:
- `project-memory.md`
- `REGISTRY.md`
- current `git log`
- current tool output from the subsystem you are about to use

### 4) For browser-session work, pair with native Chrome
If the task involves a persistent authenticated browser session, do **not** guess the port.
Use the active native Chrome debugging session and live evidence to confirm:
- Chrome processes running on the host
- CDP remote debugging port (via auto-discovery or environment variables)
- the live tab title and URL

### 5) Summarize only what is current and actionable
End with:
- what is true now
- which skill/CLI should be used next
- what is ambiguous or risky
- what the next concrete command should be

## Output shape
When you use this skill, keep the result compact:
1. Workspace snapshot
2. Relevant skills/CLIs
3. Live evidence you found
4. Recommended next action

## Guardrails
- Do not guess based on stale chat history.
- Do not invent workspace facts.
- Do not skip Vault when the user asked for workspace truth.
- Do not collapse browser-session routing into memory; verify it live.
- Do not turn a simple orientation request into a long report.

## Good defaults
If you are unsure, prefer these defaults:
- `vault read file="workspace-map" --compact`
- `vault list --compact --brief`
- `vault search query="<task>" --compact`
- `agent-browser` for any authenticated browser automation task

## Common handoffs
- Workspace structure unknown → use this skill first
- Browser session/port unclear → verify Chrome process via `ps aux` or `curl /json`
- Need to create or improve a skill → hand off to `skill-creator`
- Need recurring workspace scanning or deep system scan → consider `context-prime`
