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

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
}

// `error` on z.string() covers a missing/non-string value; `.min(1)` covers a
// blank one (after trim). Both result in the same message for the user.
const titulo = z
  .string({ error: "O título é obrigatório." })
  .trim()
  .min(1, "O título é obrigatório.")
  .max(TITULO_MAX_LENGTH, `O título deve ter no máximo ${TITULO_MAX_LENGTH} caracteres.`);

// An empty description is normalized to `undefined` so we never store "".
const descricao = z
  .string()
  .trim()
  .max(DESCRICAO_MAX_LENGTH, `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`)
  .optional()
  .transform((value) => value || undefined);

// Not restricted to UUID on purpose: an unknown id should result in a
// meaningful NOT_FOUND error from the service, not a generic validation error.
const id = z.string({ error: "O id é obrigatório." }).min(1, "O id é obrigatório.");

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

