// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts"]);

describe("notes", () => {
  it("creates a note and lists it", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });

    await asUser.mutation(api.notes.create, { projectId, content: "  Add rate limiting  " });

    const notes = await asUser.query(api.notes.listForProject, { projectId });
    expect(notes.map((note) => note.content)).toEqual(["Add rate limiting"]);
  });

  it("updates a note's content", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    await asUser.mutation(api.notes.create, { projectId, content: "First draft" });
    const [note] = await asUser.query(api.notes.listForProject, { projectId });

    await asUser.mutation(api.notes.update, { noteId: note.id, content: "Second draft" });

    const [updated] = await asUser.query(api.notes.listForProject, { projectId });
    expect(updated.content).toBe("Second draft");
  });

  it("refuses an empty note", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });

    await expect(asUser.mutation(api.notes.create, { projectId, content: "   " })).rejects.toThrow(
      "A note can't be empty"
    );
  });

  it("refuses to let another user edit or delete a note", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "user_b" });
    const projectId = await owner.mutation(api.projects.create, { title: "Private" });
    await owner.mutation(api.notes.create, { projectId, content: "Mine" });
    const [note] = await owner.query(api.notes.listForProject, { projectId });
    const intruder = t.withIdentity({ subject: "user_a" });

    await expect(
      intruder.mutation(api.notes.update, { noteId: note.id, content: "Hacked" })
    ).rejects.toThrow("Note not found");
    await expect(intruder.mutation(api.notes.remove, { noteId: note.id })).rejects.toThrow(
      "Note not found"
    );
  });
});
