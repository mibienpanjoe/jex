"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { api, Project, Env } from "@/lib/api";
import { getErrorMessage, handleDashboardLoadError } from "@/lib/dashboard-errors";
import { withLocale } from "@/lib/i18n-path";
import { DashboardErrorState } from "../DashboardErrorState";

export default function ProjectPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.project");
  const common = useTranslations("dashboard.common");
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [activeEnv, setActiveEnv] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEnvName, setNewEnvName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [creatingEnv, setCreatingEnv] = useState(false);
  const [deletingEnv, setDeletingEnv] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [proj, environments] = await Promise.all([
        api.projects.get(projectId),
        api.envs.list(projectId),
      ]);
      setProject(proj);
      setEnvs(environments);
      if (environments.length > 0) setActiveEnv(environments[0].name);
    } catch (err) {
      handleDashboardLoadError(err, {
        locale,
        router,
        onRecoverableError: () => setError(getErrorMessage(err, common("loadError"))),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [locale, projectId, router]);

  async function createEnvironment() {
    const name = newEnvName.trim();
    if (!name) return;

    setActionError(null);
    setCreatingEnv(true);
    try {
      const env = await api.envs.create(projectId, name);
      setEnvs((prev) => [...prev, env]);
      setActiveEnv(env.name);
      setNewEnvName("");
    } catch (err) {
      setActionError(envErrorMessage(err, t));
    } finally {
      setCreatingEnv(false);
    }
  }

  async function deleteEnvironment(envName: string) {
    setActionError(null);
    setDeletingEnv(envName);
    try {
      await api.envs.delete(projectId, envName);
      setEnvs((prev) => {
        const next = prev.filter((env) => env.name !== envName);
        if (activeEnv === envName) {
          setActiveEnv(next[0]?.name ?? null);
        }
        return next;
      });
    } catch (err) {
      setActionError(envErrorMessage(err, t));
    } finally {
      setDeletingEnv(null);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "#0D0F14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555A70", fontFamily: "Inter, system-ui, sans-serif" }}>
        {common("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#0D0F14", minHeight: "100vh", color: "#F0F2F8", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
          <DashboardErrorState message={error} onRetry={load} />
        </div>
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
        <Link href={withLocale("/dashboard", locale)} style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>
          {t("projects")}
        </Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{project.name}</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px" }}>
        {/* Project header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{project.name}</h1>
          <p style={{ color: "#555A70", fontSize: 13, marginTop: 4 }}>
            {t("created", { date: new Date(project.createdAt).toLocaleDateString(locale) })}
          </p>
        </div>

        {/* Environment management */}
        <div style={{ borderBottom: "1px solid #1F2336", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{t("environments.title")}</h2>
              <p style={{ color: "#555A70", fontSize: 12, margin: "4px 0 0" }}>{t("environments.desc")}</p>
            </div>
            {project.role === "Owner" && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  createEnvironment();
                }}
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <input
                  value={newEnvName}
                  onChange={(event) => setNewEnvName(event.target.value)}
                  placeholder={t("environments.placeholder")}
                  style={{
                    background: "#0D0F14",
                    border: "1px solid #2A2F42",
                    borderRadius: 8,
                    color: "#F0F2F8",
                    padding: "8px 10px",
                    fontSize: 13,
                    width: 160,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  disabled={creatingEnv || !newEnvName.trim()}
                  style={{
                    background: creatingEnv || !newEnvName.trim() ? "#2A2F42" : "#6366F1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: creatingEnv || !newEnvName.trim() ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {creatingEnv ? t("environments.creating") : t("environments.create")}
                </button>
              </form>
            )}
          </div>

          {actionError && (
            <p style={{ color: "#FCA5A5", fontSize: 12, margin: "0 0 12px" }}>{actionError}</p>
          )}

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {envs.map((env) => (
              <div
                key={env.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: activeEnv === env.name ? `2px solid ${ENV_COLORS[env.name] ?? "#6366F1"}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                <button
                  onClick={() => setActiveEnv(env.name)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "10px 10px 10px 14px",
                    color: activeEnv === env.name ? "#F0F2F8" : "#8B90A8",
                    fontSize: 13,
                    fontWeight: activeEnv === env.name ? 600 : 400,
                    cursor: "pointer",
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
                {project.role === "Owner" && !env.isDefault && (
                  <button
                    onClick={() => deleteEnvironment(env.name)}
                    disabled={deletingEnv === env.name}
                    aria-label={t("environments.deleteLabel", { name: env.name })}
                    title={t("environments.deleteLabel", { name: env.name })}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: deletingEnv === env.name ? "#555A70" : "#8B90A8",
                      cursor: deletingEnv === env.name ? "not-allowed" : "pointer",
                      padding: "10px 12px 10px 2px",
                      fontSize: 15,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        {activeEnv && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { href: withLocale(`/dashboard/${projectId}/secrets`, locale), title: t("links.secrets.title"), desc: t("links.secrets.desc", { env: activeEnv }) },
              { href: withLocale(`/dashboard/${projectId}/audit`, locale), title: t("links.audit.title"), desc: t("links.audit.desc") },
              { href: withLocale(`/dashboard/${projectId}/members`, locale), title: t("links.members.title"), desc: t("links.members.desc") },
              { href: withLocale(`/dashboard/${projectId}/tokens`, locale), title: t("links.tokens.title"), desc: t("links.tokens.desc") },
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

function envErrorMessage(err: unknown, t: ReturnType<typeof useTranslations<"dashboard.project">>) {
  if (typeof err === "object" && err !== null && "body" in err) {
    const body = (err as { body?: { error?: string } }).body;
    if (body?.error === "INVALID_ENV_NAME") return t("environments.invalidName");
    if (body?.error === "ENVIRONMENT_NAME_TAKEN") return t("environments.duplicate");
    if (body?.error === "CANNOT_DELETE_DEFAULT_ENV") return t("environments.defaultProtected");
  }

  return t("environments.actionError");
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
