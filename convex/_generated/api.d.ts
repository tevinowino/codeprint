/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as ai from "../ai.js";
import type * as aiPrompt from "../aiPrompt.js";
import type * as aiState from "../aiState.js";
import type * as documents from "../documents.js";
import type * as dtos from "../dtos.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as projects from "../projects.js";
import type * as replyWriter from "../replyWriter.js";
import type * as trackerItems from "../trackerItems.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  access: typeof access;
  ai: typeof ai;
  aiPrompt: typeof aiPrompt;
  aiState: typeof aiState;
  documents: typeof documents;
  dtos: typeof dtos;
  messages: typeof messages;
  notes: typeof notes;
  projects: typeof projects;
  replyWriter: typeof replyWriter;
  trackerItems: typeof trackerItems;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
