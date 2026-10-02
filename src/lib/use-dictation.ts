"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

function getSpeechRecognitionCtor(): typeof SpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

const subscribeToNothing = () => () => {};

/**
 * Wraps the browser's native SpeechRecognition (Web Speech API) — free, no
 * API key, no backend round-trip. Only committed (isFinal) results are
 * surfaced via `onFinalResult`; interim results are used solely to detect
 * finalization faster, not shown as a live preview, so callers never need to
 * reconcile "replace the last interim chunk" bookkeeping.
 *
 * Support is inconsistent across browsers (solid in Chrome/Edge, historically
 * partial elsewhere) — check `isSupported` and hide the control entirely
 * when false rather than rendering a button that can't work.
 */
export function useDictation({
  onFinalResult,
  lang = "en-US",
}: {
  onFinalResult: (transcript: string) => void;
  lang?: string;
}) {
  // Support can't change after load, so this is a fixed client-side fact:
  // false on the server/first paint (no hydration mismatch), real value after.
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    () => !!getSpeechRecognitionCtor(),
    () => false
  );
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalResultRef = useRef(onFinalResult);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalChunk += result[0].transcript;
      }
      if (finalChunk) onFinalResultRef.current(finalChunk);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [lang]);

  // Stop the mic if the component unmounts mid-dictation.
  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isSupported, isListening, start, stop };
}
