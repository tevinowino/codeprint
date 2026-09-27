# CODEPRINT: Comprehensive Project Blueprint & Handoff Document

This document serves as the master specification and architectural blueprint for **CODEPRINT**, a modern, Vercel-inspired web application designed to help developers comprehensively scope, architect, and manage projects before writing code. It acts as a "notebook" style environment where raw ideas are transformed into structured markdown artifacts (`architecture.md`, `design.md`, `README.md`, database schemas) through a dynamic, generative AI interview process.

---

## 1. Product Vision & Core Workflow

### The Problem
In the era of AI-assisted coding, the bottleneck has shifted from *writing* code to *architecting, scoping, and maintaining context* across projects to prevent hallucinated scope and messy architectures.

### The Solution (CODEPRINT Workflow)
1. **The Notebook Metaphor:** Similar to Gemini Notebook or NotebookLM, users maintain separate, isolated workspaces ("apps" or "notebooks") for each project they want to build.
2. **The Dynamic Generative Interview:** Instead of a rigid form, an AI acts as a senior product architect. It uses Generative UI to dynamically prompt the user with targeted questions, multi-select options, and scoping components.
3. **Artifact Generation & Export:** Once the project is scoped, the system compiles comprehensive markdown documentation (`architecture.md`, `design.md`, `README.md`, DB schemas) designed to be handed directly to coding agents (like Cursor, Windsurf, or CLI agents).
4. **Chat-to-Modify Loop:** Users can chat with the app post-generation to iteratively refine specific sections (e.g., *"Change the database from PostgreSQL to Supabase and update the schema"*).

---

## 2. Technology Stack

*   **Frontend Framework:** Next.js (App Router)
*   **Styling & UI System:** Tailwind CSS paired with a **Vercel-inspired aesthetic** (deep zinc blacks `#0a0a0a`, fine 1px borders `border-zinc-800`, monochromatic elegance, subtle glows, and clean typography using Geist Font / Inter).
*   **Components:** shadcn/ui (Radix primitives) + Lucide React icons.
*   **Backend & Authentication:** **Convex** (providing real-time reactivity, bulletproof TypeScript type safety from database to frontend, and built-in user authentication).
*   **AI Orchestration:** **Vercel AI SDK** (`ai` and `@ai-sdk/google`) handling text streaming, tool calling, and generative UI.
*   **AI Model Strategy (Primary + Fallback):**
    *   **Primary Model:** **Gemma** (open-source, lightweight, fast).
    *   **Fallback Model:** **Gemini** (robust safety net ensuring 100% uptime and high-end reasoning for complex architecture synthesis).

---

## 3. Database Schema (Convex Backend)

The database schema manages users, isolated project notebooks, dynamic chat history, and versioned markdown documents.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_email", ["email"]),

  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "interviewing" | "architecting" | "completed"
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  documents: defineTable({
    projectId: v.id("projects"),
    title: v.string(), // e.g., "architecture.md", "design.md", "README.md"
    content: v.string(),
    version: v.number(),
    updatedAt: v.number(),
  }).index("by_project_and_title", ["projectId", "title"]),
});
```

---

## 4. AI Integration & Generative UI Architecture

### A. Tool Definitions (Zod Schemas)
The AI is given structured tools via the Vercel AI SDK to render interactive UI components directly in the chat stream instead of relying solely on raw text.

```typescript
// ai/tools.ts
import { tool as createTool } from 'ai';
import { z } from 'zod';

export const projectTools = {
  renderScopingForm: createTool({
    description: 'Render an interactive scoping questionnaire for the user to specify app requirements.',
    inputSchema: z.object({
      question: z.string().describe('The primary question to ask the user'),
      options: z.array(z.string()).describe('Suggested options or choices for the user'),
    }),
    execute: async ({ question, options }) => {
      return { question, options, status: 'pending' };
    },
  }),

  renderDocumentPreview: createTool({
    description: 'Render a live-preview card for the generated markdown documents.',
    inputSchema: z.object({
      docTitle: z.string().describe('Title of the document, e.g., architecture.md'),
      summary: z.string().describe('A brief summary of what this document contains'),
    }),
    execute: async ({ docTitle, summary }) => {
      return { docTitle, summary };
    },
  }),
};
```

### B. API Route with Gemma-to-Gemini Fallback Logic
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { projectTools } from '@/ai/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();

  let result;
  try {
    // Attempt primary open-source model: Gemma
    result = streamText({
      model: google('gemma-2-9b-it'),
      system: `You are CODEPRINT, an elite software architect assistant. You guide users through a dynamic interview to build structural app documentation. Use your tools to render interactive UI components when gathering structured input or presenting results.`,
      messages,
      tools: projectTools,
      maxSteps: 5,
    });
  } catch (error) {
    console.warn('Gemma model failed or rate-limited, failing over to Gemini...', error);
    
    // Fallback model: Gemini
    result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are CODEPRINT, an elite software architect assistant...`,
      messages,
      tools: projectTools,
      maxSteps: 5,
    });
  }

  return result.toDataStreamResponse();
}
```

---

## 5. UI & Design Guidelines (Vercel Aesthetic)
*   **Color Scheme:** Dark mode default. Backgrounds in `bg-zinc-950`, cards in `bg-zinc-900/55` with `border border-zinc-800`.
*   **Typography:** Clean sans-serif hierarchy, subtle text colors (`text-zinc-400` for secondary metadata, `text-zinc-100` for primary headings).
*   **Layout Structure:**
    *   `/dashboard`: Sidebar navigation (`bg-zinc-950 border-r border-zinc-800`) displaying user project notebooks.
    *   `/project/[id]`: Split workspace featuring the generative chat interface on one side and live-rendering markdown preview tabs (`architecture.md`, `design.md`, `README.md`) on the other.

---
*Generated for CODEPRINT — Ready for handoff to Claude.*