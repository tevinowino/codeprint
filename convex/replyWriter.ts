import type { Doc } from "./_generated/dataModel";

type MessagePart = Doc<"messages">["parts"][number];
type Save = (parts: MessagePart[], isStreaming: boolean) => Promise<unknown>;

const MIN_MILLISECONDS_BETWEEN_SAVES = 250;

/**
 * Accumulates an assistant reply and persists it to the database. Text deltas
 * arrive many times a second, so saves are throttled; `finish`/`fail` always
 * write the final state. Not safe for concurrent use — one instance per reply.
 */
export class ReplyWriter {
  private parts: MessagePart[] = [];
  private lastSaveAt = 0;

  constructor(
    private readonly save: Save,
    private readonly now: () => number = Date.now
  ) {}

  async appendText(delta: string) {
    const last = this.parts[this.parts.length - 1];
    if (last?.type === "text") last.text += delta;
    else this.parts.push({ type: "text", text: delta });
    await this.saveIfDue();
  }

  /** Adds a non-text part (tool card). Saved immediately so cards appear promptly. */
  async addPart(part: MessagePart) {
    this.parts.push(part);
    await this.saveNow(true);
  }

  async finish() {
    if (this.parts.length === 0) {
      this.parts.push({ type: "text", text: "(No response — try rephrasing.)" });
    }
    await this.saveNow(false);
  }

  /** Ends the reply with an explanation, keeping whatever was already streamed. */
  async fail(explanation: string) {
    this.parts.push({ type: "text", text: explanation });
    await this.saveNow(false);
  }

  private async saveIfDue() {
    if (this.now() - this.lastSaveAt >= MIN_MILLISECONDS_BETWEEN_SAVES) {
      await this.saveNow(true);
    }
  }

  private async saveNow(isStreaming: boolean) {
    this.lastSaveAt = this.now();
    // Copy so later in-place text appends can't mutate what was handed to `save`.
    await this.save(structuredClone(this.parts), isStreaming);
  }
}
