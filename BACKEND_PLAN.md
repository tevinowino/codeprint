# CODEPRINT — Backend Implementation Plan

This is the plan for replacing the mock-data phase with a real backend. It assumes the reader has the codebase open but not necessarily fresh context on it — every phase names exact files.

## 0. Where things stand today

The whole app was deliberately built against a **seam**, not scattered mock calls:

- `src/lib/projects.ts` — the only place UI code reads data from. Five async functions (`listProjects`, `getProject`, `getMessages`, `getDocuments`, `getTrackerItems`, `getNotes`), each currently backed by static objects in `src/lib/mock-data.ts`. Every server component (`src/app/(app)/dashboard/page.tsx`, `src/app/(app)/project/[id]/page.tsx`) calls through here, never touches `mock-data.ts` directly.
- `src/domain/types.ts` — the shape contract (`Project`, `ProjectMessage`/`MessagePart`, `ProjectDocument`, `TrackerItem`, `NotebookNote`). These shapes are what the Convex schema needs to match; UI components are typed against them, not against Convex directly.
- **Client-side writes that aren't real yet:**
  - Chat (`src/components/workspace/chat-panel.tsx`) — messages live in local `useState`, seeded from the server props. Sending a message appends locally, waits 2.2s (`SIMULATED_THINKING_MS`), then shows a "wiring lands in a later phase" toast. No real model is called.
  - New notebook (`src/components/dashboard/new-project-dialog.tsx`) — shows a toast, closes, creates nothing.
  - Tracker & Notes (`src/lib/use-tracker.ts`, `src/lib/use-notebook-notes.ts`, built on `src/lib/local-collection.ts`) — genuinely persisted, but to `localStorage`, not a server. Single-device, single-browser only.
  - Auth — **done** (Clerk; see Phase 2). Convex-side ownership checks are still to come.
- **Stack already in place:** Next.js 16 App Router, TypeScript, Tailwind v4. No backend packages installed yet (`package.json` has no `convex`, `ai`, or `@ai-sdk/*`).
- **Decided earlier this session:** AI model is **Gemini only** (via `@ai-sdk/google`) — the blueprint's Gemma-primary/Gemini-fallback design is out of scope; a `streamText` try/catch fallback wouldn't work anyway since errors surface mid-stream, not at call time. **Re-confirmed below (§1a) after checking current pricing and Gemma's actual hosting options** — the conclusion still holds, now with evidence.
- **New this pass:** dictation (speak instead of type in the composer) — researched in §1b, recommendation is the browser's native Web Speech API, not a paid transcription service.

The migration strategy for every phase below is the same: **implement the Convex functions, then change only `lib/projects.ts` (plus the specific client hook for writes) to call them instead of the mock data** — no component should need to change its own code, since they're already typed against `domain/types.ts`, not against the mock shape.

## 1. Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Database + backend functions | **Convex** | Already the blueprint's stated choice — real-time queries, end-to-end TypeScript types, no separate ORM/migration tooling. |
| Auth | **Clerk** (`@clerk/nextjs`) + Convex's Clerk integration | Google OAuth and email/password out of the box with prebuilt `<SignIn/>`/`<SignUp/>`; Convex validates Clerk's JWT via `convex/auth.config.ts`, so `ctx.auth.getUserIdentity()` works in every function. |
| AI orchestration | **Vercel AI SDK** (`ai`) + `@ai-sdk/google` | Already the blueprint's choice; its tool-calling shape is what `MessagePart`'s `tool-renderScopingForm` / `tool-renderDocumentPreview` variants were modeled on. |
| Model | **`gemini-flash-lite`** (cheapest current flash-lite model — see §1a for the exact ID to use at build time) | Free tier, no card required; §1a has the evidence. |
| Dictation | **Browser-native `SpeechRecognition`** (Web Speech API) | Free, zero backend, zero API quota spent. See §1b. |
| Validation | Convex's own `v.*` validators for schema; keep `zod` (already informally in use via `TrackerItemSchema` in `domain/types.ts`) for anything validated in client code before it reaches a mutation. | Convex doesn't accept zod schemas directly in `defineSchema` — don't fight that; use `v` for the schema, keep zod only where it already lives. |

### 1a. Model choice, pricing, and the Gemma question

Checked directly against `ai.google.dev` (Gemini API docs, pricing page, rate-limits page, models page) and `ai.google.dev/gemma`, not from memory — pricing pages change often and "keep this free" is a hard constraint, so it's worth the primary-source check.

**The free tier is actually free, not a trial:**
- No billing account has to be linked to use the free tier at all — that's an explicit, separate step ("Set up and link an active billing account") only required to move to a *paid* usage tier.
- Going over a free-tier rate limit returns an HTTP `429 RESOURCE_EXHAUSTED` error. It does **not** silently start billing — there's no billing account attached for it to bill *to*. Worst case on the free tier is "the request fails," never "a surprise charge."
- This means: as long as the Convex deployment's `GOOGLE_GENERATIVE_AI_API_KEY` is an API key from an AI Studio project with **no billing account linked**, this stays free by construction — there's no accidental-overage failure mode to guard against in code.

**Model pricing (paid-tier numbers, for context on what free tier is worth — these don't apply unless billing is explicitly enabled later):**

| Model | Input $/1M tokens | Output $/1M tokens | Notes |
|---|---|---|---|
| `gemini-2.5-flash` | $0.30 | $2.50 | Current stable flash model. |
| `gemini-2.5-flash-lite` | $0.10 | $0.40 | Cheapest 2.5-series option. |
| newest flash-lite (post-2.5, check exact current ID in AI Studio at build time) | promotional-free through end of 2026, then ~$0.75–1.50 | ~$3.75 | Google's pricing pages show a newer generation than `gemini-2.5-flash` now exists; confirm the exact model ID string in `aistudio.google.com` before wiring `@ai-sdk/google`, since these IDs shift and a stale hardcoded string is a real failure mode (a typo'd model ID just 404s). |

None of this matters for cost as long as billing stays unlinked — the table is here so a future "should we enable billing to get X" decision has real numbers next to it, not a guess.

**Recommendation: pick whichever current flash-lite model AI Studio lists as the cheapest/fastest at build time** (the exact ID drifts — verify in `aistudio.google.com/apikey` → model list right before writing `convex/ai/chat.ts`, don't trust a hardcoded ID from this doc). Flash-lite over full flash: CODEPRINT's system prompt (scoping questions, tool calls, doc generation) doesn't need frontier reasoning quality, and flash-lite's free-tier headroom is larger since it's cheaper per token even in the hypothetical paid case.

**The Gemma question — verdict: don't use it, keep it out of this app.**

Checked `ai.google.dev/gemma/docs/get_started` directly: Gemma (all generations — 1 through the current one, 270M through 27B+ parameter sizes) is an **open-weights model family, not a hosted API**. Confirmed separately against the Gemini API's own models listing: **no Gemma variant is callable through the Gemini API** (the same endpoint/API key that serves `gemini-*` models). Gemma's actual paths are:
- Self-host it yourself (Ollama, llama.cpp, LM Studio, MLX) — needs a machine with enough RAM/VRAM to hold the weights, running continuously to serve requests. Not something a Vercel/Convex-hosted web app can do; this would mean the user's own computer has to be on and running an inference server for the app to work.
- Vertex AI or another paid cloud host — real, ongoing infrastructure cost, the opposite of "keep it free."

So the blueprint's original "Gemma primary, Gemini fallback" design was never viable as written — there's no free hosted way to call Gemma at all, hosted or not. This isn't a new problem introduced by the earlier "Gemini only" decision; researching it now just confirms that decision was correct, for a more specific reason than "the fallback logic doesn't work": **Gemma has no free hosted API, period.** Stick with Gemini's free tier.

### 1b. Dictation (speak instead of type)

Checked MDN's `SpeechRecognition` docs directly. Two real implementation paths exist:

**Option A — Web Speech API (`SpeechRecognition`), recommended:**
- Genuinely free, built into the browser, no API key, no backend round-trip through this app's own servers, doesn't touch the Gemini quota at all.
- Chrome/Edge (Chromium) actually route the audio to a Google cloud recognizer under the hood — but that's Google's own free consumer feature, not something this app pays for or configures.
- **The real limitation: browser support is inconsistent.** MDN flags it as "not Baseline" — meaning it doesn't work uniformly across the widely-used browsers. Chrome/Edge: solid support. Safari: partial/prefixed support historically. Firefox: limited/behind-flag support historically. Check current per-browser status on MDN's compatibility table before shipping, since this shifts version to version.
- Implementation is small: `new SpeechRecognition()` (or `webkitSpeechRecognition` for the prefixed fallback), `continuous`/`interimResults`/`lang` config, `onresult` appends transcribed text into the composer's existing controlled `value` state.

**Option B — send recorded audio to Gemini (multimodal input or a dedicated transcription model):** works in any browser (record via `MediaRecorder`, upload the audio blob), but costs a real round trip to the backend, spends API quota (free-tier, but still a request against the same rate limits the chat itself uses), and is meaningfully more code (record → encode → upload → transcribe → insert text) for a feature that's fundamentally "fill in a text box."

**Recommendation: ship Option A only, in `src/components/workspace/composer.tsx`.** Add a mic icon-button next to the send button; while listening, append `onresult` transcripts into the existing `value`/`setValue` state — no new component needed, no new dependency, no backend change at all. Feature-detect (`"webkitSpeechRecognition" in window || "SpeechRecognition" in window`) and simply hide the mic button when unsupported, rather than showing a broken control — this is a progressive enhancement, not a requirement to type. Revisit Option B only if real usage shows the unsupported-browser gap actually matters.

## Implementation status

| Phase | State | Where |
|---|---|---|
| 0 Convex setup | Done | `convex/`, `ConvexProviderWithClerk` in `src/components/providers.tsx` |
| 1 Schema | Done (parts union tightened from the start, not `v.any()`) | `convex/schema.ts`, `convex/validators.ts` |
| 2 Auth | Done (Clerk) | see Phase 2 below |
| 3 Projects / documents / messages | Done | `convex/{projects,documents,messages}.ts`, `src/lib/use-projects.ts`, `use-project-chat.ts` |
| 4 Tracker & notes | Done, `localStorage` collection deleted | `convex/{trackerItems,notes}.ts`, `src/lib/use-tracker.ts`, `use-notebook-notes.ts` |
| 4.5 Dictation | Done earlier | `src/lib/use-dictation.ts` |
| 5 AI chat | Done | `convex/ai.ts`, `aiPrompt.ts`, `aiState.ts`, `replyWriter.ts` |
| 6 Document generation | Done (tools: `writeDocument`, `updateProjectStatus`) | `convex/ai.ts` |
| 7 Hardening | Partly done | per-user rate limit (40 AI requests/hour, `aiRequests` table), error text written into the chat, empty/loading states, `mock-data.ts` removed. **Not done:** production deploy wiring (below). |

Decisions taken (these answer the "Open decisions" list at the bottom):

1. **AI architecture:** neither of the two options offered. `messages.send` inserts the user message plus an empty streaming assistant message and schedules `internal.ai.respond`. That action streams Gemini's output into the assistant message row (throttled to about 4 writes/second) and runs tools server-side. The UI is a reactive `useQuery`, so text simply appears, works across tabs, and needs no HTTP streaming or second auth path.
2. **IDs:** Convex functions take plain `string` ids and resolve them with `db.normalizeId`, and return DTOs (`convex/dtos.ts`) shaped like `src/domain/types.ts`. The UI never sees `_id`/`_creationTime`, and a garbage URL id yields "not found" rather than an error.
3. **Scoping form:** answering auto-continues the conversation (`messages.answerScopingForm` records the selection and starts the next turn).
4. **`mock-data.ts`:** removed. There is no demo-data seed.
5. **Status transitions:** model-driven via `updateProjectStatus`, guided by stage-specific instructions in `convex/aiPrompt.ts`. `projects.updateStatus` exists as a manual override but has no UI yet.
6. **Dictation:** Option A only (mic hidden where unsupported).
7. **Model:** `gemini-3.1-flash-lite` (verified against the live models list). Override with `npx convex env set GEMINI_MODEL <id>`.

Convex env vars set on the dev deployment: `CLERK_JWT_ISSUER_DOMAIN`, `GOOGLE_GENERATIVE_AI_API_KEY`.

Known gaps / next steps:

- **Production deploy is not wired.** Create a production Convex deployment; set `CLERK_JWT_ISSUER_DOMAIN`, `GOOGLE_GENERATIVE_AI_API_KEY` (and optionally `GEMINI_MODEL`) on it; on Vercel use the build command `npx convex deploy --cmd 'npm run build'` with `CONVEX_DEPLOY_KEY` set, so the schema is never stale relative to the frontend.
- There is no delete-notebook function or UI, and no cascade for child rows when one is added.
- The AI action holds the whole document set in the prompt; fine for four documents, revisit if notebooks grow large.
- Free-tier Gemini 429s are reported in the chat as "quota used up, try again in a minute"; there is no automatic retry.

## Phase 0 — Convex project setup

1. `npm install convex` and run `npx convex dev` once to scaffold `convex/` and get a deployment URL. Add `convex/_generated` to `.gitignore` if the CLI doesn't already.
2. Add `ConvexClientProvider` (a client component wrapping `ConvexReactClient`) and mount it in `src/components/providers.tsx`, alongside the existing `ThemeProvider`/`TooltipProvider`. This is additive — doesn't change existing behavior yet.
3. Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local` (and to whatever hosting platform's env config later).
4. Verify: `npx convex dev` running alongside `npm run dev`, a trivial `convex/ping.ts` query callable from a throwaway component, confirming the client actually connects. Delete the throwaway once confirmed.

## Phase 1 — Schema (`convex/schema.ts`)

Mirrors `src/domain/types.ts` field-for-field. Convex's own `_id`/`_creationTime` replace the mock data's `id`/`createdAt` string-and-number fields, so mutations will need to map between them at the API boundary (or the client types can be adjusted to accept Convex's native fields — see "Open decisions" below).

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    ownerId: v.string(), // Clerk user id (identity.subject); there is no Convex `users` table
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("interviewing"),
      v.literal("architecting"),
      v.literal("completed")
    ),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_and_updated", ["ownerId"]), // sort by _creationTime/updatedAt in the query

  messages: defineTable({
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    // Store parts as-is; MessagePart's discriminated union maps directly to this.
    parts: v.array(v.any()), // tightened below, see note
  }).index("by_project", ["projectId"]),

  documents: defineTable({
    projectId: v.id("projects"),
    title: v.string(), // "architecture.md", "design.md", etc.
    content: v.string(),
    version: v.number(),
  }).index("by_project_and_title", ["projectId", "title"]),

  trackerItems: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    completed: v.boolean(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("almost_completed"),
      v.literal("completed"),
      v.literal("on_hold")
    ),
  }).index("by_project", ["projectId"]),

  notes: defineTable({
    projectId: v.id("projects"),
    content: v.string(),
  }).index("by_project", ["projectId"]),
});
```

Notes on the deviations from a literal 1:1 mapping:

- **`v.array(v.any())` for `parts`** — Convex validators can express a proper discriminated union (`v.union(v.object({type: v.literal("text"), text: v.string()}), ...)`), and that's the *right* long-term choice for catching bad writes at the schema level. Start with `v.any()` to unblock Phase 3 quickly, then tighten to the full union once the three part types stop changing (`TextPart`/`ScopingFormPart`/`DocumentPreviewPart` in `domain/types.ts`) — don't do it twice.
- **No `userId` on `trackerItems`/`notes`/`messages`/`documents`** — they're scoped through `projectId`, and `projects.ownerId` is the actual ownership boundary. Every query/mutation on these child tables must still verify the caller owns the parent project (see Phase 2's auth-check pattern) — Convex doesn't enforce foreign-key ownership for you.
- **`updatedAt` fields are dropped** — Convex's built-in `_creationTime` covers `createdAt`; for `updatedAt` (used by documents, tracker items, notes for "Updated 3 hours ago" copy), either add it back explicitly as a field a mutation must remember to bump, or accept `_creationTime` as a stand-in only where nothing is ever edited in place (messages, tracker item creation). Documents and notes **are** edited in place, so they need a real `updatedAt` field, set explicitly on every mutation that touches `content`.

Run `npx convex dev` after writing this — it type-checks the schema and regenerates `convex/_generated/dataModel.d.ts`, which is what all the functions below import types from.

## Phase 2 — Auth (DONE: Clerk)

Sign-in with **Google** and **email + password** via Clerk. Implemented:

1. `@clerk/nextjs` installed; `ClerkProvider` in `src/app/layout.tsx` themed from the app's CSS variables (`src/lib/clerk-theme.ts`), so it follows light/dark.
2. Prebuilt `<SignIn/>` / `<SignUp/>` at `src/app/sign-in/[[...sign-in]]` and `src/app/sign-up/[[...sign-up]]`, inside `AuthShell`.
3. Route protection in `src/proxy.ts` (Next 16's replacement for `middleware.ts`): `/dashboard(.*)` and `/project(.*)` call `auth.protect()`. `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` is required so unauthenticated users land on the local page, not Clerk's hosted portal.
4. `UserMenu` reads `useUser()`; "Sign out" calls `signOut`, "Account settings" opens Clerk's profile modal.
5. Convex bridge: `ConvexProviderWithClerk` in `providers.tsx`; a Clerk JWT template named `convex` (`aud: "convex"`) exists on the dev instance; `convex/auth.config.ts` trusts `CLERK_JWT_ISSUER_DOMAIN`, set on the Convex deployment with `npx convex env set`.
6. **Still required in every Convex function (Phase 3+):** call `ctx.auth.getUserIdentity()`, reject when null, and scope data by `identity.subject` stored as `projects.ownerId`. This is the real multi-tenancy boundary; the proxy only protects pages.

**Before production:** Clerk dev instances use shared Google OAuth credentials. Create your own Google OAuth client (Google Cloud Console → Credentials), add it in Clerk → SSO connections → Google, then create a production Clerk instance, recreate the `convex` JWT template there, and set `CLERK_JWT_ISSUER_DOMAIN` on the production Convex deployment.

## Phase 3 — Core data: projects, documents, messages

This phase turns the dashboard and workspace from mock-fed into live-fed, with **no AI yet** — messages/documents still need to come from *somewhere*, so this phase also includes a one-time seed script (or manual creation via the now-working "New notebook" dialog) rather than trying to land AI generation in the same phase.

1. `convex/projects.ts`:
   - `list` (query) — `projects` where `ownerId == identity.subject`, ordered by `_creationTime` desc (or an explicit `updatedAt` if added).
   - `get` (query, by `projectId`) — verify `ownerId` matches before returning.
   - `create` (mutation) — `title`, optional `description`, default `status: "interviewing"`. This is what `new-project-dialog.tsx` calls instead of just toasting.
   - `updateStatus` (mutation) — for the interviewing → architecting → completed transitions (used by AI-driven status changes in Phase 6, and possibly a manual override).
2. `convex/documents.ts`: `listForProject` (query), `upsert` (mutation — creates or bumps `version` + `updatedAt` on an existing title).
3. `convex/messages.ts`: `listForProject` (query), `send` (mutation — inserts a `user`-role message; the `assistant` side is Phase 5).
4. Update `src/lib/projects.ts`: replace the mock-backed bodies with calls to these Convex functions via `fetchQuery`/`fetchMutation` (Convex's server-side helpers for use inside React Server Components) — **the function signatures in this file don't need to change**, so nothing calling `listProjects()` etc. needs touching.
5. Update `src/components/dashboard/new-project-dialog.tsx` to call the `create` mutation (via `useMutation`) instead of `gooeyToast.success(...)` + closing — keep a success toast, just make it follow a real write, and navigate to the new project.
6. Update `src/components/workspace/chat-panel.tsx`'s `handleSend` to call the real `send` mutation instead of local `setState` — but **leave the simulated "Thinking…" delay and toast in place until Phase 5**; this phase is data plumbing, not AI.
7. Switch `ChatPanel`/`DocumentPanel` from the current "seeded once via props, then local state" pattern to Convex's `useQuery` (live-updating) once messages/documents genuinely come from the server — this is also where real-time reactivity starts paying off (a doc generated by AI in Phase 6 will just appear, no refresh).
8. **`mock-data.ts` stays** through this phase as the source for a one-time seed script (`convex/seed.ts` or a `scripts/seed.ts` run via `npx convex run`) so the three example notebooks (Habit Tracker API, Recipe Box, Local Marketplace) still exist for manual testing — don't throw away good demo content, just stop reading it live.

## Phase 4 — Tracker & Notes (move off localStorage)

Straightforward once Phase 3's pattern exists — same shape, different table.

1. `convex/trackerItems.ts`: `listForProject`, `create`, `setStatus` (mutation taking the new 5-state enum), `remove`.
2. `convex/notes.ts`: `listForProject`, `create`, `update` (content + bump `updatedAt`), `remove`.
3. Replace `src/lib/use-tracker.ts` and `src/lib/use-notebook-notes.ts` internals: swap `useLocalCollection` for Convex's `useQuery` (read) + `useMutation` (each write action) pairs. **Keep the same exported hook shape** (`{ items, addItem, setItemStatus, toggleItem, removeItem }` / `{ notes, addNote, updateNote, removeNote }`) so `TrackerPanel`/`TrackerItem`/`NotesPanel`/`NoteCard` need zero changes.
4. Delete `src/lib/local-collection.ts` and its test once nothing imports it — check first (`grep -r local-collection src`), since it was written as a generic primitive and nothing else should depend on it, but verify.
5. This is the one phase where real-time reactivity is immediately visible and testable: open the same notebook in two browser tabs, add a task in one, watch it appear in the other without a refresh.

## Phase 4.5 — Dictation (no backend dependency, can ship any time)

Unlike everything else in this doc, this needs **no Convex, no phase ordering, no waiting** — it's pure frontend, per §1b. Worth calling out separately so it doesn't get stuck queued behind AI work it doesn't actually depend on.

1. Add a mic `Button` (icon-only, matching the existing send button's styling) to `src/components/workspace/composer.tsx`.
2. On click: feature-detect `SpeechRecognition`/`webkitSpeechRecognition`; if absent, don't render the button at all rather than showing a dead control.
3. Start recognition (`continuous: true`, `interimResults: true` for live feedback as the user talks), append `onresult` transcripts into the existing `value` state the textarea already controls.
4. Stop on: clicking the mic again, the `onend` event, or the user hitting send.
5. Test: this is a genuine "look at it in a real browser" feature — jsdom has no `SpeechRecognition` to test against, so this is verified by hand in Chrome (works) and whichever browser the user actually uses day to day, not by a unit test asserting the mock fired.

## Phase 5 — Real AI chat

This is the biggest phase. Two things need to happen together: streaming a real model response, and persisting the conversation so it survives a reload (Convex's HTTP actions + the AI SDK's streaming both need to agree on one source of truth).

1. `npm install ai @ai-sdk/google`.
2. `GOOGLE_GENERATIVE_AI_API_KEY` in env vars (server-only, never exposed to the client).
3. Define the two tools from the blueprint, typed against the existing `ScopingFormPart`/`DocumentPreviewPart` shapes so there's no drift between what the model can call and what `MessageItem` (`src/components/workspace/message-item.tsx`) already knows how to render:
   ```ts
   // convex/ai/tools.ts (or app/api/chat/tools.ts, see architecture note below)
   import { tool } from "ai";
   import { z } from "zod";

   export const projectTools = {
     renderScopingForm: tool({
       description: "Render an interactive scoping questionnaire for the user.",
       inputSchema: z.object({
         question: z.string(),
         options: z.array(z.string()),
       }),
     }),
     renderDocumentPreview: tool({
       description: "Render a live-preview card for a generated document.",
       inputSchema: z.object({
         docTitle: z.string(),
         summary: z.string(),
       }),
     }),
   };
   ```
4. **Architecture decision to make explicitly (see "Open decisions" below): where does `streamText` run?** Two real options:
   - **(a) Next.js Route Handler** (`src/app/api/chat/route.ts`, matching the blueprint's original sketch) that reads/writes messages through Convex via `fetchQuery`/`fetchMutation`, streams the response back to the client, and the client also calls a Convex mutation to persist the finished assistant message once streaming completes.
   - **(b) Convex HTTP Action** (`convex/http.ts`), keeping the model call inside Convex entirely, which simplifies auth (reuses `ctx.auth` directly, no separate session-passing to a Next.js route) and keeps "where is the data" and "where is the AI" in one place.
   - **Recommendation: (b).** It's less plumbing (no duplicate auth check in two places), and Convex actions can call `ctx.runMutation` to persist streamed chunks/tool calls as they arrive, which is what makes the chat feel real-time across tabs/devices, not just to the tab that sent the message.
5. System prompt: adapt the blueprint's ("You are CODEPRINT, an elite software architect assistant...") — this is a copy/product decision, not an engineering one; write it once real usage patterns from Phase 3's seeded conversations (`mock-data.ts`'s `mockMessages`) are available as a style reference, since those transcripts are the closest thing to an approved "voice" that exists right now.
6. Replace `ChatPanel`'s `SIMULATED_THINKING_MS` timeout + static toast with the real streaming state: the `isPending`/`ThinkingOrb` UI (`src/components/workspace/chat-panel.tsx`) already exists and just needs to be driven by the real "is the model currently responding" state instead of a `setTimeout`.
7. `ScopingFormCard`'s answer submission (`src/components/generative/scoping-form-card.tsx`) currently just mutates local message state (`handleAnswerScopingForm` in `chat-panel.tsx`). Once real, submitting an answer should both update that message's part (so it renders as answered) **and** send the answer back to the model as the next turn — check the exact UX with the user before building; it's a real product decision (does answering a scoping-form chip auto-continue the conversation, or does the user still have to hit send?).

## Phase 6 — Document generation

Depends on Phase 5 existing (the model needs to be in a live conversation to decide *when* to generate a document).

1. Add a third tool, `writeDocument` (title, content) — when the model calls it, the action persists via the `documents.upsert` mutation from Phase 3 and emits a `renderDocumentPreview` part in the same assistant message (matching the existing UI pattern where a doc-preview card and the "Open document →" link already work against real documents).
2. Status transitions (`interviewing → architecting → completed`): decide the trigger — likely the model calling `updateStatus` itself once it judges enough has been scoped to start drafting, and again once all expected documents (`architecture.md`, `design.md`, `README.md`, schema) exist. This needs an explicit rule set in the system prompt, not just implicit model judgment, or status will drift inconsistently across projects.
3. Chat-to-modify loop (blueprint's "change the database from PostgreSQL to Supabase and update the schema" example): once a project is `completed`, a new user message should still be able to trigger a `writeDocument` call that bumps an existing doc's `version` — this is the same tool, no new mechanism needed, just confirm the system prompt covers "editing an already-generated doc" as an explicit case, not just "generating for the first time."

## Phase 7 — Production hardening

- Remove `src/lib/mock-data.ts` and the seed-script dependency on it, **or** keep it purely as `convex/seed.ts`'s fixture data for local dev/demo accounts — decide based on whether a "try it with example data" onboarding flow is wanted later.
- Rate limiting on the AI HTTP action (Convex has patterns for this; a naive per-user request counter in a table is enough to start).
- Error states: a failed `streamText` call needs a real error message in the chat, not a silent failure — audit `ChatPanel` for this once Phase 5 lands.
- Loading/empty states audit: `DocumentPanel`, `TrackerPanel`, `NotesPanel` already have empty states for the mock-empty case (`proj_marketplace` has zero docs in mock data) — verify they still read correctly for a *brand-new real project* with zero of everything, not just the specific empty projects mock data happened to include.
- Deployment: Convex has its own deploy step (`npx convex deploy`) separate from the Next.js host's build — document the two-step deploy (or wire a `postbuild`/CI step) so a Vercel deploy doesn't silently ship against a stale Convex schema.

## Testing

Per the existing test stack (Vitest + Testing Library, already configured in `vitest.config.mts`):

- Convex functions: use `convex-test` (Convex's own Vitest-compatible harness) for `convex/*.ts` — test queries/mutations against an in-memory Convex instance, not against a real deployment. New test files live next to their function file (`convex/trackerItems.test.ts`, matching this project's established colocated-test convention).
- Component tests that currently pass `initialItems`/`initialMessages` as static props (`tracker-panel.test.tsx`, `notes-panel.test.tsx`, `document-panel.test.tsx`) will need their Convex hooks mocked once those components switch to `useQuery`/`useMutation` — Convex's React bindings are mockable the same way `goey-toast` and other hooks already are in this codebase's tests (see `document-panel.test.tsx` for the existing pattern of mocking a toast call).
- Keep the DAMP style already established: don't extract a shared "mock Convex project" fixture that hides what each test is actually asserting.

## Environment variables checklist

```
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=              # set by `npx convex dev`/`deploy`, not hand-written
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# set on the Convex deployment (npx convex env set), not in .env.local:
# CLERK_JWT_ISSUER_DOMAIN=https://<name>.clerk.accounts.dev
GOOGLE_GENERATIVE_AI_API_KEY=   # from an AI Studio project with NO billing account linked — see §1a
```

No env var is needed for dictation — the Web Speech API is a browser feature, not a service this app calls into.

## Open decisions (need the user's input before or during the relevant phase)

1. **Phase 5 architecture:** Next.js Route Handler vs. Convex HTTP Action for `streamText`. Plan recommends the Convex HTTP Action; confirm before building.
2. **ID shape:** keep `domain/types.ts`'s `id: string` fields as string aliases of Convex's `Id<"projects">` etc. (simplest, no type changes), or embrace Convex's native `Id<T>` types throughout and update the domain layer — affects how much of `domain/types.ts` changes in Phase 1 vs. staying untouched.
3. **Scoping-form answer flow** (Phase 5, point 7): does answering auto-continue the conversation, or wait for an explicit send?
4. **`mock-data.ts`'s fate** (Phase 7): demo-account fixture vs. fully removed.
5. **Status-transition triggers** (Phase 6): fully model-driven vs. a manual override control in the UI as a fallback if the model doesn't reliably call `updateStatus`.
6. **Dictation's unsupported-browser gap** (§1b/Phase 4.5): ship with the mic button silently absent where `SpeechRecognition` doesn't exist (recommended), or invest in the Option B fallback (record + send to Gemini) so dictation works everywhere from day one?
