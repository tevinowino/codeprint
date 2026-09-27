import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScopingFormCard } from "@/components/generative/scoping-form-card";
import type { ScopingFormPart } from "@/domain/types";

describe("ScopingFormCard", () => {
  it("disables the submit button until at least one option is selected", async () => {
    const user = userEvent.setup();
    const part: ScopingFormPart = {
      type: "tool-renderScopingForm",
      question: "API access model",
      options: ["Read-only public API", "Full read/write via API keys"],
    };
    render(<ScopingFormCard part={part} onAnswer={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Submit answer" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Full read/write via API keys" }));

    expect(screen.getByRole("button", { name: "Submit answer" })).toBeEnabled();
  });

  it("toggles an option off when clicked twice, removing it from the submitted selection", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const part: ScopingFormPart = {
      type: "tool-renderScopingForm",
      question: "Payment handling",
      options: ["Cash only, app just coordinates", "In-app payment, held until handoff"],
    };
    render(<ScopingFormCard part={part} onAnswer={onAnswer} />);

    const cashOption = screen.getByRole("button", { name: "Cash only, app just coordinates" });
    const inAppOption = screen.getByRole("button", { name: "In-app payment, held until handoff" });

    await user.click(cashOption);
    await user.click(inAppOption);
    await user.click(cashOption); // deselect

    await user.click(screen.getByRole("button", { name: "Submit answer" }));

    expect(onAnswer).toHaveBeenCalledWith(["In-app payment, held until handoff"]);
  });

  it("renders as read-only, with the selected option marked and no submit button, once already answered", () => {
    const part: ScopingFormPart = {
      type: "tool-renderScopingForm",
      question: "API access model",
      options: ["Read-only public API", "Full read/write via API keys"],
      selected: ["Full read/write via API keys"],
    };
    render(<ScopingFormCard part={part} onAnswer={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Full read/write via API keys" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Read-only public API" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Submit answer" })).not.toBeInTheDocument();
  });
});
