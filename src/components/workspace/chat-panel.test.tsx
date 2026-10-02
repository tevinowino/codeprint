import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "@/components/workspace/chat-panel";

vi.mock("thinking-orbs", () => ({ ThinkingOrb: () => <span data-testid="thinking-orb" /> }));

// jsdom doesn't implement scrollIntoView; the panel calls it after every render.
Element.prototype.scrollIntoView = vi.fn();

describe("ChatPanel", () => {
  it("invites the user to describe their project when the conversation is empty", () => {
    render(
      <ChatPanel
        messages={[]}
        isResponding={false}
        sendMessage={vi.fn()}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    expect(screen.getByText(/Describe what you want to build/)).toBeInTheDocument();
  });

  it("shows nothing but the composer while messages are still loading", () => {
    render(
      <ChatPanel
        messages={undefined}
        isResponding={false}
        sendMessage={vi.fn()}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    expect(screen.queryByText(/Describe what you want to build/)).not.toBeInTheDocument();
  });

  it("renders both sides of the conversation", () => {
    render(
      <ChatPanel
        messages={[
          { id: "m1", projectId: "p", role: "assistant", parts: [{ type: "text", text: "What are you building?" }], createdAt: 1 },
          { id: "m2", projectId: "p", role: "user", parts: [{ type: "text", text: "A habit tracker" }], createdAt: 2 },
        ]}
        isResponding={false}
        sendMessage={vi.fn()}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    expect(screen.getByText("What are you building?")).toBeInTheDocument();
    expect(screen.getByText("A habit tracker")).toBeInTheDocument();
  });

  it("shows the thinking indicator until the assistant's first words arrive", () => {
    render(
      <ChatPanel
        messages={[
          { id: "m1", projectId: "p", role: "user", parts: [{ type: "text", text: "Hi" }], createdAt: 1 },
          { id: "m2", projectId: "p", role: "assistant", parts: [], isStreaming: true, createdAt: 2 },
        ]}
        isResponding={true}
        sendMessage={vi.fn()}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    expect(screen.getByText("Thinking…")).toBeInTheDocument();
    expect(screen.getByTestId("thinking-orb")).toBeInTheDocument();
  });

  it("drops the thinking indicator once the reply starts streaming", () => {
    render(
      <ChatPanel
        messages={[
          { id: "m1", projectId: "p", role: "user", parts: [{ type: "text", text: "Hi" }], createdAt: 1 },
          { id: "m2", projectId: "p", role: "assistant", parts: [{ type: "text", text: "Hello th" }], isStreaming: true, createdAt: 2 },
        ]}
        isResponding={true}
        sendMessage={vi.fn()}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
    expect(screen.getByText("Hello th")).toBeInTheDocument();
  });

  it("sends what the user types", async () => {
    const user = userEvent.setup();
    const sendMessage = vi.fn();
    render(
      <ChatPanel
        messages={[]}
        isResponding={false}
        sendMessage={sendMessage}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    await user.type(screen.getByRole("textbox"), "A habit tracker");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(sendMessage).toHaveBeenCalledWith("A habit tracker");
  });

  it("does not send while the assistant is replying", async () => {
    const user = userEvent.setup();
    const sendMessage = vi.fn();
    render(
      <ChatPanel
        messages={[
          { id: "m1", projectId: "p", role: "assistant", parts: [], isStreaming: true, createdAt: 1 },
        ]}
        isResponding={true}
        sendMessage={sendMessage}
        answerScopingForm={vi.fn()}
        onOpenDocument={vi.fn()}
      />
    );

    await user.type(screen.getByRole("textbox"), "Too soon{Enter}");

    expect(sendMessage).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});
