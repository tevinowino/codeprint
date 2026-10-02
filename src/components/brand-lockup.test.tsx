import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLockup } from "@/components/brand-lockup";

describe("BrandLockup", () => {
  it("shows the CODEPRINT wordmark next to the mark by default", () => {
    render(<BrandLockup />);

    expect(screen.getByText("CODEPRINT")).toBeInTheDocument();
  });

  it("hides the wordmark when rendered icon-only for the collapsed sidebar", () => {
    render(<BrandLockup iconOnly />);

    expect(screen.queryByText("CODEPRINT")).not.toBeInTheDocument();
  });

  it("draws the Cursor C mark as a frame plus a cursor bar, hidden from assistive tech", () => {
    const { container } = render(<BrandLockup />);

    const mark = container.querySelector("svg");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark?.querySelectorAll("path")).toHaveLength(2);
  });
});
