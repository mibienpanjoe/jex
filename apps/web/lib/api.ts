const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? "API error"), {
      status: res.status,
      body,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  projects: {
    list: () => apiFetch<Project[]>("/api/v1/projects"),
    create: (name: string) =>
      apiFetch<Project>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    get: (projectId: string) =>
      apiFetch<Project>(`/api/v1/projects/${projectId}`),
    delete: (projectId: string) =>
      apiFetch<void>(`/api/v1/projects/${projectId}`, { method: "DELETE" }),
  },
  envs: {
    list: (projectId: string) =>
      apiFetch<Env[]>(`/api/v1/projects/${projectId}/envs`),
  },
};

export interface Project {
  id: string;
  name: string;
  role: "Owner" | "Developer" | "ReadOnly";
  createdAt: string;
  updatedAt: string;
}

export interface Env {
  id: string;
  projectId: string;
  name: string;
  isDefault: boolean;
  secretCount: number;
  createdAt: string;
}
