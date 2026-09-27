import type {
  Project,
  ProjectDocument,
  ProjectMessage,
} from "@/domain/types";

const HOUR = 1000 * 60 * 60;
const now = Date.now();

export const mockProjects: Project[] = [
  {
    id: "proj_habit_tracker",
    title: "Habit Tracker API",
    description: "Streak-based habit tracking with a public API for third-party clients.",
    status: "architecting",
    createdAt: now - HOUR * 26,
    updatedAt: now - HOUR * 2,
  },
  {
    id: "proj_recipe_box",
    title: "Recipe Box",
    description: "Private recipe manager that imports recipes from any URL.",
    status: "completed",
    createdAt: now - HOUR * 96,
    updatedAt: now - HOUR * 20,
  },
  {
    id: "proj_marketplace",
    title: "Local Marketplace",
    status: "interviewing",
    createdAt: now - HOUR * 1,
    updatedAt: now - HOUR * 1,
  },
];

export const mockMessages: Record<string, ProjectMessage[]> = {
  proj_habit_tracker: [
    {
      id: "msg_1",
      projectId: "proj_habit_tracker",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Let's scope Habit Tracker API. What's the core loop for a user in one sentence?",
        },
      ],
      createdAt: now - HOUR * 26,
    },
    {
      id: "msg_2",
      projectId: "proj_habit_tracker",
      role: "user",
      parts: [
        {
          type: "text",
          text: "A user checks in daily on habits they've created, and sees a streak count per habit.",
        },
      ],
      createdAt: now - HOUR * 26 + 1000 * 60 * 2,
    },
    {
      id: "msg_3",
      projectId: "proj_habit_tracker",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Good. How should other developers consume this — is the public API read-only, or can third parties write check-ins on a user's behalf?",
        },
        {
          type: "tool-renderScopingForm",
          question: "API access model",
          options: [
            "Read-only public API",
            "Full read/write via API keys",
            "OAuth on behalf of users",
          ],
          selected: ["Full read/write via API keys"],
        },
      ],
      createdAt: now - HOUR * 26 + 1000 * 60 * 3,
    },
    {
      id: "msg_4",
      projectId: "proj_habit_tracker",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Got it — API keys with full read/write. I've drafted the data layer and API surface.",
        },
        {
          type: "tool-renderDocumentPreview",
          docTitle: "architecture.md",
          summary: "Data model for habits/check-ins, streak calculation rules, and the public REST surface for API-key clients.",
        },
        {
          type: "tool-renderDocumentPreview",
          docTitle: "schema.sql",
          summary: "Postgres schema: users, habits, check_ins, api_keys, with a unique constraint keeping one check-in per habit per day.",
        },
      ],
      createdAt: now - HOUR * 2,
    },
  ],
  proj_recipe_box: [
    {
      id: "msg_5",
      projectId: "proj_recipe_box",
      role: "assistant",
      parts: [
        { type: "text", text: "Recipe Box is fully scoped. All documents are ready in the panel." },
        {
          type: "tool-renderDocumentPreview",
          docTitle: "README.md",
          summary: "Setup instructions and the recipe-import flow overview.",
        },
      ],
      createdAt: now - HOUR * 20,
    },
  ],
  proj_marketplace: [
    {
      id: "msg_6",
      projectId: "proj_marketplace",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Let's start scoping Local Marketplace. Who are the two sides of this marketplace, and what does a successful transaction look like between them?",
        },
      ],
      createdAt: now - HOUR * 1,
    },
    {
      id: "msg_7",
      projectId: "proj_marketplace",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Neighbors selling household items to other neighbors nearby — a transaction succeeds when both sides confirm a handoff in person.",
        },
      ],
      createdAt: now - HOUR * 1 + 1000 * 60,
    },
    {
      id: "msg_8",
      projectId: "proj_marketplace",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "In-person handoff, no shipping — that simplifies things a lot. How should payment work?",
        },
        {
          type: "tool-renderScopingForm",
          question: "Payment handling",
          options: [
            "Cash only, app just coordinates",
            "In-app payment, held until handoff",
            "Buyer and seller settle outside the app",
          ],
        },
      ],
      createdAt: now - HOUR * 1 + 1000 * 60 * 2,
    },
  ],
};

const habitArchitecture = `# Architecture — Habit Tracker API

## Overview
A streak-based habit tracker exposing a public, API-key-authenticated REST surface so third-party clients can build on top of user habit data.

## Core Entities
- **User** — owns habits, authenticates via email + password.
- **Habit** — a recurring commitment (\`name\`, \`cadence\`, \`createdAt\`).
- **CheckIn** — one record per habit per calendar day. Uniqueness is enforced at the database level to prevent duplicate streak inflation.
- **ApiKey** — scoped credential issued per user for third-party read/write access.

## Streak Calculation
Streaks are computed on read, not stored, to avoid drift between the stored counter and actual check-in history:

1. Fetch check-ins for a habit ordered by date descending.
2. Walk backward from today (or yesterday, if today has no check-in yet) counting consecutive days.
3. Stop at the first gap.

## Public API Surface
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /v1/habits | API key | List habits for the authenticated user |
| POST | /v1/habits | API key | Create a habit |
| POST | /v1/habits/:id/checkins | API key | Record today's check-in |
| GET | /v1/habits/:id/streak | API key | Current streak length |

## Open Questions
- Should third parties be able to create habits on a user's behalf, or only check in on existing ones?
`;

const habitSchema = `-- schema.sql — Habit Tracker API

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  cadence text not null default 'daily',
  created_at timestamptz not null default now()
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  checked_in_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, checked_in_on)
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  key_hash text unique not null,
  label text,
  created_at timestamptz not null default now()
);
`;

const habitDesign = `# Design — Habit Tracker API

## Principles
- **Zero client required.** Every capability must work from a raw HTTP client with an API key — the dashboard is a convenience layer, not the source of truth.
- **Streaks are earned, not stored.** See architecture.md for why streaks are computed on read.

## Dashboard (internal, not part of the public API)
- Habit list as a single-column stack of cards, each showing name, current streak, and a "Check in" button.
- Checking in today disables the button and shows a filled flame icon; unchecked days show an outline flame.

## Error Model
All API errors return \`{ "error": { "code": string, "message": string } }\` with a matching HTTP status. Codes are stable identifiers (\`HABIT_NOT_FOUND\`, \`DUPLICATE_CHECK_IN\`) that clients can branch on without parsing message text.
`;

const recipeReadme = `# Recipe Box

Private recipe manager that imports recipes directly from a URL.

## Import Flow
1. Paste a recipe URL.
2. The server fetches the page and extracts structured recipe data (ingredients, steps, times) via schema.org \`Recipe\` metadata where present, falling back to heuristic HTML parsing.
3. The parsed recipe is shown for review before saving — imports are never saved silently.

## Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`
`;

const recipeArchitecture = `# Architecture — Recipe Box

## Core Entities
- **Recipe** — title, ingredients (structured list), steps, source URL, imported-at timestamp.
- **Collection** — user-defined grouping of recipes (e.g. "Weeknight dinners").

## Import Pipeline
URL → fetch HTML → look for \`application/ld+json\` with \`@type: Recipe\` → normalize into our Recipe shape → present as a draft for the user to confirm or edit before it's persisted.
`;

export const mockDocuments: Record<string, ProjectDocument[]> = {
  proj_habit_tracker: [
    {
      id: "doc_1",
      projectId: "proj_habit_tracker",
      title: "architecture.md",
      content: habitArchitecture,
      version: 3,
      updatedAt: now - HOUR * 2,
    },
    {
      id: "doc_2",
      projectId: "proj_habit_tracker",
      title: "design.md",
      content: habitDesign,
      version: 1,
      updatedAt: now - HOUR * 3,
    },
    {
      id: "doc_3",
      projectId: "proj_habit_tracker",
      title: "schema.sql",
      content: habitSchema,
      version: 2,
      updatedAt: now - HOUR * 2,
    },
  ],
  proj_recipe_box: [
    {
      id: "doc_4",
      projectId: "proj_recipe_box",
      title: "README.md",
      content: recipeReadme,
      version: 1,
      updatedAt: now - HOUR * 20,
    },
    {
      id: "doc_5",
      projectId: "proj_recipe_box",
      title: "architecture.md",
      content: recipeArchitecture,
      version: 2,
      updatedAt: now - HOUR * 21,
    },
  ],
  proj_marketplace: [],
};
