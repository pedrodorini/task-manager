import "server-only";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/server/trpc";

/**
 * Server-side caller for Server Components (SSR).
 * Directly invokes procedures in-process without network overhead or self-calling HTTP.
 */
const createCaller = createCallerFactory(appRouter);

export const api = createCaller({});
