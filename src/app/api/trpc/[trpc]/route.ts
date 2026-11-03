import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";

/** Exposes the tRPC router through a Next.js Route Handler at /api/trpc. */
function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    onError({ error, path }) {
      // Expected errors (validation, not found) are returned to the client;
      // only unexpected ones are worth logging on the server.
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`tRPC error on "${path}":`, error);
      }
    },
  });
}

export { handler as GET, handler as POST };

