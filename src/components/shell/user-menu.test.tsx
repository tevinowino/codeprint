import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/components/shell/user-menu";

const useUserMock = vi.fn();
const signOutMock = vi.fn();
const openUserProfileMock = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useUser: () => useUserMock(),
  useClerk: () => ({ signOut: signOutMock, openUserProfile: openUserProfileMock }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("UserMenu", () => {
  it("shows the signed-in user's first name and email", async () => {
    const user = userEvent.setup();
    useUserMock.mockReturnValue({
      user: {
        firstName: "Tevin",
        username: null,
        imageUrl: "",
        primaryEmailAddress: { emailAddress: "tevin@example.com" },
      },
    });
    render(<UserMenu />);

    expect(screen.getByText("Tevin")).toBeInTheDocument();
    await user.click(screen.getByText("Tevin"));

    expect(await screen.findByText("tevin@example.com")).toBeInTheDocument();
  });

  it("falls back to the email prefix when the user has no first name or username", () => {
    useUserMock.mockReturnValue({
      user: {
        firstName: null,
        username: null,
        imageUrl: "",
        primaryEmailAddress: { emailAddress: "jane.doe@example.com" },
      },
    });
    render(<UserMenu />);

    expect(screen.getByText("jane.doe")).toBeInTheDocument();
  });

  it("signs out and returns to the landing page", async () => {
    const user = userEvent.setup();
    useUserMock.mockReturnValue({
      user: {
        firstName: "Tevin",
        username: null,
        imageUrl: "",
        primaryEmailAddress: { emailAddress: "tevin@example.com" },
      },
    });
    render(<UserMenu />);

    await user.click(screen.getByText("Tevin"));
    await user.click(await screen.findByText("Sign out"));

    expect(signOutMock).toHaveBeenCalledWith({ redirectUrl: "/" });
  });

  it("opens the Clerk profile from Account settings", async () => {
    const user = userEvent.setup();
    useUserMock.mockReturnValue({
      user: {
        firstName: "Tevin",
        username: null,
        imageUrl: "",
        primaryEmailAddress: { emailAddress: "tevin@example.com" },
      },
    });
    render(<UserMenu />);

    await user.click(screen.getByText("Tevin"));
    await user.click(await screen.findByText("Account settings"));

    expect(openUserProfileMock).toHaveBeenCalledTimes(1);
  });
});
