import {
  createTaskInput,
  listTasksInput,
  taskIdInput,
  updateTaskInput,
} from "../tasks/task.schema";
import { taskService } from "../tasks/task.service";
import { publicProcedure, router } from "../trpc";

/**
 * Transport layer only: validates the input with the shared schemas and
 * delegates to the service. No business rules live here.
 */
export const taskRouter = router({
  list: publicProcedure.input(listTasksInput).query(({ input }) => taskService.list(input)),
  getById: publicProcedure.input(taskIdInput).query(({ input }) => taskService.getById(input)),
  create: publicProcedure.input(createTaskInput).mutation(({ input }) => taskService.create(input)),
  update: publicProcedure.input(updateTaskInput).mutation(({ input }) => taskService.update(input)),
  delete: publicProcedure.input(taskIdInput).mutation(({ input }) => taskService.delete(input)),
});

