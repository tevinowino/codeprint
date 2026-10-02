import { describe, expect, it } from "vitest";
import { buildSystemPrompt, toModelMessages } from "./aiPrompt";

describe("buildSystemPrompt", () => {
  it("names the project and tells the model which stage it is in", () => {
    const prompt = buildSystemPrompt(
      { title: "Habit Tracker", description: "Streaks for habits", status: "interviewing" },
      []
    );

    expect(prompt).toContain("Habit Tracker — Streaks for habits");
    expect(prompt).toContain("INTERVIEW stage");
    expect(prompt).toContain("(none yet)");
  });

  it("includes existing documents so completed projects can be edited in place", () => {
    const prompt = buildSystemPrompt(
      { title: "Recipe Box", status: "completed" },
      [{ title: "architecture.md", content: "# Uses PostgreSQL", version: 3 }]
    );

    expect(prompt).toContain("COMPLETED");
    expect(prompt).toContain("--- architecture.md (v3) ---\n# Uses PostgreSQL");
  });
});

describe("toModelMessages", () => {
  it("turns text parts into plain chat turns", () => {
    const turns = toModelMessages([
      { role: "assistant", parts: [{ type: "text", text: "What are you building?" }] },
      { role: "user", parts: [{ type: "text", text: "A habit tracker" }] },
    ]);

    expect(turns).toEqual([
      { role: "assistant", content: "What are you building?" },
      { role: "user", content: "A habit tracker" },
    ]);
  });

  it("summarises tool cards as bracketed notes, including the user's answer", () => {
    const turns = toModelMessages([
      {
        role: "assistant",
        parts: [
          {
            type: "tool-renderScopingForm",
            question: "Which database?",
            options: ["Postgres", "SQLite"],
            selected: ["Postgres"],
          },
          { type: "tool-renderDocumentPreview", docTitle: "schema.md", summary: "Data model" },
        ],
      },
    ]);

    expect(turns[0].content).toContain(
      '[Asked the user: "Which database?" with options: Postgres / SQLite. User answered: Postgres.]'
    );
    expect(turns[0].content).toContain("[Saved document schema.md: Data model]");
  });

  it("skips empty placeholders and system messages", () => {
    const turns = toModelMessages([
      { role: "system", parts: [{ type: "text", text: "internal" }] },
      { role: "user", parts: [{ type: "text", text: "Hello" }] },
      { role: "assistant", parts: [] },
    ]);

    expect(turns).toEqual([{ role: "user", content: "Hello" }]);
  });

  it("merges back-to-back messages from the same role so turns alternate", () => {
    const turns = toModelMessages([
      { role: "user", parts: [{ type: "text", text: "First" }] },
      { role: "user", parts: [{ type: "text", text: "Second" }] },
    ]);

    expect(turns).toEqual([{ role: "user", content: "First\nSecond" }]);
  });
});
