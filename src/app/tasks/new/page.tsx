import { TaskForm } from "@/components/TaskForm";

export const metadata = {
  title: "Create Task - Task Manager",
};

export default function NewTaskPage() {
  return (
    <section aria-labelledby="new-task-heading" className="space-y-6">
      <div>
        <h1 id="new-task-heading" className="text-2xl font-bold tracking-tight text-gray-900">
          Create Task
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new task to your task list.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-2xs">
        <TaskForm />
      </div>
    </section>
  );
}
