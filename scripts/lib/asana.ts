// Asana API helpers (one-way import)

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

export interface AsanaTask {
  gid: string;
  name: string;
  notes?: string | null;
  assignee?: {
    name?: string | null;
    email?: string | null;
  } | null;
  memberships?: Array<{
    project?: { gid?: string | null } | null;
    section?: { name?: string | null } | null;
  }>;
}

interface AsanaTaskResponse {
  data: AsanaTask[];
  next_page?: {
    offset: string;
  } | null;
}

export async function fetchAsanaTasks(
  projectId: string,
  accessToken: string
): Promise<AsanaTask[]> {
  const tasks: AsanaTask[] = [];
  let offset: string | null = null;

  const fields = [
    "gid",
    "name",
    "notes",
    "assignee.name",
    "assignee.email",
    "memberships.section.name",
    "memberships.project.gid",
  ];

  do {
    const url = new URL(`${ASANA_API_BASE}/projects/${projectId}/tasks`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("opt_fields", fields.join(","));
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Asana API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as AsanaTaskResponse;
    tasks.push(...(data.data || []));
    offset = data.next_page?.offset ?? null;
  } while (offset);

  return tasks;
}

export function mapAsanaSectionToStatus(sectionName: string | null | undefined):
  | "planning"
  | "in_progress"
  | "review"
  | "done"
  | "blocked" {
  if (!sectionName) return "planning";

  const normalized = sectionName.trim().toLowerCase();

  const map: Record<string, "planning" | "in_progress" | "review" | "done" | "blocked"> = {
    backlog: "planning",
    planning: "planning",
    "in progress": "in_progress",
    "in review": "review",
    review: "review",
    done: "done",
    completed: "done",
    blocked: "blocked",
  };

  return map[normalized] ?? "planning";
}
