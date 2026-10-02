// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts"]);

describe("documents", () => {
  it("creates a document at version 1, then bumps the version when the title is reused", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    const id = projectId as Id<"projects">;

    await t.mutation(internal.documents.upsert, { projectId: id, title: "architecture.md", content: "# v1" });
    await t.mutation(internal.documents.upsert, { projectId: id, title: "architecture.md", content: "# v2" });

    const documents = await asUser.query(api.documents.listForProject, { projectId });
    expect(documents).toHaveLength(1);
    expect(documents[0]).toMatchObject({ title: "architecture.md", content: "# v2", version: 2 });
  });

  it("lists documents in the order they were first written", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "user_a" });
    const projectId = await asUser.mutation(api.projects.create, { title: "Habit Tracker" });
    const id = projectId as Id<"projects">;

    await t.mutation(internal.documents.upsert, { projectId: id, title: "schema.md", content: "s" });
    await t.mutation(internal.documents.upsert, { projectId: id, title: "architecture.md", content: "a" });

    const documents = await asUser.query(api.documents.listForProject, { projectId });
    expect(documents.map((doc) => doc.title)).toEqual(["schema.md", "architecture.md"]);
  });

  it("returns nothing for a notebook the caller does not own", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t
      .withIdentity({ subject: "user_b" })
      .mutation(api.projects.create, { title: "Private" });
    await t.mutation(internal.documents.upsert, {
      projectId: projectId as Id<"projects">,
      title: "secret.md",
      content: "x",
    });

    const documents = await t
      .withIdentity({ subject: "user_a" })
      .query(api.documents.listForProject, { projectId });

    expect(documents).toEqual([]);
  });
});
