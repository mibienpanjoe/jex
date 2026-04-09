"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Project } from "@/lib/api";
import { NewProjectModal } from "./NewProjectModal";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    try {
      const data = await api.projects.list();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ background: "#0D0F14", minHeight: "100vh", color: "#F0F2F8", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1F2336", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.4px" }}>Jex</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Projects</h1>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#6366F1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + New project
          </button>
        </div>

        {/* Project list */}
        {loading ? (
          <p style={{ color: "#555A70" }}>Loading…</p>
        ) : projects.length === 0 ? (
          <EmptyState onNew={() => setShowModal(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => {
            setProjects((prev) => [...prev, p]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/dashboard/${project.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "#141720",
          border: "1px solid #2A2F42",
          borderRadius: 10,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366F1")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2F42")}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#F0F2F8" }}>{project.name}</div>
          <div style={{ color: "#555A70", fontSize: 12, marginTop: 3 }}>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
        <RoleBadge role={project.role} />
      </div>
    </Link>
  );
}

function RoleBadge({ role }: { role: Project["role"] }) {
  const colors: Record<string, string> = {
    Owner: "#6366F1",
    Developer: "#22C55E",
    ReadOnly: "#8B90A8",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: colors[role] ?? "#8B90A8",
        background: "#1C2030",
        border: `1px solid ${colors[role] ?? "#2A2F42"}`,
        borderRadius: 5,
        padding: "3px 8px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {role}
    </span>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      style={{
        border: "1px dashed #2A2F42",
        borderRadius: 12,
        padding: "60px 40px",
        textAlign: "center",
        color: "#555A70",
      }}
    >
      <p style={{ fontSize: 15, marginBottom: 16 }}>No projects yet.</p>
      <button
        onClick={onNew}
        style={{
          background: "#6366F1",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Create your first project
      </button>
    </div>
  );
}
