import type { Task } from "./task.schema";

const SAMPLE_TASKS: Array<Pick<Task, "titulo" | "descricao">> = [
  { titulo: "Set up project repository", descricao: "Create the GitHub repo and push the initial commit." },
  { titulo: "Write API documentation", descricao: "Document every tRPC procedure with its inputs and errors." },
  { titulo: "Review pull requests" },
  { titulo: "Fix login page layout on mobile", descricao: "The submit button overflows on small screens." },
  { titulo: "Plan next sprint" },
  { titulo: "Update dependencies", descricao: "Check for security advisories with npm audit." },
  { titulo: "Prepare demo for stakeholders" },
  { titulo: "Refactor date formatting helpers" },
  { titulo: "Add unit tests for the service layer", descricao: "Cover success and failure scenarios." },
  { titulo: "Investigate slow dashboard query" },
  { titulo: "Design onboarding email" },
  { titulo: "Configure error monitoring", descricao: "Evaluate tools and set up alerts for production errors." },
  { titulo: "Clean up unused feature flags" },
  { titulo: "Schedule 1:1 meetings" },
  { titulo: "Translate UI strings" },
  { titulo: "Write blog post about the release", descricao: "Highlight the new task filters and performance gains." },
  { titulo: "Benchmark page load time" },
  { titulo: "Organize team retrospective" },
  { titulo: "Improve form accessibility", descricao: "Labels, focus states and screen reader announcements." },
  { titulo: "Archive old project files" },
  { titulo: "Renew SSL certificate" },
  { titulo: "Create backup strategy", descricao: "Define frequency, retention and restore tests." },
  { titulo: "Pair program with new teammate" },
  { titulo: "Update README screenshots" },
  { titulo: "Celebrate the release" },
];

/**
 * Builds the demo tasks loaded on startup, so the list (and its infinite
 * scroll) can be explored right away. Each task is one hour older than the
 * previous one, giving a deterministic order by creation date.
 */
export function createSeedTasks(now: Date = new Date()): Task[] {
  const ONE_HOUR = 60 * 60 * 1000;

  return SAMPLE_TASKS.map((sample, index) => ({
    id: crypto.randomUUID(),
    ...sample,
    dataCriacao: new Date(now.getTime() - index * ONE_HOUR),
  }));
}
