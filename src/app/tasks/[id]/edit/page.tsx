import { notFound } from "next/navigation";
import { TaskForm } from "@/components/TaskForm";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditTaskPageProps) {
  const { id } = await params;
  try {
    const task = await api.task.getById({ id });
    return {
      title: `Edit "${task.titulo}" - Task Manager`,
    };
  } catch {
    return {
      title: "Edit Task - Task Manager",
    };
  }
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  let task;
  try {
    task = await api.task.getById({ id });
  } catch {
    notFound();
  }

  return (
    <section aria-labelledby="edit-task-heading" className="space-y-6">
      <div>
        <h1 id="edit-task-heading" className="text-2xl font-bold tracking-tight text-gray-900">
          Edit Task
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the task details below.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-2xs">
        <TaskForm initialTask={task} />
      </div>
    </section>
  );
}
