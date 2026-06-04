# Gainhelm — App Description & Architecture

## What It Does
Gainhelm (`gainhelm.com`) is an **Agent-First, Context-Driven** AI dispatcher for field service teams. Instead of coordinating schedules via phone tag or bloated calendar dashboards, Gainhelm coordinates jobs entirely in natural language:
- **For Technicians**: 100% headless. Technicians receive and accept dispatch offers via native text messages (SMS/WhatsApp) without downloading or logging into any app.
- **For Owners**: A simple **Context Configuration Wizard** (`/setup`) to load technicians and define business rules, and a **Supervision Board** (`/app`) to monitor or override dispatch logs in real-time.

## Who Uses It
Small trade contractors (HVAC, plumbing, electrical, locksmith, restoration, cleaning) with 1–20 technicians. Owners who waste 3+ hours daily playing middleman between clients and field staff.

## The Problem It Solves
Traditional field service management software (FSM) is bloated and hard to adopt:
- Technicians hate screen-tapping complex scheduling apps while driving or working.
- Owners are forced to manually drag, drop, and reschedule jobs in visual calendar boards all day.
- Mobile apps introduce massive setup friction and constant technical support overhead.

## The Solution: Agent-First Simplicity
Gainhelm replaces the user interface with an **AI Agent**. The dispatcher reads the company's rules, matches incoming requests to the best technician, sends an automated SMS, and books the response into the owner's Google Calendar.

## Monetization
**SaaS Subscription Model** — flat rate or per-technician pricing ($99–$199/mo). Selling **saved time and hands-off automation**, not calendar features.

## Philosophy & SEO
- **Listen Before Building**: Use programmatic SEO and GEO-targeted pages as probes for demand. If Search Console shows recurring intent for a specific category, that trade is prioritized.
- **Split-Level Page Layouts**:
  - Keep landing page headers ultra-simple (Logo, Features, Waitlist) to drive human conversions.
  - Consolidate all 35+ trade and competitor alternative links inside the footer directory so Google can still crawl and index the entire site tree.

## Technical Architecture
- **Marketing & SEO**: Programmatic static HTML landing pages hosted at the root (`/hvac-dispatch-software`, `/plumbing-dispatch-software`, etc.).
- **Product Layer**: Safely isolated under non-indexed `/setup` and `/app` routes in Fastify (`server.js`), backed by PostgreSQL database storage.