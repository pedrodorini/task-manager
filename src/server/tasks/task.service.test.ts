import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { createInMemoryTaskRepository } from "./task.repository";
import { createSeedTasks } from "./task.seed";
import { createTaskService, TaskNotFoundError, type TaskService } from "./task.service";

// Each test gets a fresh service backed by its own repository, so tests never
// share state with each other or with the app's global instance.
let service: TaskService;

beforeEach(() => {
  service = createTaskService(createInMemoryTaskRepository());
});

describe("create", () => {
  it("creates a task with generated id and creation date", () => {
    const task = service.create({ titulo: "Write tests", descricao: "Cover the service" });

    expect(task.id).toEqual(expect.any(String));
    expect(task.dataCriacao).toBeInstanceOf(Date);
    expect(task).toMatchObject({ titulo: "Write tests", descricao: "Cover the service" });
    expect(service.getById({ id: task.id })).toEqual(task);
  });

  it("trims the title and drops an empty description", () => {
    const task = service.create({ titulo: "  Write tests  ", descricao: "   " });

    expect(task.titulo).toBe("Write tests");
    expect(task.descricao).toBeUndefined();
  });

  it.each([
    ["missing", {}],
    ["empty", { titulo: "" }],
    ["blank", { titulo: "   " }],
  ])("rejects a %s title", (_, input) => {
    expect(() => service.create(input as { titulo: string })).toThrow(ZodError);
    expect(service.list().items).toHaveLength(0);
  });
});

describe("update", () => {
  it("updates title and description, keeping id and creation date", () => {
    const original = service.create({ titulo: "Old title", descricao: "Old description" });

    const updated = service.update({ id: original.id, titulo: "New title" });

    expect(updated).toEqual({
      id: original.id,
      titulo: "New title",
      descricao: undefined,
      dataCriacao: original.dataCriacao,
    });
  });

  it("throws TaskNotFoundError for an unknown id", () => {
    expect(() => service.update({ id: "unknown", titulo: "Title" })).toThrow(TaskNotFoundError);
  });

  it("rejects an empty title", () => {
    const task = service.create({ titulo: "Title" });

    expect(() => service.update({ id: task.id, titulo: "" })).toThrow(ZodError);
    expect(service.getById({ id: task.id }).titulo).toBe("Title");
  });
});

describe("delete", () => {
  it("removes the task", () => {
    const task = service.create({ titulo: "Temporary" });

    expect(service.delete({ id: task.id })).toEqual({ id: task.id });
    expect(() => service.getById({ id: task.id })).toThrow(TaskNotFoundError);
  });

  it("throws TaskNotFoundError for an unknown id", () => {
    expect(() => service.delete({ id: "unknown" })).toThrow(TaskNotFoundError);
  });
});

describe("getById", () => {
  it("throws TaskNotFoundError with a meaningful message", () => {
    expect(() => service.getById({ id: "unknown" })).toThrow('Task with id "unknown" was not found.');
  });
});

describe("list", () => {
  beforeEach(() => {
    // Seed with a fixed past date so tasks created during a test are always newer.
    const seed = createSeedTasks(new Date("2026-01-01T12:00:00Z"));
    service = createTaskService(createInMemoryTaskRepository(seed));
  });

  it("returns the newest tasks first", () => {
    const newest = service.create({ titulo: "Brand new" });

    const { items } = service.list({ limit: 5 });

    expect(items[0].id).toBe(newest.id);
    const times = items.map((task) => task.dataCriacao.getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("paginates through all tasks with a cursor", () => {
    const page1 = service.list({ limit: 10 });
    const page2 = service.list({ limit: 10, cursor: page1.nextCursor });
    const page3 = service.list({ limit: 10, cursor: page2.nextCursor });

    expect([page1.items.length, page2.items.length, page3.items.length]).toEqual([10, 10, 5]);
    expect(page3.nextCursor).toBeNull();

    const ids = [...page1.items, ...page2.items, ...page3.items].map((task) => task.id);
    expect(new Set(ids).size).toBe(25);
  });

  it("keeps paginating correctly when the cursor task is deleted", () => {
    const page1 = service.list({ limit: 10 });
    service.delete({ id: page1.items[9].id });

    const page2 = service.list({ limit: 10, cursor: page1.nextCursor });

    // The next page starts right after the deleted task: nothing skipped or repeated.
    const expected = service.list({ limit: 50 }).items.slice(9, 19);
    expect(page2.items).toEqual(expected);
  });

  it("rejects a limit above 50", () => {
    expect(() => service.list({ limit: 51 })).toThrow(ZodError);
  });
});
