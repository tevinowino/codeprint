// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts"]);

describe("projects", () => {
  it("rejects anonymous callers", async () => {
    const t = convexTest(schema, modules);

    await expect(t.query(api.projects.list, {})).rejects.toThrow("Not signed in");
  });

  it("lists only the caller's notebooks, most recently active first", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("projects", { ownerId: "user_a", title: "Older", status: "interviewing", updatedAt: 1_000 });
      await ctx.db.insert("projects", { ownerId: "user_a", title: "Newer", status: "interviewing", updatedAt: 2_000 });
      await ctx.db.insert("projects", { ownerId: "user_b", title: "Not mine", status: "interviewing", updatedAt: 3_000 });
    });

    const projects = await t.withIdentity({ subject: "user_a" }).query(api.projects.list, {});

    expect(projects.map((project) => project.title)).toEqual(["Newer", "Older"]);
  });

  it("creates a trimmed notebook in the interviewing stage", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });

    const id = await asUser.mutation(api.projects.create, { title: "  Habit Tracker  " });

    const project = await asUser.query(api.projects.get, { projectId: id });
    expect(project).toMatchObject({ title: "Habit Tracker", status: "interviewing" });
  });

  it("refuses a blank title", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.withIdentity({ subject: "user_a" }).mutation(api.projects.create, { title: "   " })
    ).rejects.toThrow("A notebook needs a title");
  });

  it("returns null when asked for another user's notebook", async () => {
    const t = convexTest(schema, modules);
    const id = await t
      .withIdentity({ subject: "user_b" })
      .mutation(api.projects.create, { title: "Private" });

    const project = await t.withIdentity({ subject: "user_a" }).query(api.projects.get, { projectId: id });

    expect(project).toBeNull();
  });

  it("returns null for an id that is not a notebook id at all", async () => {
    const t = convexTest(schema, modules);

    const project = await t
      .withIdentity({ subject: "user_a" })
      .query(api.projects.get, { projectId: "not-a-real-id" });

    expect(project).toBeNull();
  });

  it("does not let another user change a notebook's status", async () => {
    const t = convexTest(schema, modules);
    const id = await t
      .withIdentity({ subject: "user_b" })
      .mutation(api.projects.create, { title: "Private" });

    await expect(
      t
        .withIdentity({ subject: "user_a" })
        .mutation(api.projects.updateStatus, { projectId: id, status: "completed" })
    ).rejects.toThrow("Notebook not found");
  });
});
