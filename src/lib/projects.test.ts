import { describe, expect, it } from "vitest";
import { getDocuments, getMessages, getProject, listProjects } from "@/lib/projects";

describe("listProjects", () => {
  it("returns every seeded project, most recently updated first", async () => {
    const projects = await listProjects();

    expect(projects.length).toBeGreaterThan(0);
    const updatedTimestamps = projects.map((project) => project.updatedAt);
    expect(updatedTimestamps).toEqual([...updatedTimestamps].sort((a, b) => b - a));
  });
});

describe("getProject", () => {
  it("returns the matching project for a known id", async () => {
    const project = await getProject("proj_habit_tracker");

    expect(project?.title).toBe("Habit Tracker API");
  });

  it("returns null for an id that doesn't exist", async () => {
    const project = await getProject("proj_does_not_exist");

    expect(project).toBeNull();
  });
});

describe("getMessages", () => {
  it("returns the seeded conversation for a known project", async () => {
    const messages = await getMessages("proj_habit_tracker");

    expect(messages.length).toBeGreaterThan(0);
    expect(messages.every((message) => message.projectId === "proj_habit_tracker")).toBe(true);
  });

  it("returns an empty array for a project with no conversation", async () => {
    const messages = await getMessages("proj_does_not_exist");

    expect(messages).toEqual([]);
  });
});

describe("getDocuments", () => {
  it("returns the seeded documents for a known project", async () => {
    const documents = await getDocuments("proj_habit_tracker");

    expect(documents.map((doc) => doc.title)).toContain("architecture.md");
  });

  it("returns an empty array for a project with no documents yet", async () => {
    const documents = await getDocuments("proj_marketplace");

    expect(documents).toEqual([]);
  });
});
