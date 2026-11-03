"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import type { TaskPage } from "@/server/tasks/task.schema";
import { Feedback } from "./Feedback";

interface TaskListProps {
  initialData: TaskPage;
  initialMessage?: string;
}

export function TaskList({ initialData, initialMessage }: TaskListProps) {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    initialMessage ? { type: "success", message: initialMessage } : null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data } = trpc.task.list.useQuery(
    { limit: 10 },
    {
      initialData,
    }
  );

  const deleteMutation = trpc.task.delete.useMutation({
    onMutate: ({ id }) => {
      setDeletingId(id);
      setFeedback(null);
    },
    onSuccess: () => {
      setFeedback({ type: "success", message: "Task deleted successfully." });
      utils.task.list.invalidate();
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete task. Please try again.",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ id });
  };

  const tasks = data?.items ?? [];

  return (
    <section aria-labelledby="tasks-heading">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 id="tasks-heading" className="text-2xl font-bold tracking-tight text-gray-900">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your daily tasks and priorities.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Task
        </Link>
      </div>

      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No tasks found.</p>
          <p className="mt-1 text-xs text-gray-400">
            Get started by creating your first task!
          </p>
          <div className="mt-4">
            <Link
              href="/tasks/new"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              + Add a task
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {tasks.map((task) => {
            const isDeleting = deletingId === task.id;
            return (
              <li
                key={task.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-base font-semibold text-gray-900 break-words">
                    {task.titulo}
                  </h2>
                  {task.descricao && (
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-line break-words">
                      {task.descricao}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <time
                      dateTime={task.dataCriacao.toISOString()}
                      suppressHydrationWarning
                      className="text-xs text-gray-400"
                    >
                      Created on{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(task.dataCriacao)}
                    </time>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    aria-label={`Edit "${task.titulo}"`}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    disabled={isDeleting || deleteMutation.isPending}
                    aria-label={`Delete "${task.titulo}"`}
                    className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
