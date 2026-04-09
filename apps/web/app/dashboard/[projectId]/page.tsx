"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Project, Env } from "@/lib/api";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [activeEnv, setActiveEnv] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [proj, environments] = await Promise.all([
          api.projects.get(projectId),
          api.envs.list(projectId),
        ]);
        setProject(proj);
        setEnvs(environments);
        if (environments.length > 0) setActiveEnv(environments[0].name);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, router]);

  if (loading) {
    return (
      <div style={{ background: "#0D0F14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555A70", fontFamily: "Inter, system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!project) return null;

  const ENV_COLORS: Record<string, string> = {
    prod: "#EF4444",
    staging: "#F59E0B",
    dev: "#22C55E",
  };

  return (
    <div style={{ background: "#0D0F14", minHeight: "100vh", color: "#F0F2F8", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1F2336", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>
          Projects
        </Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{project.name}</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px" }}>
        {/* Project header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{project.name}</h1>
          <p style={{ color: "#555A70", fontSize: 13, marginTop: 4 }}>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Environment tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1F2336", marginBottom: 28 }}>
          {envs.map((env) => (
            <button
              key={env.name}
              onClick={() => setActiveEnv(env.name)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeEnv === env.name ? `2px solid ${ENV_COLORS[env.name] ?? "#6366F1"}` : "2px solid transparent",
                padding: "10px 18px",
                color: activeEnv === env.name ? "#F0F2F8" : "#8B90A8",
                fontSize: 13,
                fontWeight: activeEnv === env.name ? 600 : 400,
                cursor: "pointer",
                marginBottom: -1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              <EnvDot color={ENV_COLORS[env.name] ?? "#6366F1"} />
              {env.name}
              <span style={{ color: "#555A70", fontSize: 11 }}>
                {env.secretCount}
              </span>
            </button>
          ))}
        </div>

        {/* Quick links */}
        {activeEnv && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { href: `/dashboard/${projectId}/secrets`, title: "Secrets", desc: `Manage encrypted secrets for ${activeEnv}` },
              { href: `/dashboard/${projectId}/audit`, title: "Audit log", desc: "View all secret access and mutations" },
              { href: `/dashboard/${projectId}/members`, title: "Members", desc: "Manage team members and roles" },
              { href: `/dashboard/${projectId}/tokens`, title: "CI/CD tokens", desc: "Create and revoke environment-scoped tokens" },
            ].map(({ href, title, desc }) => (
              <Link
                key={href}
                href={href}
                style={{
                  background: "#141720",
                  border: "1px solid #2A2F42",
                  borderRadius: 10,
                  padding: "20px 24px",
                  textDecoration: "none",
                  color: "#F0F2F8",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                <div style={{ color: "#555A70", fontSize: 12, marginTop: 4 }}>{desc}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EnvDot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}
