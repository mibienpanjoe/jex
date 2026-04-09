"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Project, Env, AuditEvent } from "@/lib/api";

const OPERATION_LABELS: Record<string, string> = {
  SECRET_CREATE: "Create",
  SECRET_READ: "Read",
  SECRET_READ_BULK: "Export",
  SECRET_UPDATE: "Update",
  SECRET_DELETE: "Delete",
  MEMBER_INVITE: "Invite",
  MEMBER_ROLE_CHANGE: "Role change",
  MEMBER_REMOVE: "Remove",
  TOKEN_CREATE: "Token created",
  TOKEN_REVOKE: "Token revoked",
};

const OPERATION_COLORS: Record<string, string> = {
  SECRET_CREATE: "#22C55E",
  SECRET_READ: "#6366F1",
  SECRET_READ_BULK: "#6366F1",
  SECRET_UPDATE: "#F59E0B",
  SECRET_DELETE: "#EF4444",
  MEMBER_INVITE: "#22C55E",
  MEMBER_ROLE_CHANGE: "#F59E0B",
  MEMBER_REMOVE: "#EF4444",
  TOKEN_CREATE: "#22C55E",
  TOKEN_REVOKE: "#EF4444",
};

const ENV_COLORS: Record<string, string> = {
  prod: "#EF4444",
  staging: "#F59E0B",
  dev: "#22C55E",
};

const ALL_OPERATIONS = Object.keys(OPERATION_LABELS);

export default function AuditPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Filters
  const [filterEnv, setFilterEnv] = useState("");
  const [filterOp, setFilterOp] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [proj, environments] = await Promise.all([
          api.projects.get(projectId),
          api.envs.list(projectId),
        ]);
        setProject(proj);
        setEnvs(environments);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, router]);

  useEffect(() => {
    if (loading) return;
    setEventsLoading(true);
    api.audit
      .list(projectId, {
        env: filterEnv || undefined,
        limit: 200,
      })
      .then((data) => {
        const filtered = filterOp ? data.filter((e) => e.operation === filterOp) : data;
        setEvents(filtered);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [loading, projectId, filterEnv, filterOp]);

  if (loading) {
    return (
      <div style={{ background: "#0D0F14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555A70", fontFamily: "Inter, system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ background: "#0D0F14", minHeight: "100vh", color: "#F0F2F8", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1F2336", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>Projects</Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <Link href={`/dashboard/${projectId}`} style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>{project.name}</Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Audit log</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <select
            value={filterEnv}
            onChange={(e) => setFilterEnv(e.target.value)}
            style={selectStyle}
          >
            <option value="">All environments</option>
            {envs.map((env) => (
              <option key={env.name} value={env.name}>{env.name}</option>
            ))}
          </select>
          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
            style={selectStyle}
          >
            <option value="">All operations</option>
            {ALL_OPERATIONS.map((op) => (
              <option key={op} value={op}>{OPERATION_LABELS[op]}</option>
            ))}
          </select>
          {(filterEnv || filterOp) && (
            <button
              onClick={() => { setFilterEnv(""); setFilterOp(""); }}
              style={{
                background: "transparent",
                border: "1px solid #2A2F42",
                borderRadius: 8,
                padding: "7px 14px",
                color: "#8B90A8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        {eventsLoading ? (
          <p style={{ color: "#555A70", fontSize: 14 }}>Loading…</p>
        ) : events.length === 0 ? (
          <div style={{ border: "1px dashed #2A2F42", borderRadius: 10, padding: "48px 32px", textAlign: "center", color: "#555A70" }}>
            <p style={{ fontSize: 14 }}>No audit events found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 180px 140px",
              gap: 12,
              padding: "8px 16px",
              color: "#555A70",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              <span>Actor</span>
              <span>Operation</span>
              <span>Environment</span>
              <span>Key</span>
              <span>Time</span>
            </div>
            {events.map((event) => (
              <AuditRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditRow({ event }: { event: AuditEvent }) {
  const opColor = OPERATION_COLORS[event.operation] ?? "#8B90A8";
  const opLabel = OPERATION_LABELS[event.operation] ?? event.operation;
  const envColor = event.env ? (ENV_COLORS[event.env] ?? "#6366F1") : "#2A2F42";

  return (
    <div style={{
      background: "#141720",
      border: "1px solid #1F2336",
      borderRadius: 8,
      display: "grid",
      gridTemplateColumns: "1fr 120px 120px 180px 140px",
      gap: 12,
      padding: "12px 16px",
      alignItems: "center",
    }}>
      {/* Actor */}
      <div>
        <span style={{ fontSize: 13, color: "#F0F2F8" }}>{event.actorName}</span>
        {event.actorType === "CICDToken" && (
          <span style={{ fontSize: 11, color: "#555A70", marginLeft: 8 }}>CI/CD</span>
        )}
      </div>

      {/* Operation badge */}
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: opColor,
        background: `${opColor}1A`,
        border: `1px solid ${opColor}33`,
        borderRadius: 5,
        padding: "2px 8px",
        display: "inline-block",
      }}>
        {opLabel}
      </span>

      {/* Environment badge */}
      {event.env ? (
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: envColor,
          background: `${envColor}1A`,
          border: `1px solid ${envColor}33`,
          borderRadius: 5,
          padding: "2px 8px",
          display: "inline-block",
        }}>
          {event.env}
        </span>
      ) : (
        <span style={{ color: "#2A2F42", fontSize: 12 }}>—</span>
      )}

      {/* Key */}
      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#8B90A8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {event.key ?? "—"}
      </span>

      {/* Timestamp */}
      <span style={{ fontSize: 12, color: "#555A70" }}>
        {new Date(event.timestamp).toLocaleString()}
      </span>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "#141720",
  border: "1px solid #2A2F42",
  borderRadius: 8,
  padding: "7px 12px",
  color: "#F0F2F8",
  fontSize: 13,
  outline: "none",
  cursor: "pointer",
};
