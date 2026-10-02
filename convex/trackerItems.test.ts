// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts"]);

describe("trackerItems", () => {
  it("creates a task that starts as todo and not completed", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });

    await asUser.mutation(api.trackerItems.create, { projectId, title: "  Write the schema  " });

    const items = await asUser.query(api.trackerItems.listForProject, { projectId });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: "Write the schema", status: "todo", completed: false });
  });

  it("derives completed from status so the two never disagree", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    await asUser.mutation(api.trackerItems.create, { projectId, title: "Ship it" });
    const [item] = await asUser.query(api.trackerItems.listForProject, { projectId });

    await asUser.mutation(api.trackerItems.setStatus, { itemId: item.id, status: "completed" });
    const [done] = await asUser.query(api.trackerItems.listForProject, { projectId });
    expect(done).toMatchObject({ status: "completed", completed: true });

    await asUser.mutation(api.trackerItems.setStatus, { itemId: item.id, status: "on_hold" });
    const [held] = await asUser.query(api.trackerItems.listForProject, { projectId });
    expect(held).toMatchObject({ status: "on_hold", completed: false });
  });

  it("hides another user's tasks and refuses to modify them", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ subject: "user_b" });
    const projectId = await owner.mutation(api.projects.create, { title: "Private" });
    await owner.mutation(api.trackerItems.create, { projectId, title: "Secret task" });
    const [item] = await owner.query(api.trackerItems.listForProject, { projectId });
    const intruder = t.withIdentity({ subject: "user_a" });

    expect(await intruder.query(api.trackerItems.listForProject, { projectId })).toEqual([]);
    await expect(intruder.mutation(api.trackerItems.remove, { itemId: item.id })).rejects.toThrow(
      "Task not found"
    );
  });

  it("removes a task", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    await asUser.mutation(api.trackerItems.create, { projectId, title: "Temporary" });
    const [item] = await asUser.query(api.trackerItems.listForProject, { projectId });

    await asUser.mutation(api.trackerItems.remove, { itemId: item.id });

    expect(await asUser.query(api.trackerItems.listForProject, { projectId })).toEqual([]);
  });
});
