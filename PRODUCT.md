# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers who are about to start a new coding project and want to scope it before writing code — including working with Claude Code, Cursor, or another coding agent.

## Product Purpose

CODEPRINT turns a raw idea into structured project documentation — `architecture.md`, `design.md`, `README.md`, a database schema — through a dynamic AI-led interview, so a coding agent (or the developer) has grounded context before implementation begins.

## Positioning

Not a blank chat with an LLM: CODEPRINT is a notebook per project, with a generative interview (interactive scoping-form and document-preview cards inline in the chat, not a rigid form) that produces persistent, versioned documents purpose-built to hand to a coding agent.

## Operating Context

Each notebook (project) has four panels: Chat (the interview), Documents (the generated `.md`/schema files, tabbed), Tracker (a task list for what's being built), and Notes (freeform notes). A project's status moves `interviewing → architecting → completed`.

## Capabilities and Constraints

- **Current phase: mock data, not live backend.** No Convex, no real AI model wired up yet — chat responses, document generation, and the interview are all static/simulated so the UI and interaction can be designed first. This is explicit in the product, not hidden (e.g. toasts and copy say so).
- Tracker and Notes persist per-notebook in `localStorage` (will move to Convex later); Chat/Documents are seeded per-notebook and edits are session-local until the backend lands.
- Toast notifications use `goey-toast` (morphing pill-to-card toasts).
- Auth is a static placeholder screen (`/sign-in`), not wired up.

## Brand Commitments

- Name: **CODEPRINT**. Tagline: "Scope it before you build it."
- Custom logomark: two corner-registration brackets (the blueprint/technical-drawing framing-mark motif), not a lettermark.
- Incumbent visual world (evidence, not a binding constraint — see the open redesign request below): a Vercel-inspired, dark-only, zinc-monochrome aesthetic with restrained motion, established and deliberately kept free of generic "AI app" patterns (no gradient text, no stock icon badges, etc.) over the course of this project's early build.
- **Open redesign in progress:** the user wants a light/dark theme toggle and a new accent direction — white/black/gray with a lime-green accent, referencing a marketing site's card/border treatment for mood and color, not its content or layout. This will be resolved in `new-work` and recorded in `DESIGN.md`.

## Evidence on Hand

No real user data, testimonials, or case studies. All notebook content shown anywhere in the app (chat transcripts, documents, tasks, notes) is clearly-labeled example/seed data for a fictional "Habit Tracker API" / "Recipe Box" / "Local Marketplace" project — nothing is presented as real.

## Product Principles

- Motion and visual flourish are earned, not default — one authored moment per surface, not scattered effects.
- The UI never fakes functionality that isn't there yet; mock-phase interactions are honest about being mock (toasts say so, empty states say so).
- Deep, reusable modules over one-off styling — shared tokens and components (e.g. `StatusBadge`, `WorkspaceTabBar`) instead of re-deriving the same pattern per screen.
