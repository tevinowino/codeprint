"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import type { FunctionReference, OptionalRestArgs } from "convex/server";
import { gooeyToast } from "@/components/ui/goey-toaster";

/** The message to show a person: our own ConvexError text, or a generic fallback. */
export function describeError(error: unknown): string {
  if (error instanceof ConvexError && typeof error.data === "string") return error.data;
  return "Something went wrong. Please try again.";
}

/**
 * A Convex mutation that reports failures as a toast instead of throwing.
 * Resolves to the mutation's result, or `undefined` if it failed — callers that
 * need the result (e.g. a new id) must handle `undefined`.
 */
export function useReportedMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation
) {
  const run = useMutation(mutation);
  return useCallback(
    async (...args: OptionalRestArgs<Mutation>) => {
      try {
        return await run(...args);
      } catch (error) {
        gooeyToast.error(describeError(error));
        return undefined;
      }
    },
    [run]
  );
}
