import { createSeedTasks } from "./task.seed";
import type { Task } from "./task.schema";

/**
 * Storage layer for tasks. It only knows how to store and retrieve data;
 * business rules (validation, ordering, pagination, errors) live in the
 * service. Keeping it behind an interface makes it trivial to swap for a
 * real database later, and lets tests use an isolated instance.
 */
export interface TaskRepository {
  findAll(): Task[];
  findById(id: string): Task | undefined;
  /** Inserts a new task or replaces an existing one with the same id. */
  save(task: Task): Task;
  /** Returns `false` when there was no task with the given id. */
  delete(id: string): boolean;
}

export function createInMemoryTaskRepository(initialTasks: Task[] = []): TaskRepository {
  const tasks = new Map<string, Task>(initialTasks.map((task) => [task.id, task]));

  // Shallow copies prevent callers from mutating the stored objects directly.
  return {
    findAll: () => Array.from(tasks.values(), (task) => ({ ...task })),
    findById: (id) => {
      const task = tasks.get(id);
      return task && { ...task };
    },
    save: (task) => {
      tasks.set(task.id, { ...task });
      return { ...task };
    },
    delete: (id) => tasks.delete(id),
  };
}

/**
 * Shared repository instance used by the application.
 *
 * It is stored on `globalThis` because Next.js may load this module more than
 * once: hot reload in development re-evaluates it, and the API route handler
 * and server-rendered pages can be bundled separately. Without this, each copy
 * would hold its own Map and tasks created via the API wouldn't appear in SSR.
 */
const globalForTasks = globalThis as typeof globalThis & {
  taskRepository?: TaskRepository;
};

export const taskRepository: TaskRepository = (globalForTasks.taskRepository ??=
  createInMemoryTaskRepository(createSeedTasks()));
