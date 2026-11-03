import { router } from "../trpc";
import { taskRouter } from "./task.router";

export const appRouter = router({
  task: taskRouter,
});

// Only the type is shared with the client, giving end-to-end type safety
// without bundling any server code in the browser.
export type AppRouter = typeof appRouter;

