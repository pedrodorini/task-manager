import { TaskList } from "@/components/TaskList";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const initialMessage = typeof resolvedParams.msg === "string" ? resolvedParams.msg : undefined;

  // Server-Side Rendering (SSR): preloads the first page of tasks directly on the server
  const initialData = await api.task.list({ limit: 10 });

  return <TaskList initialData={initialData} initialMessage={initialMessage} />;
}
