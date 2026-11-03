"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createTaskInput,
  DESCRICAO_MAX_LENGTH,
  TITULO_MAX_LENGTH,
  type Task,
} from "@/server/tasks/task.schema";
import { trpc } from "@/trpc/client";
import { Feedback } from "./Feedback";

interface TaskFormProps {
  initialTask?: Task;
}

export function TaskForm({ initialTask }: TaskFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialTask);

  const [titulo, setTitulo] = useState(initialTask?.titulo ?? "");
  const [descricao, setDescricao] = useState(initialTask?.descricao ?? "");
  const [fieldErrors, setFieldErrors] = useState<{ titulo?: string; descricao?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const handleMutationError = (error: {
    message: string;
    data?: { fieldErrors?: Record<string, string[] | undefined> | null } | null;
  }) => {
    const serverFieldErrors = error.data?.fieldErrors;
    if (serverFieldErrors && (serverFieldErrors.titulo || serverFieldErrors.descricao)) {
      setFieldErrors({
        titulo: serverFieldErrors.titulo?.[0],
        descricao: serverFieldErrors.descricao?.[0],
      });
    } else {
      setGeneralError(error.message || "An unexpected error occurred. Please try again.");
    }
  };

  const createMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      router.push("/?msg=" + encodeURIComponent("Task created successfully."));
    },
    onError: handleMutationError,
  });

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      router.push("/?msg=" + encodeURIComponent("Task updated successfully."));
    },
    onError: handleMutationError,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    // Validate using the shared zod schema before sending
    const validation = createTaskInput.safeParse({ titulo, descricao });
    if (!validation.success) {
      const formatted = validation.error.flatten().fieldErrors;
      setFieldErrors({
        titulo: formatted.titulo?.[0],
        descricao: formatted.descricao?.[0],
      });
      return;
    }

    setFieldErrors({});

    if (isEditing && initialTask) {
      updateMutation.mutate({
        id: initialTask.id,
        titulo,
        descricao,
      });
    } else {
      createMutation.mutate({
        titulo,
        descricao,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {generalError && (
        <Feedback
          type="error"
          message={generalError}
          onDismiss={() => setGeneralError(null)}
        />
      )}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-400">
            {titulo.length}/{TITULO_MAX_LENGTH}
          </span>
        </div>
        <div className="mt-1">
          <input
            id="titulo"
            name="titulo"
            type="text"
            required
            maxLength={TITULO_MAX_LENGTH}
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              if (fieldErrors.titulo) {
                setFieldErrors((prev) => ({ ...prev, titulo: undefined }));
              }
            }}
            placeholder="e.g. Finish project presentation"
            disabled={isPending}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 disabled:bg-gray-100 ${
              fieldErrors.titulo
                ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            }`}
            aria-invalid={Boolean(fieldErrors.titulo)}
            aria-describedby={fieldErrors.titulo ? "titulo-error" : undefined}
          />
        </div>
        {fieldErrors.titulo && (
          <p id="titulo-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.titulo}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Description <span className="text-xs text-gray-400">(optional)</span>
          </label>
          <span className="text-xs text-gray-400">
            {descricao.length}/{DESCRICAO_MAX_LENGTH}
          </span>
        </div>
        <div className="mt-1">
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            maxLength={DESCRICAO_MAX_LENGTH}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              if (fieldErrors.descricao) {
                setFieldErrors((prev) => ({ ...prev, descricao: undefined }));
              }
            }}
            placeholder="Add any extra details or context..."
            disabled={isPending}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 disabled:bg-gray-100 ${
              fieldErrors.descricao
                ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            }`}
            aria-invalid={Boolean(fieldErrors.descricao)}
            aria-describedby={fieldErrors.descricao ? "descricao-error" : undefined}
          />
        </div>
        {fieldErrors.descricao && (
          <p id="descricao-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.descricao}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? isEditing
              ? "Saving changes..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Task"}
        </button>
      </div>
    </form>
  );
}
