import { z } from "zod";

/**
 * Validation schemas for the task domain.
 *
 * These schemas are the single source of truth for validation: the tRPC
 * router uses them to validate incoming requests and the form reuses them
 * on the client, so the rules are never duplicated in the UI layer.
 */

export const TITULO_MAX_LENGTH = 120;
export const DESCRICAO_MAX_LENGTH = 1000;

// Field names (titulo, descricao, dataCriacao) intentionally follow the
// challenge specification, while all user-facing text is in English.
export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
}

// `error` on z.string() covers a missing/non-string value; `.min(1)` covers a
// blank one (after trim). Both result in the same message for the user.
const titulo = z
  .string({ error: "Title is required." })
  .trim()
  .min(1, "Title is required.")
  .max(TITULO_MAX_LENGTH, `Title must be at most ${TITULO_MAX_LENGTH} characters.`);

// An empty description is normalized to `undefined` so we never store "".
const descricao = z
  .string()
  .trim()
  .max(DESCRICAO_MAX_LENGTH, `Description must be at most ${DESCRICAO_MAX_LENGTH} characters.`)
  .optional()
  .transform((value) => value || undefined);

// Not restricted to UUID on purpose: an unknown id should result in a
// meaningful NOT_FOUND error from the service, not a generic validation error.
const id = z.string({ error: "Id is required." }).min(1, "Id is required.");

export const taskIdInput = z.object({ id });

export const createTaskInput = z.object({ titulo, descricao });

export const updateTaskInput = createTaskInput.extend({ id });

export const listTasksInput = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  // Id of the last task from the previous page. tRPC's infinite queries
  // require this field to be named `cursor`.
  cursor: z.string().nullish(),
});

export type TaskIdInput = z.infer<typeof taskIdInput>;
export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type ListTasksInput = z.infer<typeof listTasksInput>;

export interface TaskPage {
  items: Task[];
  nextCursor: string | null;
}

