import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProjectChat } from "@/lib/use-project-chat";

const { queryResult, sendMessage, answerScopingForm } = vi.hoisted(() => ({
  queryResult: { current: undefined as unknown },
  sendMessage: vi.fn(),
  answerScopingForm: vi.fn(),
}));

vi.mock("convex/react", async () => {
  const { getFunctionName } = await import("convex/server");
  const mutations: Record<string, unknown> = {
    "messages:send": sendMessage,
    "messages:answerScopingForm": answerScopingForm,
  };
  return {
    useQuery: () => queryResult.current,
    useMutation: (reference: never) => mutations[getFunctionName(reference)],
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useProjectChat", () => {
  it("is not responding while messages are still loading", () => {
    queryResult.current = undefined;

    const { result } = renderHook(() => useProjectChat("project_1"));

    expect(result.current.messages).toBeUndefined();
    expect(result.current.isResponding).toBe(false);
  });

  it("is responding while any assistant message is still streaming", () => {
    queryResult.current = [
      { id: "m1", projectId: "project_1", role: "user", parts: [{ type: "text", text: "Hi" }], createdAt: 1 },
      { id: "m2", projectId: "project_1", role: "assistant", parts: [], isStreaming: true, createdAt: 2 },
    ];

    const { result } = renderHook(() => useProjectChat("project_1"));

    expect(result.current.isResponding).toBe(true);
  });

  it("is not responding once every message has finished streaming", () => {
    queryResult.current = [
      { id: "m1", projectId: "project_1", role: "assistant", parts: [{ type: "text", text: "Hello" }], isStreaming: false, createdAt: 1 },
    ];

    const { result } = renderHook(() => useProjectChat("project_1"));

    expect(result.current.isResponding).toBe(false);
  });

  it("sends a message into the notebook", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useProjectChat("project_1"));

    result.current.sendMessage("A habit tracker");

    expect(sendMessage).toHaveBeenCalledWith({ projectId: "project_1", text: "A habit tracker" });
  });

  it("answers a scoping form by message id and part index", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useProjectChat("project_1"));

    result.current.answerScopingForm("m2", 1, ["Postgres"]);

    expect(answerScopingForm).toHaveBeenCalledWith({
      messageId: "m2",
      partIndex: 1,
      selected: ["Postgres"],
    });
  });
});
