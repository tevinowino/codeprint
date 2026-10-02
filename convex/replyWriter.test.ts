import { describe, expect, it, vi } from "vitest";
import { ReplyWriter } from "./replyWriter";

describe("ReplyWriter", () => {
  it("merges consecutive text deltas into one text part", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const writer = new ReplyWriter(save);

    await writer.appendText("Hello");
    await writer.appendText(", world");
    await writer.finish();

    expect(save).toHaveBeenLastCalledWith([{ type: "text", text: "Hello, world" }], false);
  });

  it("throttles saves while streaming but always saves the final state", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    let clock = 1_000;
    const writer = new ReplyWriter(save, () => clock);

    await writer.appendText("a"); // due: first save
    clock += 100;
    await writer.appendText("b"); // 100ms later: throttled
    clock += 100;
    await writer.appendText("c"); // 200ms since last save: still throttled
    expect(save).toHaveBeenCalledTimes(1);

    await writer.finish();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith([{ type: "text", text: "abc" }], false);
  });

  it("saves tool cards immediately and starts a new text part after them", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const writer = new ReplyWriter(save);

    await writer.appendText("Saved it.");
    await writer.addPart({
      type: "tool-renderDocumentPreview",
      docTitle: "architecture.md",
      summary: "System design",
    });
    await writer.appendText("Anything else?");
    await writer.finish();

    expect(save).toHaveBeenLastCalledWith(
      [
        { type: "text", text: "Saved it." },
        { type: "tool-renderDocumentPreview", docTitle: "architecture.md", summary: "System design" },
        { type: "text", text: "Anything else?" },
      ],
      false
    );
  });

  it("fills an empty reply with a fallback message rather than leaving it blank", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const writer = new ReplyWriter(save);

    await writer.finish();

    expect(save).toHaveBeenCalledWith(
      [{ type: "text", text: "(No response — try rephrasing.)" }],
      false
    );
  });

  it("keeps what already streamed and appends the explanation when a reply fails", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const writer = new ReplyWriter(save);
    await writer.appendText("Partial answer");

    await writer.fail("Something went wrong.");

    expect(save).toHaveBeenLastCalledWith(
      [
        { type: "text", text: "Partial answer" },
        { type: "text", text: "Something went wrong." },
      ],
      false
    );
  });

  it("hands save a snapshot that later appends cannot mutate", async () => {
    const snapshots: unknown[] = [];
    const writer = new ReplyWriter(async (parts) => {
      snapshots.push(parts);
    });

    await writer.appendText("one");
    await writer.finish();
    await writer.appendText(" two");

    expect(snapshots[0]).toEqual([{ type: "text", text: "one" }]);
  });
});
