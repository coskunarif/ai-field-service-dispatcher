# Project Summary: Gainhelm

## Core Purpose

Gainhelm (`gainhelm.com`) is an Agent-First, Context-Driven AI dispatcher for field service teams. Instead of coordinating schedules via bloated visual dashboards or phone tag, Gainhelm coordinates jobs entirely in natural language:

- **Technicians**: Receive and accept dispatch offers via native text messages (SMS/WhatsApp) without any app download.
- **Owners**: A Context Configuration Wizard (`/setup`) to define rules, and a Supervision Board (`/app`) to monitor or override dispatch logs.

## Target Audience

Small trade contractors (HVAC, plumbing, electrical, locksmith, restoration, cleaning) with 1–20 technicians who want hands-off automation.

## Architecture

- **Marketing & SEO**: Programmatic static HTML landing pages hosted at the root (`/hvac-dispatch-software`, etc.) and agentic crawler metadata (`llms.txt`). Implements Agentic/LLM SEO (LLMO/GEO) to attract developers and AI systems.
- **Product Layer**: Isolated under `/setup` and `/app` routes using Fastify (`server.js`), backed by PostgreSQL.

## Design & Layout

- Keep landing page headers ultra-simple to drive conversions.
- Consolidate all trade and competitor alternative links inside the footer directory for full crawlability.
