import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDictation } from "@/lib/use-dictation";

/** A minimal fake of the browser's SpeechRecognition, just enough to drive useDictation. */
class FakeSpeechRecognition extends EventTarget implements SpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
  onend: (() => void) | null = null;
  static instances: FakeSpeechRecognition[] = [];

  constructor() {
    super();
    FakeSpeechRecognition.instances.push(this);
  }

  start = vi.fn();
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();

  /** Test helper: simulate the browser delivering a result. */
  emitResult(transcript: string, isFinal: boolean) {
    const result = { isFinal, length: 1, 0: { transcript } } as unknown as SpeechRecognitionResult;
    const event = {
      resultIndex: 0,
      results: { length: 1, 0: result },
    } as unknown as SpeechRecognitionEvent;
    this.onresult?.(event);
  }
}

afterEach(() => {
  FakeSpeechRecognition.instances = [];
  delete window.SpeechRecognition;
});

describe("useDictation", () => {
  it("reports unsupported when the browser has no SpeechRecognition constructor", () => {
    const { result } = renderHook(() => useDictation({ onFinalResult: vi.fn() }));

    expect(result.current.isSupported).toBe(false);
  });

  it("reports supported and starts listening when SpeechRecognition exists", () => {
    window.SpeechRecognition = FakeSpeechRecognition as unknown as typeof SpeechRecognition;
    const { result } = renderHook(() => useDictation({ onFinalResult: vi.fn() }));

    expect(result.current.isSupported).toBe(true);

    act(() => result.current.start());

    expect(result.current.isListening).toBe(true);
    expect(FakeSpeechRecognition.instances[0].start).toHaveBeenCalled();
  });

  it("only surfaces final results to the caller, not interim ones", () => {
    window.SpeechRecognition = FakeSpeechRecognition as unknown as typeof SpeechRecognition;
    const onFinalResult = vi.fn();
    const { result } = renderHook(() => useDictation({ onFinalResult }));

    act(() => result.current.start());
    const recognition = FakeSpeechRecognition.instances[0];

    act(() => recognition.emitResult("scoping a habit", false));
    expect(onFinalResult).not.toHaveBeenCalled();

    act(() => recognition.emitResult("scoping a habit tracker", true));
    expect(onFinalResult).toHaveBeenCalledWith("scoping a habit tracker");
  });

  it("stops listening when stop is called", () => {
    window.SpeechRecognition = FakeSpeechRecognition as unknown as typeof SpeechRecognition;
    const { result } = renderHook(() => useDictation({ onFinalResult: vi.fn() }));

    act(() => result.current.start());
    expect(result.current.isListening).toBe(true);

    act(() => result.current.stop());

    expect(result.current.isListening).toBe(false);
    expect(FakeSpeechRecognition.instances[0].stop).toHaveBeenCalled();
  });
});
