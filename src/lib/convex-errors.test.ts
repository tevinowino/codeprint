import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ConvexError } from "convex/values";
import { describeError, useReportedMutation } from "@/lib/convex-errors";

const { runMutation, toastError } = vi.hoisted(() => ({
  runMutation: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("convex/react", () => ({ useMutation: () => runMutation }));
vi.mock("@/components/ui/goey-toaster", () => ({ gooeyToast: { error: toastError } }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("describeError", () => {
  it("shows the text of a deliberate ConvexError", () => {
    expect(describeError(new ConvexError("Notebook not found"))).toBe("Notebook not found");
  });

  it("hides the details of unexpected errors behind a generic message", () => {
    expect(describeError(new Error("ECONNRESET at 10.0.0.3"))).toBe(
      "Something went wrong. Please try again."
    );
  });
});

describe("useReportedMutation", () => {
  it("resolves to the mutation's result on success", async () => {
    runMutation.mockResolvedValue("new_id");
    const { result } = renderHook(() => useReportedMutation({} as never));

    const outcome = await result.current({} as never);

    expect(outcome).toBe("new_id");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("toasts the reason and resolves to undefined when the mutation fails", async () => {
    runMutation.mockRejectedValue(new ConvexError("A notebook needs a title"));
    const { result } = renderHook(() => useReportedMutation({} as never));

    const outcome = await result.current({} as never);

    expect(outcome).toBeUndefined();
    expect(toastError).toHaveBeenCalledWith("A notebook needs a title");
  });
});
