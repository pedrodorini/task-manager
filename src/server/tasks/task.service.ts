import {
  createTaskInput,
  listTasksInput,
  taskIdInput,
  updateTaskInput,
  type Task,
  type TaskPage,
} from "./task.schema";
import { taskRepository, type TaskRepository } from "./task.repository";
import type { z } from "zod";

/**
 * Domain error for a missing task. The service doesn't know about tRPC/HTTP;
 * the API layer is responsible for translating this into a NOT_FOUND response.
 */
export class TaskNotFoundError extends Error {
  readonly taskId: string;

  constructor(taskId: string) {
    super(`Task with id "${taskId}" was not found.`);
    this.name = "TaskNotFoundError";
    this.taskId = taskId;
  }
}

/**
 * Pagination cursor made of the last task's creation time and id.
 * Using only the id would break when that task is deleted between page loads
 * (we couldn't find where to resume). Comparing by (time, id) always works,
 * and the id breaks ties between tasks created in the same millisecond.
 */
const encodeCursor = (task: Task) => `${task.dataCriacao.getTime()}_${task.id}`;

function decodeCursor(cursor: string) {
  const separator = cursor.indexOf("_");
  return { time: Number(cursor.slice(0, separator)), id: cursor.slice(separator + 1) };
}

/**
 * Newest first; id as tie-breaker so the order is always deterministic.
 * Ids are compared with `<`/`>` (not localeCompare) to match the cursor filter.
 */
function compareNewestFirst(a: Task, b: Task) {
  const byDate = b.dataCriacao.getTime() - a.dataCriacao.getTime();
  if (byDate !== 0) return byDate;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/**
 * Business rules for tasks.
 *
 * Every method parses its input with the shared zod schemas. The API already
 * validates requests, but validating here too guarantees the rules (e.g. "a
 * task must have a title") hold no matter who calls the service.
 */
export function createTaskService(repository: TaskRepository) {
  function getExisting(id: string): Task {
    const task = repository.findById(id);
    if (!task) throw new TaskNotFoundError(id);
    return task;
  }

  return {
    list(input: z.input<typeof listTasksInput> = {}): TaskPage {
      const { limit, cursor } = listTasksInput.parse(input);
      let tasks = repository.findAll().sort(compareNewestFirst);

      if (cursor) {
        const last = decodeCursor(cursor);
        tasks = tasks.filter(
          (task) =>
            task.dataCriacao.getTime() < last.time ||
            (task.dataCriacao.getTime() === last.time && task.id < last.id),
        );
      }

      const items = tasks.slice(0, limit);
      const hasMore = tasks.length > limit;
      return { items, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null };
    },

    getById(input: z.input<typeof taskIdInput>): Task {
      const { id } = taskIdInput.parse(input);
      return getExisting(id);
    },

    create(input: z.input<typeof createTaskInput>): Task {
      const data = createTaskInput.parse(input);
      return repository.save({ id: crypto.randomUUID(), ...data, dataCriacao: new Date() });
    },

    /** Full update of the editable fields; id and creation date never change. */
    update(input: z.input<typeof updateTaskInput>): Task {
      const { id, titulo, descricao } = updateTaskInput.parse(input);
      const existing = getExisting(id);
      return repository.save({ ...existing, titulo, descricao });
    },

    delete(input: z.input<typeof taskIdInput>): { id: string } {
      const { id } = taskIdInput.parse(input);
      if (!repository.delete(id)) throw new TaskNotFoundError(id);
      return { id };
    },
  };
}

export type TaskService = ReturnType<typeof createTaskService>;

export const taskService = createTaskService(taskRepository);
