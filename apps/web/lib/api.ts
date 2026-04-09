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
  secrets: {
    list: (projectId: string, env: string) =>
      apiFetch<SecretMeta[]>(`/api/v1/projects/${projectId}/secrets?env=${encodeURIComponent(env)}`),
    get: (projectId: string, env: string, key: string) =>
      apiFetch<{ key: string; value: string }>(
        `/api/v1/projects/${projectId}/secrets/${encodeURIComponent(key)}?env=${encodeURIComponent(env)}`
      ),
    create: (projectId: string, env: string, key: string, value: string) =>
      apiFetch<{ key: string; env: string }>(`/api/v1/projects/${projectId}/secrets`, {
        method: "POST",
        body: JSON.stringify({ key, value, env }),
      }),
    update: (projectId: string, env: string, key: string, value: string) =>
      apiFetch<{ key: string; env: string }>(
        `/api/v1/projects/${projectId}/secrets/${encodeURIComponent(key)}?env=${encodeURIComponent(env)}`,
        { method: "PUT", body: JSON.stringify({ value }) }
      ),
    delete: (projectId: string, env: string, key: string) =>
      apiFetch<void>(
        `/api/v1/projects/${projectId}/secrets/${encodeURIComponent(key)}?env=${encodeURIComponent(env)}`,
        { method: "DELETE" }
      ),
    import: (projectId: string, env: string, secrets: Record<string, string>) =>
      apiFetch<{ imported: number }>(`/api/v1/projects/${projectId}/secrets/import`, {
        method: "POST",
        body: JSON.stringify({ env, secrets }),
      }),
  },
  members: {
    list: (projectId: string) =>
      apiFetch<Member[]>(`/api/v1/projects/${projectId}/members`),
    invite: (projectId: string, email: string, role: string) =>
      apiFetch<Member>(`/api/v1/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      }),
    updateRole: (projectId: string, userId: string, role: string) =>
      apiFetch<Member>(`/api/v1/projects/${projectId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    remove: (projectId: string, userId: string) =>
      apiFetch<void>(`/api/v1/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      }),
  },
  tokens: {
    list: (projectId: string) =>
      apiFetch<CICDToken[]>(`/api/v1/projects/${projectId}/tokens`),
    create: (projectId: string, name: string, scopedEnv: string) =>
      apiFetch<{ token: string; meta: CICDToken }>(`/api/v1/projects/${projectId}/tokens`, {
        method: "POST",
        body: JSON.stringify({ name, scopedEnv }),
      }),
    revoke: (projectId: string, tokenId: string) =>
      apiFetch<void>(`/api/v1/projects/${projectId}/tokens/${tokenId}`, {
        method: "DELETE",
      }),
  },
  audit: {
    list: (projectId: string, params: { env?: string; limit?: number } = {}) => {
      const qs = new URLSearchParams();
      if (params.env) qs.set("env", params.env);
      if (params.limit) qs.set("limit", String(params.limit));
      return apiFetch<AuditEvent[]>(
        `/api/v1/projects/${projectId}/audit?${qs.toString()}`
      );
    },
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

export interface SecretMeta {
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  actorType: "User" | "CICDToken";
  operation: string;
  env: string | null;
  key: string | null;
  timestamp: string;
}

export interface Member {
  id: string;
  projectId: string;
  userId: string;
  role: "Owner" | "Developer" | "ReadOnly";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CICDToken {
  id: string;
  projectId: string;
  name: string;
  scopedEnv: string;
  createdAt: string;
  lastUsedAt: string | null;
}
