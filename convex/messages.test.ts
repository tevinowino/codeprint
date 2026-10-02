// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts"]);

// Fake timers keep the scheduled AI action from actually running (and calling
// Gemini): these tests only cover what the mutations write before it starts.
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("messages.send", () => {
  it("stores the user's message and a streaming assistant placeholder", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });

    await asUser.mutation(api.messages.send, { projectId, text: "  A daily habit app  " });

    const messages = await asUser.query(api.messages.listForProject, { projectId });
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      role: "user",
      parts: [{ type: "text", text: "A daily habit app" }],
    });
    expect(messages[1]).toMatchObject({ role: "assistant", parts: [], isStreaming: true });
  });

  it("refuses a second message while the assistant is still replying", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    await asUser.mutation(api.messages.send, { projectId, text: "First" });

    await expect(asUser.mutation(api.messages.send, { projectId, text: "Second" })).rejects.toThrow(
      "still replying"
    );
  });

  it("lets the user send again once a streaming reply has gone stale", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    await asUser.mutation(api.messages.send, { projectId, text: "First" });

    vi.advanceTimersByTime(4 * 60 * 1000);

    await asUser.mutation(api.messages.send, { projectId, text: "Second" });

    const messages = await asUser.query(api.messages.listForProject, { projectId });
    expect(messages.map((message) => message.role)).toEqual([
      "user",
      "assistant",
      "user",
      "assistant",
    ]);
  });

  it("refuses to send into someone else's notebook", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t
      .withIdentity({ subject: "user_b" })
      .mutation(api.projects.create, { title: "Private" });

    await expect(
      t.withIdentity({ subject: "user_a" }).mutation(api.messages.send, { projectId, text: "Hi" })
    ).rejects.toThrow("Notebook not found");
  });

  it("stops a user who has used up their hourly AI requests", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    await t.run(async (ctx) => {
      for (let i = 0; i < 40; i++) await ctx.db.insert("aiRequests", { ownerId: "user_a" });
    });

    await expect(
      asUser.mutation(api.messages.send, { projectId, text: "One too many" })
    ).rejects.toThrow("hourly message limit");
  });
});

describe("messages.answerScopingForm", () => {
  async function projectWithScopingQuestion() {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    const messageId = await t.run(async (ctx) =>
      ctx.db.insert("messages", {
        projectId: projectId as Id<"projects">,
        role: "assistant",
        parts: [
          {
            type: "tool-renderScopingForm",
            question: "Which database?",
            options: ["Postgres", "SQLite"],
          },
        ],
      })
    );
    return { asUser, projectId, messageId: messageId as string };
  }

  it("records the selection and continues the conversation with it as the next user turn", async () => {
    const { asUser, projectId, messageId } = await projectWithScopingQuestion();

    await asUser.mutation(api.messages.answerScopingForm, {
      messageId,
      partIndex: 0,
      selected: ["Postgres"],
    });

    const messages = await asUser.query(api.messages.listForProject, { projectId });
    expect(messages[0].parts[0]).toMatchObject({
      type: "tool-renderScopingForm",
      selected: ["Postgres"],
    });
    expect(messages[1]).toMatchObject({
      role: "user",
      parts: [{ type: "text", text: "Postgres" }],
    });
    expect(messages[2]).toMatchObject({ role: "assistant", isStreaming: true });
  });

  it("refuses to answer the same question twice", async () => {
    const { asUser, messageId } = await projectWithScopingQuestion();
    await asUser.mutation(api.messages.answerScopingForm, {
      messageId,
      partIndex: 0,
      selected: ["SQLite"],
    });
    vi.advanceTimersByTime(4 * 60 * 1000);

    await expect(
      asUser.mutation(api.messages.answerScopingForm, {
        messageId,
        partIndex: 0,
        selected: ["Postgres"],
      })
    ).rejects.toThrow("already answered");
  });

  it("refuses an empty selection", async () => {
    const { asUser, messageId } = await projectWithScopingQuestion();

    await expect(
      asUser.mutation(api.messages.answerScopingForm, { messageId, partIndex: 0, selected: [] })
    ).rejects.toThrow("Pick at least one option");
  });
});
