import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";
import { TaskNotFoundError } from "./tasks/task.service";

const t = initTRPC.create({
  // superjson keeps rich types such as Date intact between server and client,
  // so `dataCriacao` arrives as a Date instead of an ISO string.
  transformer: superjson,
  // Exposes field-level validation messages (e.g. { titulo: ["Title is required."] })
  // so the frontend can show them next to the corresponding form fields.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        fieldErrors: error.cause instanceof ZodError ? z.flattenError(error.cause).fieldErrors : null,
      },
    };
  },
});

/**
 * Translates domain errors thrown by the services into proper tRPC errors.
 * Without this, any non-tRPC error would surface as a generic 500.
 */
const mapDomainErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (result.ok) return result;

  const { cause } = result.error;
  if (cause instanceof TaskNotFoundError) {
    throw new TRPCError({ code: "NOT_FOUND", message: cause.message, cause });
  }
  if (cause instanceof ZodError) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input.", cause });
  }
  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(mapDomainErrors);
export const createCallerFactory = t.createCallerFactory;

