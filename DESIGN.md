# DESIGN.md — GainHelm (AI Field Service Dispatcher) Design Contract

> **Rule: Codebase Wins.** This file is the single visual source of truth for this platform.
> When building or refactoring UI components, dispatch tables, or landing pages, adhere strictly to the tokens, scales, and constraints below.

## 1. Aesthetic Identity & Calibration Dials
- **Domain & Archetype**: B2B Operational SaaS — High-density dispatch dashboard & field service command center.
- **Primary Stack**: `nextjs` (React / Tailwind / Lucide Icons)
- **Design Variance**: `5/10` (Strict, organized, dependable enterprise layout)
- **Motion Intensity**: `3/10` (Subtle status transitions, 150ms hover feedback)
- **Visual Density**: `8/10` (High data density, tabular efficiency, compact rows)

## 2. Color System & Semantic Tokens
- **Canvas / Background**: `#090D16` (Deep Navy Slate) / `#F8FAFC` (Light Mode)
- **Surface / Card**: `#0F172A` (Slate 900) / `#FFFFFF` (White)
- **Border**: `rgba(255, 255, 255, 0.08)` / `#E2E8F0`
- **Primary Accent (Operational Emerald)**: `#10B981` (Dispatched / Available / Active)
- **Warning Accent (Amber)**: `#F59E0B` (Delayed / Pending / Priority)
- **Danger Accent (Rose)**: `#EF4444` (Unassigned Emergency / SLA Breach)
- **Text Primary**: `#F8FAFC` / `#0F172A`
- **Text Muted / Metadata**: `#94A3B8` / `#64748B`
- **Banned**: Low-contrast gray-on-gray table headers, playful bubbly gradients, unreadable neon statuses.

## 3. Typography, Spacing & Layout Rules
- **Font Hierarchy**: `Inter` / `Geist Sans` for UI labels; `JetBrains Mono` for timestamps, job IDs, coordinates, and phone numbers.
- **Table Row Height**: Compact `36px`–`44px` with clear hairline dividing borders (`border-b border-white/5`).
- **Corner Radius**: Sharp & professional `6px` across table containers, buttons, and status tags.
- **Spacing Scale**: 4px base grid (`gap-1.5`, `p-2`, `p-4`).

## 4. Component Standards & Anti-Slop Constraints
- **Data Tables**: Sticky header, sortable columns, inline status badges, keyboard navigation support.
- **Status Badges**: Semi-transparent pill (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`) with 6px dot indicator.
- **Touch & Accessibility**: Minimum 44×44px interactive touch targets for mobile field contractor views.
- **Copy Standards**: Zero marketing fluff on operational interfaces; action-oriented labels (`Assign Tech`, `Trigger Dispatch`, `Export SLA`).
